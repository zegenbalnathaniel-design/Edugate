import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Crumbs } from "@/components/explore/Crumbs";
import { Container, Section } from "@/components/primitives/Section";
import { Block, DataTable, NotYet } from "@/components/unis/Blocks";
import { FitPanel } from "@/components/unis/FitPanel";
import { ReportForm } from "@/components/unis/ReportForm";
import { Sourced, TrustBar } from "@/components/unis/Sourced";
import { TrackButton } from "@/components/unis/TrackButton";
import { getCurrentUser } from "@/lib/auth/session";
import { CURRICULUM_LABELS } from "@/lib/profile/schema";
import { programCostInr } from "@/lib/unis/extract";
import { gapAnalysis, type GapStatus } from "@/lib/unis/fit";
import { BASIS_LABEL, FIELD_NAMES, parseFilters } from "@/lib/unis/filters";
import { dateLabel, inrCompact, moneyRange, salary, TEST_POLICY_LABEL, usdApprox } from "@/lib/unis/format";
import { perYear } from "@/lib/unis/fx";
import { isPast } from "@/lib/unis/freshness";
import { tierOf } from "@/lib/unis/geo";
import { BAND_GLYPH, BAND_LABEL, matchProgram } from "@/lib/unis/match";
import { placeCrumbs } from "@/lib/unis/paths";
import { getUniversity, searchPrograms } from "@/lib/unis/repo";
import { normalizeDegree, programSubjects } from "@/lib/unis/taxonomy";
import { getProfile, trackedSlugs } from "@/lib/user/repo";

type Props = { params: Promise<{ slug: string; program: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, program } = await params;
  const row = await getUniversity(slug);
  const p = row?.data.programs.find((x) => x.slug === program);
  return { title: p ? `${p.name} — ${row!.name}: eligibility, fees, admission & careers` : "Program", description: p?.summary };
}

const GAP: Record<GapStatus, { glyph: string; label: string; tone: string }> = {
  meets: { glyph: "✓", label: "Meets", tone: "text-verified" },
  exceeds: { glyph: "↑", label: "Exceeds", tone: "text-verified" },
  missing: { glyph: "✗", label: "Missing", tone: "text-attention" },
  unclear: { glyph: "◐", label: "Unclear — verify", tone: "text-pending" },
  "not-applicable": { glyph: "–", label: "Not applicable", tone: "text-paper/50" },
};
const STATUS_LABEL: Record<string, string> = { required: "Required", recommended: "Recommended", accepted: "Accepted", "not-accepted": "Not accepted", conditional: "Conditional" };
const LEVEL_LABEL = { bachelors: "Undergraduate", integrated: "Integrated", masters: "Postgraduate" } as const;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="glass p-4">
      <dt className="meta text-paper/50">{label}</dt>
      <dd className="mt-1 text-[0.9375rem]">{children}</dd>
    </div>
  );
}

