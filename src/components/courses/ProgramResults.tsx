import Link from "next/link";
import { HairlineRule } from "@/components/primitives/Hairline";
import { Reveal } from "@/components/primitives/Reveal";
import { filtersToQuery, type Filters } from "@/lib/unis/filters";
import { BASIS_SHORT, inrCompact, moneyRange } from "@/lib/unis/format";
import { INSTITUTION_TYPE_LABEL, tierOf, TIER_LABEL, TIERS, type Tier } from "@/lib/unis/geo";
import type { ProgramHit } from "@/lib/unis/repo";
import { SELECTIVITY_LABEL, type Selectivity } from "@/lib/unis/selectivity";
import { TEST_LABEL } from "@/lib/unis/taxonomy";

const TIER_HEADING: Record<Tier, string> = {
  chennai: "In Chennai",
  "tamil-nadu": "Elsewhere in Tamil Nadu",
  india: "Rest of India",
  abroad: "Abroad",
};

/**
 * Rows rendered per location group before linking through.
 *
 * A broad query like "Computer Science" returns ~470 programmes; rendering
 * every one put thousands of nodes on a single page and is a large part of
 * why the explorer felt heavy. Each group now shows a readable slice and
 * links to the tier-filtered view — a filter that already exists — for the
 * remainder, so nothing becomes unreachable.
 *
 * The cap is lifted when every hit belongs to ONE institution: that result is
 * a catalogue view, not a broad search, and truncating it reproduces the
 * original complaint — searching "Harvard" and being shown a fraction of what
 * Harvard offers.
 */
const PER_GROUP = 30;

/** Variant chips: how many programmes of each degree family, plus joint/interdisciplinary ones. */
function Variants({ hits }: { hits: ProgramHit[] }) {
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(h.degreeNorm ?? "Other", (counts.get(h.degreeNorm ?? "Other") ?? 0) + 1);
  const joint = hits.filter((h) => h.subjects.length > 2).length;
  return (
    <p className="flex flex-wrap gap-2 text-[0.8125rem] text-paper/65">
      {[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([d, n]) => (
        <span key={d} className="rounded-full border border-paper/15 px-2.5 py-0.5">{d} <span className="text-paper/45">{n}</span></span>
      ))}
      {joint > 0 && <span className="rounded-full border border-paper/15 px-2.5 py-0.5">Joint / interdisciplinary <span className="text-paper/45">{joint}</span></span>}
    </p>
  );
}

