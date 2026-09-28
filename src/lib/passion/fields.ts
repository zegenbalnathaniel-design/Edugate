import type {
  FieldKey,
  SignalKey,
  SignalScore,
  FieldConnection,
  FieldConnectionBand,
} from "@/lib/data/types";

/**
 * Signals → fields — docs/04-passion-engine.md §7.
 *
 * connection(field) = Σ normalized(s) × weight(s) / Σ weight(s)
 * Banded to three labels, never numbers: below 0.35 is not shown at all.
 */

export type FieldWeights = Record<FieldKey, Partial<Record<SignalKey, number>>>;

function bandFor(strength: number): FieldConnectionBand | null {
  if (strength >= 0.7) return "strong";
  if (strength >= 0.5) return "moderate";
  if (strength >= 0.35) return "worth_exploring";
  return null;
}

export const FIELD_CONNECTION_LABELS: Record<FieldConnectionBand, string> = {
  strong: "Strong connection",
  moderate: "Moderate connection",
  worth_exploring: "Worth exploring",
};

export function computeFieldConnections(
  scores: SignalScore[],
  fieldWeights: FieldWeights,
): FieldConnection[] {
  const bySignal = new Map(scores.map((s) => [s.key, s]));
  const results: FieldConnection[] = [];

  for (const [field, weights] of Object.entries(fieldWeights) as [
    FieldKey,
    Partial<Record<SignalKey, number>>,
  ][]) {
    const entries = Object.entries(weights) as [SignalKey, number][];
    const weightSum = entries.reduce((sum, [, w]) => sum + w, 0);
    if (weightSum === 0) continue;

    let numerator = 0;
    const contributions: FieldConnection["contributions"] = [];
    for (const [signal, weight] of entries) {
      const normalized = bySignal.get(signal)?.normalized ?? 0;
      numerator += normalized * weight;
      contributions.push({ signal, weight });
    }

    const strength = numerator / weightSum;
    const band = bandFor(strength);
    if (!band) continue;

    contributions.sort((a, b) => b.weight - a.weight);
    results.push({ field, strength, band, contributions });
  }

  return results.sort((a, b) => b.strength - a.strength);
}
