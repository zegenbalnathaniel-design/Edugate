import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, Empty, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { programCostInr } from "@/lib/unis/extract";
import { BASIS_LABEL, FIELD_NAMES } from "@/lib/unis/filters";
import { inrCompact, moneyRange } from "@/lib/unis/format";
import { getUniversity } from "@/lib/unis/repo";
import type { Program } from "@/lib/unis/schema";
import { DEGREES, normalizeDegree, programSubjects } from "@/lib/unis/taxonomy";

export async function generateMetadata({ params }: PageProps<"/universities/[slug]/courses">): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} courses — every programme, eligibility & fees` : "Courses" };
}

const LEVEL_LABEL: Record<Program["level"], string> = { bachelors: "Undergraduate", integrated: "Integrated (UG + PG)", masters: "Postgraduate" };
const box = "rounded-[var(--radius-md)] border border-current/20 bg-navy-800 px-3 py-2 text-[0.875rem]";

/**
 * Every programme the institution offers that Edugate has verified, grouped
 * Level → Degree → Programme (e.g. Undergraduate → B.Com → B.Com Corporate
 * Secretaryship), searchable and comparable.
 */
export default async function CoursesPage({ params, searchParams }: PageProps<"/universities/[slug]/courses">) {
  const { slug } = await params;
  const sp = await searchParams;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase().slice(0, 80) : "";
  const deg = typeof sp.degree === "string" ? sp.degree : "";
  const subj = typeof sp.subject === "string" ? sp.subject : "";
  const stream = typeof sp.stream === "string" ? sp.stream : "";

  const all = u.programs.map((p) => ({ p, degree: normalizeDegree(p.degree, p.level), subjects: programSubjects(p) }));
  const list = all.filter(
    (x) =>
      (!q || `${x.p.name} ${x.p.specialization ?? ""} ${x.p.department ?? ""}`.toLowerCase().includes(q)) &&
      (!deg || x.degree === deg) &&
      (!subj || x.subjects.includes(subj as never)) &&
      (!stream || x.p.stream === stream),
  );
  const degrees = DEGREES.filter((d) => all.some((x) => x.degree === d));
  const subjects = [...new Set(all.flatMap((x) => x.subjects))].sort((a, b) => (FIELD_NAMES[a] ?? a).localeCompare(FIELD_NAMES[b] ?? b));
  const streams = [...new Set(all.map((x) => x.p.stream).filter((s): s is string => !!s))];
  const levels = (["bachelors", "integrated", "masters"] as const).filter((l) => list.some((x) => x.p.level === l));
  const base = `/universities/${u.slug}`;

  return (
    <div className="space-y-12">
      <Block
        title={`All courses (${u.programs.length})`}
        note={
          <>
            Every programme Edugate has verified at {u.name}, under its official name. Grouped by level and degree; tick any to compare them — with each other or with courses elsewhere.
            {u.website && <> The institution&apos;s own list is the final word.</>}
          </>
        }
      >
        <form method="get" className="glass grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_12rem_12rem_auto]" aria-label="Filter courses">
          <input name="q" defaultValue={q} placeholder="Search courses, e.g. Corporate Secretaryship" className={box} aria-label="Search courses" />
          <select name="degree" defaultValue={deg} className={box} aria-label="Degree">
            <option value="">All degrees</option>
            {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="subject" defaultValue={subj} className={box} aria-label="Subject">
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{FIELD_NAMES[s] ?? s}</option>)}
          </select>
          {streams.length > 1 ? (
            <select name="stream" defaultValue={stream} className={box} aria-label="Stream">
              <option value="">All streams</option>
              {streams.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : <span className="hidden lg:block" />}
          <div className="flex gap-2">
            <button className="h-10 rounded-full bg-electric px-5 text-[0.875rem] font-semibold text-[var(--on-electric)]">Filter</button>
            {(q || deg || subj || stream) && <Link href={`${base}/courses`} className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem]">Clear</Link>}
          </div>
        </form>
      </Block>

      {list.length === 0 ? (
        <Empty>No course here matches those filters.</Empty>
      ) : (
        <form action="/compare/programs" method="get" className="space-y-12">
          <div className="flex justify-end">
            <button className="rounded-full border border-paper/25 px-4 py-2 text-[0.8125rem] hover:border-paper/60">Compare selected (up to 5) →</button>
          </div>
          {levels.map((level) => {
            const inLevel = list.filter((x) => x.p.level === level);
            const byDegree = DEGREES.map((d) => ({ d, items: inLevel.filter((x) => x.degree === d) })).filter((g) => g.items.length);
            return (
              <section key={level} aria-labelledby={`lvl-${level}`}>
                <h2 id={`lvl-${level}`} className="font-display text-[1.5rem]">
                  {LEVEL_LABEL[level]} <span className="text-paper/45">({inLevel.length})</span>
                </h2>
                <div className="mt-5 space-y-6">
                  {byDegree.map(({ d, items }) => (
                    <details key={d} open className="glass group">
                      <summary className="flex cursor-pointer items-baseline justify-between gap-3 px-5 py-4">
                        <span className="font-display text-[1.125rem]">{d === "Other" ? "Other degrees" : d}</span>
                        <span className="text-[0.8125rem] text-paper/50">{items.length} programme{items.length === 1 ? "" : "s"}</span>
                      </summary>
                      <ul className="border-t border-paper/10 px-5">
                        {items.map(({ p }) => {
                          const fee = p.fees ?? (u.countryCode === "IN" ? u.costs.domesticTuition : u.costs.internationalTuition);
                          const inr = programCostInr(u, p);
                          return (
                            <li key={p.slug} className="grid gap-3 border-b border-paper/8 py-4 last:border-0 md:grid-cols-[auto_1fr_9rem_10rem_11rem] md:items-start">
                              <input type="checkbox" name="p" value={`${u.slug}/${p.slug}`} aria-label={`Compare ${p.name}`} className="mt-1.5 size-4 accent-[var(--color-electric)]" />
                              <div className="min-w-0">
                                <Link href={`${base}/programs/${p.slug}`} className="font-medium hover:text-cyan">{p.name}</Link>
                                {p.specialization && <span className="text-paper/60"> · {p.specialization}</span>}
                                <p className="mt-0.5 text-[0.75rem] text-paper/50">
                                  {[p.department ?? p.school, p.stream, p.campus, p.mode].filter(Boolean).join(" · ") || FIELD_NAMES[p.field]}
                                </p>
                              </div>
                              {p.durationYears || (p.intake.value != null && p.intake.sourceId) ? (
                                <div className="text-[0.8125rem]">
                                  <span className="meta block text-paper/45">{p.durationYears && p.intake.value != null && p.intake.sourceId ? "Duration · seats" : p.durationYears ? "Duration" : "Seats"}</span>
                                  {p.durationYears ? `${p.durationYears} yrs` : null}
                                  {p.intake.value != null && p.intake.sourceId && (
                                    <>{p.durationYears ? " · " : ""}<Sourced sourceId={p.intake.sourceId} sources={S} confidence={p.intake.confidence} asOf={p.intake.asOf}>{p.intake.value}</Sourced></>
                                  )}
                                </div>
                              ) : (
                                <div aria-hidden />
                              )}
                              {fee.value && fee.sourceId ? (
                                <div className="text-[0.8125rem]">
                                  <span className="meta block text-paper/45">Tuition</span>
                                  <Sourced sourceId={fee.sourceId} sources={S} confidence={fee.confidence} asOf={fee.asOf} notes={fee.notes}>
                                    {moneyRange(fee.value, u.costs.currency)}
                                  </Sourced>
                                  {!p.fees && <span className="block text-[0.6875rem] text-paper/45">Institution-wide figure</span>}
                                  {u.costs.currency !== "INR" && inr != null && <span className="block text-[0.6875rem] text-paper/45">≈ {inrCompact(inr)}/yr</span>}
                                </div>
                              ) : (
                                <div aria-hidden />
                              )}
                              {p.admission?.basis.length || p.tests.length ? (
                                <div className="text-[0.8125rem]">
                                  <span className="meta block text-paper/45">Admission</span>
                                  {p.admission?.basis.length ? p.admission.basis.map((b) => BASIS_LABEL[b]).join(", ") : p.tests.map((t) => t.test).join(", ")}
                                </div>
                              ) : (
                                <div aria-hidden />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </form>
      )}
    </div>
  );
}
