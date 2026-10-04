import type { StudentProfile } from "../profile/schema";
import { fitDimensions, gapAnalysis, preferenceAlignment, type FitDimension } from "./fit";
import type { Program, University } from "./schema";
import { selectivity, SELECTIVITY_LABEL } from "./selectivity";

/*
 * Programme match for a student (docs/09 §7).
 *
 * Two separate answers, never blended:
 *  1. Match % — how well the published facts fit the student's own
 *     priorities (course, curriculum, tests, budget, location, opportunities),
 *     weighted by the student's weights. It is NOT an admission chance.
 *  2. Admission band — Reach / Target / Safety, only from published evidence:
 *       a. the student's rank vs a published closing rank (JoSAA/JEE Advanced)
 *       b. the student's Class XII % vs a published merit-list cut-off
 *       c. the institution's published acceptance rate
 *     Missing a published requirement → "Not yet eligible". No evidence →
 *     "Unclassified", with the reason. Never inferred from reputation.
 */

export type Band = "safety" | "target" | "reach" | "not-eligible" | "unclassified";
export const BAND_LABEL: Record<Band, string> = {
  safety: "Safety",
  target: "Target",
  reach: "Reach",
  "not-eligible": "Not yet eligible",
  unclassified: "Unclassified",
};
export const BAND_GLYPH: Record<Band, string> = { safety: "●", target: "◐", reach: "○", "not-eligible": "✗", unclassified: "·" };

export type ProgramMatch = {
  percent: number | null;
  unknownShare: number;
  band: Band;
  bandReasons: string[];
  bandSourceIds: string[];
  dims: FitDimension[];
  why: string[]; // short "why this appears" lines, strongest first
};

const pctOf = (s: string | null | undefined) => {
  const m = s?.match(/([\d.]+)\s*%?/);
  return m ? Number(m[1]) : null;
};

/** Class XII percentage, when the profile holds a percentage-based board total. */
function boardPercent(profile: StudentProfile): number | null {
  if (!profile.curriculum || !["CBSE", "ISC", "STATE_BOARD"].includes(profile.curriculum)) return null;
  const n = pctOf(profile.predictedTotal);
  return n != null && n <= 100 ? n : null;
}

export function admissionBand(u: University, p: Program, profile: StudentProfile): { band: Band; reasons: string[]; sourceIds: string[] } {
  // Eligibility first: a missing published requirement is not a "reach", it's ineligible.
  const gaps = profile.curriculum ? gapAnalysis(u, p, profile).filter((g) => !/English|SAT|ACT/i.test(g.requirement)) : [];
  const missing = gaps.filter((g) => g.status === "missing");
  if (missing.length) {
    return {
      band: "not-eligible",
      reasons: missing.map((g) => `Missing: ${g.requirement} — ${g.university}`),
      sourceIds: missing.map((g) => g.sourceId).filter((x): x is string => !!x),
    };
  }
  const pct = boardPercent(profile);
  const minPct = pctOf(p.admission?.minimumPercent);
  if (pct != null && minPct != null && pct < minPct) {
    return { band: "not-eligible", reasons: [`Published minimum ${p.admission!.minimumPercent}; your Class XII total is ${pct}%`], sourceIds: p.admission?.sourceId ? [p.admission.sourceId] : [] };
  }

  // (a) Rank vs published closing rank for this programme.
  const rank = profile.tests.JEE_ADV;
  if (rank != null) {
    const c = u.details.cutoffs
      .filter((x) => /jee\W*adv/i.test(x.exam) && /open/i.test(x.category) && sameProgram(x.program, p))
      .sort((a, b) => b.year - a.year)[0];
    const closing = c ? Number(c.closing.replace(/[^\d]/g, "")) : NaN;
    if (c && closing > 0) {
      const band: Band = rank <= closing * 0.7 ? "safety" : rank <= closing ? "target" : "reach";
      return {
        band,
        reasons: [`Your JEE Advanced rank ${rank.toLocaleString("en-IN")} vs ${c.year} closing rank ${closing.toLocaleString("en-IN")} (${c.category}${c.round ? `, ${c.round}` : ""})`, "Closing ranks move every year; this compares against the last published one."],
        sourceIds: c.sourceId ? [c.sourceId] : [],
      };
    }
  }

  // (b) Class XII % vs a published merit-list cut-off.
  if (pct != null) {
    const c = u.details.cutoffs.filter((x) => /class xii|merit|12th|hsc/i.test(x.exam) && sameProgram(x.program, p)).sort((a, b) => b.year - a.year)[0];
    const cut = c ? pctOf(c.closing) : null;
    if (c && cut != null) {
      const band: Band = pct >= cut + 3 ? "safety" : pct >= cut - 1 ? "target" : "reach";
      return { band, reasons: [`Your ${pct}% vs the ${c.year} published cut-off of ${c.closing} (${c.category})`], sourceIds: c.sourceId ? [c.sourceId] : [] };
    }
  }

  // (c) Institution-wide acceptance rate.
  const sel = selectivity(u);
  if (sel) {
    const unclear = gaps.some((g) => g.status === "unclear");
    const band: Band = sel.band === "highly-selective" ? "reach" : sel.band === "selective" ? (unclear ? "reach" : "target") : sel.band === "moderate" ? "target" : unclear ? "target" : "safety";
    return {
      band,
      reasons: [
        `${SELECTIVITY_LABEL[sel.band]}: ${sel.reason}`,
        sel.band === "highly-selective" ? "At this selectivity, admission is a reach for every applicant." : unclear ? "Some of your requirements couldn't be checked automatically." : "You meet the published requirements Edugate can check.",
      ],
      sourceIds: sel.sourceId ? [sel.sourceId] : [],
    };
  }

  return {
    band: "unclassified",
    reasons: ["No published acceptance rate or cut-off to compare against — Edugate won't guess from reputation."],
    sourceIds: [],
  };
}

/** Loose programme-name match for cut-off rows ("Computer Science and Engineering (4 Years, B.Tech)" ↔ "B.Tech Computer Science and Engineering"). */
function sameProgram(cutoffProgram: string, p: Program) {
  const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)|b\.?\s?tech|bachelor of technology|b\.?\s?e\.?\b|[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const a = norm(cutoffProgram);
  const b = norm(`${p.name} ${p.specialization ?? ""} ${p.subfield ?? ""}`);
  return !!a && (b.includes(a) || a.includes(norm(p.name)));
}

export function matchProgram(u: University, p: Program, profile: StudentProfile): ProgramMatch {
  const dims = fitDimensions(u, profile, p);
  const { percent, unknownShare } = preferenceAlignment(dims, profile.weights);
  const b = admissionBand(u, p, profile);
  const why = dims
    .filter((d) => d.state === "aligned" || d.state === "partial")
    .map((d) => `${d.state === "aligned" ? "✓" : "◐"} ${d.label}: ${(d.reasons.find((r) => !r.startsWith("For ")) ?? d.reasons[0]).replace(/^[✓✗○] /, "")}`);
  return { percent, unknownShare, band: b.band, bandReasons: b.reasons, bandSourceIds: b.sourceIds, dims, why };
}
