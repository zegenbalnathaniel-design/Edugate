import type { Field } from "../unis/schema";
import { SUBJECT_BY_KEY } from "../unis/taxonomy";
import {
  ACADEMIC,
  ENV,
  LEARNING,
  MODULE_IDS,
  MOTIVATION,
  RIASEC,
  RIASEC_PLAIN,
  TRAIT,
  type Academic,
  type Answers,
  type Effects,
  type Env,
  type Learning,
  type ModuleId,
  type Motivation,
  type Question,
  type Riasec,
  type Trait,
} from "./model";
import { QUESTIONS } from "./questions";

/*
 * Answers → a multidimensional profile (docs/10 §4). Pure and client-safe: the
 * quiz uses it live for micro-feedback and adaptive deep dives; the server
 * uses the same function before matching universities.
 */

type Raw = {
  riasec: Record<Riasec, number>;
  academic: Record<Academic, number>;
  motivation: Record<Motivation, number>;
  learning: Record<Learning, number>;
  trait: Record<Trait, number>;
  env: Record<Env, number>;
  subjects: Partial<Record<Field, number>>;
};

const zero = <K extends string>(keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
const emptyRaw = (): Raw => ({
  riasec: zero(RIASEC),
  academic: zero(ACADEMIC),
  motivation: zero(MOTIVATION),
  learning: zero(LEARNING),
  trait: zero(TRAIT),
  env: zero(ENV),
  subjects: {},
});

function apply(raw: Raw, fx: Effects | undefined, k: number) {
  if (!fx || k === 0) return;
  for (const group of ["riasec", "academic", "motivation", "learning", "trait", "env", "subjects"] as const) {
    const g = fx[group] as Record<string, number> | undefined;
    if (!g) continue;
    const target = raw[group] as Record<string, number>;
    for (const [key, v] of Object.entries(g)) target[key] = (target[key] ?? 0) + v * k;
  }
}

/* ------------------------------ adaptive flow ------------------------------ */

const CLUSTER: Record<ModuleId, { subjects: Field[]; riasec: Riasec[] }> = {
  money: { subjects: ["economics", "finance", "business", "commerce", "statistics"], riasec: ["E", "C"] },
  tech: { subjects: ["computer-science", "data-science", "engineering"], riasec: ["R"] },
  health: { subjects: ["medicine", "biology", "psychology", "nursing", "pharmacy", "allied-health", "biotechnology"], riasec: ["S"] },
  design: { subjects: ["design", "architecture", "visual-arts", "media", "performing-arts"], riasec: ["A"] },
  society: { subjects: ["law", "political-science", "international-relations", "history", "sociology", "philosophy"], riasec: ["E", "S"] },
  science: { subjects: ["physics", "chemistry", "mathematics", "environmental", "biology"], riasec: ["I"] },
};

/** The two deep-dive modules that best match the answers given before the deep dives start. */
export function chooseModules(answers: Answers): ModuleId[] {
  const base = QUESTIONS.filter((q) => !q.module && (q.chapter === "brain" || q.chapter === "energy"));
  const raw = emptyRaw();
  for (const q of base) applyAnswer(raw, q, answers[q.id]);
  const score = (m: ModuleId) =>
    CLUSTER[m].subjects.reduce((a, s) => a + Math.max(0, raw.subjects[s] ?? 0), 0) / Math.sqrt(CLUSTER[m].subjects.length) +
    CLUSTER[m].riasec.reduce((a, r) => a + Math.max(0, raw.riasec[r]), 0) * 0.5;
  return [...MODULE_IDS].sort((a, b) => score(b) - score(a)).slice(0, 2);
}

/** Questions this student will see, in order, given their answers so far. */
export function activeQuestions(answers: Answers): Question[] {
  const modules = chooseModules(answers);
  return QUESTIONS.filter((q) => !q.when || q.when({ answers, modules }));
}

function applyAnswer(raw: Raw, q: Question, a: Answers[string] | undefined) {
  if (a === undefined) return;
  switch (q.kind) {
    case "single":
    case "versus":
      apply(raw, q.options.find((o) => o.id === a)?.fx, 1);
      break;
    case "multi": {
      const ids = Array.isArray(a) ? a : [];
      const k = ids.length ? 1.6 / Math.sqrt(ids.length) : 0; // picking more spreads the signal, it doesn't multiply it
      for (const id of ids) apply(raw, q.options.find((o) => o.id === id)?.fx, k);
      break;
    }
    case "rank": {
      const ids = Array.isArray(a) ? a : [];
      const w = [1.5, 1, 0.6, 0.4, 0.3];
      ids.forEach((id, i) => apply(raw, q.options.find((o) => o.id === id)?.fx, w[i] ?? 0.2));
      break;
    }
    case "slider": {
      const v = typeof a === "number" ? a : Number(a);
      if (Number.isFinite(v)) apply(raw, q.fx, ((v - 5.5) / 4.5) * 1.6);
      break;
    }
  }
}

/* -------------------------------- profile ---------------------------------- */

/** 0–100 from an accumulating raw score: diminishing returns, never quite 100. */
const pctPos = (raw: number, scale: number) => Math.max(2, Math.min(99, Math.round(100 * (1 - Math.exp(-Math.max(0, raw) / scale)))));
/** 0–100 for bipolar traits: 50 is neutral. */
const pctBi = (raw: number, scale: number) => Math.round(50 + 50 * Math.tanh(raw / scale));

export type Facts = {
  home: "chennai" | "tn" | "india" | "abroad" | null;
  distance: "city" | "state" | "india" | "india-abroad" | "abroad" | null;
  regions: string[];
  exclude: string[];
  budget: string | null;
  scholarshipImportance: number | null; // 1–10
  loan: "none" | "small" | "worth" | "large" | null;
  prefersValue: boolean | null;
  board: string | null;
  stream: string | null;
  marks: string | null;
  exams: string[];
  bold: boolean | null;
  gendered: "coed" | "women" | "men" | null;
};

export type Profile = {
  answered: number;
  riasec: Record<Riasec, number>;
  academic: Record<Academic, number>;
  motivation: Record<Motivation, number>;
  learning: Record<Learning, number>;
  trait: Record<Trait, number>;
  env: Record<Env, number>;
  subjects: { key: Field; label: string; pct: number }[];
  modules: ModuleId[];
  facts: Facts;
};

const str = (a: Answers[string] | undefined) => (typeof a === "string" ? a : null);
const arr = (a: Answers[string] | undefined) => (Array.isArray(a) ? a : []);

export function buildProfile(answers: Answers): Profile {
  const qs = activeQuestions(answers);
  const raw = emptyRaw();
  let answered = 0;
  for (const q of qs) {
    if (answers[q.id] === undefined) continue;
    answered++;
    applyAnswer(raw, q, answers[q.id]);
  }
  const map = <K extends string>(r: Record<K, number>, f: (v: number) => number) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, f(v as number)])) as Record<K, number>;
  const subjects = (Object.entries(raw.subjects) as [Field, number][])
    .map(([key, v]) => ({ key, label: SUBJECT_BY_KEY[key]?.label ?? key, pct: pctPos(v, 7) }))
    .filter((s) => s.pct > 5)
    .sort((a, b) => b.pct - a.pct);
  const sch = answers.scholarships;
  return {
    answered,
    riasec: map(raw.riasec, (v) => pctPos(v, 9)),
    academic: map(raw.academic, (v) => pctPos(v, 7)),
    motivation: map(raw.motivation, (v) => pctPos(v, 5)),
    learning: map(raw.learning, (v) => pctPos(v, 4)),
    trait: map(raw.trait, (v) => pctBi(v, 4)),
    env: map(raw.env, (v) => pctBi(v, 3.5)),
    subjects,
    modules: chooseModules(answers),
    facts: {
      home: str(answers.home) as Facts["home"],
      distance: str(answers.distance) as Facts["distance"],
      regions: arr(answers.regions),
      exclude: arr(answers.exclude),
      budget: str(answers.budget),
      scholarshipImportance: typeof sch === "number" ? sch : null,
      loan: str(answers.loan) as Facts["loan"],
      prefersValue: answers.value === undefined ? null : answers.value === "value",
      board: str(answers.board),
      stream: str(answers.stream),
      marks: str(answers.marks),
      exams: arr(answers.exams),
      bold: answers.risk === undefined ? null : answers.risk === "bold",
      gendered: str(answers.gendered) as Facts["gendered"],
    },
  };
}

