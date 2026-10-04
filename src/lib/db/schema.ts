import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Program, University } from "../unis/schema";
import type { StudentProfile } from "../profile/schema";
import type { SavedProject } from "../architect/schemas";

/*
 * Catalogue: the full sourced record lives in `data` (validated JSONB, keeps
 * every value's source/date/confidence). The other columns are extracted
 * from it on every write purely so filters can use indexes
 * (docs/07-college-engine.md §3–4).
 */
export const universities = pgTable(
  "universities",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    country: text("country").notNull(),
    countryCode: text("country_code").notNull(),
    region: text("region").notNull(),
    city: text("city").notNull(),
    control: text("control").notNull(),
    category: text("category").notNull(),
    qsRank: integer("qs_rank"), // numeric lower bound of the published band, for sorting/filtering
    qsEdition: integer("qs_edition"),
    fields: text("fields").array().notNull().default(sql`'{}'::text[]`),
    curricula: text("curricula").array().notNull().default(sql`'{}'::text[]`),
    satPolicy: text("sat_policy"),
    intlTuitionUsdMin: numeric("intl_tuition_usd_min", { mode: "number" }),
    // Course-explorer columns (docs/09): Indian structure, degrees, admissions and cost for an Indian student.
    hub: text("hub"),
    institutionType: text("institution_type"),
    degrees: text("degrees").array().notNull().default(sql`'{}'::text[]`),
    admissionBases: text("admission_bases").array().notNull().default(sql`'{}'::text[]`),
    tests: text("tests").array().notNull().default(sql`'{}'::text[]`),
    costInrMin: numeric("cost_inr_min", { mode: "number" }),
    selectivity: text("selectivity"),
    dataHash: text("data_hash"),
    data: jsonb("data").$type<University>().notNull(),
    lastVerified: date("last_verified").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("universities_slug_idx").on(t.slug),
    index("universities_country_idx").on(t.countryCode),
    index("universities_qs_idx").on(t.qsRank),
    index("universities_region_idx").on(t.countryCode, t.region, t.hub),
  ],
);

export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    universityId: integer("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    field: text("field").notNull(),
    level: text("level").notNull(),
    degree: text("degree").notNull(),
    subjects: text("subjects").array().notNull().default(sql`'{}'::text[]`),
    degreeNorm: text("degree_norm"),
    costInr: numeric("cost_inr", { mode: "number" }),
    admissionBases: text("admission_bases").array().notNull().default(sql`'{}'::text[]`),
    tests: text("tests").array().notNull().default(sql`'{}'::text[]`),
    data: jsonb("data").$type<Program>().notNull(),
  },
  (t) => [
    uniqueIndex("programs_uni_slug_idx").on(t.universityId, t.slug),
    index("programs_field_idx").on(t.field),
    index("programs_subjects_idx").using("gin", t.subjects),
  ],
);

/* ---------------------------- accounts ---------------------------- */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256(token) — the raw token only ever lives in the cookie
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const studentProfiles = pgTable("student_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<StudentProfile>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const APPLICATION_STATUSES = [
  "researching",
  "considering",
  "preparing",
  "ready",
  "submitted",
  "interview",
  "decision",
  "accepted",
  "waitlisted",
  "rejected",
] as const;

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    universityId: integer("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    programId: integer("program_id").references(() => programs.id, { onDelete: "set null" }),
    status: text("status", { enum: APPLICATION_STATUSES }).notNull().default("researching"),
    checklist: jsonb("checklist").$type<Record<string, "done" | "in-progress" | "todo">>().notNull().default({}),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("applications_user_uni_prog_idx").on(t.userId, t.universityId, t.programId)],
);

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  query: text("query").notNull(), // the URL query string — filters live in the URL
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------- data integrity ------------------------- */

export const dataReports = pgTable("data_reports", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id")
    .notNull()
    .references(() => universities.id, { onDelete: "cascade" }),
  programSlug: text("program_slug"),
  fieldLabel: text("field_label").notNull(),
  message: text("message").notNull(),
  reporterId: text("reporter_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status", { enum: ["open", "accepted", "dismissed"] }).notNull().default("open"),
  resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").references(() => universities.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action", { enum: ["edit", "verify", "seed", "report-accepted", "report-dismissed"] }).notNull(),
  summary: text("summary").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------------- Passion Project Architect ---------------------- */

// Each AI step costs real money, so usage is metered per user per day.
export const architectUsage = pgTable(
  "architect_usage",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    step: text("step").notNull(),
    units: integer("units").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("architect_usage_user_time_idx").on(t.userId, t.createdAt)],
);

export const architectProjects = pgTable(
  "architect_projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    data: jsonb("data").$type<SavedProject>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("architect_projects_user_idx").on(t.userId)],
);
