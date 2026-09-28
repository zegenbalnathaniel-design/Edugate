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

export interface Institution extends Entity {
  slug: string;
  name: string;
  type: "university" | "college" | "school" | "institute";
  location: { country: string; state: string; city: string };
  description: string;
  programs: ID[];
  tuition: Money;
  scholarshipCount: number;
  /** Null when genuinely not verified — dates are never fabricated (§22). */
  verification: VerificationRecord | null;
}

export interface Course extends Entity {
  slug: string;
  name: string;
  degree: DegreeLevel;
  field: FieldKey;
  durationMonths: number;
  subjects: string[];
  institutions: ID[];
}

export interface Career extends Entity {
  slug: string;
  title: string;
  description: string;
  fields: FieldKey[];
  skills: string[];
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
