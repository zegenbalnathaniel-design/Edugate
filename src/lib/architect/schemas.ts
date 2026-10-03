import { z } from "zod";

/*
 * Passion Project Architect (docs/08-passion-architect.md).
 *
 * Model-output schemas are sent to the Claude API as structured-output JSON
 * schemas, so they stick to what that supports: every field required, no
 * min/max constraints, enums for the qualitative scales. Lengths and counts
 * are asked for in the prompt instead.
 */

/** The spec's qualitative scale. Never converted to a number or percentage. */
export const LEVELS = ["Low", "Moderate", "High", "Very High"] as const;
export const Level = z.enum(LEVELS);
export type Level = z.infer<typeof Level>;

export const COVERAGE_KEYS = [
  "interests",
  "experiences",
  "skills",
  "motivation",
  "problems",
  "resources",
  "preferences",
  "horizon",
] as const;
export const COVERAGE_LABELS: Record<(typeof COVERAGE_KEYS)[number], string> = {
  interests: "Interests",
  experiences: "Experiences",
  skills: "Skills",
  motivation: "Motivation",
  problems: "Problems you care about",
  resources: "Time & resources",
  preferences: "How you like to work",
  horizon: "Ambition & horizon",
};

/* ----------------------------- Part I ----------------------------- */

export const InterviewQuestion = z.object({
  id: z.string(),
  text: z.string(),
  why: z.string(), // one line: what this question is trying to learn
  kind: z.enum(["open", "single", "multi"]),
  options: z.array(z.string()), // empty for open questions
});
export type InterviewQuestion = z.infer<typeof InterviewQuestion>;

export const InterviewTurn = z.object({
  reflection: z.string(), // what has been learned so far, in the student's terms
  questions: z.array(InterviewQuestion),
  coverage: z.object(
    Object.fromEntries(COVERAGE_KEYS.map((k) => [k, z.enum(["none", "partial", "good"])])) as Record<
      (typeof COVERAGE_KEYS)[number],
      z.ZodEnum<{ none: "none"; partial: "partial"; good: "good" }>
    >,
  ),
  readyForConcepts: z.boolean(),
});
export type InterviewTurn = z.infer<typeof InterviewTurn>;

/* ------------------------- Parts II – IV ------------------------- */

export const PersonalProfile = z.object({
  summary: z.string(),
  coreInterests: z.array(z.string()),
  hiddenInterests: z.array(z.string()),
  strengths: z.array(z.string()),
  skillGaps: z.array(z.string()),
  motivations: z.array(z.string()),
  problemsTheyCareAbout: z.array(z.string()),
  resources: z.array(z.string()),
  constraints: z.array(z.string()),
  workStyle: z.string(),
  ambition: z.string(),
  idealProject: z.array(z.string()),
  avoid: z.array(z.string()),
});
export type PersonalProfile = z.infer<typeof PersonalProfile>;

export const Concept = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  oneLine: z.string(),
  problem: z.string(),
  whyItMatters: z.string(),
  whoBenefits: z.string(),
  coreIdea: z.string(),
  whyItFitsYou: z.string(),
  uniqueAngle: z.string(),
  firstVersion: z.string(),
  longTermPotential: z.string(),
  skillsDeveloped: z.array(z.string()),
  resourcesNeeded: z.array(z.string()),
  difficulty: Level,
  timeToFirstResult: z.string(),
  keyRisks: z.array(z.string()),
});
export type Concept = z.infer<typeof Concept>;

export const MATRIX_KEYS = [
  "personalAlignment",
  "skillMatch",
  "feasibility",
  "resourceRequirement",
  "speedToFirstResult",
  "originality",
  "impactPotential",
  "scalability",
  "learningValue",
  "academicValue",
  "careerValue",
  "entrepreneurialPotential",
  "riskLevel",
] as const;
export const MATRIX_LABELS: Record<(typeof MATRIX_KEYS)[number], string> = {
  personalAlignment: "Personal alignment",
  skillMatch: "Skill match",
  feasibility: "Feasibility",
  resourceRequirement: "Resources needed",
  speedToFirstResult: "Speed to first result",
  originality: "Originality",
  impactPotential: "Impact potential",
  scalability: "Scalability",
  learningValue: "Learning value",
  academicValue: "Academic value",
  careerValue: "Career value",
  entrepreneurialPotential: "Entrepreneurial potential",
  riskLevel: "Risk",
};
/** For these two, "High" is a cost, not a benefit — the UI colours them inverted. */
export const INVERTED_KEYS: ReadonlySet<string> = new Set(["resourceRequirement", "riskLevel"]);

export const MatrixRow = z.object({
  conceptId: z.string(),
  ...(Object.fromEntries(MATRIX_KEYS.map((k) => [k, Level])) as Record<(typeof MATRIX_KEYS)[number], typeof Level>),
  tradeoff: z.string(),
});
export type MatrixRow = z.infer<typeof MatrixRow>;

