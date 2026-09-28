import type { SignalKey, SignalScore } from "@/lib/data/types";
import { SIGNAL_LABELS } from "@/lib/data/types";
import { DISPLAY_CONFIDENCE_THRESHOLD } from "@/lib/passion/scoring";

const BANDS = 5;

/**
 * Renders one interest signal — docs/04-passion-engine.md §4.
 *
 * Below the confidence floor this never fabricates a band from one or two
 * data points: it renders "not enough signal yet" instead. No percentages,
 * no decimals, anywhere.
 */
export function SignalMeter({ score }: { score: SignalScore }) {
  const label = SIGNAL_LABELS[score.key as SignalKey];
  const hasConfidence = score.confidence >= DISPLAY_CONFIDENCE_THRESHOLD;
  const filled = hasConfidence ? Math.round(score.normalized * BANDS) : 0;

  return (
    <div className="flex items-center justify-between gap-4 py-2.5" data-signal={score.key}>
      <span className="text-[0.9375rem] text-paper/85">{label}</span>
      {hasConfidence ? (
        <div className="flex items-center gap-1" role="img" aria-label={`${label}: ${filled} of ${BANDS} bands`}>
          {Array.from({ length: BANDS }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-2.5 w-2.5 rounded-[2px] ${i < filled ? "bg-cyan" : "border border-current/20 bg-transparent"}`}
            />
          ))}
        </div>
      ) : (
        <span className="meta text-grey-500">Not enough signal yet</span>
      )}
    </div>
  );
}
