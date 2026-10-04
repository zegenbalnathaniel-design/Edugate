import type { University } from "./schema";

/*
 * Selectivity bands are derived only from published evidence, with the rule
 * shown to the student (methodology page). No published evidence → null,
 * shown as "Not enough published data" — never guessed from reputation.
 *
 *   acceptance rate < 15%            → highly selective
 *   15–35%                           → selective
 *   35–65%                           → moderate
 *   > 65%                            → accessible
 *   JoSAA/JEE Advanced closing rank (OPEN, gender-neutral) ≤ 5,000 for the
 *   institution's most competitive listed course → highly selective
 */

export const SELECTIVITY = ["highly-selective", "selective", "moderate", "accessible"] as const;
export type Selectivity = (typeof SELECTIVITY)[number];
export const SELECTIVITY_LABEL: Record<Selectivity, string> = {
  "highly-selective": "Highly selective",
  selective: "Selective",
  moderate: "Moderate",
  accessible: "Accessible",
};

export type SelectivityEvidence = { band: Selectivity; reason: string; sourceId: string | null; year: string };

export function parseRate(rate: string | null, admitted?: number | null, applicants?: number | null): number | null {
  const m = rate?.match(/([\d.]+)\s*%/);
  if (m) return Number(m[1]);
  if (admitted && applicants) return (admitted / applicants) * 100;
  return null;
}

export function bandForRate(pct: number): Selectivity {
  return pct < 15 ? "highly-selective" : pct < 35 ? "selective" : pct < 65 ? "moderate" : "accessible";
}

export function selectivity(u: University): SelectivityEvidence | null {
  const stats = [...u.details.admissionStats].sort((a, b) => b.year.localeCompare(a.year));
  for (const s of stats) {
    const pct = parseRate(s.acceptanceRate, s.admitted, s.applicants);
    if (pct != null) {
      return {
        band: bandForRate(pct),
        reason: `${pct < 1 ? pct.toFixed(2) : pct.toFixed(pct < 10 ? 1 : 0)}% of applicants admitted (${s.scope})`,
        sourceId: s.sourceId,
        year: s.year,
      };
    }
  }
  const jee = u.details.cutoffs
    .filter((c) => /jee\W*adv/i.test(c.exam) && /open/i.test(c.category) && /neutral/i.test(c.category))
    .map((c) => ({ c, rank: Number(c.closing.replace(/[^\d]/g, "")) }))
    .filter((x) => x.rank > 0)
    .sort((a, b) => a.rank - b.rank)[0];
  if (jee && jee.rank <= 5000) {
    return {
      band: "highly-selective",
      reason: `${jee.c.program}: JEE Advanced closing rank ${jee.rank.toLocaleString("en-IN")} (OPEN, ${jee.c.year})`,
      sourceId: jee.c.sourceId,
      year: String(jee.c.year),
    };
  }
  return null;
}
