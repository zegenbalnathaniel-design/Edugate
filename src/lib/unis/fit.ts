import type { StudentProfile } from "../profile/schema";
import { CURRICULUM_LABELS } from "../profile/schema";
import type { CurriculumReq, Program, University } from "./schema";
import { programCostInr } from "./extract";
import { PER_USD } from "./fx";
import { inrCompact } from "./format";
import { programSubjects } from "./taxonomy";

/*
 * Per-dimension fit (docs/07 §10). Never an admission probability: each
 * dimension says aligned / partial / misaligned / unknown, with the reasons
 * and the sources behind them. Unknown is never counted as pass or fail.
 */

export type FitState = "aligned" | "partial" | "misaligned" | "unknown";
export type WeightKey = keyof StudentProfile["weights"];

export type FitDimension = {
  key: string;
  label: string;
  weight: WeightKey;
  state: FitState;
  reasons: string[];
  sourceIds: string[];
};

export const STATE_GLYPH: Record<FitState, string> = { aligned: "✓", partial: "◐", misaligned: "✗", unknown: "○" };
export const STATE_LABEL: Record<FitState, string> = { aligned: "Aligned", partial: "Partly aligned", misaligned: "Not aligned", unknown: "Unknown" };

/* ----------------------------- subjects ----------------------------- */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\bmaths?\b/g, "mathematics")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function ibMathKind(s: string): "aa" | "ai" | null {
  const n = norm(s);
  if (/analysis|approaches|\baa\b/.test(n)) return "aa";
  if (/applications|interpretation|\bai\b/.test(n)) return "ai";
  return null;
}

