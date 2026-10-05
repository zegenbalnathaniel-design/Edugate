import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { ABROAD_REGIONS, abroadRegionOf, HOME_HUB, sortStates, stateLabel, tierOf, TIER_LABEL, type Tier } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";
import { geoFacets, subjectCounts } from "@/lib/unis/repo";
import { SUBJECT_GROUPS, SUBJECTS } from "@/lib/unis/taxonomy";

export const metadata: Metadata = {
  title: "Explore colleges",
  description: "Chennai → Tamil Nadu → India → Abroad: colleges, courses, admissions, fees and scholarships with every fact sourced.",
};

const TIER_COPY: Record<Tier, { href: string; blurb: string }> = {
  chennai: { href: explorePath.city(HOME_HUB.state, HOME_HUB.city), blurb: "Universities, autonomous and affiliated colleges, deemed universities and specialist institutes across Chennai." },
  "tamil-nadu": { href: explorePath.state(HOME_HUB.state), blurb: "Coimbatore, Madurai, Tiruchirappalli, Vellore, Salem, Tirunelveli, Thanjavur and the state's other education hubs." },
  india: { href: explorePath.india, blurb: "State by state, city by city — from Karnataka and Maharashtra to Delhi NCR and beyond." },
  abroad: { href: explorePath.abroad, blurb: "USA, UK, Canada, Australia, Singapore, Europe, UAE and Hong Kong, with the same depth." },
};

export default async function ExplorePage() {
  await connection(); // counts change with every data update; never serve a build-time snapshot
  const [facets, counts] = await Promise.all([geoFacets(), subjectCounts()]);
  const tally = (t: Tier) => {
    const rows = facets.filter((f) => tierOf({ countryCode: f.countryCode, region: f.region, hub: f.hub, city: f.hub }) === t);
    return { institutions: rows.reduce((a, r) => a + r.institutions, 0), programs: rows.reduce((a, r) => a + r.programs, 0) };
  };
  const states = sortStates(
    Object.values(
      facets
        .filter((f) => f.countryCode === "IN")
        .reduce<Record<string, { name: string; n: number }>>((acc, f) => {
          acc[f.region] ??= { name: f.region, n: 0 };
          acc[f.region].n += f.institutions;
          return acc;
        }, {}),
    ),
  );
  const abroad = ABROAD_REGIONS.map((r) => ({ ...r, n: facets.filter((f) => f.countryCode !== "IN" && abroadRegionOf(f.countryCode).slug === r.slug).reduce((a, f) => a + f.institutions, 0) })).filter((r) => r.n > 0);

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Explore colleges</SectionLabel>
        <h1 className="display-m mt-3 max-w-4xl">Start close to home, then widen the map.</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          Chennai first, then the rest of Tamil Nadu, then India, then abroad. Drill down from state to city to institution to programme. Every fee, cut-off and deadline names its source and the date it was checked.
        </p>

        <form action="/courses" className="mt-8 flex max-w-2xl flex-wrap gap-2">
          <label className="sr-only" htmlFor="q">What do you want to study?</label>
          <input id="q" name="q" placeholder="I want to study… e.g. Economics, B.Com, Psychology, Economics + Finance" className="h-12 min-w-0 flex-1 rounded-full border border-paper/20 bg-navy-800 px-5 text-[0.9375rem]" />
          <button className="h-12 rounded-full bg-electric px-6 text-[0.9375rem] font-semibold text-[var(--on-electric)]">Find courses</button>
        </form>

        <ul className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(["chennai", "tamil-nadu", "india", "abroad"] as Tier[]).map((t) => {
            const n = tally(t);
            return (
              <li key={t}>
                <Link href={TIER_COPY[t].href} className="glass glass-interactive flex h-full flex-col p-6">
                  <span className="font-display text-[1.75rem] leading-tight">{t === "india" ? "India" : TIER_LABEL[t]}</span>
                  <span className="mt-2 text-[0.875rem] text-paper/65">{TIER_COPY[t].blurb}</span>
                  <span className="mt-auto pt-5 text-[0.875rem]">
                    <strong className="tabular">{n.institutions}</strong> institution{n.institutions === 1 ? "" : "s"} · <strong className="tabular">{n.programs}</strong> programmes
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <section aria-labelledby="by-course">
            <h2 id="by-course" className="font-display text-[1.5rem]">Explore by course</h2>
            <p className="mt-1 text-[0.8125rem] text-paper/55">Each subject gathers every variant — BA, BSc, Hons, joint degrees — under its official name.</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {SUBJECT_GROUPS.map((g) => (
                <div key={g}>
                  <h3 className="meta mb-2 text-paper/50">{g}</h3>
                  <ul className="space-y-1.5 text-[0.9375rem]">
                    {SUBJECTS.filter((s) => s.group === g).map((s) => (
                      <li key={s.key}>
                        <Link href={`/courses/${s.key}`} className="hover:text-cyan">
                          {s.label} <span className="text-paper/40 tabular">({counts[s.key] ?? 0})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <aside className="space-y-6">
            <div className="glass p-5">
              <h2 className="meta text-paper/50">Indian states</h2>
              <ul className="mt-3 space-y-1.5 text-[0.9375rem]">
                {states.map((s) => (
                  <li key={s.name} className="flex justify-between gap-3">
                    <Link href={explorePath.state(s.name)} className="hover:text-cyan">{stateLabel(s.name)}</Link>
                    <span className="text-paper/45 tabular">{s.n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass p-5">
              <h2 className="meta text-paper/50">Abroad</h2>
              <ul className="mt-3 space-y-1.5 text-[0.9375rem]">
                {abroad.map((r) => (
                  <li key={r.slug} className="flex justify-between gap-3">
                    <Link href={`/explore/abroad/${r.slug}`} className="hover:text-cyan">{r.label}</Link>
                    <span className="text-paper/45 tabular">{r.n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[0.8125rem] text-paper/55">
              Prefer a full filter view? <Link href="/universities" className="text-cyan hover:underline">Search all colleges with filters →</Link>
            </p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
