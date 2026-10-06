import { EMPTY_PROFILE, type StudentProfile } from "../profile/schema";
import { programCostInr } from "../unis/extract";
import { subjectMatches } from "../unis/fit";
import { perYear, toInr } from "../unis/fx";
import { HOME_HUB } from "../unis/geo";
import { admissionBand } from "../unis/match";
import type { Field, Program, University } from "../unis/schema";
import { selectivity } from "../unis/selectivity";
import { normalizeTests, programSubjects, SUBJECT_BY_KEY } from "../unis/taxonomy";
import type { Answers } from "./model";
import {
  BUDGET_MAX_INR,
  buildProfile,
  COURSES,
  courseScore,
  meetsNeed,
  NEEDS_LABEL,
  programAlignment,
  careerMatches,
  careerSentence,
  coreType,
  courseMatches,
  interestDna,
  interestSentence,
  LOAN_STRETCH,
  moneyProfile,
  subjectPct,
  universityDna,
  type CareerMatch,
  type Profile,
} from "./profile";

/*
 * Matching (docs/10 §5). Every university is scored on nine dimensions with the
 * agreed weights; a dimension Edugate has no data for is left out and the
 * weights renormalise — it never counts for or against. Hard filters run first,
 * so an unaffordable or ineligible university can't rank on prestige.
 * Admission buckets come only from published evidence (acceptance rates,
 * cut-offs, closing ranks) via admissionBand — never from reputation.
 */

export const WEIGHTS = { course: 20, career: 15, academic: 15, financial: 15, environment: 10, admissions: 10, location: 5, flexibility: 5, roi: 5 } as const;
export type Dim = keyof typeof WEIGHTS;
export const DIM_LABEL: Record<Dim, string> = {
  course: "Course fit",
  career: "Career fit",
  academic: "Academic fit",
  financial: "Financial fit",
  environment: "Campus fit",
  admissions: "Admission odds",
  location: "Location fit",
  flexibility: "Flexibility",
  roi: "Career ROI",
};

export type Bucket = "dream" | "reach" | "target" | "safety" | "open";
export const BUCKET: Record<Bucket | "value", { emoji: string; label: string; line: string }> = {
  dream: { emoji: "🚀", label: "DREAM", line: "High fit, extremely competitive." },
  reach: { emoji: "🎯", label: "REACH", line: "High fit — difficult but realistic." },
  target: { emoji: "✅", label: "TARGET", line: "High fit, realistic admission." },
  safety: { emoji: "🛡️", label: "SAFETY", line: "High fit, strong admission odds on published data." },
  open: { emoji: "🧭", label: "STRONG FIT, ODDS UNPUBLISHED", line: "Great match, but the college doesn't publish cut-offs or acceptance rates — check its merit list." },
  value: { emoji: "💰", label: "BEST VALUE", line: "Strong fit at a cost that works for you." },
};

/* ------------------------------- destinations ------------------------------- */

export const DESTINATIONS: { slug: string; label: string; flag: string; countries: string[] }[] = [
  { slug: "india", label: "India", flag: "🇮🇳", countries: ["IN"] },
  { slug: "usa", label: "USA", flag: "🇺🇸", countries: ["US"] },
  { slug: "uk", label: "UK & Ireland", flag: "🇬🇧", countries: ["GB", "IE"] },
  { slug: "canada", label: "Canada", flag: "🇨🇦", countries: ["CA"] },
  { slug: "australia", label: "Australia", flag: "🇦🇺", countries: ["AU", "NZ"] },
  { slug: "singapore", label: "Singapore", flag: "🇸🇬", countries: ["SG"] },
  { slug: "europe", label: "Europe", flag: "🇪🇺", countries: ["NL", "DE", "FR", "IT", "ES", "CH", "SE", "DK", "FI", "NO", "BE", "AT", "PT", "PL", "CZ", "HU"] },
  { slug: "uae", label: "UAE", flag: "🇦🇪", countries: ["AE"] },
  { slug: "hong-kong", label: "Hong Kong", flag: "🇭🇰", countries: ["HK"] },
  { slug: "east-asia", label: "Japan & Korea", flag: "🇯🇵", countries: ["JP", "KR"] },
];
export const destinationOf = (cc: string) => DESTINATIONS.find((d) => d.countries.includes(cc)) ?? null;