export const Ideation = z.object({
  profile: PersonalProfile,
  concepts: z.array(Concept),
  matrix: z.array(MatrixRow),
  recommendation: z.string(), // which to look at first and why — a suggestion, not a verdict
});
export type Ideation = z.infer<typeof Ideation>;

/* ---------------------- Parts VII – XV, XXVII ---------------------- */

export const VerifiedFact = z.object({ claim: z.string(), sourceUrl: z.string() });

export const BlueprintCore = z.object({
  title: z.string(),
  tagline: z.string(),
  validation: z.object({
    verifiedFacts: z.array(VerifiedFact),
    assumptions: z.array(z.string()),
    unknowns: z.array(z.string()),
    mustTest: z.array(z.string()),
  }),
  executiveSummary: z.object({
    whatItIs: z.string(),
    problem: z.string(),
    solution: z.string(),
    whoBenefits: z.string(),
    whyItMatters: z.string(),
    whyYou: z.string(),
    firstVersion: z.string(),
    longTermVision: z.string(),
    successLooksLike: z.string(),
  }),
  thesis: z.object({
    problem: z.string(),
    rootCauses: z.array(z.string()),
    existingApproachesFallShort: z.string(),
    opportunity: z.string(),
    differentiation: z.string(),
    statement: z.string(),
  }),
  objectives: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    learning: z.array(z.string()),
    impact: z.array(z.string()),
    personal: z.array(z.string()),
    measurable: z.array(z.string()),
  }),
  research: z.object({
    questions: z.array(z.string()),
    hypotheses: z.array(z.string()),
    methods: z.array(z.string()),
    dataToCollect: z.array(z.string()),
    ethics: z.array(z.string()),
  }),
  architecture: z.object({
    components: z.array(z.object({ name: z.string(), purpose: z.string() })),
    userJourney: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  mvp: z.object({
    goal: z.string(),
    features: z.array(z.string()),
    notInV1: z.array(z.string()),
    buildSteps: z.array(z.string()),
    testPlan: z.string(),
    successCriteria: z.array(z.string()),
  }),
  roadmap: z.array(
    z.object({
      phase: z.string(),
      objective: z.string(),
      actions: z.array(z.string()),
      deliverables: z.array(z.string()),
      successMetric: z.string(),
      risks: z.array(z.string()),
    }),
  ),
  weeks: z.array(
    z.object({
      week: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
      deliverable: z.string(),
      checkpoint: z.string(),
    }),
  ),
  laterMilestones: z.array(z.string()),
  preview: z.object({
    description: z.string(),
    artifacts: z.array(z.string()),
    firstUserExperience: z.string(),
  }),
  nextActions: z.object({
    next24Hours: z.array(z.string()),
    next7Days: z.array(z.string()),
    next30Days: z.array(z.string()),
  }),
});
export type BlueprintCore = z.infer<typeof BlueprintCore>;

/* ---------------------- Parts XI, XVI – XXVIII ---------------------- */

export const BlueprintExtended = z.object({
  proposal: z.object({
    title: z.string(),
    abstract: z.string(),
    background: z.string(),
    methodology: z.string(),
    expectedOutcomes: z.string(),
    evaluation: z.string(),
  }),
  costCurrency: z.string(),
  costNote: z.string(),
  materials: z.array(
    z.object({
      item: z.string(),
      purpose: z.string(),
      quantity: z.string(),
      estimatedCost: z.string(),
      priority: z.enum(["Essential", "Useful", "Optional"]),
      cheaperAlternative: z.string(),
    }),
  ),
  budgets: z.array(
    z.object({
      scenario: z.enum(["Lean", "Standard", "Ambitious"]),
      estimatedTotal: z.string(),
      covers: z.array(z.string()),
      tradeoff: z.string(),
    }),
  ),
  team: z.array(z.object({ role: z.string(), why: z.string(), when: z.string() })),
  partnerships: z.array(z.object({ kind: z.string(), whatTheyAdd: z.string(), howToApproach: z.string() })),
  impact: z.object({
    shortTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
    kpis: z.array(z.object({ metric: z.string(), howMeasured: z.string(), target: z.string() })),
  }),
  commercialization: z.object({
    credible: z.boolean(),
    reasoning: z.string(),
    customer: z.string(),
    valueProposition: z.string(),
    revenueModel: z.string(),
    unitEconomics: z.string(),
    competitors: z.array(z.string()),
  }),
  scale: z.object({
    path: z.array(z.object({ stage: z.string(), description: z.string() })),
    constraints: z.array(z.string()),
  }),
  brand: z.object({
    nameIdeas: z.array(z.string()),
    positioning: z.string(),
    voice: z.string(),
    visualDirection: z.string(),
  }),
  presence: z.object({ channels: z.array(z.string()), contentIdeas: z.array(z.string()) }),
  documentation: z.object({ system: z.array(z.string()), evidence: z.array(z.string()) }),
  risks: z.array(
    z.object({ risk: z.string(), likelihood: Level, impact: Level, mitigation: z.string(), contingency: z.string() }),
  ),
  exceptional: z.array(z.string()),
  evolution: z.object({ v1: z.string(), v2: z.string(), v3: z.string() }),
  qualityCheck: z.array(z.object({ criterion: z.string(), pass: z.boolean(), note: z.string() })),
});
export type BlueprintExtended = z.infer<typeof BlueprintExtended>;