/* --------------------------------- results --------------------------------- */

export const subjectPct = (p: Profile, k: Field) => p.subjects.find((s) => s.key === k)?.pct ?? 0;

const NOUN: Record<Riasec, (p: Profile) => string> = {
  R: () => "Builder",
  I: (p) => (p.learning.research >= p.academic.analytical ? "Researcher" : "Analyst"),
  A: () => "Creator",
  S: (p) => (p.motivation.impact >= 60 ? "Humanist" : "Connector"),
  E: (p) => (p.motivation.entrepreneurship >= 55 ? "Entrepreneur" : "Leader"),
  C: () => "Strategist",
};
const DOES: Record<Riasec, string> = {
  R: "making real things work",
  I: "analytical thinking",
  A: "original, creative ideas",
  S: "understanding people",
  E: "leadership and business instinct",
  C: "structure and sharp judgement",
};

export type CoreType = { name: string; blurb: string; top: Riasec[] };

export function coreType(p: Profile): CoreType {
  const order = [...RIASEC].sort((a, b) => p.riasec[b] - p.riasec[a]);
  const spread = p.riasec[order[0]] - p.riasec[order[5]];
  if (spread < 15 || (p.trait.flexibility > 72 && p.trait.breadth > 65 && spread < 30)) {
    return { name: "THE EXPLORER", blurb: "You're curious across the board — no single lane holds you yet. That's a strength: you'll do best somewhere that lets you try things before you commit.", top: order.slice(0, 2) };
  }
  const [a, b] = order;
  const n1 = NOUN[a](p).toUpperCase();
  const n2 = NOUN[b](p).toUpperCase();
  return {
    name: n1 === n2 ? `THE ${n1}` : `THE ${n1}-${n2}`,
    blurb: `You naturally combine ${DOES[a]} with ${DOES[b]}.`,
    top: [a, b],
  };
}

