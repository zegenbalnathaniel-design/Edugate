import { z } from "zod";
import { FieldKey } from "../unis/schema";

/*
 * Student profile (docs/07 §9). Every field is optional — a student shares
 * only what they choose (§70). Matching treats missing data as "unknown",
 * never as a pass or a fail.
 */

export const CURRICULA = ["IB", "A_LEVELS", "AP", "CBSE", "ISC", "STATE_BOARD", "US_HIGH_SCHOOL", "FRENCH_BAC", "EUROPEAN_BAC", "OTHER"] as const;
export const CURRICULUM_LABELS: Record<(typeof CURRICULA)[number], string> = {
  IB: "IB Diploma",
  A_LEVELS: "A-levels",
  AP: "AP (US)",
  CBSE: "CBSE",
  ISC: "ISC (CISCE)",
  STATE_BOARD: "Indian state board",
  US_HIGH_SCHOOL: "US high school diploma",
  FRENCH_BAC: "French Baccalauréat",
  EUROPEAN_BAC: "European Baccalaureate",
  OTHER: "Other",
};

export const WEIGHT_KEYS = ["academics", "cost", "research", "entrepreneurship", "location", "careers", "studentLife"] as const;
export const WEIGHT_LABELS: Record<(typeof WEIGHT_KEYS)[number], string> = {
  academics: "Academic fit",
  cost: "Cost",
  research: "Research",
  entrepreneurship: "Entrepreneurship",
  location: "Location",
  careers: "Careers & internships",
  studentLife: "Student life",
};

export const StudentSubject = z.object({
  name: z.string().min(1).max(80),
  level: z.string().max(20).nullable(), // "HL", "SL", "A-level", "Class XII"
  grade: z.string().max(10).nullable(), // "7", "A*", "92"
});

export const Extracurricular = z.object({
  activity: z.string().min(1).max(120),
  role: z.string().max(80).nullable(),
  years: z.number().min(0).max(8).nullable(),
  hoursPerWeek: z.number().min(0).max(80).nullable(),
  impact: z.string().max(400).nullable(),
});

export const StudentProfileSchema = z.object({
  citizenship: z.string().length(2).nullable().default(null),
  residence: z.string().length(2).nullable().default(null),
  curriculum: z.enum(CURRICULA).nullable().default(null),
  predictedTotal: z.string().max(20).nullable().default(null), // "38/45", "94%"
  subjects: z.array(StudentSubject).max(12).default([]),
  tests: z
    .object({
      SAT: z.number().int().min(400).max(1600).nullable().default(null),
      ACT: z.number().int().min(1).max(36).nullable().default(null),
      IELTS: z.number().min(0).max(9).nullable().default(null),
      TOEFL_IBT: z.number().int().min(0).max(120).nullable().default(null),
      DUOLINGO: z.number().int().min(10).max(160).nullable().default(null),
      // Indian entrance tests, as the student received them.
      JEE_MAIN: z.number().min(0).max(100).nullable().default(null), // NTA percentile
      JEE_ADV: z.number().int().min(1).max(500000).nullable().default(null), // Common Rank List (CRL) rank
      NEET: z.number().int().min(0).max(720).nullable().default(null), // score
      CUET: z.number().min(0).max(1000).nullable().default(null), // total normalised score across the papers taken
      CLAT: z.number().int().min(1).max(100000).nullable().default(null), // all-India rank
      IPMAT: z.number().min(0).max(500).nullable().default(null), // score
    })
    .default({ SAT: null, ACT: null, IELTS: null, TOEFL_IBT: null, DUOLINGO: null, JEE_MAIN: null, JEE_ADV: null, NEET: null, CUET: null, CLAT: null, IPMAT: null }),
  fields: z.array(FieldKey).max(5).default([]),
  careerInterests: z.string().max(300).nullable().default(null),
  countries: z.array(z.string().length(2)).max(15).default([]),
  budgetUsdPerYear: z.number().int().min(0).max(500000).nullable().default(null),
  budgetInrPerYear: z.number().int().min(0).max(50000000).nullable().default(null), // takes precedence over the US$ budget when set
  preferredStates: z.array(z.string().min(1).max(60)).max(36).default([]), // Indian states/UTs
  preferredCities: z.array(z.string().min(1).max(60)).max(20).default([]),
  weights: z
    .record(z.enum(WEIGHT_KEYS), z.number().int().min(0).max(100))
    .default({ academics: 25, cost: 20, research: 15, entrepreneurship: 10, location: 10, careers: 10, studentLife: 10 }),
  extracurriculars: z.array(Extracurricular).max(15).default([]),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export const EMPTY_PROFILE: StudentProfile = StudentProfileSchema.parse({});
