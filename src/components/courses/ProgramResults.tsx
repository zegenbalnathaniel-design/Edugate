import Link from "next/link";
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

function Row({ h }: { h: ProgramHit }) {
  const p = h.program;
  const u = h.uni;
  const india = u.countryCode === "IN";
  const route = [...h.admissionBases.map((b) => BASIS_SHORT[b] ?? b), ...h.tests.map((t) => TEST_LABEL[t] ?? t)];
  const local = !india && p.fees?.value ? moneyRange(p.fees.value, u.currency) : null;
  return (
    <li className="grid gap-3 border-b border-paper/8 py-4 last:border-0 md:grid-cols-[auto_1fr_10rem_11rem] md:items-start">
      <input
        type="checkbox"
        name="p"
        value={`${u.slug}/${p.slug}`}
        aria-label={`Compare ${p.name} at ${u.name}`}
        className="mt-1.5 size-4 accent-[var(--color-electric)]"
      />
      <div className="min-w-0">
        <Link href={`/universities/${u.slug}/programs/${p.slug}`} className="font-medium hover:text-cyan">{p.name}</Link>
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
export function ProgramResults({ hits, emptyHint }: { hits: ProgramHit[]; emptyHint?: string }) {
  if (!hits.length) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-[1rem]">No programmes on Edugate match all of those filters yet.</p>
        <p className="mt-2 text-[0.875rem] text-paper/60">{emptyHint ?? "Remove the most restrictive filter first. “No match” can also mean “not on Edugate yet” — coverage is growing Chennai first."}</p>
      </div>
    );
  }
  const groups = TIERS.map((t) => ({ t, list: hits.filter((h) => tierOf(h.uni) === t) })).filter((g) => g.list.length);
  return (
    <form action="/compare/programs" method="get">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.9375rem]" aria-live="polite">
          <strong>{hits.length}</strong> programme{hits.length === 1 ? "" : "s"} at <strong>{new Set(hits.map((h) => h.uni.slug)).size}</strong> institutions
        </p>
        <button className="rounded-full border border-paper/25 px-4 py-2 text-[0.8125rem] hover:border-paper/60">Compare selected (up to 5) →</button>
      </div>
      <Variants hits={hits} />
      <nav aria-label="Jump to location" className="mt-4 flex flex-wrap gap-3 text-[0.8125rem]">
        {groups.map((g) => (
          <a key={g.t} href={`#tier-${g.t}`} className="text-cyan hover:underline">{TIER_HEADING[g.t]} ({g.list.length})</a>
        ))}
      </nav>
      {groups.map((g) => (
        <section key={g.t} id={`tier-${g.t}`} className="mt-10 scroll-mt-28" aria-labelledby={`h-${g.t}`}>
          <h2 id={`h-${g.t}`} className="font-display text-[1.375rem]">
            {TIER_HEADING[g.t]} <span className="text-paper/45">({g.list.length})</span>
          </h2>
          <p className="sr-only">{TIER_LABEL[g.t]}</p>
          <ul className="glass mt-4 px-5">
            {g.list.map((h) => <Row key={`${h.uni.slug}/${h.program.slug}`} h={h} />)}
          </ul>
        </section>
      ))}
    </form>
  );
}