export function interestDna(p: Profile) {
  return [...RIASEC]
    .map((k) => ({ key: k, label: RIASEC_PLAIN[k], pct: p.riasec[k] }))
    .sort((a, b) => b.pct - a.pct);
}

export function interestSentence(p: Profile): string {
  const [a, b] = [...RIASEC].sort((x, y) => p.riasec[y] - p.riasec[x]);
  const S: Partial<Record<`${Riasec}${Riasec}`, string>> = {
    IE: "You love figuring things out — but you don't want to stop at analysis. You want to turn ideas into decisions.",
    EI: "You want to lead — and you want to be right. Ideas matter to you because of what they let you do.",
    IC: "You like depth and precision: getting to the real answer, then making it airtight.",
    CI: "You bring order to complicated things, and you like your conclusions backed by evidence.",
    IR: "You want to understand how things work — and then build them.",
    RI: "You're happiest making things that work, and understanding exactly why they do.",
    AE: "You've got ideas and the drive to get them in front of people.",
    EA: "You sell a vision — and you care how it looks and feels.",
    SI: "People fascinate you, and you want to understand them properly, not just guess.",
    IS: "You're drawn to questions that matter for people, and you want real answers.",
    SE: "You energise people and you like making things happen together.",
    ES: "You lead by bringing people with you.",
    AI: "You're creative, but with a thinker's streak — you want ideas that hold up.",
    IA: "You think deeply and express it in your own way.",
    AR: "You make ideas tangible — sketches become objects, plans become places.",
    RA: "You love making things, and you want them to be beautiful too.",
    CE: "You're organised and ambitious — the person who turns plans into results.",
    EC: "You drive things forward and you keep score.",
  };
  return S[`${a}${b}`] ?? `Your strongest pull is towards ${RIASEC_PLAIN[a].toLowerCase()}, with a real streak of ${RIASEC_PLAIN[b].toLowerCase()}.`;
}

