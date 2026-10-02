import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/primitives/Section";
import { FitPanel } from "@/components/unis/FitPanel";
import { ReportForm } from "@/components/unis/ReportForm";
import { Sourced, TrustBar } from "@/components/unis/Sourced";
import { TrackButton } from "@/components/unis/TrackButton";
import { getCurrentUser } from "@/lib/auth/session";
import { CURRICULUM_LABELS } from "@/lib/profile/schema";
import { gapAnalysis, type GapStatus } from "@/lib/unis/fit";
import { FIELD_NAMES } from "@/lib/unis/filters";
import { moneyRange, TEST_POLICY_LABEL, usdApprox } from "@/lib/unis/format";
import { getUniversity } from "@/lib/unis/repo";
import { getProfile, trackedSlugs } from "@/lib/user/repo";

type Props = { params: Promise<{ slug: string; program: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, program } = await params;
  const row = await getUniversity(slug);
  const p = row?.data.programs.find((x) => x.slug === program);
  return { title: p ? `${p.name} — ${row!.name}` : "Program" };
}

const GAP: Record<GapStatus, { glyph: string; label: string; tone: string }> = {
  meets: { glyph: "✓", label: "Meets", tone: "text-verified" },
  exceeds: { glyph: "↑", label: "Exceeds", tone: "text-verified" },
  missing: { glyph: "✗", label: "Missing", tone: "text-attention" },
  unclear: { glyph: "◐", label: "Unclear — verify", tone: "text-pending" },
  "not-applicable": { glyph: "–", label: "Not applicable", tone: "text-paper/50" },
};

const STATUS_LABEL: Record<string, string> = { required: "Required", recommended: "Recommended", accepted: "Accepted", "not-accepted": "Not accepted", conditional: "Conditional" };

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
  const fees = p.fees ?? u.costs.internationalTuition;
  const english = p.english.length ? p.english : u.english;

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <nav aria-label="Breadcrumb" className="meta text-paper/50">
          <Link href="/universities" className="hover:text-paper">Universities</Link> › <Link href={`/universities/${u.slug}`} className="hover:text-paper">{u.name}</Link> › Program
        </nav>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="meta text-electric">{FIELD_NAMES[p.field]}{p.subfield ? ` · ${p.subfield}` : ""}</p>
            <h1 className="display-m mt-2">{p.name}</h1>
            <p className="mt-3 text-[0.9375rem] text-paper/70">
              {u.name} · {p.degree}{p.durationYears ? ` · ${p.durationYears} years` : ""}{p.school ? ` · ${p.school}` : ""}
            </p>
            <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-paper/80">{p.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackButton university={u.slug} program={p.slug} back={`/universities/${u.slug}/programs/${p.slug}`} tracked={tracked.has(`${u.slug}/${p.slug}`)} />
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">Program page ↗</a>}
          </div>
        </div>
        <TrustBar lastVerified={u.lastVerified} sources={S} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-14">
            {profile && (
              <section>
                <h2 className="meta mb-4 text-paper/60">Academic gap analysis — your profile vs published requirements</h2>
                {gaps.length === 0 ? (
                  <p className="text-[0.9375rem] text-paper/65">Add your curriculum, subjects and test scores in <Link href="/profile" className="text-cyan">your profile</Link> to compare them against this program.</p>
                ) : (
                  <div className="glass overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-[0.875rem]">
                      <caption className="sr-only">Requirement comparison</caption>
                      <thead><tr className="border-b border-paper/10 text-paper/55">
                        <th scope="col" className="px-4 py-3 font-medium">Requirement</th>
                        <th scope="col" className="px-4 py-3 font-medium">University</th>
                        <th scope="col" className="px-4 py-3 font-medium">You</th>
                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                      </tr></thead>
                      <tbody>
                        {gaps.map((g, i) => (
                          <tr key={i} className="border-b border-paper/5 last:border-0 align-top">
                            <td className="px-4 py-3">{g.requirement}</td>
                            <td className="px-4 py-3"><Sourced sourceId={g.sourceId} sources={S}>{g.university}</Sourced></td>
                            <td className="px-4 py-3 text-paper/80">{g.student}</td>
                            <td className={`px-4 py-3 whitespace-nowrap ${GAP[g.status].tone}`}>{GAP[g.status].glyph} {GAP[g.status].label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-3 text-[0.8125rem] text-paper/50">Meeting published requirements is not a prediction of admission — selective programs admit holistically.</p>
              </section>
            )}

            <section>
              <h2 className="meta mb-4 text-paper/60">Entry requirements by curriculum</h2>
              {p.requirements.length === 0 ? (
                <p className="text-[0.9375rem] text-paper/60">Not currently verified for this program.</p>
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
                              {s.notes && <span className="block pl-0 text-[0.8125rem] text-paper/60">{s.notes}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Tests & English</h2>
              <ul className="space-y-1.5 text-[0.9375rem]">
                {[...p.tests, ...u.testing.filter((t) => !p.tests.some((x) => x.test === t.test))].map((t) => (
                  <li key={t.test}><Sourced sourceId={t.sourceId} sources={S} confidence={t.confidence} notes={t.notes}><strong>{t.test}</strong>: {TEST_POLICY_LABEL[t.policy]}{t.typicalRange ? ` · typical ${t.typicalRange}` : ""}</Sourced></li>
                ))}
                {english.map((e) => (
                  <li key={e.test}><Sourced sourceId={e.sourceId} sources={S} confidence={e.confidence} notes={e.waiver ? `Waiver: ${e.waiver}` : undefined}><strong>{e.test.replace("_IBT", " iBT")}</strong>: {e.minOverall ? `≥ ${e.minOverall}` : "accepted"}{e.minSection ? ` (sections ≥ ${e.minSection})` : ""}</Sourced></li>
                ))}
                {p.tests.length + u.testing.length + english.length === 0 && <li className="text-paper/60">No test requirements verified yet.</li>}
              </ul>
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">What you&apos;d actually study</h2>
              {p.curriculum.length === 0 ? (
                <p className="text-[0.9375rem] text-paper/60">
                  Year-by-year course list not verified yet — Edugate only shows course names taken from an official curriculum page.
                  {p.url && <> See the <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-cyan">program page ↗</a>.</>}
                </p>
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
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Fees</h2>
              <p className="tabular text-[1rem]">
                <Sourced sourceId={fees.sourceId} sources={S} confidence={fees.confidence} asOf={fees.asOf} notes={fees.notes}>{moneyRange(fees.value, u.costs.currency)}</Sourced>
                {fees.value && usdApprox(fees.value, u.costs.currency) && <span className="ml-2 text-[0.8125rem] text-paper/50">{usdApprox(fees.value, u.costs.currency)}</span>}
              </p>
              <p className="mt-1 text-[0.8125rem] text-paper/50">{p.fees ? "Program-specific" : "University-wide international tuition"}; before aid.</p>
            </section>
            <ReportForm university={u.slug} program={p.slug} />
          </div>
          <aside><FitPanel u={u} profile={profile} program={p} /></aside>
        </div>
      </Container>
    </Section>
  );
}
