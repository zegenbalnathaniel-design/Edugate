import Link from "next/link";
import { BASIS_LABEL, COST_BANDS, type Filters } from "@/lib/unis/filters";
import { INSTITUTION_TYPE_LABEL, TIER_LABEL, TIERS, stateLabel } from "@/lib/unis/geo";
import { SELECTIVITY, SELECTIVITY_LABEL } from "@/lib/unis/selectivity";
import { DEGREES, TESTS } from "@/lib/unis/taxonomy";

const box = "rounded-[var(--radius-md)] border border-current/20 bg-navy-800 px-3 py-2 text-[0.875rem]";

function Checks({ legend, name, options, selected }: { legend: string; name: string; options: [string, string][]; selected: string[] }) {
  if (!options.length) return null;
  return (
    <fieldset className="grid gap-1">
      <legend className="meta mb-1.5 text-paper/55">{legend}</legend>
      <div className="grid max-h-44 gap-1 overflow-y-auto pr-1">
        {options.map(([v, l]) => (
          <label key={v} className="flex items-center gap-2 text-[0.875rem]">
            <input type="checkbox" name={name} value={v} defaultChecked={selected.includes(v)} className="accent-[var(--color-electric)]" /> {l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Filters for program-level discovery. Plain GET form: filters live in the
 * URL, so a filtered course list can be shared or bookmarked.
 */
export function ProgramFilters({
  f,
  action,
  states,
  cities,
  degrees,
  showQuery = false,
}: {
  f: Filters;
  action: string;
  states: string[];
  cities: string[];
  degrees: string[];
  showQuery?: boolean;
}) {
  return (
    <form method="get" action={action} className="glass sticky top-24 space-y-5 p-5" aria-label="Filter courses">
      {showQuery && (
        <label className="grid gap-1.5">
          <span className="meta text-paper/55">Course</span>
          <input name="q" defaultValue={f.q} placeholder="Economics, B.Com, Economics + Finance" className={box} />
        </label>
      )}
      <Checks legend="Where" name="tier" options={TIERS.map((t) => [t, TIER_LABEL[t]])} selected={f.tiers} />
      <Checks legend="State" name="state" options={states.map((s) => [s, stateLabel(s)])} selected={f.states} />
      <Checks legend="City" name="city" options={cities.map((c) => [c, c])} selected={f.hubs} />
      <Checks legend="Degree" name="degree" options={DEGREES.filter((d) => degrees.includes(d)).map((d) => [d, d])} selected={f.degrees} />
      <Checks legend="Yearly fee (₹)" name="cost" options={Object.entries(COST_BANDS).map(([k, v]) => [k, v.label])} selected={f.costBands} />
      <details open={Boolean(f.bases.length || f.tests.length || f.selectivity.length || f.types.length)} className="space-y-4">
        <summary className="cursor-pointer text-[0.875rem] text-cyan">Admissions & institution</summary>
        <div className="mt-3 space-y-4">
          <Checks legend="How you get in" name="basis" options={Object.entries(BASIS_LABEL)} selected={f.bases} />
          <Checks legend="Entrance test" name="test" options={TESTS.map((t) => [t.key, t.label])} selected={f.tests} />
          <Checks legend="Selectivity (published evidence)" name="sel" options={SELECTIVITY.map((s) => [s, SELECTIVITY_LABEL[s]])} selected={f.selectivity} />
          <Checks legend="Institution type" name="type" options={Object.entries(INSTITUTION_TYPE_LABEL)} selected={f.types} />
        </div>
      </details>
      <label className="grid gap-1.5">
        <span className="meta text-paper/55">Sort</span>
        <select name="sort" defaultValue={f.sort === "cost-inr" ? "cost-inr" : ""} className={box}>
          <option value="">Institution name</option>
          <option value="cost-inr">Lowest yearly fee</option>
        </select>
      </label>
      <div className="flex gap-2 pt-1">
        <button className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-electric text-[0.875rem] font-semibold text-[var(--on-electric)]">Apply</button>
        <Link href={action} className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem]">Clear</Link>
      </div>
      <p className="text-[0.75rem] text-paper/45">
        Fees are tuition per year as published (converted at dated reference rates for institutions abroad). Selectivity uses only published acceptance rates or cut-offs — see Methodology.
      </p>
    </form>
  );
}
