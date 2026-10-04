import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { getCurrentUser } from "@/lib/auth/session";
import { fitDimensions, type FitDimension } from "@/lib/unis/fit";
import { BAND_GLYPH, BAND_LABEL, matchProgram, type Band, type ProgramMatch } from "@/lib/unis/match";
import type { Program, University } from "@/lib/unis/schema";
import { allUniversities, type UniversityRow } from "@/lib/unis/repo";
import { getProfile } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Your university discovery" };

type Scored = { row: UniversityRow; dims: Record<string, FitDimension> };

const why = (s: Scored, keys: string[]) =>
  keys.flatMap((k) => {
    const d = s.dims[k];
    if (!d || (d.state !== "aligned" && d.state !== "partial")) return [];
    const first = d.reasons.find((r) => !r.startsWith("For ")) ?? d.reasons[0];
    return [`${d.state === "aligned" ? "✓" : "◐"} ${d.label}: ${first.replace(/^[✓✗○] /, "")}`];
  }).slice(0, 3);

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Section register="deep" className="min-h-screen pt-32 pb-24">
        <Container width="narrow">
          <SectionLabel index="01">Discover</SectionLabel>
          <h1 className="display-m mt-3 mb-4">Find the university that fits you.</h1>
          <p className="measure text-[1.0625rem] text-paper/75">
            Explore universities by what you actually care about — academics, curriculum, cost, scholarships, opportunities, location —
            and see exactly why each one appears.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?next=/profile" className="inline-flex h-11 items-center rounded-full bg-electric px-6 font-semibold text-[var(--on-electric)]">Build my profile</Link>
            <Link href="/universities" className="inline-flex h-11 items-center rounded-full border border-paper/25 px-6">Explore universities</Link>
            <Link href="/universities?q=" className="inline-flex h-11 items-center rounded-full border border-paper/25 px-6">Search universities</Link>
          </div>
        </Container>
      </Section>
    );
  }

  const profile = await getProfile(user.id);
  const empty = !profile.fields.length && !profile.curriculum && !profile.countries.length && profile.budgetUsdPerYear == null && profile.budgetInrPerYear == null && !profile.preferredStates.length;
  const rows = await allUniversities();

  // Programme-level matches: course fit first (when the student chose subjects), never ineligible ones.
  type M = { u: University; p: Program; m: ProgramMatch };
  const ORDER: Band[] = ["target", "safety", "reach", "unclassified", "not-eligible"];
  const matches: M[] = rows
    .flatMap((r) => r.data.programs.map((p) => ({ u: r.data, p, m: matchProgram(r.data, p, profile) })))
    .filter((x) => x.m.percent != null && x.m.band !== "not-eligible" && (!profile.fields.length || x.m.dims.find((d) => d.key === "program")?.state === "aligned"))
    .sort((a, b) => (b.m.percent ?? 0) - (a.m.percent ?? 0) || ORDER.indexOf(a.m.band) - ORDER.indexOf(b.m.band));
  const best = matches.slice(0, 10);
  const byBand = (["reach", "target", "safety"] as const).map((b) => ({ b, list: matches.filter((x) => x.m.band === b).slice(0, 5) }));
  const scored: Scored[] = rows.map((row) => ({ row, dims: Object.fromEntries(fitDimensions(row.data, profile).map((d) => [d.key, d])) }));
  const ok = (s: Scored, k: string) => s.dims[k]?.state === "aligned";
  const notBad = (s: Scored, k: string) => s.dims[k]?.state !== "misaligned";
  const inField = scored.filter((s) => profile.fields.length === 0 || ok(s, "program"));

  const groups: { title: string; blurb: string; items: Scored[]; keys: string[] }[] = [
    { title: "Strong academic alignment", blurb: "Offers your field, and your curriculum and subjects meet the published requirements we could check.", items: inField.filter((s) => ok(s, "curriculum") && notBad(s, "testing")), keys: ["program", "curriculum", "testing"] },
    { title: "Financially relevant", blurb: "Published international tuition is within (or close to) your yearly budget.", items: inField.filter((s) => s.dims.cost.state === "aligned" || s.dims.cost.state === "partial"), keys: ["cost", "program", "location"] },
    { title: "Research opportunities", blurb: "Documented undergraduate research programmes in a university offering your field.", items: inField.filter((s) => ok(s, "research")), keys: ["research", "program"] },
    { title: "Entrepreneurship", blurb: "Documented incubators, accelerators or founder programmes.", items: inField.filter((s) => ok(s, "entrepreneurship")), keys: ["entrepreneurship", "program"] },
    { title: "Something unexpected", blurb: "Outside your preferred countries, but offers your field without a known academic mismatch — worth a look.", items: profile.countries.length ? inField.filter((s) => s.dims.location.state === "misaligned" && notBad(s, "curriculum")) : [], keys: ["program", "curriculum", "cost"] },
  ];

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Your university discovery</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Based on your profile</h1>
        <p className="measure text-[0.9375rem] text-paper/65">
          Built from transparent fit checks — open any course to see every dimension and its source. Match % is how well the published facts fit your priorities, not an admission chance. Reach / Target / Safety appears only where a published cut-off or acceptance rate exists; everything else is marked Unclassified.
        </p>
        {empty && (
          <p className="mt-6 rounded-[var(--radius-md)] border border-pending/50 bg-pending/10 p-4 text-[0.9375rem]">
            ⚠ Your profile is empty, so nothing can be matched yet. <Link href="/profile" className="text-cyan underline">Add your fields, curriculum and budget →</Link>
          </p>
        )}
        {!empty && (
          <section className="mt-12" aria-labelledby="best">
            <h2 id="best" className="font-display text-[1.75rem]">Best matches for you</h2>
            <p className="mt-1 mb-5 text-[0.875rem] text-paper/60">Courses in your subjects, ranked by fit with your profile and weights. Ineligible courses are left out.</p>
            {best.length === 0 ? (
              <p className="text-[0.875rem] text-paper/50">No course matches yet — add subjects you want to study and a budget to your <Link href="/profile" className="text-cyan">profile</Link>.</p>
            ) : (
              <ol className="space-y-3">
                {best.map(({ u, p, m }, i) => (
                  <li key={`${u.slug}/${p.slug}`} className="glass grid gap-3 p-5 md:grid-cols-[3rem_1fr_9rem]">
                    <span className="font-display text-[1.5rem] text-paper/40 tabular">{i + 1}</span>
                    <div>
                      <Link href={`/universities/${u.slug}/programs/${p.slug}`} className="font-display text-[1.125rem] hover:text-cyan">{p.name}</Link>
                      <p className="text-[0.8125rem] text-paper/60">{u.name} · {u.hub ?? u.city}{u.countryCode === "IN" ? `, ${u.region}` : `, ${u.country}`}</p>
                      <ul className="mt-2 space-y-0.5 text-[0.8125rem] text-paper/75">
                        {m.why.slice(0, 3).map((w) => <li key={w}>{w}</li>)}
                        <li className="text-paper/55">{BAND_GLYPH[m.band]} {BAND_LABEL[m.band]} — {m.bandReasons[0]}</li>
                      </ul>
                    </div>
                    <div className="md:text-right">
                      <span className="font-display text-[1.75rem] tabular">{m.percent}%</span>
                      <span className="block text-[0.75rem] text-paper/50">match{m.unknownShare ? ` · ${m.unknownShare}% unknown` : ""}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {byBand.map(({ b, list }) => (
                <div key={b} className="glass p-5">
                  <h3 className="font-display text-[1.25rem]">{BAND_GLYPH[b]} {BAND_LABEL[b]} <span className="text-paper/45">({matches.filter((x) => x.m.band === b).length})</span></h3>
                  {list.length === 0 ? (
                    <p className="mt-2 text-[0.8125rem] text-paper/55">None with published evidence yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-[0.875rem]">
                      {list.map(({ u, p, m }) => (
                        <li key={`${u.slug}/${p.slug}`}>
                          <Link href={`/universities/${u.slug}/programs/${p.slug}`} className="hover:text-cyan">{p.name}</Link>
                          <span className="block text-[0.75rem] text-paper/50">{u.name} · {m.percent}% match</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] text-paper/50">{matches.filter((x) => x.m.band === "unclassified").length} matching course(s) have no published cut-off or acceptance rate, so they aren&apos;t banded.</p>
          </section>
        )}
        {groups.map((g) => (
          <section key={g.title} className="mt-14">
            <h2 className="font-display text-[1.5rem]">{g.title} <span className="text-paper/45">({g.items.length})</span></h2>
            <p className="mt-1 mb-5 text-[0.875rem] text-paper/60">{g.blurb}</p>
            {g.items.length === 0 ? (
              <p className="text-[0.875rem] text-paper/50">Nothing here yet for your profile.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {g.items.slice(0, 6).map((s) => <UniversityCard key={s.row.slug} row={s.row} why={why(s, g.keys)} />)}
              </div>
            )}
          </section>
        ))}
      </Container>
    </Section>
  );
}
