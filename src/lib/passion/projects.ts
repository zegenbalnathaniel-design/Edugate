import type {
  SignalKey,
  SignalScore,
  ProjectTemplate,
} from "@/lib/data/types";
import { SIGNAL_LABELS } from "@/lib/data/types";

/**
 * Project selection — docs/04-passion-engine.md §7 (Projects).
 *
 * "Selection filters on signal thresholds, grade, and the student's stated
 * available time, then diversifies: never three variations of one idea."
 */

export interface ProjectIntake {
  grade: 9 | 10 | 11 | 12;
  /** Rough weekly hours the student says they can give this. */
  weeklyHoursBudget: number;
}

export interface RecommendedProject {
  template: ProjectTemplate;
  reason: string;
  signals: SignalKey[];
}

const CAP_PER_PRIMARY_SIGNAL = 2;
/** A project shouldn't demand more than ~6 weeks at the student's stated pace. */
const WEEKS_BUDGET = 6;

export function selectProjects(
  scores: SignalScore[],
  templates: ProjectTemplate[],
  intake: ProjectIntake,
  take = 6,
): RecommendedProject[] {
  const bySignal = new Map(scores.map((s) => [s.key, s]));

  const eligible = templates.filter((t) => {
    if (intake.grade < t.gradeRange[0] || intake.grade > t.gradeRange[1]) {
      return false;
    }
    if (t.estimatedHours > intake.weeklyHoursBudget * WEEKS_BUDGET) {
      return false;
    }
    return t.requires.signals.every(
      (s) => (bySignal.get(s)?.normalized ?? 0) >= t.requires.minNormalized,
    );
  });

  const ranked = eligible
    .map((template) => {
      const fit =
        template.requires.signals.reduce(
          (sum, s) => sum + (bySignal.get(s)?.normalized ?? 0),
          0,
        ) / Math.max(1, template.requires.signals.length);
      return { template, fit };
    })
    .sort((a, b) => b.fit - a.fit || a.template.id.localeCompare(b.template.id));

  // Diversify: cap how many share the same primary required signal, so the
  // list never reads as three variations of one idea.
  const picked: typeof ranked = [];
  const countByPrimary = new Map<SignalKey, number>();

  for (const r of ranked) {
    if (picked.length >= take) break;
    const primary = r.template.requires.signals[0];
    const count = countByPrimary.get(primary) ?? 0;
    if (count >= CAP_PER_PRIMARY_SIGNAL) continue;
    picked.push(r);
    countByPrimary.set(primary, count + 1);
  }
  if (picked.length < take) {
    for (const r of ranked) {
      if (picked.length >= take) break;
      if (!picked.includes(r)) picked.push(r);
    }
  }

  return picked.map(({ template }) => {
    const strongest = [...template.requires.signals].sort(
      (a, b) => (bySignal.get(b)?.normalized ?? 0) - (bySignal.get(a)?.normalized ?? 0),
    )[0];
    return {
      template,
      reason: `Matches your ${SIGNAL_LABELS[strongest]} signal`,
      signals: template.requires.signals,
    };
  });
}