export function subjectMatches(required: string, studentSubject: string): boolean {
  const r = norm(required);
  const s = norm(studentSubject);
  if (!r || !s) return false;
  const rk = ibMathKind(required);
  const sk = ibMathKind(studentSubject);
  if (r.includes("mathematics") && s.includes("mathematics")) {
    // "Mathematics: AA or AI" accepts both; a specific kind must match.
    if (rk && sk && !/\bor\b/.test(r)) return rk === sk;
    return true;
  }
  const head = (x: string) => x.split(/[:(,-]/)[0].trim();
  return r.includes(head(s)) || s.includes(head(r));
}

const A_LEVEL = ["E", "D", "C", "B", "A", "A*"];
/** Compares grades when both are on the same recognisable scale; null when unclear. */
export function gradeMeets(required: string | null, actual: string | null): boolean | null {
  if (!required) return true;
  if (!actual) return null;
  const rn = parseFloat(required);
  const an = parseFloat(actual);
  if (!Number.isNaN(rn) && !Number.isNaN(an)) return an >= rn;
  const ri = A_LEVEL.indexOf(required.trim().toUpperCase());
  const ai = A_LEVEL.indexOf(actual.trim().toUpperCase());
  if (ri >= 0 && ai >= 0) return ai >= ri;
  return null;
}

function levelMeets(required: string | null, actual: string | null): boolean | null {
  if (!required || /or|either/i.test(required)) return true;
  if (!actual) return null;
  if (/^HL$/i.test(required.trim())) return /^HL$/i.test(actual.trim());
  return true;
}

/** The student's score for a named test; undefined when Edugate doesn't track that test. */
export function testScore(profile: StudentProfile, test: string): number | null | undefined {
  const t = test.toUpperCase();
  if (/^SAT\b/.test(t)) return profile.tests.SAT;
  if (/^ACT\b/.test(t)) return profile.tests.ACT;
  if (/JEE\W*ADV/.test(t)) return profile.tests.JEE_ADV;
  if (/JEE\W*MAIN/.test(t)) return profile.tests.JEE_MAIN;
  if (/\bNEET\b/.test(t)) return profile.tests.NEET;
  if (/\bCUET\b/.test(t)) return profile.tests.CUET;
  if (/\bCLAT\b/.test(t)) return profile.tests.CLAT;
  if (/\bIPMAT\b/.test(t)) return profile.tests.IPMAT;
  return undefined;
}

/* -------------------------- gap analysis --------------------------- */

export type GapStatus = "meets" | "missing" | "unclear" | "exceeds" | "not-applicable";
export type GapRow = { requirement: string; university: string; student: string; status: GapStatus; sourceId: string | null };

const GENERIC_SUBJECT = /^(another|any|other|one other|two (further|other)|three (further|other)|a further|further)\b/i;

export function requirementFor(program: Program, profile: StudentProfile): CurriculumReq | null {
  if (!profile.curriculum) return null;
  return program.requirements.find((r) => r.curriculum === profile.curriculum) ?? null;
}

export function gapAnalysis(u: University, program: Program, profile: StudentProfile): GapRow[] {
  const rows: GapRow[] = [];
  const req = requirementFor(program, profile);
  if (profile.curriculum) {
    const label = CURRICULUM_LABELS[profile.curriculum];
    if (!req) {
      rows.push({ requirement: `${label} accepted`, university: "Not published for this program", student: label, status: "unclear", sourceId: null });
    } else {
      rows.push({
        requirement: `${label} accepted`,
        university: req.accepted === false ? "Not accepted" : req.accepted ? "Accepted" : "Not stated",
        student: label,
        status: req.accepted === false ? "missing" : req.accepted ? "meets" : "unclear",
        sourceId: req.sourceId,
      });
      if (req.minimum) {
        const ok = gradeMeets(req.minimum.match(/[\d.]+|A\*|[A-E]/)?.[0] ?? null, profile.predictedTotal?.match(/[\d.]+/)?.[0] ?? null);
        rows.push({
          requirement: "Overall minimum",
          university: req.minimum,
          student: profile.predictedTotal ?? "Not entered",
          status: ok === null ? "unclear" : ok ? "meets" : "missing",
          sourceId: req.sourceId,
        });
      }
      for (const s of req.subjects) {
        if (s.status === "not-accepted") {
          const has = profile.subjects.find((x) => subjectMatches(s.subject, x.name));
          rows.push({ requirement: s.subject, university: "Not accepted for this program", student: has ? `${has.name}${has.level ? ` ${has.level}` : ""}` : "—", status: has ? "missing" : "not-applicable", sourceId: req.sourceId });
          continue;
        }
        const want = [s.subject, s.level, s.minGrade && `grade ${s.minGrade}`].filter(Boolean).join(" · ");
        if (GENERIC_SUBJECT.test(s.subject.trim())) {
          // "Another relevant subject", "Any academic subjects": not checkable automatically.
          rows.push({ requirement: s.subject, university: `${s.status}: ${want}`, student: profile.subjects.length ? `${profile.subjects.length} subject(s) entered` : "Not entered", status: "unclear", sourceId: req.sourceId });
          continue;
        }
        const has = profile.subjects.find((x) => subjectMatches(s.subject, x.name));
        if (!has) {
          rows.push({ requirement: s.subject, university: `${s.status}: ${want}`, student: "Not in your subjects", status: s.status === "required" ? "missing" : "unclear", sourceId: req.sourceId });
          continue;
        }
        const lvl = levelMeets(s.level, has.level);
        const grd = gradeMeets(s.minGrade, has.grade);
        const status: GapStatus = lvl === false || grd === false ? "missing" : lvl === null || grd === null ? "unclear" : "meets";
        rows.push({ requirement: s.subject, university: `${s.status}: ${want}`, student: [has.name, has.level, has.grade].filter(Boolean).join(" · "), status, sourceId: req.sourceId });
      }
    }
  }
  for (const t of [...program.tests, ...u.testing.filter((t) => !program.tests.some((p) => p.test === t.test))]) {
    if (t.policy !== "required" && t.policy !== "recommended") continue;
    const score0 = testScore(profile, t.test);
    const trackable = score0 !== undefined;
    const score = score0 ?? null;
    rows.push({
      requirement: t.test,
      university: t.policy + (t.typicalRange ? ` (typical ${t.typicalRange})` : ""),
      student: score != null ? String(score) : trackable ? "Not entered" : "Not tracked on Edugate — plan for it",
      status: score != null ? "meets" : trackable && t.policy === "required" ? "missing" : "unclear",
      sourceId: t.sourceId,
    });
  }
  const english = program.english.length ? program.english : u.english;
  if (english.length && !(profile.citizenship && ["US", "GB", "CA", "AU", "IE", "NZ"].includes(profile.citizenship))) {
    rows.push(englishRow(english, profile));
  }
  return rows;
}

function englishRow(english: University["english"], profile: StudentProfile): GapRow {
  const tests = [
    { key: "IELTS", score: profile.tests.IELTS },
    { key: "TOEFL_IBT", score: profile.tests.TOEFL_IBT },
    { key: "DUOLINGO", score: profile.tests.DUOLINGO },
  ];
  for (const t of tests) {
    const req = english.find((e) => e.test === t.key);
    if (req && t.score != null) {
      const min = req.minOverall ? parseFloat(req.minOverall) : null;
      return {
        requirement: `English (${t.key.replace("_IBT", " iBT")})`,
        university: req.minOverall ? `min ${req.minOverall}${req.minSection ? `, sections ${req.minSection}` : ""}` : "required",
        student: String(t.score),
        status: min == null ? "unclear" : t.score >= min ? (t.score >= min + 1 ? "exceeds" : "meets") : "missing",
        sourceId: req.sourceId,
      };
    }
  }
  const first = english[0];
  return {
    requirement: "English proficiency",
    university: english.map((e) => `${e.test.replace("_IBT", " iBT")}${e.minOverall ? ` ≥ ${e.minOverall}` : ""}`).join(" / "),
    student: "No score entered",
    status: first?.waiver ? "unclear" : "missing",
    sourceId: first?.sourceId ?? null,
  };
}

/* ------------------------- fit dimensions -------------------------- */

const has = (u: University, cat: string) => u.opportunities.filter((o) => o.category === cat);

export function fitDimensions(u: University, profile: StudentProfile, program?: Program): FitDimension[] {
  const dims: FitDimension[] = [];

  // Program fit — by every subject a programme's official name names, not just its primary field.
  if (profile.fields.length && program) {
    const hit = programSubjects(program).filter((s) => profile.fields.includes(s));
    dims.push({
      key: "program",
      label: "Course fit",
      weight: "academics",
      state: hit.length ? "aligned" : "misaligned",
      reasons: hit.length ? [`${program.name} covers ${hit.length} of your chosen subjects`] : [`${program.name} isn't in the subjects you chose`],
      sourceIds: [],
    });
  } else if (profile.fields.length) {
    const offered = u.programs.filter((p) => programSubjects(p).some((s) => profile.fields.includes(s)));
    dims.push({
      key: "program",
      label: "Program fit",
      weight: "academics",
      state: offered.length ? "aligned" : "misaligned",
      reasons: offered.length ? [`Offers ${offered.map((p) => p.name).join(", ")}`] : ["No program in your chosen fields is listed on Edugate yet"],
      sourceIds: [],
    });
  } else dims.push({ key: "program", label: "Program fit", weight: "academics", state: "unknown", reasons: ["Add the fields you want to study to your profile"], sourceIds: [] });

  // Curriculum + subjects (for a specific program, or best program in field)
  const target = program ?? u.programs.find((p) => programSubjects(p).some((s) => profile.fields.includes(s))) ?? u.programs[0];
  if (profile.curriculum) {
    const gaps = gapAnalysis(u, target, profile);
    const academic = gaps.filter((g) => !/English|SAT|ACT/i.test(g.requirement));
    const missing = academic.filter((g) => g.status === "missing");
    const unclear = academic.filter((g) => g.status === "unclear");
    dims.push({
      key: "curriculum",
      label: "Curriculum & subjects",
      weight: "academics",
      state: missing.length ? "misaligned" : unclear.length ? (academic.some((g) => g.status === "meets") ? "partial" : "unknown") : "aligned",
      reasons: [
        `For ${target.name}:`,
        ...academic.map((g) => `${g.status === "meets" || g.status === "exceeds" ? "✓" : g.status === "missing" ? "✗" : "○"} ${g.requirement} — ${g.university}`),
      ],
      sourceIds: academic.map((g) => g.sourceId).filter((s): s is string => !!s),
    });
  } else dims.push({ key: "curriculum", label: "Curriculum & subjects", weight: "academics", state: "unknown", reasons: ["Add your curriculum and subjects to your profile"], sourceIds: [] });

  // Testing — a required test you haven't taken yet is a to-do, not a misfit;
  // tests the profile can't record are unknown.
  const tests = [...target.tests, ...u.testing.filter((t) => !target.tests.some((x) => x.test === t.test))].filter((t) => t.policy === "required");
  const trackable = (name: string) => testScore(profile, name) !== undefined;
  const hasScore = (name: string) => testScore(profile, name) != null;
  const done = tests.filter((t) => trackable(t.test) && hasScore(t.test));
  const todo = tests.filter((t) => trackable(t.test) && !hasScore(t.test));
  const untracked = tests.filter((t) => !trackable(t.test));
  dims.push({
    key: "testing",
    label: "Testing",
    weight: "academics",
    state: tests.length === 0 || done.length === tests.length ? "aligned" : todo.length || done.length ? "partial" : "unknown",
    reasons:
      tests.length === 0
        ? ["No admissions test is listed as required"]
        : [
            ...done.map((t) => `✓ ${t.test} required — in your profile`),
            ...todo.map((t) => `○ ${t.test} required — still to take (not in your profile)`),
            ...untracked.map((t) => `○ ${t.test} required — Edugate can't track this test yet; plan for it`),
          ],
    sourceIds: tests.map((t) => t.sourceId).filter((s): s is string => !!s),
  });

  // Financial — what a student in India pays per year, in rupees: domestic fees for Indian institutions, international tuition abroad.
  const budgetInr = profile.budgetInrPerYear ?? (profile.budgetUsdPerYear != null ? Math.round(profile.budgetUsdPerYear * PER_USD.INR) : null);
  const costs = (program ? [program] : u.programs).map((p) => programCostInr(u, p)).filter((n): n is number => n != null);
  const cost = costs.length ? Math.min(...costs) : null;
  const tuitionSource = program?.fees?.sourceId ?? (u.countryCode === "IN" ? u.costs.domesticTuition.sourceId : u.costs.internationalTuition.sourceId);
  if (budgetInr == null) dims.push({ key: "cost", label: "Financial fit", weight: "cost", state: "unknown", reasons: ["Add a yearly budget to your profile"], sourceIds: [] });
  else if (cost == null) dims.push({ key: "cost", label: "Financial fit", weight: "cost", state: "unknown", reasons: ["Tuition for this isn't verified yet"], sourceIds: [] });
  else {
    const within = cost <= budgetInr;
    const close = cost <= budgetInr * 1.2;
    dims.push({
      key: "cost",
      label: "Financial fit",
      weight: "cost",
      state: within ? "aligned" : close ? "partial" : "misaligned",
      reasons: [
        `${program ? "Tuition" : "Lowest published tuition"} ${u.countryCode === "IN" ? "" : "≈ "}${inrCompact(cost)}/yr vs your ${inrCompact(budgetInr)}/yr budget (tuition only, before aid or scholarships)`,
        ...(u.scholarships.length ? [`${u.scholarships.length} scholarship/aid option(s) listed`] : []),
      ],
      sourceIds: tuitionSource ? [tuitionSource] : [],
    });
  }

  // Geography — Indian states first for Indian institutions, then countries.
  const stateMatch = u.countryCode === "IN" && profile.preferredStates.length ? profile.preferredStates.includes(u.region) : null;
  if (stateMatch != null) {
    dims.push({
      key: "location",
      label: "Location",
      weight: "location",
      state: stateMatch ? "aligned" : "misaligned",
      reasons: [stateMatch ? `${u.region} is one of your preferred states` : `${u.region} isn't one of your preferred states`],
      sourceIds: [],
    });
  } else
    dims.push(
      profile.countries.length
        ? {
            key: "location",
            label: "Location",
            weight: "location",
            state: profile.countries.includes(u.countryCode) ? "aligned" : "misaligned",
            reasons: [profile.countries.includes(u.countryCode) ? `${u.country} is in your preferred countries` : `${u.country} isn't in your preferred countries`],
            sourceIds: [],
          }
        : { key: "location", label: "Location", weight: "location", state: "unknown", reasons: ["No location preference set"], sourceIds: [] },
    );

  // Opportunities
  for (const [key, label, cat, weight] of [
    ["research", "Research opportunities", "research", "research"],
    ["entrepreneurship", "Entrepreneurship", "entrepreneurship", "entrepreneurship"],
    ["careers", "Internships & careers", "internships", "careers"],
  ] as const) {
    const list = [...has(u, cat), ...(cat === "internships" ? has(u, "careers") : [])];
    dims.push({
      key,
      label,
      weight,
      state: list.length ? "aligned" : "unknown",
      reasons: list.length ? list.map((o) => o.name) : ["None documented on Edugate yet (not the same as none existing)"],
      sourceIds: list.map((o) => o.sourceId).filter((s): s is string => !!s),
    });
  }
  return dims;
}

/**
 * Preference alignment (§53): a weighted share of *known* dimensions using the
 * student's own weights. Labelled everywhere as "not an admission chance".
 */
export function preferenceAlignment(dims: FitDimension[], weights: StudentProfile["weights"]) {
  const score: Record<FitState, number | null> = { aligned: 1, partial: 0.5, misaligned: 0, unknown: null };
  let num = 0;
  let den = 0;
  let unknownWeight = 0;
  let totalWeight = 0;
  // Each weight bucket is split evenly across the dimensions that map to it.
  const perBucket = new Map<WeightKey, number>();
  dims.forEach((d) => perBucket.set(d.weight, (perBucket.get(d.weight) ?? 0) + 1));
  for (const d of dims) {
    const w = (weights[d.weight] ?? 0) / (perBucket.get(d.weight) ?? 1);
    totalWeight += w;
    const s = score[d.state];
    if (s == null) unknownWeight += w;
    else {
      num += w * s;
      den += w;
    }
  }
  return {
    percent: den > 0 ? Math.round((num / den) * 100) : null,
    unknownShare: totalWeight > 0 ? Math.round((unknownWeight / totalWeight) * 100) : 100,
  };
}
