/**
 * Core entity types. Source of truth: docs/03-data-model.md
 *
 * Two rules hold across every type in this file:
 *  1. `provenance` is mandatory on every entity (D2.2) — this is what makes
 *     "no fabricated claims" structural rather than a matter of discipline.
 *  2. No field named tier/plan/subscription/premium/isPaid/sponsored/promoted
 *     exists anywhere (D3) — so a ranking function cannot take payment as an
 *     argument, because there is nothing to pass.
 */

export type ID = string;
export type ISODate = string;

export type Provenance = "illustrative" | "institution-supplied" | "verified";

export interface Entity {
  id: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  provenance: Provenance;
}

/* ------------------------------------------------------------------ */
/* Taxonomy                                                            */
/* ------------------------------------------------------------------ */

export type FieldKey =
  | "business"
  | "economics"
  | "technology"
  | "design"
  | "psychology"
  | "engineering"
  | "media"
  | "social_sciences"
  | "life_sciences"
  | "law"
  | "architecture"
  | "sports"
  | "entrepreneurship";

export const FIELD_LABELS: Record<FieldKey, string> = {
  business: "Business",
  economics: "Economics",
  technology: "Technology",
  design: "Design",
  psychology: "Psychology",
  engineering: "Engineering",
  media: "Media",
  social_sciences: "Social Sciences",
  life_sciences: "Life Sciences",
  law: "Law",
  architecture: "Architecture",
  sports: "Sports",
  entrepreneurship: "Entrepreneurship",
};

/**
 * Curriculum boards. India-first per the working assumption recorded in
 * docs/00-decisions.md open question 1; international boards are included so
 * the model does not need reshaping when scope widens.
 */
export type CurriculumBoard =
  | "CBSE"
  | "ICSE"
  | "STATE"
  | "IB"
  | "IGCSE"
  | "A_LEVELS"
  | "OTHER";

export type DegreeLevel =
  | "diploma"
  | "bachelors"
  | "integrated"
  | "masters"
  | "doctoral";

/* ------------------------------------------------------------------ */
/* Verification (§76)                                                  */
/* ------------------------------------------------------------------ */

export type VerificationState =
  | "unverified"
  | "pending"
  | "verified"
  | "needs_information"
  | "rejected";

export type VerifiableCategory =
  | "academics"
  | "programs"
  | "fees"
  | "admissions"
  | "campus"
  | "outcomes";

export interface VerificationRecord extends Entity {
  institutionId: ID;
  state: VerificationState;
  submittedAt: ISODate;
  reviewedAt: ISODate | null;
  reviewedBy: ID | null;
  /** Per-category, so a "verified" badge can be honest at that granularity. */
  categories: { key: VerifiableCategory; state: VerificationState }[];
}

/* ------------------------------------------------------------------ */
/* Education entities                                                  */
/* ------------------------------------------------------------------ */

export interface Money {
  currency: "INR" | "USD" | "GBP" | "EUR";
  /** A range, never a point — implied precision is a fabricated claim (D2.4). */
  min: number;
  max: number;
  period: "year" | "total" | "semester";
}

/** Qualitative bands only — D2.4 forbids a fabricated precise number here. */
export type SelectivityBand = "highly-selective" | "selective" | "moderate" | "open";

export interface AdmissionsInfo {
  selectivity: SelectivityBand;
  requirements: string[];
  deadlines: { label: string; date: ISODate }[];
}

export interface CampusInfo {
  setting: "urban" | "suburban" | "rural";
  sizeDescriptor: string;
  housingAvailable: boolean;
  notableFacilities: string[];
}

export interface ExperienceInfo {
  classSizeDescriptor: string;
  clubs: string[];
  testimonialThemes: string[];
}

/**
 * Absent unless genuinely sourced (D2.4) — no illustrative fixture in this
 * closed demo universe sets this, since nothing here is genuinely measured.
 * The type exists for when a real placement or outcomes figure is sourced.
 */
export interface OutcomeInfo {
  narrativeSummary: string;
  rangeDescriptor: string;
}

export interface MediaAsset {
  type: "image" | "video";
  url: string;
  alt: string;
}

/**
 * A citation for a real, checkable fact (docs/00-decisions.md → D2, revised).
 * Every real institution, course and scholarship record carries at least one
 * of these — the mechanism that makes "accurate" structural rather than a
 * matter of the author's discipline, the same way `provenance` does for the
 * honesty model it replaced.
 */
export interface SourceRef {
  label: string;
  url: string;
  retrievedAt: ISODate;
}

export interface Institution extends Entity {
  slug: string;
  name: string;
  type: "university" | "college" | "school" | "institute";
  location: { country: string; state: string; city: string };
  description: string;
  founded: number;
  programs: ID[];
  tuition: Money;
  scholarships: ID[];
  admissions: AdmissionsInfo;
  campus: CampusInfo;
  studentExperience: ExperienceInfo;
  /** Optional — absent unless genuinely sourced (D2.4). */
  outcomes?: OutcomeInfo;
  media: MediaAsset[];
  /** Null when genuinely not verified — dates are never fabricated (§22). */
  verification: VerificationRecord | null;
  /** Real, checkable citations backing this record — required when provenance is "verified". */
  sources: SourceRef[];
}

