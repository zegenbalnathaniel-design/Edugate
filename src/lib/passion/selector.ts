import {
  SIGNAL_KEYS,
  type SignalKey,
  type PassionQuestion,
  type PassionResponse,
  type SignalScore,
} from "@/lib/data/types";
import { scoreSignals, toSignalState, emptySignalRecord } from "./scoring";

/**
 * Adaptive selection — docs/04-passion-engine.md §3.
 *
 * score(q) = Σ uncertainty(s) × salience(s) × novelty(q)  over s in q.targets
 *
 * Deterministic: same responses always produce the same next question, which
 * is what makes "why did this appear" answerable and the flow testable.
 */

const HARD_CAP = 40;
const MIN_BEFORE_TERMINATE = 25;
const STABILITY_WINDOW = 5;
const MEAN_CONFIDENCE_TARGET = 0.7;
const TOP_N = 5;

function questionVector(q: PassionQuestion): Record<SignalKey, number> {
  const v = emptySignalRecord();
  for (const s of SIGNAL_KEYS) {
    v[s] = Math.max(0, ...q.options.map((o) => o.signals[s] ?? 0));
  }
  return v;
}

function cosineSimilarity(
  a: Record<SignalKey, number>,
  b: Record<SignalKey, number>,
): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (const k of SIGNAL_KEYS) {
    dot += a[k] * b[k];
    na += a[k] * a[k];
    nb += b[k] * b[k];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Returns the next question to ask, or null when nothing eligible remains
 * (the caller should treat that the same as termination — it happens only
 * when the depth pool is exhausted before the hard cap).
 *
 * Core questions (12, fixed order, no eligibility gate) are always exhausted
 * first — this guarantees the comparable baseline coverage the spec relies
 * on before adaptive selection begins.
 */
export function pickNextQuestion(
  bank: PassionQuestion[],
  askedOrder: string[],
  responses: PassionResponse[],
): PassionQuestion | null {
  const askedSet = new Set(askedOrder);

  const remainingCore = bank
    .filter((q) => q.stage === "core" && !askedSet.has(q.id))
    // Presentation order for core = array order in the bank.
    .sort(
      (a, b) =>
        bank.findIndex((q) => q.id === a.id) -
        bank.findIndex((q) => q.id === b.id),
    );
  if (remainingCore.length > 0) return remainingCore[0];

  const askedQuestions = bank.filter((q) => askedSet.has(q.id));
  const { scores } = scoreSignals(responses, askedQuestions);
  const state = toSignalState(scores);

  const pool = bank.filter(
    (q) =>
      q.stage !== "core" &&
      !askedSet.has(q.id) &&
      (!q.eligibility || q.eligibility(state)),
  );
  if (pool.length === 0) return null;

  const askedVectors = askedQuestions.map(questionVector);

  let best: PassionQuestion | null = null;
  let bestScore = -Infinity;

  for (const q of pool) {
    const qVec = questionVector(q);
    const maxSim = askedVectors.length
      ? Math.max(...askedVectors.map((v) => cosineSimilarity(qVec, v)))
      : 0;
    const novelty = 1 - maxSim;

    let score = 0;
    for (const sig of q.targets) {
      const uncertainty = 1 / (1 + state.observations[sig]);
      const salience = 0.3 + 0.7 * state.normalized[sig];
      score += uncertainty * salience * novelty;
    }

    if (
      score > bestScore ||
      (score === bestScore && best !== null && q.id < best.id)
    ) {
      bestScore = score;
      best = q;
    }
  }

  return best;
}

function topSignalRanking(scores: SignalScore[], n: number): SignalKey[] {
  return [...scores]
    .sort((a, b) => b.normalized - a.normalized || a.key.localeCompare(b.key))
    .slice(0, n)
    .map((s) => s.key);
}

function meanConfidence(scores: SignalScore[]): number {
  return scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length;
}

/** Top-5 signals unchanged (same ranked order) across the last 5 questions. */
function top5Stable(bank: PassionQuestion[], askedOrder: string[], responses: PassionResponse[]): boolean {
  if (askedOrder.length < STABILITY_WINDOW) return false;

  const rankings: string[] = [];
  for (
    let cut = askedOrder.length - STABILITY_WINDOW + 1;
    cut <= askedOrder.length;
    cut++
  ) {
    const ids = new Set(askedOrder.slice(0, cut));
    const qs = bank.filter((q) => ids.has(q.id));
    const resp = responses.filter((r) => ids.has(r.questionId));
    const { scores } = scoreSignals(resp, qs);
    rankings.push(topSignalRanking(scores, TOP_N).join(","));
  }

  return rankings.every((r) => r === rankings[0]);
}

/** First-satisfied-condition termination, per docs/04 §3. */
export function shouldTerminate(
  bank: PassionQuestion[],
  askedOrder: string[],
  responses: PassionResponse[],
): boolean {
  const answered = askedOrder.length;
  if (answered >= HARD_CAP) return true;
  if (answered < MIN_BEFORE_TERMINATE) return false;

  const askedQuestions = bank.filter((q) => askedOrder.includes(q.id));
  const { scores } = scoreSignals(responses, askedQuestions);

  if (meanConfidence(scores) >= MEAN_CONFIDENCE_TARGET) return true;
  if (top5Stable(bank, askedOrder, responses)) return true;

  return false;
}
