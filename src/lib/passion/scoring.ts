import {
  SIGNAL_KEYS,
  AXIS_KEYS,
  type SignalKey,
  type AxisKey,
  type PassionQuestion,
  type PassionResponse,
  type SignalScore,
  type AxisScore,
  type SignalState,
  type EvidenceMap,
} from "@/lib/data/types";

/**
 * Scoring — docs/04-passion-engine.md §4.
 *
 * Adaptive branching means two students answer different question sets, so
 * raw sums are not comparable: a student asked eight technology-touching
 * questions would out-score one asked three, regardless of orientation.
 * Everything here normalizes against what was actually *asked*, not what
 * exists in the bank.
 */

const CONFIDENCE_FLOOR_OBSERVATIONS = 5;
/** Below this, render "not enough signal yet" — never a star rating. */
export const DISPLAY_CONFIDENCE_THRESHOLD = 0.6;

function byId(questions: PassionQuestion[]): Map<string, PassionQuestion> {
  return new Map(questions.map((q) => [q.id, q]));
}

/**
 * `responseId` in the evidence map is the response's `questionId`: a session
 * asks each question at most once, so it is a stable, sufficient identifier
 * for "why did this appear" to look the question and chosen option back up.
 */
export function scoreSignals(
  responses: PassionResponse[],
  askedQuestions: PassionQuestion[],
): { scores: SignalScore[]; evidence: EvidenceMap["bySignal"] } {
  const qById = byId(askedQuestions);

  const raw: Record<SignalKey, number> = emptySignalRecord();
  const attainable: Record<SignalKey, number> = emptySignalRecord();
  const observations: Record<SignalKey, number> = emptySignalRecord();
  const evidence: EvidenceMap["bySignal"] = {};

  // attainable(s) and observations(s) are properties of the asked set, not
  // of what the student picked — computed once over every asked question.
  for (const q of askedQuestions) {
    for (const s of q.targets) {
      observations[s] += 1;
      const maxForQuestion = Math.max(
        0,
        ...q.options.map((o) => o.signals[s] ?? 0),
      );
      attainable[s] += maxForQuestion;
    }
  }

  for (const response of responses) {
    const q = qById.get(response.questionId);
    if (!q) continue;
    const option = q.options.find((o) => o.id === response.optionId);
    if (!option) continue;

    for (const [key, weight] of Object.entries(option.signals) as [
      SignalKey,
      number,
    ][]) {
      if (!weight) continue;
      raw[key] += weight;
      (evidence[key] ??= []).push({
        responseId: response.questionId,
        contribution: weight,
      });
    }
  }

  const scores: SignalScore[] = SIGNAL_KEYS.map((key) => {
    const a = attainable[key];
    const normalized = a > 0 ? clamp01(raw[key] / a) : 0;
    const confidence = Math.min(
      1,
      observations[key] / CONFIDENCE_FLOOR_OBSERVATIONS,
    );
    return { key, normalized, confidence, observations: observations[key] };
  });

  return { scores, evidence };
}

/**
 * Axes are bipolar and get no formula in §4 (only signals do) — this extends
 * the same "normalize against what was asked" principle to a -1..+1 position:
 * position is the sum of chosen axis weights divided by the sum of the
 * largest-magnitude option available per asked axis-informative question, so
 * consistently extreme answers approach ±1 and mixed answers pull to 0.
 * Confidence reuses the same ~5-observation floor as signals (§4's rationale
 * — few data points shouldn't earn a confident claim — applies identically
 * to a bipolar axis).
 */
export function scoreAxes(
  responses: PassionResponse[],
  askedQuestions: PassionQuestion[],
): AxisScore[] {
  const qById = byId(askedQuestions);

  const raw: Record<AxisKey, number> = emptyAxisRecord();
  const attainable: Record<AxisKey, number> = emptyAxisRecord();
  const observations: Record<AxisKey, number> = emptyAxisRecord();

  for (const q of askedQuestions) {
    for (const axis of AXIS_KEYS) {
      const magnitudes = q.options
        .map((o) => o.axes?.[axis])
        .filter((v): v is number => v !== undefined)
        .map((v) => Math.abs(v));
      if (magnitudes.length === 0) continue;
      observations[axis] += 1;
      attainable[axis] += Math.max(...magnitudes);
    }
  }

  for (const response of responses) {
    const q = qById.get(response.questionId);
    if (!q) continue;
    const option = q.options.find((o) => o.id === response.optionId);
    if (!option?.axes) continue;
    for (const [key, weight] of Object.entries(option.axes) as [
      AxisKey,
      number,
    ][]) {
      if (weight === undefined) continue;
      raw[key] += weight;
    }
  }

  return AXIS_KEYS.map((key) => {
    const a = attainable[key];
    const position = a > 0 ? clamp(raw[key] / a, -1, 1) : 0;
    const confidence = Math.min(
      1,
      observations[key] / CONFIDENCE_FLOOR_OBSERVATIONS,
    );
    return { key, position, confidence };
  });
}

export function toSignalState(scores: SignalScore[]): SignalState {
  const normalized = emptySignalRecord();
  const confidence = emptySignalRecord();
  const observations = emptySignalRecord();
  for (const s of scores) {
    normalized[s.key] = s.normalized;
    confidence[s.key] = s.confidence;
    observations[s.key] = s.observations;
  }
  return { normalized, confidence, observations };
}

export function emptySignalRecord(): Record<SignalKey, number> {
  return Object.fromEntries(SIGNAL_KEYS.map((k) => [k, 0])) as Record<
    SignalKey,
    number
  >;
}

function emptyAxisRecord(): Record<AxisKey, number> {
  return Object.fromEntries(AXIS_KEYS.map((k) => [k, 0])) as Record<
    AxisKey,
    number
  >;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
