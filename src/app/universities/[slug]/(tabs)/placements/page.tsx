import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, DataTable, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { salary } from "@/lib/unis/format";
import { getUniversity } from "@/lib/unis/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} placements & graduate outcomes` : "Placements" };
}

const pct = (part: number | null, whole: number | null) => (part != null && whole ? `${Math.round((part / whole) * 100)}%` : null);

export default async function PlacementsPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const d = u.details;
  // Institution-wide records plus per-course records (labelled with the course).
  const outcomes = [...d.outcomes, ...u.programs.flatMap((p) => p.outcomes.map((o) => ({ ...o, cohort: `${p.name}: ${o.cohort}` })))].sort((a, b) => b.year.localeCompare(a.year));
  const hasLowest = outcomes.some((o) => o.lowestSalary != null);
  const sectors = outcomes.filter((o) => o.sectors.length);
  const programRecruiters = u.programs.filter((p) => p.recruiters);
  const hasCounts = outcomes.some((o) => o.graduates != null || o.placed != null || o.higherStudies != null);
  const hasSalary = outcomes.some((o) => o.medianSalary != null || o.averageSalary != null || o.highestSalary != null);

  return (
    <div className="space-y-14">
      <Block
        title="Placements & graduate outcomes"
        note="Figures exactly as each publisher defines them — NIRF placement data, national graduate surveys, or the university's own career report. Different countries measure differently, so compare like with like."
      >
        {outcomes.length === 0 ? (
          <NotYet>Data not publicly available — {u.name} hasn&apos;t published placement or graduate-outcome figures that Edugate could verify. We don&apos;t show unverified package claims.</NotYet>
        ) : (
          <div className="space-y-6">
            <DataTable
              caption="Graduate outcomes"
              minWidth={900}
              head={[
                "Cohort",
                "Year",
                ...(hasCounts ? ["Graduates", "Placed", "Higher studies"] : []),
                ...(hasSalary ? ["Median", "Average", "Highest", ...(hasLowest ? ["Lowest"] : [])] : []),
                "Employment",
                "Source",
              ]}
              rows={outcomes.map((o) => [
                o.cohort,
                o.year,
                ...(hasCounts
                  ? [
                      o.graduates?.toLocaleString("en-US") ?? "—",
                      o.placed != null ? `${o.placed.toLocaleString("en-US")}${pct(o.placed, o.graduates) ? ` (${pct(o.placed, o.graduates)})` : ""}` : "—",
                      o.higherStudies?.toLocaleString("en-US") ?? "—",
                    ]
                  : []),
                ...(hasSalary
                  ? [
                      <strong key="m">{o.medianSalary != null ? salary(o.medianSalary, o.currency) : "—"}</strong>,
                      o.averageSalary != null ? salary(o.averageSalary, o.currency) : "—",
                      o.highestSalary != null ? salary(o.highestSalary, o.currency) : "—",
                      ...(hasLowest ? [o.lowestSalary != null ? salary(o.lowestSalary, o.currency) : "—"] : []),
                    ]
                  : []),
                o.employmentRate ?? (pct(o.placed, o.graduates) ? `${pct(o.placed, o.graduates)} placed` : "—"),
                <Sourced key="s" sourceId={o.sourceId} sources={S} confidence={o.confidence} asOf={o.year} notes={o.notes}>
                  {S.find((x) => x.id === o.sourceId)?.type === "secondary" ? "Secondary" : "Official"}
                </Sourced>,
              ])}
            />
            <ul className="space-y-1.5 text-[0.8125rem] text-paper/60">
              {[...new Set(outcomes.map((o) => o.measure))].map((m) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          </div>
        )}
      </Block>

      {sectors.length > 0 && (
        <Block title="Where graduates went, by sector">
          <div className="grid gap-5 md:grid-cols-2">
            {sectors.map((o) => (
              <div key={`${o.cohort}-${o.year}`} className="glass p-5">
                <p className="meta text-paper/50">{o.cohort} · {o.year}</p>
                <ul className="mt-3 space-y-2">
                  {o.sectors.map((x) => {
                    const n = parseFloat(x.share);
                    return (
                      <li key={x.sector} className="text-[0.875rem]">
                        <span className="flex justify-between gap-3"><span>{x.sector}</span><span className="tabular text-paper/70">{x.share}</span></span>
                        {Number.isFinite(n) && /%/.test(x.share) && <span className="mt-1 block h-1.5 rounded-full bg-paper/10"><span className="block h-1.5 rounded-full bg-electric" style={{ width: `${Math.min(n, 100)}%` }} /></span>}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-[0.75rem]"><Sourced sourceId={o.sourceId} sources={S} confidence={o.confidence} asOf={o.year}>Source</Sourced></p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {programRecruiters.length > 0 && (
        <Block title="Recruiters by course">
          <div className="space-y-4">
            {programRecruiters.map((p) => (
              <div key={p.slug}>
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 text-[0.875rem] text-paper/75">
                  <Sourced sourceId={p.recruiters!.sourceId} sources={S} confidence={p.recruiters!.confidence} asOf={p.recruiters!.year}>{p.recruiters!.names.join(", ")}</Sourced>
                </p>
              </div>
            ))}
          </div>
        </Block>
      )}

      <Block title="Recruiters">
        {d.recruiters ? (
          <>
            <ul className="flex flex-wrap gap-2">
              {d.recruiters.names.map((n) => (
                <li key={n} className="rounded-full border border-paper/20 px-3 py-1 text-[0.875rem]">{n}</li>
              ))}
            </ul>
            <p className="mt-3 text-[0.8125rem]">
              <Sourced sourceId={d.recruiters.sourceId} sources={S} confidence={d.recruiters.confidence} asOf={d.recruiters.year}>
                Source for this list
              </Sourced>
            </p>
          </>
        ) : (
          <NotYet>Data not publicly available — no recruiter list verified yet.</NotYet>
        )}
      </Block>
    </div>
  );
}