export default async function ProgramPage({ params }: Props) {
  const { slug, program } = await params;
  const row = await getUniversity(slug);
  const p = row?.data.programs.find((x) => x.slug === program);
  if (!row || !p) notFound();
  const u = row.data;
  const S = u.sources;
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const tracked = user ? await trackedSlugs(user.id) : new Set<string>();
  const gaps = profile ? gapAnalysis(u, p, profile) : [];
  const match = profile ? matchProgram(u, p, profile) : null;
  const india = u.countryCode === "IN";
  const fees = p.fees ?? (india ? u.costs.domesticTuition : u.costs.internationalTuition);
  const english = p.english.length ? p.english : u.english;
  const subjects = programSubjects(p);
  const degree = normalizeDegree(p.degree, p.level);
  const base = `/universities/${u.slug}`;
  const a = p.admission;
  const process = a?.process.length ? a.process : u.details.admissionProcess;
  const deadlines = [...p.deadlines, ...u.deadlines].sort((x, y) => x.date.localeCompare(y.date));
  const yearly = perYear(fees.value, p.durationYears);
  const inr = programCostInr(u, p);
  const hostel = [...p.feeBreakdown, ...u.details.feeBreakdown].filter((f) => /hostel|hall|residen|accommodation|room|mess|food/i.test(f.item));
  const scholarships = p.scholarships.length ? u.scholarships.filter((s) => p.scholarships.includes(s.name)) : u.scholarships;
  const opps = [...p.opportunities, ...u.opportunities.filter((o) => ["internships", "exchange", "international", "industry", "research"].includes(o.category))];
  const outcomes = [...p.outcomes].sort((x, y) => y.year.localeCompare(x.year));
  const instOutcomes = outcomes.length ? [] : [...u.details.outcomes].sort((x, y) => y.year.localeCompare(x.year));
  const similar = (await searchPrograms({ ...parseFilters({}), fields: [subjects.includes(p.field) ? p.field : subjects[0]] }))
    .filter((h) => !(h.uni.slug === u.slug && h.program.slug === p.slug) && tierOf(h.uni) === tierOf({ countryCode: u.countryCode, region: u.region, hub: u.hub, city: u.city }))
    .slice(0, 6);

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <Crumbs
          items={[
            ...placeCrumbs(u),
            { label: u.name, href: base },
            { label: LEVEL_LABEL[p.level], href: `${base}/courses` },
            ...(degree !== "Other" ? [{ label: degree, href: `${base}/courses?degree=${encodeURIComponent(degree)}` }] : []),
            { label: p.name },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Link key={s} href={`/courses/${s}`} className="meta rounded-full border border-electric/40 px-2 py-0.5 text-electric hover:bg-electric/10">{FIELD_NAMES[s] ?? s}</Link>
              ))}
            </p>
            <h1 className="display-m mt-3">{p.name}</h1>
            {p.specialization && <p className="mt-1 text-[1rem] text-paper/70">Specialisation: {p.specialization}</p>}
            <p className="mt-3 text-[0.9375rem] text-paper/70">
              <Link href={base} className="hover:text-paper">{u.name}</Link> · {p.degree}
              {p.durationYears ? ` · ${p.durationYears} years` : ""}
              {p.department ?? p.school ? ` · ${p.department ?? p.school}` : ""}
              {p.stream ? ` · ${p.stream}` : ""}
            </p>
            <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-paper/80">{p.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackButton university={u.slug} program={p.slug} back={`${base}/programs/${p.slug}`} tracked={tracked.has(`${u.slug}/${p.slug}`)} />
            <Link href={`/compare/programs?p=${u.slug}/${p.slug}${similar[0] ? `&p=${similar[0].uni.slug}/${similar[0].program.slug}` : ""}`} className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">Compare</Link>
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">Official page ↗</a>}
          </div>
        </div>
        <TrustBar lastVerified={u.lastVerified} sources={S} />

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Degree · level">{p.degree} · {LEVEL_LABEL[p.level]}</Fact>
          <Fact label="Duration">{p.durationYears ? `${p.durationYears} years` : <span className="text-paper/50">Not verified</span>}</Fact>
          <Fact label="Mode">{p.mode ? <span className="capitalize">{p.mode}</span> : <span className="text-paper/50">Not stated</span>}</Fact>
          <Fact label="Seats (intake)">
            {p.intake.value != null ? (
              <Sourced sourceId={p.intake.sourceId} sources={S} confidence={p.intake.confidence} asOf={p.intake.asOf} notes={p.intake.notes}>{p.intake.value}</Sourced>
            ) : (
              <span className="text-paper/50">Not published</span>
            )}
          </Fact>
          <Fact label="Tuition">
            {fees.value ? (
              <Sourced sourceId={fees.sourceId} sources={S} confidence={fees.confidence} asOf={fees.asOf} notes={fees.notes}>{moneyRange(fees.value, u.costs.currency)}</Sourced>
            ) : (
              <span className="text-paper/50">Not verified</span>
            )}
            {!india && inr != null && <span className="block text-[0.75rem] text-paper/45">≈ {inrCompact(inr)}/yr</span>}
          </Fact>
          <Fact label="How you get in">{a?.basis.length ? a.basis.map((b) => BASIS_LABEL[b]).join(", ") : <span className="text-paper/50">See admissions below</span>}</Fact>
          <Fact label="Campus">{p.campus ?? u.locality ?? u.city}</Fact>
          <Fact label="Department">{p.department ?? p.school ?? <span className="text-paper/50">Not stated</span>}</Fact>
        </dl>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-14">
            {match && (
              <section aria-labelledby="your-match" className="glass p-5">
                <h2 id="your-match" className="meta text-paper/55">Your match</h2>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-2">
                  <p>
                    <span className="font-display text-[2rem] tabular">{match.percent != null ? `${match.percent}%` : "—"}</span>
                    <span className="ml-2 text-[0.8125rem] text-paper/55">fit with your priorities{match.unknownShare ? ` · ${match.unknownShare}% of your weights unknown` : ""}</span>
                  </p>
                  <p className="text-[1.125rem]"><strong>{BAND_GLYPH[match.band]} {BAND_LABEL[match.band]}</strong></p>
                </div>
                <ul className="mt-3 space-y-1 text-[0.875rem] text-paper/75">
                  {match.bandReasons.map((r) => <li key={r}>{r}</li>)}
                  {match.why.slice(0, 4).map((r) => <li key={r}>{r}</li>)}
                </ul>
                <p className="mt-3 text-[0.75rem] text-paper/50">Match % is how well the published facts fit your profile and weights — not an admission chance. Reach/Target/Safety uses only published cut-offs or acceptance rates.</p>
              </section>
            )}

            {profile && (
              <section>
                <h2 className="meta mb-4 text-paper/60">Academic gap analysis — your profile vs published requirements</h2>
                {gaps.length === 0 ? (
                  <p className="text-[0.9375rem] text-paper/65">Add your curriculum, subjects and test scores in <Link href="/profile" className="text-cyan">your profile</Link> to compare them against this course.</p>
                ) : (
                  <DataTable
                    caption="Requirement comparison"
                    head={["Requirement", "Institution", "You", "Status"]}
                    rows={gaps.map((g) => [
                      g.requirement,
                      <Sourced key="u" sourceId={g.sourceId} sources={S}>{g.university}</Sourced>,
                      g.student,
                      <span key="s" className={`whitespace-nowrap ${GAP[g.status].tone}`}>{GAP[g.status].glyph} {GAP[g.status].label}</span>,
                    ])}
                  />
                )}
                <p className="mt-3 text-[0.8125rem] text-paper/50">Meeting published requirements is not a prediction of admission.</p>
              </section>
            )}

            <Block title="Admission" note={a ? undefined : "Course-level admission details aren't itemised yet — institution-wide information is shown."}>
              {a && (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Fact label="Eligibility">
                    <Sourced sourceId={a.sourceId} sources={S} confidence={a.confidence} asOf={a.asOf} notes={a.notes}>{a.eligibility ?? "See official page"}</Sourced>
                  </Fact>
                  <Fact label="Minimum marks">{a.minimumPercent ?? <span className="text-paper/50">Not published</span>}</Fact>
                  <Fact label="Class XI–XII subjects">{a.requiredSubjects.length ? a.requiredSubjects.join(", ") : <span className="text-paper/50">None specified</span>}</Fact>
                  <Fact label="Entrance tests">{a.entranceTests.length ? a.entranceTests.join(", ") : <span className="text-paper/50">None — {a.basis.includes("merit") ? "merit on Class XII marks" : "see process"}</span>}</Fact>
                  {a.applicationFee && <Fact label="Application fee">{a.applicationFee}</Fact>}
                  {a.reservation && <Fact label="Reservation">{a.reservation}</Fact>}
                  {a.international && <Fact label="International / NRI / OCI">{a.international}</Fact>}
                </dl>
              )}
              {!a && u.applicationFee.value && (
                <p className="text-[0.9375rem]">Application fee: <Sourced sourceId={u.applicationFee.sourceId} sources={S} confidence={u.applicationFee.confidence}>{u.applicationFee.value}</Sourced></p>
              )}
              {process.length > 0 && (
                <ol className="mt-6 space-y-3">
                  {process.map((st, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-electric/60 text-[0.8125rem] text-electric">{i + 1}</span>
                      <div>
                        <p className="font-medium">{st.step}</p>
                        <p className="text-[0.9375rem] text-paper/70">{st.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {deadlines.length > 0 && (
                <ul className="mt-6 space-y-1.5 text-[0.9375rem]">
                  {deadlines.map((d) => (
                    <li key={`${d.label}${d.date}`} className={isPast(d.date) ? "text-paper/45" : ""}>
                      <Sourced sourceId={d.sourceId} sources={S} confidence={d.confidence}>
                        <strong className={isPast(d.date) ? "line-through" : ""}>{dateLabel(d.date)}</strong> — {d.label}{isPast(d.date) ? " · passed" : ""}
                      </Sourced>
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title="Entry requirements by board & curriculum">
              {p.requirements.length === 0 ? (
                <NotYet>Board-specific requirements (CBSE, ISC, state board, IB, A-levels) not verified for this course yet.</NotYet>
              ) : (
                <div className="space-y-4">
                  {p.requirements.map((r) => (
                    <div key={r.curriculum} className="glass p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-[1.125rem]">{CURRICULUM_LABELS[r.curriculum as keyof typeof CURRICULUM_LABELS] ?? r.curriculum}</h3>
                        <Sourced sourceId={r.sourceId} sources={S} confidence={r.confidence} asOf={r.asOf} notes={r.notes}>
                          <span className={r.accepted === false ? "text-attention" : r.accepted ? "text-verified" : "text-paper/60"}>
                            {r.accepted === false ? "✗ Not accepted" : r.accepted ? "✓ Accepted" : "○ Not stated"}
                          </span>
                        </Sourced>
                      </div>
                      {(r.minimum || r.typical) && (
                        <p className="mt-2 text-[0.9375rem]">
                          {r.minimum && <>Minimum: <strong>{r.minimum}</strong></>}
                          {r.minimum && r.typical && " · "}
                          {r.typical && <>Typical/competitive (published): <strong>{r.typical}</strong></>}
                        </p>
                      )}
                      {r.subjects.length > 0 && (
                        <ul className="mt-3 space-y-1 text-[0.875rem]">
                          {r.subjects.map((s, i) => (
                            <li key={i}>
                              <span className="meta mr-2 text-paper/50">{STATUS_LABEL[s.status]}</span>
                              {s.subject}{s.level ? ` (${s.level})` : ""}{s.minGrade ? ` — grade ${s.minGrade}` : ""}
                              {s.notes && <span className="block text-[0.8125rem] text-paper/60">{s.notes}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Block>

            <Block title="Tests & English">
              <ul className="space-y-1.5 text-[0.9375rem]">
                {[...p.tests, ...u.testing.filter((t) => !p.tests.some((x) => x.test === t.test))].map((t) => (
                  <li key={t.test}><Sourced sourceId={t.sourceId} sources={S} confidence={t.confidence} notes={t.notes}><strong>{t.test}</strong>: {TEST_POLICY_LABEL[t.policy]}{t.typicalRange ? ` · typical ${t.typicalRange}` : ""}</Sourced></li>
                ))}
                {english.map((e) => (
                  <li key={e.test}><Sourced sourceId={e.sourceId} sources={S} confidence={e.confidence} notes={e.waiver ? `Waiver: ${e.waiver}` : undefined}><strong>{e.test.replace("_IBT", " iBT")}</strong>: {e.minOverall ? `≥ ${e.minOverall}` : "accepted"}{e.minSection ? ` (sections ≥ ${e.minSection})` : ""}</Sourced></li>
                ))}
                {p.tests.length + u.testing.length + english.length === 0 && <li className="text-paper/60">No test requirements listed.</li>}
              </ul>
            </Block>

            <Block title="What you'd study">
              {p.curriculum.length === 0 ? (
                <NotYet>
                  Year-by-year course list not verified yet — Edugate only shows course names taken from an official syllabus.
                  {p.url && <> See the <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-cyan">official page ↗</a>.</>}
                </NotYet>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {p.curriculum.map((y) => (
                    <div key={y.year} className="glass p-5">
                      <h3 className="meta text-paper/55">Year {y.year}</h3>
                      <ul className="mt-2 space-y-1 text-[0.875rem]">{y.courses.map((c) => <li key={c}>{c}</li>)}</ul>
                    </div>
                  ))}
                  <p className="text-[0.8125rem] text-paper/50 sm:col-span-2"><Sourced sourceId={p.curriculumSourceId} sources={S}>Curriculum source</Sourced></p>
                </div>
              )}
              {p.electives.length > 0 && (
                <div className="mt-6">
                  <h3 className="meta mb-2 text-paper/55">Electives</h3>
                  <ul className="flex flex-wrap gap-2 text-[0.8125rem]">{p.electives.map((e) => <li key={e} className="rounded-full border border-paper/20 px-3 py-1">{e}</li>)}</ul>
                </div>
              )}
            </Block>

            <Block title="Fees">
              <p className="tabular text-[1rem]">
                <Sourced sourceId={fees.sourceId} sources={S} confidence={fees.confidence} asOf={fees.asOf} notes={fees.notes}>{moneyRange(fees.value, u.costs.currency)}</Sourced>
                {fees.value && u.costs.currency !== "INR" && usdApprox(fees.value, u.costs.currency) && <span className="ml-2 text-[0.8125rem] text-paper/50">{usdApprox(fees.value, u.costs.currency)}</span>}
              </p>
              <p className="mt-1 text-[0.8125rem] text-paper/50">{p.fees ? "Course-specific" : india ? "Institution-wide figure" : "University-wide international tuition"}; before scholarships.</p>
              {yearly != null && p.durationYears && (
                <p className="mt-3 text-[0.9375rem]">
                  Whole degree (calculated): <strong>{moneyRange({ min: yearly * p.durationYears, max: yearly * p.durationYears, period: "total" }, u.costs.currency)}</strong>
                  <span className="text-[0.8125rem] text-paper/50"> — yearly tuition × {p.durationYears}; fees usually rise each year</span>
                </p>
              )}
              {p.feeBreakdown.length > 0 && (
                <div className="mt-5">
                  <DataTable
                    caption="Course fee breakdown"
                    head={["Item", "Amount"]}
                    rows={p.feeBreakdown.map((f) => [f.item, <Sourced key="a" sourceId={f.sourceId} sources={S} confidence={f.confidence} asOf={f.asOf} notes={f.notes}>{moneyRange(f.amount, f.currency)}</Sourced>])}
                  />
                </div>
              )}
              {hostel.length > 0 && (
                <ul className="mt-4 space-y-1 text-[0.875rem]">
                  {hostel.map((f) => (
                    <li key={f.item}>
                      {f.item}: <Sourced sourceId={f.sourceId} sources={S} confidence={f.confidence} asOf={f.asOf} notes={f.notes}>{moneyRange(f.amount, f.currency)}</Sourced>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-[0.875rem]"><Link href={`${base}/fees`} className="text-cyan hover:underline">Full fee breakdown →</Link></p>
            </Block>

            <Block title="Scholarships">
              {scholarships.length === 0 ? (
                <NotYet>None verified for this course yet. <Link href="/scholarships" className="text-cyan">See national and external scholarships</Link>.</NotYet>
              ) : (
                <ul className="space-y-3">
                  {scholarships.map((s) => (
                    <li key={s.name} className="glass p-4">
                      <p className="font-medium"><Sourced sourceId={s.sourceId} sources={S} confidence={s.confidence}>{s.name}</Sourced></p>
                      <p className="mt-1 text-[0.875rem] text-paper/70">{s.eligibility}{s.coverage ? ` — ${s.coverage}` : ""}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title="Internships, exchange & research">
              {opps.length === 0 ? (
                <NotYet>No internship, exchange or research programme documented for this course yet.</NotYet>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {opps.map((o) => (
                    <li key={o.name} className="glass p-4">
                      <p className="meta text-paper/45">{o.category}{p.opportunities.includes(o) ? " · this course" : " · institution-wide"}</p>
                      <p className="mt-1 font-medium"><Sourced sourceId={o.sourceId} sources={S}>{o.name}</Sourced></p>
                      <p className="mt-1 text-[0.875rem] text-paper/70">{o.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title="Careers & higher study">
              {p.careers ? (
                <div className="space-y-2 text-[0.9375rem]">
                  {p.careers.paths.length > 0 && <p><span className="meta mr-2 text-paper/50">Careers</span>{p.careers.paths.join(", ")}</p>}
                  {p.careers.higherStudy.length > 0 && <p><span className="meta mr-2 text-paper/50">Higher study</span>{p.careers.higherStudy.join(", ")}</p>}
                  <p className="text-[0.75rem]"><Sourced sourceId={p.careers.sourceId} sources={S} confidence={p.careers.confidence}>Source</Sourced></p>
                </div>
              ) : (
                <NotYet>Career pathways for this course aren&apos;t published by the institution in a form Edugate could verify.</NotYet>
              )}
            </Block>

            <Block title="Placements" note={outcomes.length ? "For this course, as published." : instOutcomes.length ? "This course's own figures aren't published; these are institution-wide." : undefined}>
              {outcomes.length + instOutcomes.length === 0 ? (
                <NotYet>Data not publicly available.</NotYet>
              ) : (
                <DataTable
                  caption="Placement outcomes"
                  head={["Cohort", "Year", "Median", "Average", "Highest", "Placed / employment"]}
                  rows={[...outcomes, ...instOutcomes].slice(0, 6).map((o) => [
                    o.cohort,
                    o.year,
                    o.medianSalary != null ? salary(o.medianSalary, o.currency) : "—",
                    o.averageSalary != null ? salary(o.averageSalary, o.currency) : "—",
                    o.highestSalary != null ? salary(o.highestSalary, o.currency) : "—",
                    <Sourced key="e" sourceId={o.sourceId} sources={S} confidence={o.confidence} asOf={o.year} notes={o.notes}>
                      {o.employmentRate ?? (o.placed != null && o.graduates ? `${o.placed} of ${o.graduates}` : "—")}
                    </Sourced>,
                  ])}
                />
              )}
              {(p.recruiters ?? u.details.recruiters) && (
                <p className="mt-4 text-[0.875rem] text-paper/75">
                  <span className="meta mr-2 text-paper/50">Recruiters{p.recruiters ? "" : " (institution-wide)"}</span>
                  <Sourced sourceId={(p.recruiters ?? u.details.recruiters)!.sourceId} sources={S}>{(p.recruiters ?? u.details.recruiters)!.names.join(", ")}</Sourced>
                </p>
              )}
            </Block>

            {similar.length > 0 && (
              <Block title="Similar courses nearby" note="Same subject, same part of the map. Pick one to compare side by side.">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {similar.map((h) => (
                    <li key={`${h.uni.slug}/${h.program.slug}`} className="glass flex items-start justify-between gap-3 p-4">
                      <span>
                        <Link href={`/universities/${h.uni.slug}/programs/${h.program.slug}`} className="font-medium hover:text-cyan">{h.program.name}</Link>
                        <span className="block text-[0.75rem] text-paper/50">{h.uni.name} · {h.uni.hub ?? h.uni.city}</span>
                      </span>
                      <Link href={`/compare/programs?p=${u.slug}/${p.slug}&p=${h.uni.slug}/${h.program.slug}`} className="shrink-0 rounded-full border border-paper/25 px-3 py-1 text-[0.8125rem] hover:border-paper/60">Compare</Link>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
            <ReportForm university={u.slug} program={p.slug} />
          </div>
          <aside><FitPanel u={u} profile={profile} program={p} /></aside>
        </div>
      </Container>
    </Section>
  );
}
