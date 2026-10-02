import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { FitPanel } from "@/components/unis/FitPanel";
import { ReportForm } from "@/components/unis/ReportForm";
import { Sourced, TrustBar } from "@/components/unis/Sourced";
import { TrackButton } from "@/components/unis/TrackButton";
import { getCurrentUser } from "@/lib/auth/session";
import { FIELD_NAMES } from "@/lib/unis/filters";
import { dateLabel, moneyRange, qsLabel, TEST_POLICY_LABEL, usdApprox } from "@/lib/unis/format";
import { freshnessFlags, isPast } from "@/lib/unis/freshness";
import { getUniversity, latestQsEdition } from "@/lib/unis/repo";
import { getProfile, trackedSlugs } from "@/lib/user/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row?.name ?? "University", description: row?.data.summary };
}

const OPP_LABEL: Record<string, string> = {
  research: "Research", entrepreneurship: "Entrepreneurship", networking: "Networking", internships: "Internships",
  careers: "Careers", international: "International", "student-life": "Student life",
};

export default async function UniversityPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const [user, latestQs] = await Promise.all([getCurrentUser(), latestQsEdition()]);
  const profile = user ? await getProfile(user.id) : null;
  const tracked = user ? await trackedSlugs(user.id) : new Set<string>();
  const qs = qsLabel(u);
  const flags = freshnessFlags(u, latestQs);
  const ct = u.costs;
  const stat = (label: string, v: (typeof u.stats)[keyof typeof u.stats]) => (
    <div>
      <dt className="meta text-paper/50">{label}</dt>
      <dd className="mt-1">
        <Sourced sourceId={v.sourceId} sources={S} confidence={v.confidence} asOf={v.asOf} notes={v.notes}>
          {typeof v.value === "number" ? v.value.toLocaleString("en-US") : v.value}
        </Sourced>
      </dd>
    </div>
  );
  const oppGroups = Object.entries(Object.groupBy(u.opportunities, (o) => o.category));

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <nav aria-label="Breadcrumb" className="meta text-paper/50">
          <Link href="/universities" className="hover:text-paper">Universities</Link> ›{" "}
          <Link href={`/universities/countries/${u.countryCode}`} className="hover:text-paper">{u.country}</Link> › {u.region}
        </nav>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="display-m">{u.name}</h1>
            <p className="mt-3 text-[0.9375rem] text-paper/70">
              {u.city}, {u.country} · <span className="capitalize">{u.control.replace("-", "–")}</span> · {u.category.replaceAll("-", " ")} · Founded {u.founded}
              {qs && (
                <> · <Sourced sourceId={qs.ranking.sourceId} sources={S} confidence={qs.ranking.sourceId ? "official" : "requires-verification"}><strong className="text-electric">{qs.text}</strong></Sourced></>
              )}
            </p>
            <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-paper/80">{u.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackButton university={u.slug} back={`/universities/${u.slug}`} tracked={tracked.has(`${u.slug}/`)} />
            <Link href={`/compare?u=${u.slug}`} className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">Compare</Link>
            <a href={u.website} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">Official site ↗</a>
          </div>
        </div>

        <TrustBar lastVerified={u.lastVerified} sources={S} />
        {flags.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-[var(--radius-md)] border border-pending/40 bg-pending/10 p-4 text-[0.875rem]">
            {flags.map((fl) => <li key={fl.kind}>⚠ {fl.message}</li>)}
          </ul>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-14">
            <section>
              <h2 className="meta mb-4 text-paper/60">Quick facts</h2>
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stat("Students", u.stats.totalStudents)}
                {stat("Undergraduates", u.stats.undergraduates)}
                {stat("International students", u.stats.internationalShare)}
                {stat("Student : faculty", u.stats.studentFacultyRatio)}
              </dl>
              {u.rankings.length > 1 && (
                <ul className="mt-6 flex flex-wrap gap-2 text-[0.8125rem]">
                  {u.rankings.map((r) => (
                    <li key={`${r.org}${r.category}${r.edition}`} className="rounded-full border border-paper/20 px-3 py-1">
                      <Sourced sourceId={r.sourceId} sources={S}>{r.org.replace("_", " ")} {r.edition} · {r.category}: #{r.rank}</Sourced>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Programs on Edugate ({u.programs.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {u.programs.map((p) => (
                  <Link key={p.slug} href={`/universities/${u.slug}/programs/${p.slug}`} className="glass glass-interactive block p-5">
                    <p className="meta text-paper/50">{FIELD_NAMES[p.field]} · {p.degree}{p.durationYears ? ` · ${p.durationYears} yrs` : ""}</p>
                    <p className="mt-1.5 font-display text-[1.125rem]">{p.name}</p>
                    <p className="mt-2 line-clamp-3 text-[0.8125rem] text-paper/65">{p.summary}</p>
                    <p className="mt-3 text-[0.8125rem] text-cyan">Requirements, curriculum & your gaps →</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Admissions</h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div><dt className="meta text-paper/50">Apply via</dt><dd className="mt-1"><Sourced sourceId={u.applicationPlatform.sourceId} sources={S} confidence={u.applicationPlatform.confidence} asOf={u.applicationPlatform.asOf} notes={u.applicationPlatform.notes}>{u.applicationPlatform.value}</Sourced></dd></div>
                <div><dt className="meta text-paper/50">Application fee</dt><dd className="mt-1"><Sourced sourceId={u.applicationFee.sourceId} sources={S} confidence={u.applicationFee.confidence} asOf={u.applicationFee.asOf} notes={u.applicationFee.notes}>{u.applicationFee.value}</Sourced></dd></div>
              </dl>
              {u.testing.length > 0 && (
                <div className="mt-6">
                  <h3 className="meta mb-2 text-paper/50">Tests</h3>
                  <ul className="space-y-1.5 text-[0.9375rem]">
                    {u.testing.map((t) => (
                      <li key={t.test}><Sourced sourceId={t.sourceId} sources={S} confidence={t.confidence} notes={t.notes}><strong>{t.test}</strong>: {TEST_POLICY_LABEL[t.policy]}{t.typicalRange ? ` · typical ${t.typicalRange}` : ""}</Sourced></li>
                    ))}
                  </ul>
                </div>
              )}
              {u.english.length > 0 && (
                <div className="mt-6">
                  <h3 className="meta mb-2 text-paper/50">English proficiency</h3>
                  <ul className="space-y-1.5 text-[0.9375rem]">
                    {u.english.map((e) => (
                      <li key={e.test}><Sourced sourceId={e.sourceId} sources={S} confidence={e.confidence} notes={e.waiver ? `Waiver: ${e.waiver}` : undefined}><strong>{e.test.replace("_IBT", " iBT")}</strong>: {e.minOverall ? `≥ ${e.minOverall} overall` : "accepted"}{e.minSection ? `, ≥ ${e.minSection} per section` : ""}</Sourced></li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6">
                <h3 className="meta mb-2 text-paper/50">Deadlines</h3>
                {u.deadlines.length === 0 ? (
                  <p className="text-[0.9375rem] text-paper/60">No dated deadline for the next intake is verified yet — check the admissions page.</p>
                ) : (
                  <ul className="space-y-1.5 text-[0.9375rem]">
                    {[...u.deadlines].sort((a, b) => a.date.localeCompare(b.date)).map((d) => (
                      <li key={d.label + d.date} className={isPast(d.date) ? "text-paper/45 line-through" : ""}>
                        <Sourced sourceId={d.sourceId} sources={S} confidence={d.confidence}>
                          <strong>{dateLabel(d.date)}</strong> — {d.label} ({d.intake}{d.timezone ? `, ${d.timezone}` : ""}){isPast(d.date) ? " · passed" : ""}
                        </Sourced>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Cost</h2>
              <dl className="grid gap-5 sm:grid-cols-3">
                {([["International tuition", ct.internationalTuition], ["Domestic tuition", ct.domesticTuition], ["Living estimate", ct.livingEstimate]] as const).map(([label, v]) => (
                  <div key={label}>
                    <dt className="meta text-paper/50">{label}</dt>
                    <dd className="mt-1 tabular">
                      <Sourced sourceId={v.sourceId} sources={S} confidence={v.confidence} asOf={v.asOf} notes={v.notes}>{moneyRange(v.value, ct.currency)}</Sourced>
                      {v.value && usdApprox(v.value, ct.currency) && <span className="block text-[0.75rem] text-paper/45">{usdApprox(v.value, ct.currency)}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[0.8125rem] text-paper/50">Tuition only unless stated; before any scholarship or aid.</p>
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Scholarships & aid ({u.scholarships.length})</h2>
              {u.scholarships.length === 0 ? (
                <p className="text-[0.9375rem] text-paper/60">None verified on Edugate yet — that isn&apos;t the same as none existing. See <Link href="/scholarships" className="text-cyan">external scholarships</Link>.</p>
              ) : (
                <ul className="space-y-4">
                  {u.scholarships.map((s) => (
                    <li key={s.name} className="glass p-4">
                      <p className="font-medium">{s.name} <span className="meta ml-2 text-paper/50">{s.kind.join(" · ")}</span></p>
                      <p className="mt-1 text-[0.875rem] text-paper/75">{s.eligibility}</p>
                      <p className="mt-1 text-[0.875rem]">
                        <Sourced sourceId={s.sourceId} sources={S} confidence={s.confidence}>
                          {[s.coverage, s.deadline && `Deadline ${dateLabel(s.deadline)}`, s.renewable === true && "Renewable"].filter(Boolean).join(" · ") || "Details on source"}
                        </Sourced>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Opportunities</h2>
              {oppGroups.length === 0 ? (
                <p className="text-[0.9375rem] text-paper/60">No opportunities documented on Edugate yet.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {oppGroups.map(([cat, list]) => (
                    <div key={cat}>
                      <h3 className="meta mb-2 text-paper/50">{OPP_LABEL[cat] ?? cat}</h3>
                      <ul className="space-y-3">
                        {list!.map((o) => (
                          <li key={o.name} className="text-[0.9375rem]">
                            <Sourced sourceId={o.sourceId} sources={S}><strong>{o.name}</strong></Sourced>
                            <span className="block text-[0.8125rem] text-paper/65">{o.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="meta mb-4 text-paper/60">Understand this university</h2>
              <ul className="space-y-2 text-[0.9375rem] text-paper/80">
                <li>• <strong>Academic environment:</strong> {u.category.replaceAll("-", " ")}, {u.setting ?? "setting not verified"} campus{u.campuses.length ? `, campuses: ${u.campuses.join(", ")}` : ""}; teaching in {u.languages.join(", ")}.</li>
                <li>• <strong>On Edugate:</strong> {u.programs.length} program{u.programs.length > 1 ? "s" : ""}, {u.opportunities.length} documented opportunit{u.opportunities.length === 1 ? "y" : "ies"}, {u.scholarships.length} scholarship/aid entr{u.scholarships.length === 1 ? "y" : "ies"}.</li>
                <li>• <strong>Investigate further:</strong> anything marked “Not currently verified”, the latest fee schedule, and program-specific subject requirements on the official site.</li>
              </ul>
            </section>
            <ReportForm university={u.slug} />
          </div>

          <aside className="space-y-6">
            <FitPanel u={u} profile={profile} />
          </aside>
        </div>
      </Container>
    </Section>
  );
}
