import { z } from "zod";
import { SIGNAL_KEYS, AXIS_KEYS, FIELD_LABELS } from "@/lib/data/types";

/**
 * Zod schemas — the shared source of truth between fixture validation and
 * (later) onboarding form validation (docs/01-architecture.md → Stack).
 * Scoped here to what Stage 1 actually introduces: the Passion domain.
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
  portfolioValue: z.string().min(1),
});
