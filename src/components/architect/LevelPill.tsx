import type { Level } from "@/lib/architect/schemas";

const RANK: Record<Level, number> = { Low: 0, Moderate: 1, High: 2, "Very High": 3 };
const TONE = ["text-paper/55 border-paper/20", "text-pending border-pending/40", "text-cyan border-cyan/45", "text-verified border-verified/50"];

/**
 * A qualitative rating, shown as a word — never a score. For costs and risks
 * ("inverted") a higher level is the worse outcome, so the tones flip.
 */
export function LevelPill({ level, inverted = false }: { level: Level; inverted?: boolean }) {
  const r = RANK[level];
  const tone = inverted ? ["text-verified border-verified/50", "text-cyan border-cyan/45", "text-pending border-pending/40", "text-attention border-attention/50"][r] : TONE[r];
  return <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.75rem] ${tone}`}>{level}</span>;
}
