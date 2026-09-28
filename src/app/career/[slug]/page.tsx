import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, SectionLabel } from "@/components/primitives/Section";
import { Provenance } from "@/components/primitives/Provenance";
import { AxisIndicator } from "@/components/passion/AxisIndicator";
import { careerRepo } from "@/lib/data/repositories/careers";
import { courseRepo } from "@/lib/data/repositories/courses";
import { institutionRepo } from "@/lib/data/repositories/institutions";
import { FIELD_LABELS, type AxisKey, type AxisScore } from "@/lib/data/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = await careerRepo.bySlug(slug);
  return { title: career?.title ?? "Career" };
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = await careerRepo.bySlug(slug);
  if (!career) notFound();

  const [courses, institutions] = await Promise.all([
    Promise.all(career.relatedCourses.map((id) => courseRepo.byId(id))),
    Promise.all(career.relatedInstitutions.map((id) => institutionRepo.byId(id))),
  ]);
  const realCourses = courses.filter((c): c is NonNullable<typeof c> => !!c);
  const realInstitutions = institutions.filter((i): i is NonNullable<typeof i> => !!i);

  const axisScores: AxisScore[] = (Object.entries(career.workStyle) as [AxisKey, number][]).map(
    ([key, position]) => ({ key, position, confidence: 1 }),
  );

  return (
    <div data-register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="01">{career.fields.map((f) => FIELD_LABELS[f]).join(" · ")}</SectionLabel>
        <h1 className="display-m mt-3">{career.title}</h1>
        <p className="measure mt-5 text-body-l leading-relaxed text-current/75">{career.description}</p>
        <Provenance kind={career.provenance} className="mt-4" />

        <section className="mt-14">
          <h2 className="meta mb-4 text-current/50">Skills involved</h2>
          <div className="flex flex-wrap gap-2">
            {career.skills.map((s) => (
              <span key={s} className="meta rounded-full border border-current/15 px-2.5 py-1 text-current/60">{s}</span>
            ))}
          </div>
        </section>

        {axisScores.length > 0 && (
          <section className="mt-14">
            <h2 className="meta mb-2 text-current/50">Working style this tends toward</h2>
            <p className="mb-4 text-[0.8125rem] text-current/45">
              Neither end is "more" — this describes a tendency, not a requirement.
            </p>
            <div className="space-y-1">
              {axisScores.map((a) => <AxisIndicator key={a.key} score={a} />)}
            </div>
          </section>
        )}

        {realCourses.length > 0 && (
          <section className="mt-14">
            <h2 className="meta mb-4 text-current/50">Related courses</h2>
            <ul className="space-y-2">
              {realCourses.map((c) => (
                <li key={c.id}>
                  <Link href={`/course/${c.slug}`} className="link-underline text-[0.9375rem] text-cyan-deep">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {realInstitutions.length > 0 && (
          <section className="mt-14">
            <h2 className="meta mb-4 text-current/50">Where to study it</h2>
            <ul className="space-y-2">
              {realInstitutions.map((inst) => (
                <li key={inst.id}>
                  <Link href={`/college/${inst.slug}`} className="link-underline text-[0.9375rem] text-cyan-deep">
                    {inst.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </div>
  );
}
