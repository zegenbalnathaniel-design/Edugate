import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { Sourced } from "@/components/unis/Sourced";
import { getCurrentUser } from "@/lib/auth/session";
import { programCostInr } from "@/lib/unis/extract";
import { BASIS_LABEL } from "@/lib/unis/filters";
import { dateLabel, inrCompact, moneyRange, salary } from "@/lib/unis/format";
import { isPast } from "@/lib/unis/freshness";
import { INSTITUTION_TYPE_LABEL } from "@/lib/unis/geo";
import { BAND_GLYPH, BAND_LABEL, matchProgram } from "@/lib/unis/match";
import { getUniversitiesBySlugs } from "@/lib/unis/repo";
import type { Program, University } from "@/lib/unis/schema";
import { SELECTIVITY_LABEL, selectivity } from "@/lib/unis/selectivity";
import { normalizeTests, TEST_LABEL } from "@/lib/unis/taxonomy";
import { getProfile } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Compare programmes" };
const MAX = 5;
const NA = <span className="text-paper/45">Data not publicly available</span>;
const NV = <span className="text-paper/40">—</span>;

type Col = { u: University; p: Program };

function hostel(u: University, p: Program) {
  return [...p.feeBreakdown, ...u.details.feeBreakdown].find((f) => /hostel|hall|residen|accommodation|room/i.test(f.item)) ?? null;
}