/* ----------------------------- student → profile ----------------------------- */

const STREAM_SUBJECTS: Record<string, string[]> = {
  pcm: ["English", "Physics", "Chemistry", "Mathematics"],
  pcb: ["English", "Physics", "Chemistry", "Biology"],
  pcmb: ["English", "Physics", "Chemistry", "Mathematics", "Biology"],
  "commerce-maths": ["English", "Accountancy", "Business Studies", "Economics", "Mathematics"],
  commerce: ["English", "Accountancy", "Business Studies", "Economics"],
  humanities: ["English"],
};

/** The parts of the quiz the existing eligibility and banding engine understands. */
export function toStudentProfile(p: Profile): StudentProfile {
  const f = p.facts;
  const curriculum = f.board && ["CBSE", "STATE_BOARD", "ISC", "IB", "A_LEVELS", "OTHER"].includes(f.board) ? (f.board as StudentProfile["curriculum"]) : null;
  const pct = f.marksPct;
  const indian = !!curriculum && ["CBSE", "STATE_BOARD", "ISC"].includes(curriculum);
  // IB / A-level students entered their real subjects, levels and predicted grades.
  const subjects = f.taken.length
    ? f.taken.slice(0, 12).map((t) => ({ name: t.name.slice(0, 80), level: t.level, grade: t.grade }))
    : f.stream && STREAM_SUBJECTS[f.stream]
      ? STREAM_SUBJECTS[f.stream].map((name) => ({ name, level: "Class XII", grade: null }))
      : [];
  return {
    ...EMPTY_PROFILE,
    curriculum,
    predictedTotal: curriculum === "IB" && f.ibTotal != null ? `${f.ibTotal}/45` : pct != null && indian ? `${pct}%` : null,
    subjects,
  };
}

/* --------------------------------- helpers ---------------------------------- */

const METROS = new Set(
  "Chennai,Mumbai,New Delhi,Delhi,Bengaluru,Hyderabad,Kolkata,Pune,Ahmedabad,London,New York,Singapore,Hong Kong,Sydney,Melbourne,Toronto,Vancouver,Montreal,Dubai,Abu Dhabi,Tokyo,Seoul,Amsterdam,Zurich,Milan,Dublin,Los Angeles,Chicago,Philadelphia,Boston,Munich,Edinburgh,Manchester,Coventry"
    .split(","),
);

function annualLivingInr(u: University): number | null {
  const v = u.costs.livingEstimate.value;
  if (!v || !u.costs.livingEstimate.sourceId) return null;
  const y = perYear(v, null);
  return y == null ? null : toInr(y, u.costs.currency);
}

function streamLacks(required: string[], subjects: string[]): string[] {
  if (!subjects.length) return [];
  return required.filter((r) => !/english|language/i.test(r) && !subjects.some((s) => subjectMatches(r, s)));
}

/** Subjects a programme's published eligibility text names as compulsory ("…with Mathematics…"). */
function eligibilityNeeds(text: string | null | undefined): string[] {
  if (!text) return [];
  const t = text.replace(/\(.*?\)/g, "");
  const needs: string[] = [];
  // "Mathematics or Biology" style alternatives are not a single hard requirement.
  if (/mathematics/i.test(t) && !/mathematics\s*(\/|or)\s*biology|biology\s*(\/|or)\s*mathematics|mathematics[^.]*\bor\b[^.]*biolog/i.test(t)) needs.push("Mathematics");
  if (/\bbiology\b/i.test(t) && !/biology\s*(\/|or)|(\/|or)\s*biology|\bor\b[^.]*biology/i.test(t)) needs.push("Biology");
  return needs;
}

export type UniCard = {
  slug: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  program: { slug: string; name: string };
  /** The degree (from the student's best-fit list) this programme is. */
  degree: { key: string; label: string };
  fit: number;
  knownShare: number;
  dims: { key: Dim; label: string; pct: number }[];
  bucket: Bucket;
  costInr: number | null;
  costIncludesLiving: boolean;
  why: string[];
  watch: string[];
};

