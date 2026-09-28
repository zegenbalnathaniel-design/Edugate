import { SIGNAL_KEYS, type SignalKey, type SignalScore, type Archetype } from "@/lib/data/types";

/**
 * Archetype matching — docs/04-passion-engine.md §5.
 *
 * Two guards against fake precision:
 *  1. Floor at 0.82 — below it, archetype = null and the reveal leads with
 *     top signals instead. Not matching a named pattern is a normal outcome.
 *  2. Blend disclosure — if the top two are within 0.05, both are shown.
 */

const SIMILARITY_FLOOR = 0.82;
const BLEND_MARGIN = 0.05;

function toVector(scores: SignalScore[]): Record<SignalKey, number> {
  const v = {} as Record<SignalKey, number>;
  for (const s of scores) v[s.key] = s.normalized;
  return v;
}

function cosineSimilarity(
  a: Record<SignalKey, number>,
  b: Partial<Record<SignalKey, number>>,
): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (const k of SIGNAL_KEYS) {
    const av = a[k] ?? 0;
    const bv = b[k] ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface ArchetypeMatchResult {
  archetype: Archetype | null;
  archetypeBlend: Archetype | null;
  /** Internal only — never rendered (no percentages/decimals in the UI, §4). */
  topSimilarity: number | null;
}

export function matchArchetype(
  scores: SignalScore[],
  archetypes: Archetype[],
): ArchetypeMatchResult {
  const vector = toVector(scores);
  const ranked = archetypes
    .map((a) => ({ archetype: a, similarity: cosineSimilarity(vector, a.vector) }))
    .sort((x, y) => y.similarity - x.similarity);

  const top = ranked[0];
  if (!top || top.similarity < SIMILARITY_FLOOR) {
    return { archetype: null, archetypeBlend: null, topSimilarity: top?.similarity ?? null };
  }

  const second = ranked[1];
  const blend =
    second && top.similarity - second.similarity <= BLEND_MARGIN
      ? second.archetype
      : null;

  return { archetype: top.archetype, archetypeBlend: blend, topSimilarity: top.similarity };
}
