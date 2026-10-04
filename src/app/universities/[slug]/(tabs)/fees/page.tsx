import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, DataTable, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { programCostInr } from "@/lib/unis/extract";
import { inrCompact, moneyRange, usdApprox } from "@/lib/unis/format";
import { FX_AS_OF, perYear } from "@/lib/unis/fx";
import { getUniversity } from "@/lib/unis/repo";

export async function generateMetadata({ params }: PageProps<"/universities/[slug]/fees">): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} fees — tuition, hostel & total cost` : "Fees" };
}

const LIVING = /hostel|hall|residen|accommodation|room|mess|food|dining|meal|transport|bus/i;

/**
 * Fees & affordability. Only published amounts; a "total" is always shown as
 * the sum of the published items it adds, never padded with estimates.
 */
export default async function FeesPage({ params }: PageProps<"/universities/[slug]/fees">) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const ct = u.costs;
  const india = u.countryCode === "IN";
  const items = u.details.feeBreakdown;
  const living = items.filter((f) => LIVING.test(f.item) && f.amount.period !== "total");
  const programFees = u.programs.filter((p) => p.fees?.value || p.feeBreakdown.length);

  // Cost-of-attendance illustration: lowest published yearly tuition + published yearly living items (same currency only).
  const tuitionYear = u.programs.map((p) => perYear((p.fees ?? (india ? ct.domesticTuition : ct.internationalTuition)).value, p.durationYears)).filter((n): n is number => n != null);
  const lowTuition = tuitionYear.length ? Math.min(...tuitionYear) : null;
  const livingYear = living
    // Only items published per year or semester: annualising weekly/monthly rents would assume a contract length nobody published.
    .filter((f) => f.currency === ct.currency && (f.amount.period === "year" || f.amount.period === "semester"))
    .map((f) => ({ f, y: perYear(f.amount, null) }))
    .filter((x): x is { f: (typeof living)[number]; y: number } => x.y != null);
  const coa = lowTuition != null && livingYear.length ? lowTuition + livingYear.reduce((a, x) => a + x.y, 0) : null;

  return (
    <div className="space-y-14">
      <Block title="Tuition" note={india ? "Per year, before scholarships. Aided and self-financed streams at the same college often charge very different fees — check each course." : "Before scholarships or aid. In the university's own currency, with a dated approximate conversion."}>
        <dl className="grid gap-5 sm:grid-cols-3">
          {(
            [
              [india ? "Tuition (institution-wide)" : "International tuition", india ? ct.domesticTuition : ct.internationalTuition],
              [india ? "International / NRI tuition" : "Domestic tuition", india ? ct.internationalTuition : ct.domesticTuition],
              ["Living estimate", ct.livingEstimate],
            ] as const
          ).map(([label, v]) => (
            <div key={label} className="glass p-4">
              <dt className="meta text-paper/50">{label}</dt>
              <dd className="mt-1 tabular">
                <Sourced sourceId={v.sourceId} sources={S} confidence={v.confidence} asOf={v.asOf} notes={v.notes}>
                  {moneyRange(v.value, ct.currency)}
                </Sourced>
                {v.value && ct.currency !== "INR" && usdApprox(v.value, ct.currency) && <span className="block text-[0.75rem] text-paper/45">{usdApprox(v.value, ct.currency)}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="Fees by course" note="Programme-specific tuition where the institution publishes it. Whole-degree totals are calculated as yearly tuition × duration; fees usually rise each year.">
        {programFees.length === 0 ? (
          <NotYet>No course-specific fees verified yet — the institution-wide figures above apply where shown.</NotYet>
        ) : (
          <DataTable
            caption="Fees by course"
            minWidth={720}
            head={["Course", "Tuition", "Whole degree (calculated)", india ? "" : "≈ ₹ per year"].filter(Boolean)}
            rows={programFees.map((p) => {
              const inr = programCostInr(u, p);
              const y = perYear(p.fees?.value ?? null, p.durationYears);
              return [
                <Link key="n" href={`/universities/${u.slug}/programs/${p.slug}`} className="hover:text-cyan">
                  {p.name}
                  {p.stream && <span className="block text-[0.75rem] font-normal text-paper/50">{p.stream}</span>}
                </Link>,
                p.fees?.value ? (
                  <Sourced key="f" sourceId={p.fees.sourceId} sources={S} confidence={p.fees.confidence} asOf={p.fees.asOf} notes={p.fees.notes}>
                    {moneyRange(p.fees.value, ct.currency)}
                  </Sourced>
                ) : (
                  "—"
                ),
                y != null && p.durationYears ? `${moneyRange({ min: y * p.durationYears, max: y * p.durationYears, period: "total" }, ct.currency)} over ${p.durationYears} yrs` : "—",
                ...(india ? [] : [inr != null ? inrCompact(inr) : "—"]),
              ];
            })}
          />
        )}
      </Block>

      <Block title="Fee breakdown" note="Itemised as the institution publishes it — hostel, mess, transport and other mandatory charges.">
        {items.length === 0 && programFees.every((p) => !p.feeBreakdown.length) ? (
          <NotYet>No itemised fee schedule verified yet. Check the official fee page for hostel, mess and other charges.</NotYet>
        ) : (
          <DataTable
            caption="Fee breakdown"
            head={["Item", "Applies to", "Amount", india ? "Notes" : "Approx. US$"]}
            rows={[...items, ...u.programs.flatMap((p) => p.feeBreakdown.map((f) => ({ ...f, item: `${p.name}: ${f.item}` })))].map((f) => [
              f.item,
              f.audience === "all" ? "All students" : f.audience === "domestic" ? "Domestic" : "International",
              <Sourced key="a" sourceId={f.sourceId} sources={S} confidence={f.confidence} asOf={f.asOf} notes={f.notes}>
                {moneyRange(f.amount, f.currency)}
              </Sourced>,
              <span key="u" className="text-paper/55">{india ? f.notes ?? "" : usdApprox(f.amount, f.currency) ?? "—"}</span>,
            ])}
          />
        )}
      </Block>

      <Block title="What a year could cost" note="An illustration from published figures only — not a quote. Add books, travel and personal costs yourself.">
        {coa == null ? (
          <NotYet>
            Not enough published figures to add up a year&apos;s cost here. {u.details.housing.value ? "See Campus for hostel details." : ""}
          </NotYet>
        ) : (
          <div className="glass p-5">
            <p className="font-display text-[1.75rem] tabular">{moneyRange({ min: coa, max: coa, period: "year" }, ct.currency)}</p>
            {ct.currency !== "INR" && <p className="text-[0.8125rem] text-paper/50">{usdApprox({ min: coa, max: coa, period: "year" }, ct.currency)}</p>}
            <ul className="mt-3 space-y-1 text-[0.875rem] text-paper/75">
              <li>Lowest published yearly tuition: {moneyRange({ min: lowTuition!, max: lowTuition!, period: "year" }, ct.currency)}</li>
              {livingYear.map(({ f, y }) => (
                <li key={f.item}>
                  + {f.item}: {moneyRange({ min: y, max: y, period: "year" }, ct.currency)}
                  {f.amount.period === "semester" ? " (two semesters)" : ""}
                </li>
              ))}
            </ul>
            {!india && <p className="mt-3 text-[0.75rem] text-paper/45">Conversions use reference rates of {FX_AS_OF}.</p>}
          </div>
        )}
        <p className="mt-4 text-[0.875rem]">
          <Link href={`/universities/${u.slug}/scholarships`} className="text-cyan hover:underline">Scholarships that can reduce this →</Link>
        </p>
      </Block>
    </div>
  );
}
