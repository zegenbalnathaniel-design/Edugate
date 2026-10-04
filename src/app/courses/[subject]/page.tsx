import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/explore/Crumbs";
import { ProgramFilters } from "@/components/courses/ProgramFilters";
import { ProgramResults } from "@/components/courses/ProgramResults";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { parseFilters } from "@/lib/unis/filters";
import { searchPrograms } from "@/lib/unis/repo";
import { SUBJECT_BY_KEY, SUBJECTS } from "@/lib/unis/taxonomy";

export async function generateMetadata({ params }: PageProps<"/courses/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const s = SUBJECT_BY_KEY[subject as keyof typeof SUBJECT_BY_KEY];
  return s ? { title: `${s.label} courses — Chennai, Tamil Nadu, India & abroad`, description: s.blurb } : { title: "Course" };
}

export default async function SubjectPage({ params, searchParams }: PageProps<"/courses/[subject]">) {
  const { subject } = await params;
  const s = SUBJECT_BY_KEY[subject as keyof typeof SUBJECT_BY_KEY];
  if (!s) notFound();
  const f = parseFilters(await searchParams);
  // Facets come from the unfiltered subject list, so options don't vanish as you filter.
  const [all, hits] = await Promise.all([searchPrograms({ ...parseFilters({}), fields: [s.key] }), searchPrograms({ ...f, fields: [s.key] })]);
  const states = [...new Set(all.filter((h) => h.uni.countryCode === "IN").map((h) => h.uni.region))].sort();
  const cities = [...new Set(all.filter((h) => h.uni.countryCode === "IN").map((h) => h.uni.hub ?? h.uni.city))].sort();
  const degrees = [...new Set(all.map((h) => h.degreeNorm ?? "Other"))];
  const related = SUBJECTS.filter((x) => x.group === s.group && x.key !== s.key);

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <Crumbs items={[{ label: "Courses", href: "/courses" }, { label: s.label }]} />
        <SectionLabel index="01" className="mt-6">{s.group}</SectionLabel>
        <h1 className="display-m mt-3">{s.label}</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">{s.blurb} Grouped Chennai first, then Tamil Nadu, the rest of India and abroad. Tick programmes to compare them side by side.</p>
        {related.length > 0 && (
          <p className="mt-4 flex flex-wrap gap-2 text-[0.8125rem]">
            <span className="meta mr-1 self-center text-paper/45">Related</span>
            {related.map((r) => <Link key={r.key} href={`/courses/${r.key}`} className="rounded-full border border-paper/20 px-3 py-1 hover:border-paper/60">{r.label}</Link>)}
          </p>
        )}
        <div className="mt-10 grid gap-8 lg:grid-cols-[19rem_1fr]">
          <aside>
            <ProgramFilters f={f} action={`/courses/${s.key}`} states={states} cities={cities} degrees={degrees} />
          </aside>
          <div>
            <ProgramResults hits={hits} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