export type RequirementType = "academic" | "language" | "portfolio" | "interview";

export interface Requirement {
  type: RequirementType;
  description: string;
}

export interface CurriculumReality {
  whatYouStudy: string[];
  /** 0..1 — rendered as a qualitative band in the UI, never a percentage (§49). */
  theoryToPracticeRatio: number;
  assessmentTypes: string[];
  typicalProjects: string[];
  workloadDescriptor: "light" | "moderate" | "heavy" | "intensive";
  skillsDeveloped: string[];
}

export interface Course extends Entity {
  slug: string;
  name: string;
  degree: DegreeLevel;
  field: FieldKey;
  durationMonths: number;
  subjects: string[];
  institutions: ID[];
  requirements: Requirement[];
  fees: Money;
  careerPathways: ID[];
  scholarships: ID[];
  deadlines: { label: string; date: ISODate }[];
  curriculumReality: CurriculumReality;
  sources: SourceRef[];
}

/**
 * Reuses the same bipolar axis vocabulary as Passion Projector (§1) — a
 * career page and a Passion Projector reveal can share the same
 * <AxisIndicator>, rather than inventing a second work-style taxonomy.
 */
export type WorkStyleTags = Partial<Record<AxisKey, number>>;

export interface Career extends Entity {
  slug: string;
  title: string;
  description: string;
  fields: FieldKey[];
  skills: string[];
  degrees: ID[];
  relatedCourses: ID[];
  relatedInstitutions: ID[];
  relatedProjects: ID[];
  workStyle: WorkStyleTags;
}

export type ScholarshipBasis = "merit" | "need" | "field" | "demographic";

export interface EligibilityCriteria {
  description: string;
  curriculum?: CurriculumBoard[];
  fields?: FieldKey[];
  countries?: string[];
}

export interface Coverage {
  type: "full" | "partial" | "fixed-amount";
  amount?: Money;
}

export interface ApplicationStep {
  order: number;
  label: string;
  description: string;
}

export interface Scholarship extends Entity {
  slug: string;
  name: string;
  provider: string;
  eligibility: EligibilityCriteria;
  coverage: Coverage;
  deadline: ISODate;
  applicationProcess: ApplicationStep[];
  basis: ScholarshipBasis[];
  sources: SourceRef[];
}

/* ------------------------------------------------------------------ */
/* Passion Projector (§100, docs/04-passion-engine.md)                 */
/*                                                                      */
/* Two kinds of dimension that must never be scored the same way:      */
/*  - signals are unipolar (more is meaningful) → star bands            */
/*  - axes are bipolar (neither pole is "more") → position + band,      */
/*    never a star rating (docs/04 §1)                                  */
/* ------------------------------------------------------------------ */

export const SIGNAL_KEYS = [
  "curiosity",
  "creation",
  "analysis",
  "systems",
  "people",
  "competition",
  "exploration",
  "research",
  "design",
  "business",
  "technology",
  "storytelling",
  "impact",
] as const;

export type SignalKey = (typeof SIGNAL_KEYS)[number];

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  curiosity: "Curiosity",
  creation: "Creation",
  analysis: "Analysis",
  systems: "Systems Thinking",
  people: "People",
  competition: "Competition",
  exploration: "Exploration",
  research: "Research",
  design: "Design",
  business: "Business",
  technology: "Technology",
  storytelling: "Storytelling",
  impact: "Impact",
};

export const AXIS_KEYS = [
  "structure",
  "social",
  "risk",
  "scope",
  "drive",
] as const;

export type AxisKey = (typeof AXIS_KEYS)[number];

/** Pole A is the negative end of the stored position, Pole B the positive. */
export const AXIS_LABELS: Record<
  AxisKey,
  { name: string; poleA: string; poleB: string }
> = {
  structure: {
    name: "Structure",
    poleA: "Thrives in structure",
    poleB: "Thrives in ambiguity",
  },
  social: {
    name: "Working with others",
    poleA: "Independent",
    poleB: "Collaborative",
  },
  risk: { name: "Risk", poleA: "Steady", poleB: "Risk-seeking" },
  scope: {
    name: "Scope",
    poleA: "Depth on one thing",
    poleB: "Breadth across many",
  },
  drive: {
    name: "Drive",
    poleA: "Intrinsic",
    poleB: "Recognition-driven",
  },
};

export type QuestionStage = "core" | "probe" | "depth";

export interface PassionOption {
  id: ID;
  label: string;
  /** Every option carries multiple signal weights — no one-answer mapping. */
  signals: Partial<Record<SignalKey, number>>;
  axes?: Partial<Record<AxisKey, number>>;
}

