import { z } from "zod";

/*
 * College Discovery & Fit Engine — sourced data contract.
 *
 * Every externally sourced value is wrapped in `sourced()`: the value plus
 * which source it came from, how confident we are, and which year/date it
 * describes (spec §44–§48, §63). `value: null` + "requires-verification"
 * is the honest state for anything not found on a checkable source —
 * never a guess (§48).
 *
 * Hierarchy (§3): Country → University → Campus → School → Program. Country
 * and region are denormalised onto the university for filtering; the DB
 * schema (src/lib/db/schema.ts) normalises them.
 */

export const Confidence = z.enum(["official", "high", "secondary", "estimated", "requires-verification"]);
export const SourceType = z.enum(["university", "government", "testing-org", "ranking-org", "secondary", "journalism"]);

export const SourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().url(),
  type: SourceType,
  retrievedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export function sourced<T extends z.ZodTypeAny>(value: T) {
  return z.object({
    value: value.nullable(),
    sourceId: z.string().nullable(),
    confidence: Confidence,
    asOf: z.string().nullable(), // academic year ("2026-27") or date the fact describes
    notes: z.string().optional(),
  });
}

export const MoneyRange = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  period: z.enum(["year", "semester", "month", "total", "credit"]),
});

export const TestPolicy = z.enum([
  "required",
  "optional",
  "recommended",
  "test-blind",
  "not-considered",
  "not-applicable",
]);

export const RequirementStatus = z.enum(["required", "recommended", "accepted", "not-accepted", "conditional"]);

export const SubjectRequirement = z.object({
  subject: z.string().min(1),
  level: z.string().nullable(), // "HL", "SL", "A-level", "AP", "Class XII"…
  minGrade: z.string().nullable(), // kept as string: "6", "A*", "85%"
  status: RequirementStatus,
  notes: z.string().optional(),
});

export const CurriculumRequirement = z.object({
  curriculum: z.enum(["IB", "A_LEVELS", "AP", "CBSE", "ISC", "STATE_BOARD", "US_HIGH_SCHOOL", "FRENCH_BAC", "EUROPEAN_BAC", "OTHER"]),
  accepted: z.boolean().nullable(),
  minimum: z.string().nullable(), // "38 points", "A*AA", "90% in best four"
  typical: z.string().nullable(), // only where the institution publishes a typical/competitive figure
  subjects: z.array(SubjectRequirement),
  sourceId: z.string().nullable(),
  confidence: Confidence,
  asOf: z.string().nullable(),
  notes: z.string().optional(),
});

export const EnglishRequirement = z.object({
  test: z.enum(["IELTS", "TOEFL_IBT", "DUOLINGO", "PTE", "CAMBRIDGE", "OTHER"]),
  minOverall: z.string().nullable(),
  minSection: z.string().nullable(),
  waiver: z.string().nullable(),
  sourceId: z.string().nullable(),
  confidence: Confidence,
});

export const TestRequirement = z.object({
  test: z.string().min(1), // "SAT", "ACT", "JEE Advanced", "UCAT", "LNAT", "TMUA"…
  policy: TestPolicy,
  typicalRange: z.string().nullable(), // only when published by the institution
  sourceId: z.string().nullable(),
  confidence: Confidence,
  notes: z.string().optional(),
});

export const Deadline = z.object({
  label: z.string().min(1), // "Early Action", "UCAS equal-consideration", "JoSAA registration"
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  intake: z.string(), // "Fall 2027"
  timezone: z.string().nullable(),
  sourceId: z.string().nullable(),
  confidence: Confidence,
});

export const ScholarshipEntry = z.object({
  name: z.string().min(1),
  kind: z.array(z.enum(["merit", "need", "international", "domestic", "full", "partial", "automatic", "competitive", "departmental", "external"])).min(1),
  eligibility: z.string().min(1),
  coverage: z.string().nullable(),
  deadline: z.string().nullable(),
  renewable: z.boolean().nullable(),
  url: z.string().url().nullable(),
  sourceId: z.string().nullable(),
  confidence: Confidence,
});

export const Opportunity = z.object({
  category: z.enum(["research", "entrepreneurship", "networking", "internships", "careers", "international", "student-life"]),
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().nullable(),
  sourceId: z.string().nullable(),
});

export const Ranking = z.object({
  org: z.enum(["QS", "THE", "US_NEWS", "ARWU", "NIRF", "OTHER"]),
  category: z.string().min(1), // "World University Rankings", "Subject: Economics & Econometrics"
  edition: z.number().int(), // the edition year as the publisher labels it, e.g. 2026
  rank: z.string().min(1), // string: "=25", "101-150"
  sourceId: z.string().nullable(),
});

