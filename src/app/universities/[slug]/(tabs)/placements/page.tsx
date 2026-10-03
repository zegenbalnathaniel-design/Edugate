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
  const outcomes = [...d.outcomes].sort((a, b) => b.year.localeCompare(a.year));
  const hasCounts = outcomes.some((o) => o.graduates != null || o.placed != null || o.higherStudies != null);
  const hasSalary = outcomes.some((o) => o.medianSalary != null || o.averageSalary != null || o.highestSalary != null);

  return (
    <div className="space-y-14">
      <Block
        title="Placements & graduate outcomes"
        note="Figures exactly as each publisher defines them — NIRF placement data, national graduate surveys, or the university's own career report. Different countries measure differently, so compare like with like."
      >
        {outcomes.length === 0 ? (
          <NotYet>No verified placement or graduate-outcome figures yet. We don&apos;t show unverified package claims.</NotYet>
        ) : (
          <div className="space-y-6">
            <DataTable
              caption="Graduate outcomes"
              minWidth={900}
              head={[
                "Cohort",
                "Year",
                ...(hasCounts ? ["Graduates", "Placed", "Higher studies"] : []),
                ...(hasSalary ? ["Median", "Average", "Highest"] : []),
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
          <NotYet>No verified recruiter list yet.</NotYet>
        )}
      </Block>
    </div>
  );
}
