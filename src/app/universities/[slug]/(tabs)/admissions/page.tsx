import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, DataTable, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import Link from "next/link";
import { CURRICULUM_LABELS } from "@/lib/profile/schema";
import { BASIS_LABEL } from "@/lib/unis/filters";
import { dateLabel, TEST_POLICY_LABEL } from "@/lib/unis/format";
import { isPast } from "@/lib/unis/freshness";
import { getUniversity } from "@/lib/unis/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} admissions, deadlines & cutoffs` : "Admissions" };
}

export default async function AdmissionsPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const d = u.details;
  const cutoffsByYear = Object.entries(Object.groupBy(d.cutoffs, (c) => `${c.exam} ${c.year}${c.round ? ` · ${c.round}` : ""}`));

  // Exam → policy → applicable programmes (programme tests, programme entrance tests, then institution-wide tests).
  const examMap = new Map<string, { policy: string; programs: Set<string>; sourceId: string | null }>();
  const addExam = (test: string, policy: string, program: string, sourceId: string | null) => {
    const k = `${test}::${policy}`;
    const e = examMap.get(k) ?? { policy, programs: new Set<string>(), sourceId };
    e.programs.add(program);
    examMap.set(k, e);
  };
  for (const p of u.programs) {
    for (const t of p.tests) addExam(t.test, t.policy, p.name, t.sourceId);
    for (const t of p.admission?.entranceTests ?? []) if (!p.tests.some((x) => x.test === t)) addExam(t, "required", p.name, p.admission?.sourceId ?? null);
  }
  for (const t of u.testing) addExam(t.test, t.policy, "All courses", t.sourceId);
  const exams = [...examMap.entries()].map(([k, v]) => ({ test: k.split("::")[0], ...v }));
  const withAdmission = u.programs.filter((p) => p.admission);
  const allProgramsCount = u.programs.length;

  return (
    <div className="space-y-14">
      <Block title="How to apply">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="glass p-4">
            <dt className="meta text-paper/50">Apply via</dt>
            <dd className="mt-1">
              <Sourced sourceId={u.applicationPlatform.sourceId} sources={S} confidence={u.applicationPlatform.confidence} asOf={u.applicationPlatform.asOf} notes={u.applicationPlatform.notes}>
                {u.applicationPlatform.value}
              </Sourced>
            </dd>
          </div>
          <div className="glass p-4">
            <dt className="meta text-paper/50">Application fee</dt>
            <dd className="mt-1">
              <Sourced sourceId={u.applicationFee.sourceId} sources={S} confidence={u.applicationFee.confidence} asOf={u.applicationFee.asOf} notes={u.applicationFee.notes}>
                {u.applicationFee.value}
              </Sourced>
            </dd>
          </div>
        </dl>
        {d.admissionProcess.length > 0 && (
          <ol className="mt-6 space-y-4">
            {d.admissionProcess.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-electric" />
                <div>
                  <p className="font-medium">
                    <Sourced sourceId={s.sourceId} sources={S}>{s.step}</Sourced>
                  </p>
                  <p className="mt-0.5 text-[0.9375rem] text-paper/70">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
        {u.admissionsUrl && (
          <p className="mt-5 text-[0.875rem]">
            <a href={u.admissionsUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">Official admissions page ↗</a>
          </p>
        )}
      </Block>

      <Block title="Entrance exams by course" note="Which exam each course uses, and whether it is required or optional.">
        {exams.length === 0 ? (
          <NotYet>No entrance exam is listed for any course here{withAdmission.some((p) => p.admission!.basis.includes("merit")) ? " — admission is on Class XII marks (merit)" : ""}.</NotYet>
        ) : (
          <DataTable
            caption="Entrance exams"
            head={["Exam", "Required / optional", "Applies to"]}
            rows={exams.map((e) => [
              e.test,
              <Sourced key="p" sourceId={e.sourceId} sources={S}>{TEST_POLICY_LABEL[e.policy] ?? e.policy}</Sourced>,
              e.programs.size >= allProgramsCount && allProgramsCount > 1 ? "All courses on Edugate" : [...e.programs].join(", "),
            ])}
          />
        )}
      </Block>

      <Block title="Eligibility by course" note="Minimum marks, Class XI–XII subjects and how the institution selects, per course.">
        {withAdmission.length === 0 ? (
          <NotYet>Course-level eligibility isn&apos;t itemised yet — see each course page for curriculum requirements.</NotYet>
        ) : (
          <DataTable
            caption="Eligibility by course"
            minWidth={880}
            head={["Course", "Eligibility", "Minimum marks", "Required subjects", "Selection"]}
            rows={withAdmission.map((p) => [
              <Link key="n" href={`/universities/${u.slug}/programs/${p.slug}`} className="hover:text-cyan">{p.name}{p.stream && <span className="block text-[0.75rem] font-normal text-paper/50">{p.stream}</span>}</Link>,
              <Sourced key="e" sourceId={p.admission!.sourceId} sources={S} confidence={p.admission!.confidence} asOf={p.admission!.asOf} notes={p.admission!.notes}>{p.admission!.eligibility ?? "See course"}</Sourced>,
              p.admission!.minimumPercent ?? "—",
              p.admission!.requiredSubjects.join(", ") || "—",
              p.admission!.basis.map((b) => BASIS_LABEL[b]).join(", ") || "—",
            ])}
          />
        )}
        {(() => {
          const boards = [...new Set(u.programs.flatMap((p) => p.requirements.filter((r) => r.accepted !== false).map((r) => r.curriculum)))];
          return boards.length ? (
            <p className="mt-4 text-[0.875rem] text-paper/70">
              Boards and curricula with published requirements: {boards.map((b) => CURRICULUM_LABELS[b as keyof typeof CURRICULUM_LABELS] ?? b).join(", ")}. Details on each course page.
            </p>
          ) : null;
        })()}
        {withAdmission.some((p) => p.admission!.reservation || p.admission!.international) && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[...new Set(withAdmission.map((p) => p.admission!.reservation).filter(Boolean))].slice(0, 1).map((r) => (
              <div key="res" className="glass p-4"><p className="meta text-paper/50">Reservation</p><p className="mt-1 text-[0.875rem]">{r}</p></div>
            ))}
            {[...new Set(withAdmission.map((p) => p.admission!.international).filter(Boolean))].slice(0, 1).map((r) => (
              <div key="intl" className="glass p-4"><p className="meta text-paper/50">International, NRI & OCI applicants</p><p className="mt-1 text-[0.875rem]">{r}</p></div>
            ))}
          </div>
        )}
      </Block>

      <Block title="Important dates">
        {[...u.deadlines, ...u.programs.flatMap((p) => p.deadlines)].length === 0 ? (
          <NotYet>No dated deadline for the next intake is verified yet — check the admissions page.</NotYet>
        ) : (
          <DataTable
            caption="Admission deadlines"
            head={["Date", "Event", "Intake"]}
            rows={[...u.deadlines, ...u.programs.flatMap((p) => p.deadlines.map((d) => ({ ...d, label: `${p.name}: ${d.label}` })))]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((dl) => [
                <span key="d" className={isPast(dl.date) ? "text-paper/45 line-through" : ""}>{dateLabel(dl.date)}</span>,
                <Sourced key="l" sourceId={dl.sourceId} sources={S} confidence={dl.confidence}>
                  {dl.label}
                  {isPast(dl.date) ? " · passed" : ""}
                </Sourced>,
                `${dl.intake}${dl.timezone ? ` (${dl.timezone})` : ""}`,
              ])}
          />
        )}
      </Block>

      <Block title="Entrance tests & English">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="meta mb-2 text-paper/50">Tests</h3>
            {u.testing.length === 0 ? (
              <p className="text-[0.9375rem] text-paper/60">Course-specific — see each course.</p>
            ) : (
              <ul className="space-y-2 text-[0.9375rem]">
                {u.testing.map((t) => (
                  <li key={t.test}>
                    <Sourced sourceId={t.sourceId} sources={S} confidence={t.confidence} notes={t.notes}>
                      <strong>{t.test}</strong>: {TEST_POLICY_LABEL[t.policy]}
                      {t.typicalRange ? ` · typical ${t.typicalRange}` : ""}
                    </Sourced>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {u.english.length > 0 && (
          <div>
            <h3 className="meta mb-2 text-paper/50">English proficiency</h3>
            {(

              <ul className="space-y-2 text-[0.9375rem]">
                {u.english.map((e) => (
                  <li key={e.test}>
                    <Sourced sourceId={e.sourceId} sources={S} confidence={e.confidence} notes={e.waiver ? `Waiver: ${e.waiver}` : undefined}>
                      <strong>{e.test.replace("_IBT", " iBT")}</strong>: {e.minOverall ? `≥ ${e.minOverall} overall` : "accepted"}
                      {e.minSection ? `, ≥ ${e.minSection} per section` : ""}
                    </Sourced>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}
        </div>
      </Block>

      <Block title="Admission statistics" note="Published counts of applicants and admits. These describe past cycles — they are not your chance of admission.">
        {d.admissionStats.length === 0 ? (
          <NotYet>No published applicant and admit figures verified yet.</NotYet>
        ) : (
          <DataTable
            caption="Admission statistics"
            head={["Cycle", "Scope", "Applicants", "Admitted", "Enrolled", "Acceptance rate"]}
            rows={d.admissionStats.map((a) => [
              a.year,
              a.scope,
              a.applicants?.toLocaleString("en-US") ?? "—",
              a.admitted?.toLocaleString("en-US") ?? "—",
              a.enrolled?.toLocaleString("en-US") ?? "—",
              <Sourced key="r" sourceId={a.sourceId} sources={S} confidence={a.confidence} asOf={a.year} notes={a.notes}>
                {a.acceptanceRate ?? "—"}
              </Sourced>,
            ])}
          />
        )}
      </Block>

      <Block title="Cutoffs" note="Opening and closing ranks as published by the counselling authority for that year. Ranks shift every year; use them to understand competitiveness, not as a guarantee.">
        {d.cutoffs.length === 0 ? (
          <NotYet>
            No published cutoffs on Edugate for this university. Many universities admit holistically and don&apos;t publish cutoffs at all.
          </NotYet>
        ) : (
          <div className="space-y-8">
            {cutoffsByYear.map(([label, list]) => (
              <div key={label}>
                <h3 className="meta mb-3 text-paper/55">{label}</h3>
                <DataTable
                  caption={`Cutoffs ${label}`}
                  head={["Course", "Category", "Opening rank", "Closing rank"]}
                  rows={list!.map((c) => [
                    c.program,
                    c.category,
                    c.opening ?? "—",
                    <Sourced key="c" sourceId={c.sourceId} sources={S} confidence={c.confidence} notes={c.notes}>
                      <strong>{c.closing}</strong>
                    </Sourced>,
                  ])}
                />
              </div>
            ))}
          </div>
        )}
      </Block>
    </div>
  );
}
