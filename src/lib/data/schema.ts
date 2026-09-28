import { z } from "zod";
import { SIGNAL_KEYS, AXIS_KEYS, FIELD_LABELS } from "@/lib/data/types";

/**
 * Zod schemas — the shared source of truth between fixture validation and
 * (later) onboarding form validation (docs/01-architecture.md → Stack).
 */

export const ProvenanceSchema = z.enum([
  "illustrative",
  "institution-supplied",
  "verified",
]);

export const SignalKeySchema = z.enum(SIGNAL_KEYS);
export const AxisKeySchema = z.enum(AXIS_KEYS);
export const FieldKeySchema = z.enum(
  Object.keys(FIELD_LABELS) as [string, ...string[]],
);

export const PassionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  signals: z.partialRecord(SignalKeySchema, z.number()),
  axes: z.partialRecord(AxisKeySchema, z.number()).optional(),
});

export const PassionQuestionSchema = z.object({
  id: z.string().min(1),
  stage: z.enum(["core", "probe", "depth"]),
  prompt: z.string().min(1),
  options: z.array(PassionOptionSchema).min(2),
  eligibility: z.custom<(s: unknown) => boolean>((v) => v === undefined || typeof v === "function").optional(),
  targets: z.array(SignalKeySchema).min(1),
});

export const ArchetypeSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  vector: z.partialRecord(SignalKeySchema, z.number()),
  description: z.string().min(1),
  pullsAttention: z.array(z.string()).min(1),
  howYouWork: z.array(z.string()).min(1),
  whatMotivates: z.array(z.string()).min(1),
  whatYouReturnTo: z.array(z.string()).min(1),
});

export const ProjectTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  rationale: z.string().min(1),
  requires: z.object({
    signals: z.array(SignalKeySchema).min(1),
    minNormalized: z.number().min(0).max(1),
  }),
  fields: z.array(FieldKeySchema).min(1),
  gradeRange: z.tuple([z.number(), z.number()]),
  difficulty: z.enum(["starter", "intermediate", "ambitious"]),
  estimatedHours: z.number().positive(),
  skills: z.array(z.string()).min(1),
  learningOutcomes: z.array(z.string()).min(1),
  firstStep: z.string().min(1),
  implementationPlan: z.array(
    z.object({
      title: z.string().min(1),
      goal: z.string().min(1),
      tasks: z.array(z.string().min(1)).min(1),
      durationDescriptor: z.string().min(1),
    }),
  ).min(1),
  deliverables: z.array(z.string().min(1)).min(1),
  portfolioValue: z.string().min(1),
});

/* ------------------------------------------------------------------ */
/* Education entities — closed fictional universe (D2)                 */
/* ------------------------------------------------------------------ */

export const MoneySchema = z.object({
  currency: z.enum(["INR", "USD", "GBP", "EUR"]),
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  period: z.enum(["year", "total", "semester"]),
}).refine((m) => m.max >= m.min, { message: "Money range max must be >= min" });

export const VerificationStateSchema = z.enum([
  "unverified",
  "pending",
  "verified",
  "needs_information",
  "rejected",
]);

export const VerificationRecordSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  provenance: ProvenanceSchema,
  institutionId: z.string().min(1),
  state: VerificationStateSchema,
  submittedAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  categories: z.array(
    z.object({
      key: z.enum(["academics", "programs", "fees", "admissions", "campus", "outcomes"]),
      state: VerificationStateSchema,
    }),
  ),
});

export const InstitutionSchema = z
  .object({
    id: z.string().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    provenance: ProvenanceSchema,
    slug: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(["university", "college", "school", "institute"]),
    location: z.object({ country: z.string().min(1), state: z.string().min(1), city: z.string().min(1) }),
    description: z.string().min(1),
    programs: z.array(z.string()),
    tuition: MoneySchema,
    scholarships: z.array(z.string()),
    admissions: z.object({
      selectivity: z.enum(["highly-selective", "selective", "moderate", "open"]),
      requirements: z.array(z.string()),
      deadlines: z.array(z.object({ label: z.string(), date: z.string() })),
    }),
    campus: z.object({
      setting: z.enum(["urban", "suburban", "rural"]),
      sizeDescriptor: z.string().min(1),
      housingAvailable: z.boolean(),
      notableFacilities: z.array(z.string()),
    }),
    studentExperience: z.object({
      classSizeDescriptor: z.string().min(1),
      clubs: z.array(z.string()),
      testimonialThemes: z.array(z.string()),
    }),
    outcomes: z.object({ narrativeSummary: z.string(), rangeDescriptor: z.string() }).optional(),
    media: z.array(z.object({ type: z.enum(["image", "video"]), url: z.string(), alt: z.string() })),
    verification: VerificationRecordSchema.nullable(),
  })
  // D2.2 / docs/03: "verified" provenance may only be set alongside a real
  // verification record — a fixture cannot claim verification it doesn't have.
  .refine(
    (inst) => inst.provenance !== "verified" || inst.verification !== null,
    { message: "provenance 'verified' requires a real verification record", path: ["verification"] },
  );

export const CurriculumRealitySchema = z.object({
  whatYouStudy: z.array(z.string()).min(1),
  theoryToPracticeRatio: z.number().min(0).max(1),
  assessmentTypes: z.array(z.string()).min(1),
  typicalProjects: z.array(z.string()).min(1),
  workloadDescriptor: z.enum(["light", "moderate", "heavy", "intensive"]),
  skillsDeveloped: z.array(z.string()).min(1),
});

export const CourseSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  provenance: ProvenanceSchema,
  slug: z.string().min(1),
  name: z.string().min(1),
  degree: z.enum(["diploma", "bachelors", "integrated", "masters", "doctoral"]),
  field: FieldKeySchema,
  durationMonths: z.number().positive(),
  subjects: z.array(z.string()).min(1),
  institutions: z.array(z.string()).min(1),
  requirements: z.array(z.object({
    type: z.enum(["academic", "language", "portfolio", "interview"]),
    description: z.string().min(1),
  })),
  fees: MoneySchema,
  careerPathways: z.array(z.string()),
  scholarships: z.array(z.string()),
  deadlines: z.array(z.object({ label: z.string(), date: z.string() })),
  curriculumReality: CurriculumRealitySchema,
});

export const CareerSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  provenance: ProvenanceSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(FieldKeySchema).min(1),
  skills: z.array(z.string()).min(1),
  degrees: z.array(z.string()),
  relatedCourses: z.array(z.string()),
  relatedInstitutions: z.array(z.string()),
  relatedProjects: z.array(z.string()),
  workStyle: z.partialRecord(AxisKeySchema, z.number()),
});

export const ScholarshipSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  provenance: ProvenanceSchema,
  slug: z.string().min(1),
  name: z.string().min(1),
  provider: z.string().min(1),
  eligibility: z.object({
    description: z.string().min(1),
    curriculum: z.array(z.string()).optional(),
    fields: z.array(FieldKeySchema).optional(),
    countries: z.array(z.string()).optional(),
  }),
  coverage: z.object({
    type: z.enum(["full", "partial", "fixed-amount"]),
    amount: MoneySchema.optional(),
  }),
  deadline: z.string(),
  applicationProcess: z.array(z.object({ order: z.number(), label: z.string(), description: z.string() })),
  basis: z.array(z.enum(["merit", "need", "field", "demographic"])).min(1),
});
