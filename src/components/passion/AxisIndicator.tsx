import type { AxisScore } from "@/lib/data/types";
import { AXIS_LABELS } from "@/lib/data/types";

/**
 * Renders one working-style axis — docs/04-passion-engine.md §1, §4.
 *
 * Bipolar, never a star rating: a 5-star "independence" score would imply
 * collaboration is a deficiency. Position on a line, with a confidence band
 * that widens toward "most of the line" as confidence drops — the band's
 * width *is* the honesty signal, not a caveat next to it.
 */
export function AxisIndicator({ score }: { score: AxisScore }) {
  const meta = AXIS_LABELS[score.key];
  const markerPct = ((score.position + 1) / 2) * 100;
  const bandHalfPct = (1 - score.confidence) * 45;
  const bandStart = Math.max(0, markerPct - bandHalfPct);
  const bandWidth = Math.min(100, markerPct + bandHalfPct) - bandStart;

  return (
    <div className="py-3" data-axis={score.key}>
      <div className="mb-2 flex items-center justify-between text-[0.8125rem] text-paper/60">
        <span>{meta.poleA}</span>
        <span className="meta text-grey-500">{meta.name}</span>
        <span>{meta.poleB}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-navy-700">
        <div
          className="absolute top-0 h-full rounded-full bg-cyan/25"
          style={{ left: `${bandStart}%`, width: `${bandWidth}%` }}
          aria-hidden
        />
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan bg-navy-900"
          style={{ left: `${markerPct}%` }}
          role="img"
          aria-label={`${meta.name}: positioned toward ${score.position >= 0 ? meta.poleB : meta.poleA}`}
        />
      </div>
    </div>
  );
}