/* ------------------------------ course & careers ---------------------------- */

export type CourseCategory = { key: string; label: string; emoji: string; subjects: Field[]; needs?: "maths" | "biology" | "pcm" };

export const COURSES: CourseCategory[] = [
  { key: "econ-finance", label: "Economics & Finance", emoji: "📈", subjects: ["economics", "finance", "statistics"] },
  { key: "economics", label: "Economics", emoji: "🌍", subjects: ["economics", "political-science"] },
  { key: "finance", label: "Finance & Accounting", emoji: "💹", subjects: ["finance", "commerce"] },
  { key: "commerce", label: "Commerce (B.Com)", emoji: "🧾", subjects: ["commerce", "finance", "business"] },
  { key: "business", label: "Business Management", emoji: "💼", subjects: ["business", "commerce"] },
  { key: "analytics", label: "Business Analytics", emoji: "📊", subjects: ["business", "data-science", "statistics"], needs: "maths" },
  { key: "cs", label: "Computer Science", emoji: "💻", subjects: ["computer-science", "mathematics"], needs: "maths" },
  { key: "ai", label: "Data Science & AI", emoji: "🤖", subjects: ["data-science", "computer-science", "statistics"], needs: "maths" },
  { key: "engineering", label: "Engineering", emoji: "⚙️", subjects: ["engineering", "physics", "mathematics"], needs: "pcm" },
  { key: "maths", label: "Mathematics & Statistics", emoji: "🧮", subjects: ["mathematics", "statistics"], needs: "maths" },
  { key: "physics", label: "Physics", emoji: "⚛️", subjects: ["physics", "mathematics"], needs: "pcm" },
  { key: "chemistry", label: "Chemistry", emoji: "🧪", subjects: ["chemistry", "physics"] },
  { key: "bio", label: "Life Sciences & Biotechnology", emoji: "🧬", subjects: ["biology", "biotechnology", "chemistry"], needs: "biology" },
  { key: "medicine", label: "Medicine (MBBS)", emoji: "🩺", subjects: ["medicine", "biology"], needs: "biology" },
  { key: "health", label: "Nursing & Allied Health", emoji: "🏥", subjects: ["nursing", "allied-health", "biology"], needs: "biology" },
  { key: "pharmacy", label: "Pharmacy", emoji: "💊", subjects: ["pharmacy", "chemistry"] },
  { key: "psychology", label: "Psychology", emoji: "🧠", subjects: ["psychology", "sociology"] },
  { key: "law", label: "Law", emoji: "⚖️", subjects: ["law", "political-science"] },
  { key: "politics", label: "Politics & International Relations", emoji: "🏛️", subjects: ["political-science", "international-relations", "history"] },
  { key: "humanities", label: "History & Humanities", emoji: "📜", subjects: ["history", "humanities", "philosophy"] },
  { key: "social", label: "Sociology & Social Work", emoji: "🫶", subjects: ["sociology", "social-work", "psychology"] },
  { key: "english", label: "English & Languages", emoji: "📚", subjects: ["languages-literature", "media"] },
  { key: "media", label: "Media & Journalism", emoji: "🎬", subjects: ["media", "languages-literature"] },
  { key: "design", label: "Design", emoji: "🎨", subjects: ["design", "visual-arts"] },
  { key: "architecture", label: "Architecture", emoji: "🏛️", subjects: ["architecture", "design", "engineering"], needs: "maths" },
  { key: "arts", label: "Fine & Performing Arts", emoji: "🎭", subjects: ["visual-arts", "performing-arts"] },
  { key: "environment", label: "Environmental Science", emoji: "🌱", subjects: ["environmental", "geography", "biology"] },
  { key: "liberal", label: "Liberal Arts", emoji: "🗺️", subjects: ["liberal-arts", "humanities", "economics"] },
  { key: "sport", label: "Sports Science & Management", emoji: "🏅", subjects: ["sports-management"] },
  { key: "hospitality", label: "Hospitality & Tourism", emoji: "🧳", subjects: ["hospitality", "business"] },
  { key: "agriculture", label: "Agriculture", emoji: "🌾", subjects: ["agriculture", "biology"], needs: "biology" },
  { key: "education", label: "Education", emoji: "🍎", subjects: ["education", "psychology"] },
];