/* -------------------------- research step -------------------------- */

export const ResearchSource = z.object({ url: z.string(), title: z.string() });
export type ResearchSource = z.infer<typeof ResearchSource>;

export const Research = z.object({
  notes: z.string(),
  sources: z.array(ResearchSource),
  available: z.boolean(), // false when live search could not run — the blueprint then treats everything as unverified
});
export type Research = z.infer<typeof Research>;

/* --------------------------- request bodies --------------------------- */

export const ORIENTATIONS = {
  idea: "I already have a project idea",
  interests: "I know my interests, but not the project",
  open: "I don't know where to start",
  improve: "I want to improve a project I've started",
} as const;
export type Orientation = keyof typeof ORIENTATIONS;

const short = (n: number) => z.string().trim().max(n);

export const TranscriptEntry = z.object({
  question: short(600),
  answer: short(2000),
});
export type TranscriptEntry = z.infer<typeof TranscriptEntry>;

export const Discovery = z.object({
  orientation: z.enum(Object.keys(ORIENTATIONS) as [Orientation, ...Orientation[]]),
  opening: short(2000),
  transcript: z.array(TranscriptEntry).max(40),
});
export type Discovery = z.infer<typeof Discovery>;

export const IdeateRequest = Discovery.extend({
  feedback: short(1500).default(""),
  rejectedTitles: z.array(short(200)).max(40).default([]),
});

export const ResearchRequest = z.object({
  concepts: z.array(Concept).min(1).max(3),
  profile: PersonalProfile,
});

export const BlueprintRequest = Discovery.extend({
  part: z.enum(["core", "extended"]),
  concepts: z.array(Concept).min(1).max(3),
  profile: PersonalProfile,
  research: Research,
});

export const SaveRequest = z.object({
  title: short(200).min(1),
  profile: PersonalProfile,
  concepts: z.array(Concept).min(1).max(3),
  research: Research,
  core: BlueprintCore,
  extended: BlueprintExtended,
});
export type SavedProject = z.infer<typeof SaveRequest>;

/* ------------------------------ guards ------------------------------ */

/**
 * Spec Part VI: nothing is presented as verified unless it traces to a source
 * that live research actually returned. A "verified" fact whose URL the
 * research step never saw is demoted to an assumption.
 */
export function enforceVerification(core: BlueprintCore, research: Research): BlueprintCore {
  const seen = new Set(research.sources.map((s) => normaliseUrl(s.url)));
  const verifiedFacts = [];
  const demoted = [];
  for (const f of core.validation.verifiedFacts) {
    if (research.available && seen.has(normaliseUrl(f.sourceUrl))) verifiedFacts.push(f);
    else demoted.push(`${f.claim} (requires validation)`);
  }
  return {
    ...core,
    validation: { ...core.validation, verifiedFacts, assumptions: [...core.validation.assumptions, ...demoted] },
  };
}

export function normaliseUrl(u: string) {
  try {
    const url = new URL(u.trim());
    url.hash = "";
    for (const k of [...url.searchParams.keys()]) if (k.startsWith("utm_")) url.searchParams.delete(k);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}${url.search}`.toLowerCase();
  } catch {
    return u.trim().toLowerCase();
  }
}

/** Matrix rows must line up with the concepts they rate; drop anything that doesn't. */
export function alignMatrix(ideation: Ideation): Ideation {
  const ids = new Set(ideation.concepts.map((c) => c.id));
  const seen = new Set<string>();
  const matrix = ideation.matrix.filter((r) => ids.has(r.conceptId) && !seen.has(r.conceptId) && seen.add(r.conceptId));
  return { ...ideation, matrix };
}

/*
 * The SDK sends enums to the API as description hints rather than hard
 * constraints, so a model can return "very high" or "Very-High". Snap those
 * back to the canonical literal before validating, for enum-typed keys only.
 */
const ENUM_VALUES = [...LEVELS, "none", "partial", "good", "open", "single", "multi", "Essential", "Useful", "Optional", "Lean", "Standard", "Ambitious"];
const ENUM_KEYS = new Set<string>([...MATRIX_KEYS, ...COVERAGE_KEYS, "difficulty", "likelihood", "impact", "kind", "priority", "scenario"]);
const canon = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, " ").trim();
const ENUM_LOOKUP = new Map(ENUM_VALUES.map((v) => [canon(v), v]));

export function normaliseEnums(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((v) => normaliseEnums(v, key));
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normaliseEnums(v, k)]));
  if (typeof value === "string" && ENUM_KEYS.has(key)) return ENUM_LOOKUP.get(canon(value)) ?? value;
  return value;
}