type Scored = UniCard & { selective: boolean; financial: number | null; degrees: string[] };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function bandToBucket(band: string, highlySelective: boolean): Bucket | null {
  if (band === "not-eligible") return null;
  if (highlySelective) return "dream";
  if (band === "reach") return "reach";
  if (band === "target") return "target";
  if (band === "safety") return "safety";
  return "open";
}

/* --------------------------------- scoring ---------------------------------- */

export type Filtered = { budget: number; location: number; eligibility: number; course: number; gender: number };

/** How many best-fit degrees the student sees, and the only degrees universities are matched on. */
export const COURSE_COUNT = 6;

export function scoreUniversities(p: Profile, careers: CareerMatch[], unis: University[], today = new Date()) {
  const f = p.facts;
  const sp = toStudentProfile(p);
  const taken = sp.subjects.map((s) => s.name);
  const max = f.budget ? BUDGET_MAX_INR[f.budget] : null;
  const stretch = f.loan ? LOAN_STRETCH[f.loan] : 1.35;
  const excluded = new Set(f.exclude);
  const wantedRegions = new Set(f.regions);
  const filtered: Filtered = { budget: 0, location: 0, eligibility: 0, course: 0, gender: 0 };
  const out: Scored[] = [];
  const exams = new Set(f.exams);
  // The student's strongest degrees — the same ones shown on the course card — and a programme only counts if it IS one of them.
  const ranked = COURSES.map((c) => ({ c, s: courseScore(p, c) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, COURSE_COUNT);
  const topScore = ranked[0]?.s || 1;
  const marks = f.marksPct;

  for (const u of unis) {
    const dest = destinationOf(u.countryCode);
    const india = u.countryCode === "IN";
    const hub = u.hub ?? u.city;

    // ---- hard filter: single-gender colleges only when the student opted in
    if ((u.gender === "women" && f.gendered !== "women") || (u.gender === "men" && f.gendered !== "men")) {
      filtered.gender++;
      continue;
    }

    // ---- hard filter: where the student will go
    if (dest && excluded.has(dest.slug)) {
      filtered.location++;
      continue;
    }
    const d = f.distance;
    const inState = india && u.region === HOME_HUB.state;
    const allowed =
      d === "city"
        ? f.home === "chennai"
          ? india && hub === HOME_HUB.city
          : f.home === "tn"
            ? inState
            : india
        : d === "state"
          ? f.home === "chennai" || f.home === "tn"
            ? inState
            : india
          : d === "india"
            ? india
            : true;
    if (!allowed) {
      filtered.location++;
      continue;
    }

    // ---- institution-level facts, shared by all its programmes
    const sel = selectivity(u);
    const envChecks: number[] = [];
    const want = (k: keyof Profile["env"]) => p.env[k] >= 58;
    const big = u.setting ? u.setting === "urban" : METROS.has(hub);
    if (want("bigCity")) envChecks.push(big ? 100 : 35);
    if (want("smallTown")) envChecks.push(big ? 35 : 100);
    const students = u.stats.totalStudents.sourceId ? u.stats.totalStudents.value : null;
    if (students != null && want("large")) envChecks.push(students >= 15000 ? 100 : students >= 6000 ? 65 : 35);
    if (students != null && want("small")) envChecks.push(students <= 4000 ? 100 : students <= 10000 ? 65 : 35);
    const intl = u.stats.internationalShare.sourceId ? Number(String(u.stats.internationalShare.value ?? "").match(/[\d.]+/)?.[0]) : NaN;
    if (want("international") && Number.isFinite(intl)) envChecks.push(intl >= 20 ? 100 : intl >= 8 ? 70 : 40);
    if (want("competitive") && sel) envChecks.push(sel.band === "highly-selective" || sel.band === "selective" ? 100 : 50);
    const opp = (c: string) => u.opportunities.some((o) => o.category === c) || u.programs.some((x) => x.opportunities.some((o) => o.category === c));
    if (want("research") && opp("research")) envChecks.push(100);
    if (want("entrepreneurial") && opp("entrepreneurship")) envChecks.push(100);
    if (want("careerFocus") && (u.details.outcomes.length || opp("internships") || opp("careers"))) envChecks.push(100);
    const life = u.details.studentLife.map((x) => x.category);
    if (want("sport") && (life.includes("sport") || u.details.facilities.some((x) => x.category === "sports"))) envChecks.push(100);
    if (want("culture") && life.some((c) => ["festival", "club", "society", "cultural"].includes(c))) envChecks.push(100);
    const environment = envChecks.length ? clamp(envChecks.reduce((a, b) => a + b, 0) / envChecks.length) : null;
    const prefRegion = dest && wantedRegions.has(dest.slug);
    const location =
      d === "abroad"
        ? india
          ? 40
          : prefRegion || !wantedRegions.size
            ? 100
            : 72
        : d === "india-abroad"
          ? india
            ? 85
            : prefRegion
              ? 100
              : wantedRegions.size
                ? 65
                : 80
          : india && hub === HOME_HUB.city && (f.home === "chennai" || d === "city")
            ? 100
            : india && inState
              ? 92
              : 85;
    const breadth = new Set(u.programs.flatMap((x) => programSubjects(x))).size;
    const breadthScore = clamp(breadth >= 15 ? 100 : breadth >= 8 ? 78 : breadth >= 4 ? 58 : 38) + (u.category === "liberal-arts" || u.category === "multidisciplinary" ? 8 : 0);
    const flexNeed = p.trait.flexibility / 100;
    const flexibility = clamp(Math.min(100, breadthScore) * flexNeed + 82 * (1 - flexNeed));
    const living = annualLivingInr(u);

    let anyCourse = false;
    let anyEligible = false;
    for (const prog of u.programs) {
      if (prog.level === "masters") continue;
      const subs = programSubjects(prog);

      // ---- course fit: which of the student's degrees this programme actually is
      let bestCourse = 0;
      let bestCat: (typeof ranked)[number]["c"] | null = null;
      const degrees: string[] = [];
      for (const { c, s: cs } of ranked) {
        const a = programAlignment(prog, subs, c);
        if (!a) continue;
        if (a >= 0.85) degrees.push(c.key);
        const v = a * (0.6 * (cs / topScore) * 100 + 0.4 * cs);
        if (v > bestCourse) {
          bestCourse = v;
          bestCat = c;
        }
      }
      if (!bestCat || bestCourse < 40) continue;
      anyCourse = true;

      // ---- hard filter: published subject requirements and eligibility
      const lacks = streamLacks([...(prog.admission?.requiredSubjects ?? []), ...eligibilityNeeds(prog.admission?.eligibility)], taken);
      const ab = admissionBand(u, prog, sp, today, { testsPlanned: true });
      if (lacks.length || ab.band === "not-eligible") continue;
      anyEligible = true;

      // ---- hard filter: realistic cost
      const tuition = programCostInr(u, prog);
      const cost = tuition != null ? tuition + (living ?? 0) : null;
      const hasAid = u.scholarships.length > 0 || prog.scholarships.length > 0;
      let financial: number | null = null;
      if (cost != null && max != null) {
        if (cost <= max) financial = 100 - Math.round((cost / Math.max(max, 1)) * 10);
        else if (cost <= max * 1.15) financial = 80;
        else if (cost <= max * stretch) financial = 60 - Math.round(((cost / max - 1.15) / Math.max(stretch - 1.15, 0.1)) * 25);
        else if (hasAid && cost <= max * stretch * 1.6) financial = 15;
        else continue;
        if (hasAid && financial < 100) financial = Math.min(100, financial + 5);
      }

      // ---- admissions & academics, evidence only
      const highly = sel?.band === "highly-selective";
      const bucket = bandToBucket(ab.band, highly) ?? "open";
      const admissions = bucket === "dream" ? 20 : bucket === "reach" ? 40 : bucket === "target" ? 70 : bucket === "safety" ? 92 : null;
      let academic: number | null = null;
      if (marks != null && sel) {
        const need = { "highly-selective": 95, selective: 88, moderate: 75, accessible: 60 }[sel.band];
        academic = clamp(85 + (marks - need) * 3);
      } else if (marks != null && prog.admission?.minimumPercent) {
        const min = Number(prog.admission.minimumPercent.match(/[\d.]+/)?.[0]);
        if (Number.isFinite(min)) academic = clamp(70 + (marks - min) * 1.2);
      }
      const usualGap = bestCat.needs && meetsNeed(p, bestCat.needs) === false ? NEEDS_LABEL[bestCat.needs] : null;
      if (usualGap) academic = Math.min(academic ?? 30, 30);

      // ---- career fit: careers this programme leads toward, weighted by how well they fit the student
      const careerPct = careers.filter((c) => c.subjects.some((s) => subs.includes(s))).map((c) => c.pct);
      const career = careerPct.length ? clamp(Math.max(...careerPct) + (prog.careers?.paths.length ? 3 : 0)) : clamp(bestCourse * 0.6);

      // ---- ROI: published outcomes against cost
      const out1 = [...prog.outcomes, ...u.details.outcomes].find((o) => o.medianSalary != null || o.averageSalary != null);
      const salary = out1 ? toInr((out1.medianSalary ?? out1.averageSalary)!, out1.currency) : null;
      const roi = salary != null && cost != null && cost > 0 ? clamp(salary / cost >= 3 ? 100 : salary / cost >= 2 ? 85 : salary / cost >= 1 ? 65 : 40) : null;

      const dims: Record<Dim, number | null> = { course: clamp(bestCourse), career, academic, financial, environment, admissions, location, flexibility, roi };
      let wsum = 0;
      let acc = 0;
      for (const k of Object.keys(WEIGHTS) as Dim[]) {
        const v = dims[k];
        if (v == null) continue;
        wsum += WEIGHTS[k];
        acc += v * WEIGHTS[k];
      }
      const fit = clamp(acc / wsum);

      // ---- plain-language reasons, from the data that drove the score
      const why: string[] = [`It's a ${bestCat.label} degree — one of your best-fit fields.`];
      if (financial != null && financial >= 85) why.push(`Within your comfortable budget${living == null ? " on tuition" : ""}.`);
      if (environment != null && environment >= 85) why.push("The campus matches what you said you want.");
      if (bucket === "safety" || bucket === "target") why.push(ab.reasons[0] ?? "");
      if (hasAid) why.push("Scholarships are published for this institution.");
      if (roi != null && roi >= 85) why.push("Published graduate outcomes look strong against the cost.");
      const watch: string[] = [];
      if (usualGap) watch.push(`Courses like this usually need ${usualGap} in your final school years — check the eligibility before applying.`);
      if (bucket === "dream") watch.push(`Extremely competitive — ${sel?.reason ?? "published selectivity"}. Admission is never guaranteed.`);
      if (bucket === "reach") watch.push(ab.reasons[0] ?? "A reach on published data.");
      if (financial != null && financial < 60) watch.push(financial <= 15 ? "Beyond your budget unless a substantial scholarship comes through." : "Stretches your budget — you'd need a loan or aid.");
      if (cost == null) watch.push("Fees aren't published in a form Edugate could verify — check before you apply.");
      if (cost != null && living == null && !india) watch.push("Living, travel and visa costs come on top of tuition.");
      const needsExams = normalizeTests([...(prog.admission?.entranceTests ?? []), ...prog.tests.filter((t) => t.policy === "required").map((t) => t.test)]);
      const missingExam = needsExams.find((t) => ["JEE-MAIN", "JEE-ADV", "NEET", "CLAT", "IPMAT", "CUET", "NATA", "SAT"].includes(t) && !exams.has(t.split("-")[0]) && !(t === "SAT" && exams.has("SAT")));
      if (missingExam) watch.push(`Needs ${missingExam.replace("-", " ").replace("ADV", "Advanced").replace("MAIN", "Main")} — it isn't on your exam list yet.`);

      out.push({
        slug: u.slug,
        name: u.name,
        city: hub,
        country: u.country,
        flag: dest?.flag ?? "🌐",
        program: { slug: prog.slug, name: prog.name },
        degree: { key: bestCat.key, label: bestCat.label },
        degrees,
        fit,
        knownShare: Math.round(wsum),
        dims: (Object.keys(WEIGHTS) as Dim[]).filter((k) => dims[k] != null).map((k) => ({ key: k, label: DIM_LABEL[k], pct: dims[k]! })),
        bucket,
        costInr: cost,
        costIncludesLiving: living != null && cost != null,
        why: why.filter(Boolean).slice(0, 3),
        watch: watch.slice(0, 3),
        selective: !!sel && (sel.band === "highly-selective" || sel.band === "selective"),
        financial,
      });
    }
    if (!out.some((x) => x.slug === u.slug)) {
      if (!anyCourse) filtered.course++;
      else if (!anyEligible) filtered.eligibility++;
      else filtered.budget++;
    }
  }
  return { pairs: out.sort((a, b) => b.fit - a.fit), filtered };
}

/* -------------------------------- countries --------------------------------- */

export type CountryFit = { slug: string; label: string; flag: string; pct: number; reasons: string[]; universities: number };

export function countryFits(p: Profile, unis: University[], courseSubjects: Field[]): CountryFit[] {
  const f = p.facts;
  const max = f.budget ? BUDGET_MAX_INR[f.budget] : null;
  const stretch = f.loan ? LOAN_STRETCH[f.loan] : 1.35;
  const abroadOk = f.distance === "abroad" || f.distance === "india-abroad";
  const res: CountryFit[] = [];
  for (const d of DESTINATIONS) {
    if (f.exclude.includes(d.slug)) continue;
    const here = unis.filter((u) => d.countries.includes(u.countryCode));
    if (!here.length) continue;
    const india = d.slug === "india";
    const pref = india ? (f.distance === "abroad" ? 45 : 95) : !abroadOk ? 10 : f.regions.includes(d.slug) ? 100 : f.regions.length ? 55 : 70;
    const costs = here.flatMap((u) => u.programs.map((pr) => programCostInr(u, pr))).filter((n): n is number => n != null).sort((a, b) => a - b);
    const median = costs.length ? costs[Math.floor(costs.length / 2)] : null;
    const afford = median == null || max == null ? null : median <= max ? 100 : median <= max * stretch ? 60 : 20;
    const progs = here.flatMap((u) => u.programs.filter((pr) => programSubjects(pr).some((s) => courseSubjects.includes(s))));
    const courses = clamp(Math.min(100, progs.length * 12));
    const mobility = india ? 100 - p.motivation.mobility : p.motivation.mobility;
    const parts: [number | null, number][] = [
      [pref, 40],
      [afford, 25],
      [courses, 25],
      [mobility, 10],
    ];
    const w = parts.reduce((a, [v, k]) => a + (v == null ? 0 : k), 0);
    const pct = clamp(parts.reduce((a, [v, k]) => a + (v ?? 0) * k, 0) / w);
    const reasons: string[] = [];
    if (!india && f.regions.includes(d.slug)) reasons.push("You said it sounds exciting.");
    if (india && f.distance !== "abroad") reasons.push("Close to home, and you're open to studying here.");
    if (progs.length) reasons.push(`${progs.length} programme${progs.length === 1 ? "" : "s"} on Edugate in your best-fit subjects.`);
    if (median != null) reasons.push(`Typical tuition across ${costs.length} listed programme${costs.length === 1 ? "" : "s"}: about ${lakh(median)} a year${max != null ? (median <= max ? " — inside your budget" : " — above your comfortable budget") : ""}.`);
    res.push({ slug: d.slug, label: d.label, flag: d.flag, pct, reasons: reasons.slice(0, 3), universities: here.length });
  }
  return res.sort((a, b) => b.pct - a.pct).slice(0, 5);
}

export function lakh(inr: number): string {
  if (inr >= 10000000) return `₹${(inr / 10000000).toFixed(1).replace(/\.0$/, "")} crore`;
  if (inr >= 100000) return `₹${(inr / 100000).toFixed(1).replace(/\.0$/, "")} lakh`;
  return `₹${Math.round(inr / 1000)}k`;
}

/* --------------------------------- result ----------------------------------- */

export type WrappedResult = ReturnType<typeof computeWrapped>;

export function computeWrapped(answers: Answers, unis: University[], today = new Date()) {
  const profile = buildProfile(answers);
  const courses = courseMatches(profile, COURSE_COUNT);
  const careers = careerMatches(profile, answers);
  const { pairs, filtered } = scoreUniversities(profile, careerMatches(profile, answers, 30), unis, today);
  // One card per university: its best-fitting programme.
  const seenUni = new Set<string>();
  const scored = pairs.filter((x) => !seenUni.has(x.slug) && seenUni.add(x.slug));
  // "High fit" means the course itself fits — budget and location can't carry a weak course match.
  // A sixth-choice degree at a famous university mustn't outrank the student's real first choices.
  const strong = scored.filter((s) => s.fit >= 58 && (s.dims.find((d) => d.key === "course")?.pct ?? 0) >= 65);
  /** Best n by fit, at most two per destination so one country can't crowd out the rest. */
  const take = (b: Bucket, n: number) => {
    const per = new Map<string, number>();
    const picked: Scored[] = [];
    for (const s of strong) {
      if (s.bucket !== b || picked.length >= n) continue;
      const k = s.flag;
      if ((per.get(k) ?? 0) >= 2 && strong.some((x) => x.bucket === b && x.flag !== k && !picked.includes(x))) continue;
      per.set(k, (per.get(k) ?? 0) + 1);
      picked.push(s);
    }
    return picked;
  };
  const lists = {
    dream: take("dream", 3),
    reach: take("reach", 3),
    target: take("target", 5),
    safety: take("safety", 3),
    open: take("open", 5),
    value: [] as Scored[],
  };
  const shown = new Set(Object.values(lists).flat().map((s) => s.slug));
  const valuePool = strong.filter((s) => s.fit >= 75 && s.financial != null && s.financial >= 85 && s.costInr != null);
  const byValue = (a: Scored, b: Scored) => b.fit + (b.financial ?? 0) * 0.3 - (a.fit + (a.financial ?? 0) * 0.3);
  // Prefer value picks the student hasn't already seen in another group.
  lists.value = [...valuePool.filter((s) => !shown.has(s.slug)).sort(byValue), ...valuePool.filter((s) => shown.has(s.slug)).sort(byValue)].slice(0, 3);
  const courseSubjects = [...new Set(courses.slice(0, 3).flatMap((c) => c.subjects.slice(0, 2)))];
  // "Where to study it": for each best-fit degree, the strongest places that actually teach it.
  const goodPair = (x: Scored) => x.fit >= 55;
  const where = Object.fromEntries(
    courses.map((c) => {
      const seen = new Set<string>();
      const list = pairs
        .filter((x) => goodPair(x) && x.degrees.includes(c.key) && !seen.has(x.slug) && seen.add(x.slug))
        .slice(0, 4)
        .map((x) => ({ slug: x.slug, name: x.name, flag: x.flag, city: x.city, program: x.program, fit: x.fit, bucket: x.bucket }));
      return [c.key, list];
    }),
  ) as Record<string, { slug: string; name: string; flag: string; city: string; program: { slug: string; name: string }; fit: number; bucket: Bucket }[]>;
  // Honest gaps: a top degree the student would go abroad for, with nothing abroad on Edugate yet.
  const abroadOk = profile.facts.distance === "abroad" || profile.facts.distance === "india-abroad";
  const abroadGaps: string[] = abroadOk
    ? courses.slice(0, 3).filter((c) => !pairs.some((x) => x.flag !== "🇮🇳" && x.degrees.includes(c.key))).map((c) => c.label)
    : [];
  return {
    answered: profile.answered,
    abroadGaps,
    type: coreType(profile),
    dna: interestDna(profile),
    dnaLine: interestSentence(profile),
    courses: courses.map((c) => ({ ...c, where: where[c.key] ?? [] })),
    careers,
    careerLine: careerSentence(profile),
    campus: universityDna(profile),
    money: moneyProfile(profile),
    countries: countryFits(profile, unis, courseSubjects),
    lists,
    considered: unis.length,
    filtered,
    topSubjects: profile.subjects.slice(0, 5).map((s) => s.key),
  };
}