export const NEEDS_LABEL = { maths: "Maths", biology: "Biology", pcm: "Physics and Maths" } as const;
export const STREAM_HAS: Record<string, { maths: boolean; biology: boolean; pcm: boolean }> = {
  pcm: { maths: true, biology: false, pcm: true },
  pcb: { maths: false, biology: true, pcm: false },
  pcmb: { maths: true, biology: true, pcm: true },
  "commerce-maths": { maths: true, biology: false, pcm: false },
  commerce: { maths: false, biology: false, pcm: false },
  humanities: { maths: false, biology: false, pcm: false },
};

export type CourseMatch = { key: string; label: string; emoji: string; pct: number; subjects: Field[]; reason: string; note?: string };

function courseScore(p: Profile, c: CourseCategory): number {
  const w = [1, 0.55, 0.35];
  const tot = c.subjects.reduce((a, _, i) => a + (w[i] ?? 0.2), 0);
  let s = c.subjects.reduce((a, k, i) => a + subjectPct(p, k) * (w[i] ?? 0.2), 0) / tot;
  if (c.key === "liberal") s = s * 0.6 + ((p.trait.breadth + p.trait.flexibility) / 2) * 0.4;
  return s;
}

export function courseMatches(p: Profile, limit = 5): CourseMatch[] {
  const scored = COURSES.map((c) => ({ c, s: courseScore(p, c) })).sort((a, b) => b.s - a.s);
  const top = scored[0]?.s || 1;
  return scored.slice(0, limit).map(({ c, s }, i) => {
    const lead = c.subjects.filter((k) => subjectPct(p, k) >= 30).map((k) => SUBJECT_BY_KEY[k]?.label.toLowerCase() ?? k);
    const has = p.facts.stream ? STREAM_HAS[p.facts.stream] : null;
    const note = c.needs && has && !has[c.needs] ? `Usually needs ${NEEDS_LABEL[c.needs]} in Class 11–12 — check each course.` : undefined;
    return {
      key: c.key,
      label: c.label,
      emoji: c.emoji,
      // Shown relative to the strongest match so the list reads as a ranking, capped below 100.
      pct: Math.max(35, Math.min(97, Math.round(97 * (s / top) - i * 0.5))),
      subjects: c.subjects,
      reason: lead.length ? `Your strongest signals — ${lead.slice(0, 2).join(" and ")} — sit right at its core.` : "It draws on several things you lit up for.",
      note,
    };
  });
}

export type Career = { key: string; label: string; emoji: string; subjects: Field[]; riasec: Riasec[]; motivation: Motivation[]; picks: string[] };

