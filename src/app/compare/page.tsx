import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { Sourced } from "@/components/unis/Sourced";
import { getCurrentUser } from "@/lib/auth/session";
import { CURRICULUM_LABELS } from "@/lib/profile/schema";
import { satPolicy } from "@/lib/unis/extract";
import { dateLabel, moneyRange, qsLabel, TEST_POLICY_LABEL, usdApprox } from "@/lib/unis/format";
import { isPast } from "@/lib/unis/freshness";
import { allUniversities, getUniversitiesBySlugs } from "@/lib/unis/repo";
import type { University } from "@/lib/unis/schema";
import { getProfile } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Compare universities" };
const MAX = 5;
const NV = <span className="text-paper/45">Not currently verified</span>;

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  const sel = ((await searchParams).u ?? "").split(",").filter(Boolean).slice(0, MAX);
  const [rows, all, user] = await Promise.all([getUniversitiesBySlugs(sel), allUniversities(), getCurrentUser()]);
  const profile = user ? await getProfile(user.id) : null;
  const href = (slugs: string[]) => `/compare${slugs.length ? `?u=${slugs.join(",")}` : ""}`;

  const RowDefs: [string, (u: University) => ReactNode][] = [
    ["QS ranking", (u) => { const q = qsLabel(u); return q ? <Sourced sourceId={q.ranking.sourceId} sources={u.sources}>{q.text}</Sourced> : NV; }],
    ["Location", (u) => `${u.city}, ${u.country}`],
    ["Type", (u) => `${u.control.replace("-", "–")} · ${u.category.replaceAll("-", " ")}`],
    ["Programs on Edugate", (u) => u.programs.map((p) => <Link key={p.slug} href={`/universities/${u.slug}/programs/${p.slug}`} className="block text-cyan">{p.name}</Link>)],
    [
      profile?.curriculum ? `Your curriculum (${CURRICULUM_LABELS[profile.curriculum]})` : "Curricula with published requirements",
      (u) => {
        const reqs = u.programs.flatMap((p) => p.requirements.map((r) => ({ p, r })));
        if (profile?.curriculum) {
          const m = reqs.filter((x) => x.r.curriculum === profile.curriculum);
          if (!m.length) return <span className="text-paper/55">Not published</span>;
          return m.map(({ p, r }) => (
            <span key={p.slug} className="block"><Sourced sourceId={r.sourceId} sources={u.sources} confidence={r.confidence} notes={r.notes}>{p.degree}: {r.accepted === false ? "not accepted" : r.minimum ?? r.typical ?? "accepted"}</Sourced></span>
          ));
        }
        return [...new Set(reqs.filter((x) => x.r.accepted !== false).map((x) => CURRICULUM_LABELS[x.r.curriculum as keyof typeof CURRICULUM_LABELS] ?? x.r.curriculum))].join(", ") || NV;
      },
    ],
    ["SAT", (u) => { const s = satPolicy(u); return s ? TEST_POLICY_LABEL[s] : NV; }],
    ["English (IELTS)", (u) => { const e = u.english.find((x) => x.test === "IELTS"); return e ? <Sourced sourceId={e.sourceId} sources={u.sources} confidence={e.confidence}>≥ {e.minOverall ?? "?"}{e.minSection ? ` (≥ ${e.minSection} each)` : ""}</Sourced> : NV; }],
    ["International tuition", (u) => { const t = u.costs.internationalTuition; return t.value ? <><Sourced sourceId={t.sourceId} sources={u.sources} confidence={t.confidence} asOf={t.asOf} notes={t.notes}>{moneyRange(t.value, u.costs.currency)}</Sourced><span className="block text-[0.75rem] text-paper/45">{usdApprox(t.value, u.costs.currency)}</span></> : NV; }],
    ["Scholarships & aid", (u) => (u.scholarships.length ? u.scholarships.map((s) => <span key={s.name} className="block">{s.name}</span>) : <span className="text-paper/55">None verified yet</span>)],
    ["Research", (u) => u.opportunities.filter((o) => o.category === "research").map((o) => <span key={o.name} className="block">{o.name}</span>)],
    ["Entrepreneurship", (u) => u.opportunities.filter((o) => o.category === "entrepreneurship").map((o) => <span key={o.name} className="block">{o.name}</span>)],
    ["Internships & careers", (u) => u.opportunities.filter((o) => o.category === "internships" || o.category === "careers").map((o) => <span key={o.name} className="block">{o.name}</span>)],
    ["Next deadline", (u) => { const d = u.deadlines.filter((x) => !isPast(x.date)).sort((a, b) => a.date.localeCompare(b.date))[0]; return d ? <Sourced sourceId={d.sourceId} sources={u.sources} confidence={d.confidence}>{dateLabel(d.date)} — {d.label}</Sourced> : <span className="text-paper/55">None listed</span>; }],
    ["Data verified", (u) => `${dateLabel(u.lastVerified)} · ${u.sources.length} sources`],
  ];

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Compare</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Side by side, no ranking score</h1>
        <p className="measure mb-8 text-[0.9375rem] text-paper/65">
          Pick up to {MAX}. Edugate lays the facts next to each other; which row matters most is your call. Expand any ⓘ to see the source.
        </p>
        <div className="mb-8 flex flex-wrap gap-2">
          {all.map((r) => {
            const on = sel.includes(r.slug);
            const next = on ? sel.filter((s) => s !== r.slug) : [...sel, r.slug];
            const disabled = !on && sel.length >= MAX;
            return disabled ? (
              <span key={r.slug} className="rounded-full border border-paper/10 px-3 py-1.5 text-[0.8125rem] text-paper/30">{r.name}</span>
            ) : (
              <Link key={r.slug} href={href(next)} aria-pressed={on} className={`rounded-full border px-3 py-1.5 text-[0.8125rem] ${on ? "border-electric bg-electric text-[var(--on-electric)]" : "border-paper/25 hover:border-paper/60"}`}>
                {on ? "✓ " : "+ "}{r.name}
              </Link>
            );
          })}
        </div>
        {rows.length === 0 ? (
          <p className="glass p-8 text-center text-[0.9375rem] text-paper/70">Choose two or more universities above to compare them.</p>
        ) : (
          <div className="glass overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[0.875rem]">
              <caption className="sr-only">University comparison</caption>
              <thead>
                <tr className="border-b border-paper/10">
                  <th scope="col" className="w-48 px-4 py-4 text-paper/55 font-medium">Category</th>
                  {rows.map((r) => (
                    <th key={r.slug} scope="col" className="px-4 py-4 align-top font-display text-[1.0625rem] font-normal">
                      <Link href={`/universities/${r.slug}`} className="hover:text-cyan">{r.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RowDefs.map(([label, fn]) => (
                  <tr key={label} className="border-b border-paper/5 align-top last:border-0">
                    <th scope="row" className="px-4 py-3 font-normal text-paper/55">{label}</th>
                    {rows.map((r) => {
                      const v = fn(r.data);
                      const empty = v == null || (Array.isArray(v) && v.length === 0);
                      return <td key={r.slug} className="px-4 py-3">{empty ? <span className="text-paper/45">None documented</span> : v}</td>;
                    })}
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