function Row({ h, index }: { h: ProgramHit; index: number }) {
  const p = h.program;
  const u = h.uni;
  const india = u.countryCode === "IN";
  const route = [...h.admissionBases.map((b) => BASIS_SHORT[b] ?? b), ...h.tests.map((t) => TEST_LABEL[t] ?? t)];
  const local = !india && p.fees?.value ? moneyRange(p.fees.value, u.currency) : null;
  return (
    <li className="group grid gap-3 border-t border-paper/8 py-4 transition-colors duration-[var(--dur-quick)] hover:bg-paper/[0.03] md:grid-cols-[auto_auto_1fr_9rem_10rem] md:items-start">
      <input
        type="checkbox"
        name="p"
        value={`${u.slug}/${p.slug}`}
        aria-label={`Compare ${p.name} at ${u.name}`}
        className="mt-1.5 size-4 accent-[var(--color-electric)]"
      />
      <span aria-hidden className="tabular hidden pt-1 text-[0.6875rem] text-paper/30 md:block">
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <Link href={`/universities/${u.slug}/programs/${p.slug}`} className="font-medium transition-colors group-hover:text-cyan">{p.name}</Link>
        {p.specialization && <span className="text-paper/60"> · {p.specialization}</span>}
        <p className="mt-0.5 text-[0.8125rem] text-paper/60">
          <Link href={`/universities/${u.slug}`} className="hover:text-paper">{u.name}</Link> · {u.hub ?? u.city}
          {u.countryCode === "IN" ? `, ${u.region}` : `, ${u.country}`}
          {p.stream ? ` · ${p.stream}` : ""}
        </p>
        <p className="mt-1 text-[0.75rem] text-paper/45">
          {[p.degree, p.durationYears ? `${p.durationYears} yrs` : null, u.institutionType ? INSTITUTION_TYPE_LABEL[u.institutionType] : null].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="text-[0.875rem]">
        <span className="meta block text-paper/45">Yearly fee</span>
        {h.costInr != null ? <span className="tabular">{india ? "" : "≈ "}{inrCompact(h.costInr)}</span> : <span className="text-paper/40">—</span>}
        {local && <span className="block text-[0.75rem] text-paper/45">{local.trim()}</span>}
      </div>
      <div className="text-[0.875rem]">
        <span className="meta block text-paper/45">Admission</span>
        {route.length ? route.slice(0, 3).join(", ") : <span className="text-paper/50">See course</span>}
        {u.selectivity && <span className="block text-[0.75rem] text-paper/55">{SELECTIVITY_LABEL[u.selectivity as Selectivity]}</span>}
      </div>
    </li>
  );
}

/**
 * Course results grouped by the discovery hierarchy (Chennai → Tamil Nadu →
 * India → Abroad). Checkboxes feed the programme comparison.
 */
export function ProgramResults({
  hits,
  emptyHint,
  f,
  action = "/courses",
}: {
  hits: ProgramHit[];
  emptyHint?: string;
  f?: Filters;
  action?: string;
}) {
  if (!hits.length) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-[1rem]">No programmes on Edugate match all of those filters yet.</p>
        <p className="mt-2 text-[0.875rem] text-paper/60">{emptyHint ?? "Remove the most restrictive filter first. “No match” can also mean “not on Edugate yet” — coverage is growing Chennai first."}</p>
      </div>
    );
  }
  const groups = TIERS.map((t) => ({ t, list: hits.filter((h) => tierOf(h.uni) === t) })).filter((g) => g.list.length);
  const institutionCount = new Set(hits.map((h) => h.uni.slug)).size;
  const cap = institutionCount === 1 ? Number.POSITIVE_INFINITY : PER_GROUP;
  return (
    <form action="/compare/programs" method="get">
      {/* Sticky summary: counts and the compare action stay reachable however
          far down a long result set the reader has scrolled. */}
      <div className="sticky top-20 z-10 mb-5 rounded-[var(--radius-md)] bg-navy-900/80 px-3 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.9375rem]" aria-live="polite">
            <strong className="tabular">{hits.length}</strong> programme{hits.length === 1 ? "" : "s"} at{" "}
            <strong className="tabular">{institutionCount}</strong> institution{institutionCount === 1 ? "" : "s"}
          </p>
          <button className="rounded-full border border-paper/25 px-4 py-2 text-[0.8125rem] transition-colors hover:border-cyan hover:text-cyan">
            Compare selected (up to 5) →
          </button>
        </div>
      </div>
      <Reveal>
        <Variants hits={hits} />
      </Reveal>
      <nav aria-label="Jump to location" className="mt-4 flex flex-wrap gap-3 text-[0.8125rem]">
        {groups.map((g) => (
          <a key={g.t} href={`#tier-${g.t}`} className="link-underline text-cyan">{TIER_HEADING[g.t]} ({g.list.length})</a>
        ))}
      </nav>
      {groups.map((g) => {
        const shown = cap === Number.POSITIVE_INFINITY ? g.list : g.list.slice(0, cap);
        const rest = g.list.length - shown.length;
        return (
          <section key={g.t} id={`tier-${g.t}`} className="mt-12 scroll-mt-32" aria-labelledby={`h-${g.t}`}>
            <h2 id={`h-${g.t}`} className="font-display text-[1.375rem]">
              {TIER_HEADING[g.t]} <span className="tabular text-paper/45">({g.list.length})</span>
            </h2>
            <HairlineRule className="mt-3 text-paper" />
            <p className="sr-only">{TIER_LABEL[g.t]}</p>
            <Reveal stagger>
              <ul className="mt-1">
                {shown.map((h, i) => (
                  <Row key={`${h.uni.slug}/${h.program.slug}`} h={h} index={i + 1} />
                ))}
              </ul>
            </Reveal>
            {rest > 0 && (
              <p className="mt-4 text-[0.875rem] text-paper/60">
                Showing {shown.length} of {g.list.length}.{" "}
                {f ? (
                  <Link href={`${action}?${filtersToQuery({ ...f, tiers: [g.t] })}`} className="link-underline text-cyan">
                    See all {g.list.length} in {TIER_HEADING[g.t].toLowerCase()}
                  </Link>
                ) : (
                  <span>Narrow the filters to see the rest.</span>
                )}
              </p>
            )}
          </section>
        );
      })}
    </form>
  );
}
