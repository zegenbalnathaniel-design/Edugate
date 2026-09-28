import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";
import { Provenance } from "@/components/primitives/Provenance";
import { Sources } from "@/components/primitives/Sources";
import { VerificationBadge } from "@/components/education/VerificationBadge";
import { CourseCard } from "@/components/education/CourseCard";
import { ScholarshipCard } from "@/components/education/ScholarshipCard";
import { institutionRepo } from "@/lib/data/repositories/institutions";
import { courseRepo } from "@/lib/data/repositories/courses";
import { scholarshipRepo } from "@/lib/data/repositories/scholarships";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const institution = await institutionRepo.bySlug(slug);
  return { title: institution?.name ?? "Institution" };
}

export default async function CollegePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = await institutionRepo.bySlug(slug);
  if (!institution) notFound();

  const [courses, scholarships] = await Promise.all([
    courseRepo.byInstitution(institution.id),
    scholarshipRepo.byIds(institution.scholarships),
  ]);

  return (
    <div data-register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">
          {institution.location.city}, {institution.location.country} · Founded {institution.founded}
        </SectionLabel>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <h1 className="display-m">{institution.name}</h1>
          <span className="meta rounded-full border border-current/20 px-3 py-1.5 text-current/60">
            {institution.type}
          </span>
        </div>
        <p className="measure mt-5 text-body-l leading-relaxed text-current/75">
          {institution.description}
        </p>
        <Provenance kind={institution.provenance} className="mt-4" />

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="meta mb-2 text-current/45">Tuition</p>
            <p className="tabular text-[0.9375rem]">
              {institution.tuition.currency} {institution.tuition.min.toLocaleString()}–
              {institution.tuition.max.toLocaleString()} / {institution.tuition.period}
            </p>
          </div>
          <div>
            <p className="meta mb-2 text-current/45">Admissions</p>
            <p className="text-[0.9375rem] capitalize">{institution.admissions.selectivity.replace("-", " ")}</p>
          </div>
          <div>
            <p className="meta mb-2 text-current/45">Campus</p>
            <p className="text-[0.9375rem]">{institution.campus.sizeDescriptor}, {institution.campus.setting}</p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="meta mb-4 text-current/50">Verification</h2>
          <VerificationBadge record={institution.verification} />
          <Sources sources={institution.sources} className="mt-4" />
        </section>

        <section className="mt-16">
          <h2 className="meta mb-4 text-current/50">Admissions requirements</h2>
          <ul className="space-y-1.5">
            {institution.admissions.requirements.map((r, i) => (
              <li key={i} className="text-[0.9375rem] text-current/75">{r}</li>
            ))}
          </ul>
          {institution.admissions.deadlines.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {institution.admissions.deadlines.map((d, i) => (
                <span key={i} className="meta rounded-full border border-current/20 px-3 py-1.5">
                  {d.label}: {new Date(d.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="meta mb-4 text-current/50">Student experience</h2>
            <p className="text-[0.9375rem] text-current/75">{institution.studentExperience.classSizeDescriptor}</p>
            {institution.studentExperience.clubs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {institution.studentExperience.clubs.map((c) => (
                  <span key={c} className="meta rounded-full border border-current/15 px-2.5 py-1 text-current/60">{c}</span>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="meta mb-4 text-current/50">Campus facilities</h2>
            <ul className="space-y-1.5">
              {institution.campus.notableFacilities.map((f, i) => (
                <li key={i} className="text-[0.9375rem] text-current/75">{f}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="meta mb-6 text-current/50">Programs ({courses.length})</h2>
          {courses.length === 0 ? (
            <p className="text-[0.9375rem] text-current/60">No programs listed yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </section>

        {scholarships.length > 0 && (
          <section className="mt-16">
            <h2 className="meta mb-6 text-current/50">Scholarships</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {scholarships.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