export const Currency = z.enum(["INR", "USD", "GBP", "EUR", "CAD", "AUD", "SGD", "HKD", "CHF", "AED", "JPY", "KRW", "QAR"]);

/*
 * Detail sections (the depth students expect from portals like Shiksha),
 * held to the same rule: every figure names its source, year and confidence.
 */

/** Graduate outcomes as the publisher reports them — NIRF placement data, UK Graduate Outcomes, US College Scorecard, a university's own report. */
export const OutcomeRecord = z.object({
  cohort: z.string().min(1), // "UG 4-year programmes", "All bachelor's graduates", "BTech CSE"
  year: z.string().min(1), // graduating year or survey year as published: "2023-24"
  measure: z.string().min(1), // what the numbers mean, in the publisher's terms
  graduates: z.number().nullable(),
  placed: z.number().nullable(),
  higherStudies: z.number().nullable(),
  employmentRate: z.string().nullable(), // "94% in work or study 15 months after graduating"
  medianSalary: z.number().nullable(),
  averageSalary: z.number().nullable(),
  highestSalary: z.number().nullable(),
  currency: Currency,
  sourceId: z.string().nullable(),
  confidence: Confidence,
  notes: z.string().optional(),
});

/** Published opening/closing ranks or scores (e.g. JoSAA for IITs/IIITs/NITs). */
export const Cutoff = z.object({
  exam: z.string().min(1),
  program: z.string().min(1),
  category: z.string().min(1), // "OPEN · Gender-neutral"
  round: z.string().nullable(),
  year: z.number().int(),
  opening: z.string().nullable(),
  closing: z.string().min(1),
  sourceId: z.string().nullable(),
  confidence: Confidence,
  notes: z.string().optional(),
});

/** Applicants / admits as published (Common Data Set, UCAS, the university's own figures). Never a predicted chance. */
export const AdmissionStat = z.object({
  year: z.string().min(1),
  scope: z.string().min(1), // "First-year applicants, Class of 2029"
  applicants: z.number().nullable(),
  admitted: z.number().nullable(),
  enrolled: z.number().nullable(),
  acceptanceRate: z.string().nullable(),
  sourceId: z.string().nullable(),
  confidence: Confidence,
  notes: z.string().optional(),
});

export const FeeItem = z.object({
  item: z.string().min(1), // "Tuition", "Hostel", "Mess", "Student services fee"
  audience: z.enum(["domestic", "international", "all"]),
  amount: MoneyRange,
  currency: Currency,
  sourceId: z.string().nullable(),
  confidence: Confidence,
  asOf: z.string().nullable(),
  notes: z.string().optional(),
});

const NOT_VERIFIED = { value: null, sourceId: null, confidence: "requires-verification" as const, asOf: null };

export const DetailsSchema = z.object({
  campusAreaAcres: sourced(z.number()).default(NOT_VERIFIED),
  faculty: sourced(z.number()).default(NOT_VERIFIED),
  housing: sourced(z.string()).default(NOT_VERIFIED), // on-campus accommodation, as the university describes it
  address: z.string().nullable().default(null),
  schools: z.array(z.string()).default([]), // faculties / schools / departments as officially named
  schoolsSourceId: z.string().nullable().default(null),
  facilities: z.array(z.object({ name: z.string().min(1), description: z.string().nullable(), sourceId: z.string().nullable() })).default([]),
  admissionProcess: z.array(z.object({ step: z.string().min(1), detail: z.string().min(1), sourceId: z.string().nullable() })).default([]),
  admissionStats: z.array(AdmissionStat).default([]),
  cutoffs: z.array(Cutoff).default([]),
  feeBreakdown: z.array(FeeItem).default([]),
  outcomes: z.array(OutcomeRecord).default([]),
  recruiters: z
    .object({ names: z.array(z.string().min(1)).min(1), year: z.string().nullable(), sourceId: z.string().nullable(), confidence: Confidence })
    .nullable()
    .default(null),
  alumni: z.array(z.object({ name: z.string().min(1), note: z.string().min(1), sourceId: z.string().nullable() })).default([]),
});

export const CurriculumYear = z.object({
  year: z.number().int().min(1).max(7),
  courses: z.array(z.string().min(1)),
});

