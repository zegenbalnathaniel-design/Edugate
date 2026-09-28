import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, SectionLabel } from "@/components/primitives/Section";
import { Provenance } from "@/components/primitives/Provenance";
import { CareerCard } from "@/components/education/CareerCard";
import { courseRepo } from "@/lib/data/repositories/courses";
import { institutionRepo } from "@/lib/data/repositories/institutions";
import { careerRepo } from "@/lib/data/repositories/careers";
import { FIELD_LABELS } from "@/lib/data/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await courseRepo.bySlug(slug);
  return { title: course?.name ?? "Course" };
}

const WORKLOAD_LABEL: Record<string, string> = {
  light: "Light workload",
  moderate: "Moderate workload",
  heavy: "Heavy workload",
  intensive: "Intensive workload",
};

function theoryPracticeBand(ratio: number): string {
  if (ratio >= 0.7) return "Theory-heavy";
  if (ratio >= 0.45) return "Balanced theory and practice";
  return "Practice-heavy";
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await courseRepo.bySlug(slug);
  if (!course) notFound();

  const [institutions, careers] = await Promise.all([
    Promise.all(course.institutions.map((id) => institutionRepo.byId(id))),
    careerRepo.byIds(course.careerPathways),
  ]);
  const realInstitutions = institutions.filter((i): i is NonNullable<typeof i> => !!i);

  return (
    <div data-register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">{FIELD_LABELS[course.field]}</SectionLabel>
        <h1 className="display-m mt-3">{course.name}</h1>
        <p className="mt-4 text-[0.9375rem] text-current/60">
          {course.durationMonths} months · {course.fees.currency} {course.fees.min.toLocaleString()}–
          {course.fees.max.toLocaleString()} / {course.fees.period}
        </p>
        <Provenance kind={course.provenance} className="mt-4" />

        <section className="mt-14">
          <h2 className="meta mb-4 text-current/50">Offered at</h2>
          <div className="flex flex-wrap gap-3">
            {realInstitutions.map((inst) => (
              <Link
                key={inst.id}
                href={`/college/${inst.slug}`}
                className="link-underline text-[0.9375rem] text-cyan-deep"
              >
                {inst.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="meta mb-3 text-current/50">Subjects</h2>
            <ul className="space-y-1.5">
              {course.subjects.map((s) => (
                <li key={s} className="text-[0.9375rem] text-current/75">{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="meta mb-3 text-current/50">Requirements</h2>
            <ul className="space-y-1.5">
              {course.requirements.map((r, i) => (
                <li key={i} className="text-[0.9375rem] text-current/75">{r.description}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="glass mt-14 p-8">
          <h2 className="meta mb-6 text-current/50">The curriculum, honestly (§49)</h2>
          <p className="text-[0.9375rem] text-current/70">
            {theoryPracticeBand(course.curriculumReality.theoryToPracticeRatio)} · {WORKLOAD_LABEL[course.curriculumReality.workloadDescriptor]}
          </p>

          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="meta mb-2 text-current/45">What you'll actually study</p>
              <ul className="space-y-1.5">
                {course.curriculumReality.whatYouStudy.map((s, i) => (
                  <li key={i} className="text-[0.9375rem] text-current/75">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="meta mb-2 text-current/45">Typical projects</p>
              <ul className="space-y-1.5">
                {course.curriculumReality.typicalProjects.map((s, i) => (
                  <li key={i} className="text-[0.9375rem] text-current/75">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="meta mb-2 text-current/45">How you're assessed</p>
              <ul className="space-y-1.5">
                {course.curriculumReality.assessmentTypes.map((s, i) => (
                  <li key={i} className="text-[0.9375rem] text-current/75">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="meta mb-2 text-current/45">Skills developed</p>
              <div className="flex flex-wrap gap-2">
                {course.curriculumReality.skillsDeveloped.map((s) => (
                  <span key={s} className="meta rounded-full border border-current/15 px-2.5 py-1 text-current/60">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {careers.length > 0 && (
          <section className="mt-14">
            <h2 className="meta mb-6 text-current/50">Where this could lead</h2>
            <p className="mb-6 text-[0.875rem] text-current/50">
              One pathway worth exploring, not the only one.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {careers.map((c) => <CareerCard key={c.id} career={c} />)}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