export const CAREERS: Career[] = [
  { key: "investment", label: "Investment & finance", emoji: "📈", subjects: ["finance", "economics"], riasec: ["E", "C"], motivation: ["income", "prestige"], picks: ["finance"] },
  { key: "consulting", label: "Consulting", emoji: "💼", subjects: ["business", "economics"], riasec: ["E", "I"], motivation: ["prestige", "challenge"], picks: ["consult"] },
  { key: "founder", label: "Entrepreneurship", emoji: "🚀", subjects: ["business"], riasec: ["E"], motivation: ["entrepreneurship"], picks: ["own"] },
  { key: "econ-research", label: "Economic research", emoji: "📊", subjects: ["economics", "statistics"], riasec: ["I"], motivation: ["challenge"], picks: ["research"] },
  { key: "policy", label: "Public policy", emoji: "🌍", subjects: ["political-science", "economics"], riasec: ["S", "E"], motivation: ["impact"], picks: ["policy"] },
  { key: "software", label: "Software engineering", emoji: "💻", subjects: ["computer-science"], riasec: ["I", "R"], motivation: ["challenge", "income"], picks: ["software"] },
  { key: "ai", label: "AI & data science", emoji: "🤖", subjects: ["data-science", "computer-science", "statistics"], riasec: ["I"], motivation: ["challenge"], picks: ["software"] },
  { key: "product", label: "Product management", emoji: "🧩", subjects: ["business", "computer-science", "design"], riasec: ["E", "A"], motivation: ["leadership"], picks: ["software", "consult"] },
  { key: "engineer", label: "Engineering", emoji: "⚙️", subjects: ["engineering", "physics"], riasec: ["R", "I"], motivation: ["challenge", "security"], picks: ["engineer"] },
  { key: "architect", label: "Architecture", emoji: "🏛️", subjects: ["architecture", "design"], riasec: ["A", "R"], motivation: ["creativity"], picks: ["design"] },
  { key: "ux", label: "UX & product design", emoji: "🎨", subjects: ["design", "computer-science"], riasec: ["A", "I"], motivation: ["creativity"], picks: ["design"] },
  { key: "doctor", label: "Medicine", emoji: "🩺", subjects: ["medicine", "biology"], riasec: ["I", "S"], motivation: ["impact", "security"], picks: ["doctor"] },
  { key: "scientist", label: "Scientific research", emoji: "🔬", subjects: ["physics", "chemistry", "biology"], riasec: ["I"], motivation: ["challenge"], picks: ["research"] },
  { key: "biotech", label: "Biotech & pharma", emoji: "🧪", subjects: ["biotechnology", "pharmacy", "chemistry"], riasec: ["I"], motivation: ["impact"], picks: ["research", "doctor"] },
  { key: "psych", label: "Psychology & counselling", emoji: "🧠", subjects: ["psychology"], riasec: ["S"], motivation: ["impact"], picks: ["psych"] },
  { key: "law", label: "Law", emoji: "⚖️", subjects: ["law"], riasec: ["E", "S"], motivation: ["prestige", "impact"], picks: ["law"] },
  { key: "journalism", label: "Journalism & media", emoji: "📰", subjects: ["media", "languages-literature"], riasec: ["A", "E"], motivation: ["creativity", "impact"], picks: ["media"] },
  { key: "film", label: "Film & content", emoji: "🎬", subjects: ["media", "performing-arts"], riasec: ["A"], motivation: ["creativity"], picks: ["media"] },
  { key: "marketing", label: "Marketing & brand", emoji: "📣", subjects: ["business", "media", "design"], riasec: ["E", "A"], motivation: ["creativity", "income"], picks: ["own", "media"] },
  { key: "teaching", label: "Teaching & education", emoji: "🍎", subjects: ["education"], riasec: ["S"], motivation: ["impact", "balance"], picks: ["teach"] },
  { key: "ngo", label: "Social impact", emoji: "🫶", subjects: ["social-work", "sociology"], riasec: ["S"], motivation: ["impact"], picks: [] },
  { key: "climate", label: "Sustainability & climate", emoji: "🌱", subjects: ["environmental"], riasec: ["I", "S"], motivation: ["impact"], picks: [] },
  { key: "accounting", label: "Accounting & audit", emoji: "🧾", subjects: ["commerce", "finance"], riasec: ["C"], motivation: ["security"], picks: ["finance"] },
  { key: "diplomacy", label: "Diplomacy & international affairs", emoji: "🌐", subjects: ["international-relations", "political-science"], riasec: ["E", "S"], motivation: ["mobility", "impact"], picks: ["policy"] },
  { key: "sport", label: "Sport & fitness", emoji: "🏅", subjects: ["sports-management"], riasec: ["R", "S"], motivation: ["balance"], picks: ["sport"] },
  { key: "hospitality", label: "Hospitality & travel", emoji: "🧳", subjects: ["hospitality"], riasec: ["S", "E"], motivation: ["mobility"], picks: [] },
  { key: "writing", label: "Writing & publishing", emoji: "✍️", subjects: ["languages-literature"], riasec: ["A"], motivation: ["creativity"], picks: [] },
];