export const FieldKey = z.enum([
  "economics", "business", "finance", "computer-science", "engineering", "medicine", "law", "psychology",
  "mathematics", "physics", "biology", "chemistry", "political-science", "international-relations",
  "humanities", "architecture", "design", "media", "social-sciences", "environmental", "liberal-arts",
]);

export const ProgramSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  degree: z.string().min(1), // "BA", "BSc", "BTech", "BEng", "MBBS"…
  level: z.enum(["bachelors", "integrated", "masters"]),
  field: FieldKey,
  subfield: z.string().nullable(),
  school: z.string().nullable(),
  durationYears: z.number().positive().nullable(),
  url: z.string().url().nullable(),
  summary: z.string().min(1),
  curriculum: z.array(CurriculumYear), // actual course names, only from an official source
  curriculumSourceId: z.string().nullable(),
  requirements: z.array(CurriculumRequirement),
  tests: z.array(TestRequirement),
  english: z.array(EnglishRequirement), // empty → use university-level
  fees: sourced(MoneyRange).nullable(), // program-specific fees when they differ
});

export const UniversitySchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    officialName: z.string().min(1),
    country: z.string().min(1),
    countryCode: z.string().length(2),
    region: z.string().min(1),
    city: z.string().min(1),
    campuses: z.array(z.string()),
    control: z.enum(["public", "private", "public-private"]),
    category: z.enum(["research-university", "liberal-arts", "technical", "business-school", "specialist", "polytechnic", "institute-of-national-importance"]),
    founded: z.number().int().min(1000).max(2100),
    setting: z.enum(["urban", "suburban", "rural", "mixed"]).nullable(),
    languages: z.array(z.string()).min(1),
    website: z.string().url(),
    admissionsUrl: z.string().url().nullable(),
    financialAidUrl: z.string().url().nullable(),
    internationalUrl: z.string().url().nullable(),
    summary: z.string().min(1),
    stats: z.object({
      totalStudents: sourced(z.number()),
      undergraduates: sourced(z.number()),
      internationalShare: sourced(z.string()), // "27%" — string keeps the publisher's own precision
      studentFacultyRatio: sourced(z.string()),
    }),
    rankings: z.array(Ranking),
    applicationPlatform: sourced(z.string()),
    applicationFee: sourced(z.string()),
    testing: z.array(TestRequirement),
    english: z.array(EnglishRequirement),
    costs: z.object({
      currency: Currency,
      internationalTuition: sourced(MoneyRange),
      domesticTuition: sourced(MoneyRange),
      livingEstimate: sourced(MoneyRange),
    }),
    scholarships: z.array(ScholarshipEntry),
    deadlines: z.array(Deadline),
    opportunities: z.array(Opportunity),
    programs: z.array(ProgramSchema).min(1),
    details: DetailsSchema.default(DetailsSchema.parse({})),
    sources: z.array(SourceSchema).min(1),
    lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .superRefine((u, ctx) => {
    // Every sourceId anywhere in the record must resolve to a listed source.
    const ids = new Set(u.sources.map((s) => s.id));
    const walk = (node: unknown, path: (string | number)[]) => {
      if (Array.isArray(node)) node.forEach((n, i) => walk(n, [...path, i]));
      else if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          if ((k === "sourceId" || k === "curriculumSourceId" || k === "schoolsSourceId") && typeof v === "string" && !ids.has(v)) {
            ctx.addIssue({ code: "custom", path: [...path, k], message: `unknown sourceId "${v}"` });
          }
          walk(v, [...path, k]);
        }
      }
    };
    walk(u, []);
  });

export type Source = z.infer<typeof SourceSchema>;
export type University = z.infer<typeof UniversitySchema>;
export type Program = z.infer<typeof ProgramSchema>;
export type CurriculumReq = z.infer<typeof CurriculumRequirement>;
export type TestReq = z.infer<typeof TestRequirement>;
export type EnglishReq = z.infer<typeof EnglishRequirement>;
export type ScholarshipItem = z.infer<typeof ScholarshipEntry>;
export type OpportunityItem = z.infer<typeof Opportunity>;
export type RankingItem = z.infer<typeof Ranking>;
export type ConfidenceLevel = z.infer<typeof Confidence>;
export type Field = z.infer<typeof FieldKey>;
export type CurrencyCode = z.infer<typeof Currency>;
export type Details = z.infer<typeof DetailsSchema>;
export type Outcome = z.infer<typeof OutcomeRecord>;
export type CutoffItem = z.infer<typeof Cutoff>;