/** Running signal state, read by question eligibility gates and the selector. */
export interface SignalState {
  normalized: Record<SignalKey, number>;
  confidence: Record<SignalKey, number>;
  observations: Record<SignalKey, number>;
}

export interface PassionQuestion {
  id: ID;
  stage: QuestionStage;
  prompt: string;
  options: PassionOption[];
  /** Gates depth questions on signal state already observed. */
  eligibility?: (s: SignalState) => boolean;
  targets: SignalKey[];
}

export interface PassionResponse {
  questionId: ID;
  optionId: ID;
  at: ISODate;
}

export interface SignalScore {
  key: SignalKey;
  /** raw / attainable, normalized against what was actually asked — 0..1. */
  normalized: number;
  confidence: number;
  observations: number;
}

export interface AxisScore {
  key: AxisKey;
  /** -1 (pole A) .. +1 (pole B). Never rendered as stars. */
  position: number;
  confidence: number;
}

export interface Archetype {
  key: string;
  name: string;
  vector: Partial<Record<SignalKey, number>>;
  description: string;
  pullsAttention: string[];
  howYouWork: string[];
  whatMotivates: string[];
  whatYouReturnTo: string[];
}

export type FieldConnectionBand = "strong" | "moderate" | "worth_exploring";

export interface FieldConnection {
  field: FieldKey;
  strength: number;
  band: FieldConnectionBand;
  contributions: { signal: SignalKey; weight: number }[];
}

/** Every derived claim stores the response IDs that produced it (§102). */
export interface EvidenceMap {
  bySignal: Partial<
    Record<SignalKey, { responseId: ID; contribution: number }[]>
  >;
  byField: Partial<Record<FieldKey, { signalKey: SignalKey; weight: number }[]>>;
  byProject: Record<ID, { reason: string; signals: SignalKey[] }[]>;
}

export interface PassionProfile {
  signals: SignalScore[];
  axes: AxisScore[];
  /** null is a valid, honest outcome below the 0.82 similarity floor. */
  archetype: Archetype | null;
  /** Set only when the top two archetypes are within 0.05 (blend disclosure). */
  archetypeBlend: Archetype | null;
  fieldConnections: FieldConnection[];
  evidence: EvidenceMap;
}

export type SessionStatus = "in_progress" | "complete" | "abandoned";

export interface PassionSession extends Entity {
  studentId: ID;
  status: SessionStatus;
  responses: PassionResponse[];
  /** Required for normalization — raw sums are not comparable across sessions. */
  askedQuestionIds: ID[];
  profile: PassionProfile | null;
  completedAt: ISODate | null;
}

/* ------------------------------------------------------------------ */
/* Projects (§103) — the loop that makes this a product, not a quiz    */
/* ------------------------------------------------------------------ */

export type ProjectDifficulty = "starter" | "intermediate" | "ambitious";

/** One concrete phase of a project's implementation plan — a real outline, not a vague blurb. */
export interface ImplementationPhase {
  title: string;
  /** What is true once this phase is done. */
  goal: string;
  tasks: string[];
  /** Roughly how long this phase takes, on the student's own time. */
  durationDescriptor: string;
}

export interface ProjectTemplate {
  id: ID;
  title: string;
  rationale: string;
  requires: { signals: SignalKey[]; minNormalized: number };
  fields: FieldKey[];
  gradeRange: [number, number];
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  skills: string[];
  learningOutcomes: string[];
  /** Concrete, doable within an hour — never "conduct user research". */
  firstStep: string;
  /** The full build, phase by phase — not just the first step. */
  implementationPlan: ImplementationPhase[];
  deliverables: string[];
  portfolioValue: string;
}

export type ProjectStatus = "idea" | "started" | "in_progress" | "completed";

export interface Project extends Entity {
  studentId: ID;
  sourceSessionId: ID | null;
  templateId: ID | null;
  title: string;
  rationale: string;
  skills: string[];
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  firstStep: string;
  implementationPlan: ImplementationPhase[];
  deliverables: string[];
  status: ProjectStatus;
  /** → Document ids. Empty in this stage — no doc vault yet (Stage 4). */
  evidence: ID[];
  reflection: string | null;
  statusHistory: { status: ProjectStatus; at: ISODate }[];
}

/* ------------------------------------------------------------------ */
/* Repository contracts                                                */
/* ------------------------------------------------------------------ */

export interface Page<T> {
  items: T[];
  total: number;
}

export interface InstitutionQuery {
  search?: string;
  country?: string;
  city?: string;
  field?: FieldKey;
  limit?: number;
}

export interface CourseQuery {
  search?: string;
  field?: FieldKey;
  degree?: DegreeLevel;
  institutionId?: ID;
  limit?: number;
}

export interface CareerQuery {
  search?: string;
  field?: FieldKey;
  limit?: number;
}

export interface ScholarshipQuery {
  search?: string;
  field?: FieldKey;
  basis?: ScholarshipBasis;
  limit?: number;
}

export interface ComparisonMatrix {
  institutions: Institution[];
  rows: { label: string; values: (string | number)[] }[];
}