export type CareerMatch = { key: string; label: string; emoji: string; pct: number; subjects: Field[] };

export function careerMatches(p: Profile, answers: Answers, limit = 6): CareerMatch[] {
  const picked = new Set(Array.isArray(answers.careers) ? answers.careers : []);
  return CAREERS.map((c) => {
    const subj = c.subjects.reduce((a, k, i) => a + subjectPct(p, k) * (i === 0 ? 1 : 0.6), 0) / c.subjects.reduce((a, _, i) => a + (i === 0 ? 1 : 0.6), 0);
    const ri = c.riasec.reduce((a, r) => a + p.riasec[r], 0) / c.riasec.length;
    const mo = c.motivation.reduce((a, m) => a + p.motivation[m], 0) / c.motivation.length;
    const bonus = c.picks.some((x) => picked.has(x)) ? 10 : 0;
    return { key: c.key, label: c.label, emoji: c.emoji, subjects: c.subjects, pct: Math.min(97, Math.round(subj * 0.55 + ri * 0.25 + mo * 0.2 + bonus)) };
  })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}

export function careerSentence(p: Profile): string {
  const [a, b] = [...RIASEC].sort((x, y) => p.riasec[y] - p.riasec[x]);
  const W: Record<Riasec, string> = { R: "building", I: "analysis", A: "creativity", S: "people", E: "leadership", C: "organisation" };
  const third = p.motivation.impact > p.motivation.income ? "real-world impact" : "decision-making";
  return `You could thrive where ${W[a]}, ${W[b]} and ${third} overlap.`;
}

/* ------------------------------ campus & money ------------------------------ */

const ENV_CHIP: Record<Env, { emoji: string; label: string; avoid: string }> = {
  bigCity: { emoji: "🏙️", label: "Big city", avoid: "a quiet, isolated campus far from internships and opportunities" },
  smallTown: { emoji: "🏡", label: "Calm, smaller town", avoid: "a chaotic megacity where getting anywhere takes an hour" },
  campusLife: { emoji: "🌳", label: "Real campus life", avoid: "a commuter college where everyone leaves at 4 pm" },
  large: { emoji: "🏟️", label: "Large & buzzing", avoid: "a tiny college with only a handful of courses" },
  small: { emoji: "🏠", label: "Small & close-knit", avoid: "a 40,000-student university where you're a roll number" },
  competitive: { emoji: "🔥", label: "Competitive", avoid: "a laid-back college where nobody pushes you" },
  collaborative: { emoji: "🤝", label: "Collaborative", avoid: "a cut-throat, rank-obsessed environment" },
  international: { emoji: "🌎", label: "International", avoid: "a place where everyone comes from the same background" },
  careerFocus: { emoji: "📈", label: "Career-focused", avoid: "a college with weak industry links" },
  research: { emoji: "🔬", label: "Research-driven", avoid: "a teaching-only college with no labs" },
  entrepreneurial: { emoji: "🚀", label: "Entrepreneurial", avoid: "a place where starting something is seen as a distraction" },
  sport: { emoji: "⚽", label: "Sporty", avoid: "a campus with no space to play" },
  culture: { emoji: "🎪", label: "Fests & culture", avoid: "a campus with no clubs or fests" },
};