export default async function CompareProgramsPage({ searchParams }: PageProps<"/compare/programs">) {
  const raw = (await searchParams).p;
  const pairs = (Array.isArray(raw) ? raw : (raw ?? "").split(","))
    .map((x) => x.trim())
    .filter((x) => /^[a-z0-9-]+\/[a-z0-9-]+$/.test(x))
    .slice(0, MAX);
  const rows = await getUniversitiesBySlugs([...new Set(pairs.map((x) => x.split("/")[0]))]);
  const cols: Col[] = pairs
    .map((x) => {
      const [us, ps] = x.split("/");
      const u = rows.find((r) => r.slug === us)?.data;
      const p = u?.programs.find((q) => q.slug === ps);
      return u && p ? { u, p } : null;
    })
    .filter((c): c is Col => !!c);
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const without = (i: number) => `/compare/programs?${cols.filter((_, j) => j !== i).map((c) => `p=${c.u.slug}/${c.p.slug}`).join("&")}`;

  const src = (u: University, v: { sourceId: string | null }, node: ReactNode) => (
    <Sourced sourceId={v.sourceId} sources={u.sources}>{node}</Sourced>
  );

  const ROWS: [string, (c: Col) => ReactNode][] = [
    ["Course", ({ u, p }) => <Link href={`/universities/${u.slug}/programs/${p.slug}`} className="font-medium text-cyan hover:underline">{p.name}</Link>],
    ["Institution", ({ u }) => <><Link href={`/universities/${u.slug}`} className="hover:text-cyan">{u.name}</Link><span className="block text-[0.75rem] text-paper/50">{[u.institutionType ? INSTITUTION_TYPE_LABEL[u.institutionType] : null, u.affiliation.value].filter(Boolean).join(" · ")}</span></>],
    ["Location", ({ u }) => `${u.locality ? `${u.locality}, ` : ""}${u.hub ?? u.city}, ${u.countryCode === "IN" ? u.region : u.country}`],
    ["Degree · duration", ({ p }) => `${p.degree}${p.durationYears ? ` · ${p.durationYears} years` : ""}${p.stream ? ` · ${p.stream}` : ""}`],
    ["Department", ({ p }) => p.department ?? p.school ?? NV],
    ["Eligibility", ({ u, p }) =>
      p.admission?.eligibility ? src(u, p.admission, <>{p.admission.eligibility}{p.admission.minimumPercent ? <span className="block text-[0.75rem] text-paper/55">Minimum: {p.admission.minimumPercent}</span> : null}</>) :
      p.requirements.length ? p.requirements.map((r) => <span key={r.curriculum} className="block">{src(u, r, <>{r.curriculum.replace("_", "-")}: {r.minimum ?? (r.accepted === false ? "not accepted" : "accepted")}</>)}</span>) : NV],
    ["Required subjects", ({ p }) => (p.admission?.requiredSubjects.length ? p.admission.requiredSubjects.join(", ") : [...new Set(p.requirements.flatMap((r) => r.subjects.filter((s) => s.status === "required").map((s) => s.subject)))].join(", ") || NV)],
    ["Entrance / tests", ({ u, p }) => {
      const t = normalizeTests([...(p.admission?.entranceTests ?? []), ...p.tests.filter((x) => x.policy === "required").map((x) => x.test), ...u.testing.filter((x) => x.policy === "required").map((x) => x.test)]);
      const raw = p.admission?.entranceTests ?? [];
      return raw.length ? raw.join(", ") : t.length ? t.map((k) => TEST_LABEL[k]).join(", ") : <span className="text-paper/55">None listed as required</span>;
    }],
    ["How you get in", ({ p }) => (p.admission?.basis.length ? p.admission.basis.map((b) => BASIS_LABEL[b]).join(", ") : NV)],
    ["Application fee", ({ u, p }) => p.admission?.applicationFee ?? (u.applicationFee.value ? src(u, u.applicationFee, u.applicationFee.value) : NV)],
    ["Next deadline", ({ u, p }) => {
      const d = [...p.deadlines, ...u.deadlines].filter((x) => !isPast(x.date)).sort((a, b) => a.date.localeCompare(b.date))[0];
      return d ? src(u, d, `${dateLabel(d.date)} — ${d.label}`) : <span className="text-paper/55">None upcoming listed</span>;
    }],
    ["Tuition per year", ({ u, p }) => {
      const v = p.fees ?? (u.countryCode === "IN" ? u.costs.domesticTuition : u.costs.internationalTuition);
      const inr = programCostInr(u, p);
      return v.value ? <><Sourced sourceId={v.sourceId} sources={u.sources} confidence={v.confidence} asOf={v.asOf} notes={v.notes}>{moneyRange(v.value, u.costs.currency)}</Sourced>{u.costs.currency !== "INR" && inr != null && <span className="block text-[0.75rem] text-paper/50">≈ {inrCompact(inr)}/yr</span>}</> : NV;
    }],
    ["Whole degree (calculated)", ({ u, p }) => {
      const inr = programCostInr(u, p);
      return inr != null && p.durationYears ? <>{u.countryCode === "IN" ? "" : "≈ "}{inrCompact(inr * p.durationYears)}<span className="block text-[0.75rem] text-paper/50">Yearly tuition × {p.durationYears} years; fees usually rise each year</span></> : NV;
    }],
    ["Hostel", ({ u, p }) => { const h = hostel(u, p); return h ? <Sourced sourceId={h.sourceId} sources={u.sources} confidence={h.confidence} asOf={h.asOf} notes={h.notes}>{moneyRange(h.amount, h.currency)}</Sourced> : u.details.housing.value ? <span className="text-paper/70">{u.details.housing.value}</span> : NV; }],
    ["Scholarships", ({ u, p }) => {
      const list = p.scholarships.length ? u.scholarships.filter((s) => p.scholarships.includes(s.name)) : u.scholarships;
      return list.length ? list.slice(0, 4).map((s) => <span key={s.name} className="block">{s.name}{s.coverage ? <span className="text-paper/55"> — {s.coverage}</span> : null}</span>) : <span className="text-paper/55">None verified yet</span>;
    }],
    ["Placements", ({ u, p }) => {
      const o = [...p.outcomes, ...u.details.outcomes].sort((a, b) => b.year.localeCompare(a.year)).find((x) => x.medianSalary != null || x.averageSalary != null || x.employmentRate);
      if (!o) return NA;
      const fig = o.medianSalary != null ? `Median ${salary(o.medianSalary, o.currency)}` : o.averageSalary != null ? `Average ${salary(o.averageSalary, o.currency)}` : o.employmentRate;
      return <Sourced sourceId={o.sourceId} sources={u.sources} confidence={o.confidence} asOf={o.year} notes={o.notes}>{fig}<span className="block text-[0.75rem] text-paper/50">{o.cohort}, {o.year}{p.outcomes.includes(o) ? "" : " (institution-wide)"}</span></Sourced>;
    }],
    ["Internships & industry", ({ u, p }) => {
      const l = [...p.opportunities, ...u.opportunities].filter((o) => ["internships", "industry", "careers"].includes(o.category));
      return l.length ? l.slice(0, 3).map((o) => <span key={o.name} className="block">{o.name}</span>) : NV;
    }],
    ["Exchange / study abroad", ({ u, p }) => {
      const l = [...p.opportunities, ...u.opportunities].filter((o) => o.category === "exchange" || o.category === "international");
      return l.length ? l.slice(0, 3).map((o) => <span key={o.name} className="block">{o.name}</span>) : NV;
    }],
    ["Curriculum", ({ u, p }) => (p.curriculum.length ? src(u, { sourceId: p.curriculumSourceId }, <>{p.curriculum[0].courses.slice(0, 5).join(", ")}{p.curriculum[0].courses.length > 5 ? "…" : ""}<span className="block text-[0.75rem] text-paper/50">Year {p.curriculum[0].year} · {p.curriculum.length} year(s) listed{p.electives.length ? ` · ${p.electives.length} electives` : ""}</span></>) : NV)],
    ["Career paths", ({ u, p }) => (p.careers?.paths.length ? src(u, p.careers, p.careers.paths.slice(0, 4).join(", ")) : NA)],
    ["Selectivity", ({ u }) => { const s = selectivity(u); return s ? <Sourced sourceId={s.sourceId} sources={u.sources}>{SELECTIVITY_LABEL[s.band]}<span className="block text-[0.75rem] text-paper/50">{s.reason}</span></Sourced> : <span className="text-paper/55">Not enough published data</span>; }],
    ["Data verified", ({ u }) => `${dateLabel(u.lastVerified)} · ${u.sources.length} sources`],
  ];
  if (profile) {
    ROWS.splice(1, 0,
      ["Your match", ({ u, p }) => { const m = matchProgram(u, p, profile); return m.percent == null ? <span className="text-paper/55">Add more to your profile</span> : <><strong>{m.percent}%</strong><span className="block text-[0.75rem] text-paper/50">Fit with your priorities — not an admission chance</span></>; }],
      ["Admission band", ({ u, p }) => { const m = matchProgram(u, p, profile); return <><strong>{BAND_GLYPH[m.band]} {BAND_LABEL[m.band]}</strong><span className="block text-[0.75rem] text-paper/55">{m.bandReasons[0]}</span></>; }],
    );
  }

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Compare programmes</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Course against course, side by side</h1>
        <p className="measure mb-8 text-[0.9375rem] text-paper/65">
          Up to {MAX} programmes from any institution, in India or abroad. Every cell links to its source; &ldquo;Data not publicly available&rdquo; means the institution doesn&apos;t publish it, and nothing is estimated in its place.
          {!profile && <> <Link href="/login?next=/profile" className="text-cyan hover:underline">Sign in</Link> to see your match and admission band in each column.</>}
        </p>
        {cols.length === 0 ? (
          <div className="glass p-8">
            <p>Pick programmes to compare from any <Link href="/courses" className="text-cyan hover:underline">course list</Link> — tick the boxes, then &ldquo;Compare selected&rdquo;.</p>
          </div>
        ) : (
          <div className="glass overflow-x-auto">
            <table className="w-full text-left text-[0.875rem]" style={{ minWidth: 260 + cols.length * 230 }}>
              <caption className="sr-only">Programme comparison</caption>
              <thead>
                <tr className="border-b border-paper/10">
                  <th scope="col" className="w-48 px-4 py-3 font-medium text-paper/55">Factor</th>
                  {cols.map((c, i) => (
                    <th key={`${c.u.slug}/${c.p.slug}`} scope="col" className="px-4 py-3 align-top font-medium">
                      <span className="block font-display text-[1rem]">{c.u.name}</span>
                      <Link href={without(i)} className="text-[0.75rem] text-paper/50 hover:text-paper">Remove ×</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, fn]) => (
                  <tr key={label} className="border-b border-paper/5 align-top last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium text-paper/80">{label}</th>
                    {cols.map((c) => <td key={`${c.u.slug}/${c.p.slug}`} className="px-4 py-3 text-paper/85">{fn(c)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  );
}
