import type { Metadata } from "next";
import Link from "next/link";
import { ProgramFilters } from "@/components/courses/ProgramFilters";
import { ProgramResults } from "@/components/courses/ProgramResults";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { FIELD_NAMES, parseFilters, subjectsInQuery } from "@/lib/unis/filters";
import { geoFacets, searchPrograms, subjectCounts } from "@/lib/unis/repo";
import { SUBJECT_GROUPS, SUBJECTS } from "@/lib/unis/taxonomy";
import { DEGREES } from "@/lib/unis/taxonomy";

export const metadata: Metadata = {
  title: "Course explorer",
  description: "Search every programme on Edugate by course — Economics, Commerce, Psychology, Computer Science, Law, Medicine — across Chennai, Tamil Nadu, India and abroad.",
};

export default async function CoursesPage({ searchParams }: PageProps<"/courses">) {
  const f = parseFilters(await searchParams);
  const [facets, counts] = await Promise.all([geoFacets(), subjectCounts()]);
  const searching = Boolean(f.q || f.fields.length || f.tiers.length || f.states.length || f.hubs.length || f.degrees.length || f.costBands.length || f.bases.length || f.tests.length);
  const hits = searching ? await searchPrograms(f) : [];
  const parsed = f.q ? subjectsInQuery(f.q) : null;
  const states = [...new Set(facets.filter((x) => x.countryCode === "IN").map((x) => x.region))].sort();
  const cities = [...new Set(facets.filter((x) => x.countryCode === "IN").map((x) => x.hub))].sort();

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Course explorer</SectionLabel>
        <h1 className="display-m mt-3">What do you want to study?</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          Search by course, not just by college. &ldquo;Economics&rdquo; finds BA, BSc and Honours Economics, Business Economics, Econometrics and PPE; &ldquo;Economics + Finance&rdquo; finds joint programmes. Each result keeps its exact official name.
        </p>
        {!searching ? (
          <>
            <form action="/courses" className="mt-8 flex max-w-2xl flex-wrap gap-2">
              <label className="sr-only" htmlFor="cq">Course</label>
              <input id="cq" name="q" placeholder="e.g. Economics, B.Com, Psychology, Economics + Finance" className="h-12 min-w-0 flex-1 rounded-full border border-paper/20 bg-navy-800 px-5 text-[0.9375rem]" />
              <button className="h-12 rounded-full bg-electric px-6 text-[0.9375rem] font-semibold text-[var(--on-electric)]">Search</button>
            </form>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {SUBJECT_GROUPS.map((g) => (
                <section key={g} aria-labelledby={`g-${g}`}>
                  <h2 id={`g-${g}`} className="meta mb-3 text-paper/50">{g}</h2>
                  <ul className="space-y-2">
                    {SUBJECTS.filter((s) => s.group === g).map((s) => (
                      <li key={s.key}>
                        <Link href={`/courses/${s.key}`} className="glass glass-interactive block p-4">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="font-display text-[1.125rem]">{s.label}</span>
                            <span className="text-[0.8125rem] text-paper/45 tabular">{counts[s.key] ?? 0}</span>
                          </span>
                          <span className="mt-1 block text-[0.8125rem] text-paper/60">{s.blurb}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[19rem_1fr]">
            <aside>
              <ProgramFilters f={f} action="/courses" states={states} cities={cities} degrees={[...DEGREES]} showQuery />
            </aside>
            <div>
              {parsed && parsed.all.length > 0 && (
                <p className="mb-4 text-[0.875rem] text-paper/65">
                  Showing programmes in <strong>{parsed.all.map((k) => FIELD_NAMES[k]).join(" + ")}</strong>
                  {parsed.rest ? <> whose name includes &ldquo;{parsed.rest}&rdquo;</> : null}.
                  {parsed.all.length === 1 && (
                    <> <Link href={`/courses/${parsed.all[0]}`} className="text-cyan hover:underline">Open the {FIELD_NAMES[parsed.all[0]]} page →</Link></>
                  )}
                </p>
              )}
              <ProgramResults hits={hits} />
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
