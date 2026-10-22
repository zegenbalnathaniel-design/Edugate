import Link from "next/link";
import { HairlineRule } from "@/components/primitives/Hairline";
import { BASIS_LABEL, COST_BANDS, filtersToQuery, type Filters } from "@/lib/unis/filters";
import { INSTITUTION_TYPE_LABEL, TIER_LABEL, TIERS, stateLabel } from "@/lib/unis/geo";
import { SELECTIVITY, SELECTIVITY_LABEL } from "@/lib/unis/selectivity";
import { DEGREES, TESTS } from "@/lib/unis/taxonomy";

const box =
  "w-full rounded-[var(--radius-md)] border border-current/20 bg-navy-800 px-3 py-2 text-[0.875rem]";

/** Which Filters array a group writes to, so chips can remove one value. */
type Key = "tiers" | "states" | "hubs" | "degrees" | "costBands" | "bases" | "tests" | "selectivity" | "types";

/**
 * One collapsible group.
 *
 * Previously every group was expanded at once, each with its own
 * `max-h-44 overflow-y-auto`. Nine stacked scroll areas is why the panel read
 * as a wall. Groups now collapse, carry a count, and open only when they hold
 * an active value — or when they are one of the three people actually start
 * with. Open groups show their full list, so nested scrollbars are gone.
 */
function Group({
  legend,
  name,
  options,
  selected,
  defaultOpen = false,
}: {
  legend: string;
  name: string;
  options: [string, string][];
  selected: string[];
  defaultOpen?: boolean;
}) {
  if (!options.length) return null;
  const active = options.filter(([v]) => selected.includes(v)).length;
  return (
    <details open={defaultOpen || active > 0} className="group border-t border-current/10 pt-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 pb-1">
        <span className="meta text-paper/60">{legend}</span>
        <span className="flex items-center gap-2">
          {active > 0 && (
            <span className="tabular rounded-full bg-electric/20 px-2 py-0.5 text-[0.6875rem] text-cyan">
              {active}
            </span>
          )}
          <span
            aria-hidden
            className="text-paper/35 transition-transform duration-[var(--dur-quick)] group-open:rotate-180"
          >
            <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
              <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </summary>
      <div className="grid gap-1.5 pb-3 pt-1.5">
        {options.map(([v, l]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2 text-[0.875rem] text-paper/80 hover:text-paper">
            <input
              type="checkbox"
              name={name}
              value={v}
              defaultChecked={selected.includes(v)}
              className="accent-[var(--color-electric)]"
            />
            {l}
          </label>
        ))}
      </div>
    </details>
  );
}

/**
 * Filters for programme-level discovery. Plain GET form: state lives in the
 * URL, so a filtered list can be shared or bookmarked, and the panel works
 * with JavaScript disabled.
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
  const groups: { legend: string; name: string; key: Key; options: [string, string][]; defaultOpen?: boolean }[] = [
    { legend: "Where", name: "tier", key: "tiers", options: TIERS.map((t) => [t, TIER_LABEL[t]]), defaultOpen: true },
    { legend: "Degree", name: "degree", key: "degrees", options: DEGREES.filter((d) => degrees.includes(d)).map((d) => [d, d]), defaultOpen: true },
    { legend: "Yearly fee (₹)", name: "cost", key: "costBands", options: Object.entries(COST_BANDS).map(([k, v]) => [k, v.label]), defaultOpen: true },
    { legend: "State", name: "state", key: "states", options: states.map((s) => [s, stateLabel(s)]) },
    { legend: "City", name: "city", key: "hubs", options: cities.map((c) => [c, c]) },
    { legend: "How you get in", name: "basis", key: "bases", options: Object.entries(BASIS_LABEL) },
    { legend: "Entrance test", name: "test", key: "tests", options: TESTS.map((t) => [t.key, t.label]) },
    { legend: "Selectivity", name: "sel", key: "selectivity", options: SELECTIVITY.map((s) => [s, SELECTIVITY_LABEL[s]]) },
    { legend: "Institution type", name: "type", key: "types", options: Object.entries(INSTITUTION_TYPE_LABEL) },
  ];

  // Active filters as removable chips, so the panel can stay collapsed and
  // the reader can still see — and undo — exactly what is narrowing the list.
  const chips: { label: string; href: string }[] = [];
  for (const g of groups) {
    const sel = f[g.key] as string[];
    for (const [v, l] of g.options) {
      if (!sel.includes(v)) continue;
      const next = { ...f, [g.key]: sel.filter((x) => x !== v) } as Filters;
      chips.push({ label: l, href: `${action}?${filtersToQuery(next)}` });
    }
  }
  if (f.q) chips.push({ label: `“${f.q}”`, href: `${action}?${filtersToQuery({ ...f, q: "" })}` });

  const total = chips.length;

  return (
    <form method="get" action={action} className="glass sticky top-24 p-5" aria-label="Filter courses">
      {showQuery && (
        <label className="grid gap-1.5">
          <span className="meta text-paper/60">Course</span>
          <input
            name="q"
            defaultValue={f.q}
            placeholder="Economics, B.Com, Economics + Finance"
            className={box}
          />
        </label>
      )}

      {total > 0 && (
        <div className="mt-4">
          <HairlineRule label={`${total} active`} className="text-paper" />
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li key={c.href + c.label}>
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-1 text-[0.75rem] text-cyan transition-colors hover:border-cyan hover:bg-cyan/20"
                >
                  {c.label}
                  <span aria-hidden>×</span>
                  <span className="sr-only">Remove filter</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        {groups.map((g) => (
          <Group
            key={g.name}
            legend={g.legend}
            name={g.name}
            options={g.options}
            selected={f[g.key] as string[]}
            defaultOpen={g.defaultOpen}
          />
        ))}
      </div>

      <div className="border-t border-current/10 pt-4">
        <label className="grid gap-1.5">
          <span className="meta text-paper/60">Sort</span>
          <select name="sort" defaultValue={f.sort === "cost-inr" ? "cost-inr" : ""} className={box}>
            <option value="">Institution name</option>
            <option value="cost-inr">Lowest yearly fee</option>
          </select>
        </label>

        <div className="mt-4 flex gap-2">
          <button className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-electric text-[0.875rem] font-semibold text-[var(--on-electric)] transition-transform duration-[var(--dur-quick)] hover:scale-[1.02]">
            Apply
          </button>
          <Link
            href={action}
            className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] transition-colors hover:border-paper/50"
          >
            Clear
          </Link>
        </div>
      </div>

      <p className="mt-4 text-[0.75rem] leading-[1.5] text-paper/45">
        Fees are tuition per year as published (converted at dated reference
        rates for institutions abroad). Selectivity uses only published
        acceptance rates or cut-offs — see Methodology.
      </p>
    </form>
  );
}