export function universityDna(p: Profile) {
  const chips = (Object.keys(ENV_CHIP) as Env[])
    .filter((k) => p.env[k] >= 58)
    .sort((a, b) => p.env[b] - p.env[a])
    .map((k) => ({ key: k, ...ENV_CHIP[k] }));
  if (p.trait.ambition >= 60 || p.motivation.challenge >= 60) chips.push({ key: "rigour" as Env, emoji: "🎓", label: "Academically rigorous", avoid: "" });
  const strongest = chips.find((c) => c.avoid);
  return { chips: chips.slice(0, 6), avoid: strongest ? `You probably won't thrive in ${strongest.avoid}.` : "You're flexible about environment — which widens your options." };
}

export const BUDGET_MAX_INR: Record<string, number | null> = {
  lt1: 100000,
  "1-3": 300000,
  "3-6": 600000,
  "6-12": 1200000,
  "12-25": 2500000,
  "25-50": 5000000,
  "50+": Number.POSITIVE_INFINITY,
  unsure: null,
};
export const BUDGET_LABEL: Record<string, string> = {
  lt1: "under ₹1 lakh",
  "1-3": "₹1–3 lakh",
  "3-6": "₹3–6 lakh",
  "6-12": "₹6–12 lakh",
  "12-25": "₹12–25 lakh",
  "25-50": "₹25–50 lakh",
  "50+": "₹50 lakh+",
  unsure: "not sure yet",
};
/** How far above the comfortable budget a student will stretch, by loan attitude. */
export const LOAN_STRETCH: Record<string, number> = { none: 1.1, small: 1.35, worth: 1.8, large: 2.5 };

export function moneyProfile(p: Profile) {
  const f = p.facts;
  const max = f.budget ? BUDGET_MAX_INR[f.budget] : null;
  const debt = f.loan === "none" ? 2 : f.loan === "small" ? 4 : f.loan === "worth" ? 7 : f.loan === "large" ? 9 : null;
  const budgetPressure = max == null ? 5 : max <= 300000 ? 9 : max <= 600000 ? 8 : max <= 1200000 ? 6 : max <= 2500000 ? 4 : 2;
  const cost = Math.max(1, Math.min(10, Math.round(budgetPressure * 0.6 + (f.prefersValue ? 3 : 1) + (debt != null ? (10 - debt) * 0.15 : 0))));
  const sch = f.scholarshipImportance != null ? Math.round(f.scholarshipImportance) : null;
  const careerUpside = p.motivation.income >= 55 || p.env.careerFocus >= 60;
  const line =
    cost >= 7
      ? careerUpside
        ? "You care about career outcomes but you're cost-conscious. Your ideal university isn't the most expensive one — it's the one where the career upside clearly justifies the cost."
        : "Value matters to you. The smartest move is a strong programme at a sensible price, with scholarships doing some of the heavy lifting."
      : cost >= 4
        ? "You'll pay for quality when it's clearly worth it — so compare outcomes, not just brand names."
        : "Cost isn't your main constraint — so choose on fit and outcomes, and still claim every scholarship you can.";
  return { budget: f.budget ? BUDGET_LABEL[f.budget] : null, budgetMax: max, scholarshipImportance: sch, costSensitivity: cost, debtTolerance: debt, line };
}

/* ------------------------------ micro-feedback ------------------------------ */

export function nudge(p: Profile, step: number): string {
  const topA = (Object.entries(p.academic) as [Academic, number][]).sort((a, b) => b[1] - a[1])[0]?.[0];
  const A: Record<Academic, string> = {
    quantitative: "numbers and logic",
    analytical: "analytical problem-solving",
    verbal: "words and arguments",
    creative: "creative thinking",
    technical: "technical, hands-on problems",
    social: "understanding people",
    practical: "practical, real-world work",
  };
  const lines = [
    `Interesting. You're leaning heavily toward ${A[topA ?? "analytical"]}.`,
    "Okay… we're starting to see a pattern. 👀",
    "Your answers are getting interesting.",
    `${p.subjects[0] ? `${p.subjects[0].label}` : "One subject"} keeps coming up. Noted. 📝`,
    "Almost there. The good part is coming.",
  ];
  return lines[step % lines.length];
}
