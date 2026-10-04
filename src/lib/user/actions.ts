"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { applications, APPLICATION_STATUSES, auditLog, dataReports, savedSearches, studentProfiles, universities } from "@/lib/db/schema";
import { upsertUniversity } from "@/lib/db/seed";
import { getCurrentUser, requireAdmin, requireUser } from "@/lib/auth/session";
import { CURRICULA, StudentProfileSchema, WEIGHT_KEYS } from "@/lib/profile/schema";
import { FieldKey, UniversitySchema } from "@/lib/unis/schema";
import { getUniversityId } from "@/lib/unis/repo";
import { programId } from "./repo";

/* ------------------------------ profile ------------------------------ */

export type ProfileState = { ok?: boolean; error?: string } | undefined;

const num = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? null : Number(v));
const str = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? null : String(v).trim());

export async function saveProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireUser("/profile");
  const subjects = form.getAll("subject.name").map((name, i) => ({
    name: String(name).trim(),
    level: str(form.getAll("subject.level")[i] ?? null),
    grade: str(form.getAll("subject.grade")[i] ?? null),
  })).filter((s) => s.name);
  const curriculum = str(form.get("curriculum"));
  const candidate = {
    citizenship: str(form.get("citizenship"))?.toUpperCase() ?? null,
    residence: str(form.get("residence"))?.toUpperCase() ?? null,
    curriculum: curriculum && (CURRICULA as readonly string[]).includes(curriculum) ? curriculum : null,
    predictedTotal: str(form.get("predictedTotal")),
    subjects,
    tests: Object.fromEntries(["SAT", "ACT", "IELTS", "TOEFL_IBT", "DUOLINGO", "JEE_MAIN", "JEE_ADV", "NEET", "CUET", "CLAT", "IPMAT"].map((k) => [k, num(form.get(k))])),
    fields: form.getAll("fields").map(String).filter((f) => (FieldKey.options as readonly string[]).includes(f)),
    careerInterests: str(form.get("careerInterests")),
    countries: form.getAll("countries").map(String),
    budgetUsdPerYear: num(form.get("budgetUsdPerYear")),
    budgetInrPerYear: num(form.get("budgetInrPerYear")),
    preferredStates: form.getAll("preferredStates").map(String),
    preferredCities: form.getAll("preferredCities").map(String),
    weights: Object.fromEntries(WEIGHT_KEYS.map((k) => [k, Number(form.get(`w.${k}`) ?? 0)])),
  };
  const parsed = StudentProfileSchema.safeParse(candidate);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { error: `${i.path.join(" › ") || "Profile"}: ${i.message}` };
  }
  const db = await getDb();
  await db
    .insert(studentProfiles)
    .values({ userId: user.id, data: parsed.data })
    .onConflictDoUpdate({ target: studentProfiles.userId, set: { data: parsed.data, updatedAt: new Date() } });
  revalidatePath("/discover");
  return { ok: true };
}

/* ------------------------------ tracker ------------------------------ */

export async function trackUniversity(form: FormData) {
  const slug = String(form.get("university") ?? "");
  const programSlug = str(form.get("program"));
  const back = String(form.get("back") ?? "/tracker");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  const uid = await getUniversityId(slug);
  if (!uid) return;
  const pid = await programId(uid, programSlug);
  const db = await getDb();
  const [exists] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.userId, user.id), eq(applications.universityId, uid), pid ? eq(applications.programId, pid) : isNull(applications.programId)));
  if (!exists) await db.insert(applications).values({ userId: user.id, universityId: uid, programId: pid });
  revalidatePath(back);
  revalidatePath("/tracker");
}

export async function updateTracker(form: FormData) {
  const user = await requireUser("/tracker");
  const id = Number(form.get("id"));
  const db = await getDb();
  const [row] = await db.select().from(applications).where(and(eq(applications.id, id), eq(applications.userId, user.id)));
  if (!row) return;
  if (form.get("remove")) {
    await db.delete(applications).where(eq(applications.id, id));
  } else {
    const status = String(form.get("status") ?? row.status);
    const item = str(form.get("item"));
    const itemState = str(form.get("itemState"));
    const checklist = { ...row.checklist };
    if (item && (itemState === "done" || itemState === "in-progress" || itemState === "todo")) checklist[item] = itemState;
    await db
      .update(applications)
      .set({
        status: (APPLICATION_STATUSES as readonly string[]).includes(status) ? (status as typeof row.status) : row.status,
        checklist,
        notes: form.has("notes") ? (str(form.get("notes"))?.slice(0, 2000) ?? null) : row.notes,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id));
  }
  revalidatePath("/tracker");
}

/* --------------------------- saved searches -------------------------- */

export async function saveSearch(form: FormData) {
  const query = String(form.get("query") ?? "").slice(0, 1000);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/universities?${query}`)}`);
  const name = str(form.get("name"))?.slice(0, 80) ?? "Saved search";
  const db = await getDb();
  await db.insert(savedSearches).values({ userId: user.id, name, query });
  revalidatePath("/universities");
}

export async function deleteSearch(form: FormData) {
  const user = await requireUser("/universities");
  const db = await getDb();
  await db.delete(savedSearches).where(and(eq(savedSearches.id, Number(form.get("id"))), eq(savedSearches.userId, user.id)));
  revalidatePath("/universities");
}

/* ------------------------------ reports ------------------------------ */

export type ReportState = { ok?: boolean; error?: string } | undefined;

export async function reportOutdated(_prev: ReportState, form: FormData): Promise<ReportState> {
  const parsed = z
    .object({ university: z.string().min(1), program: z.string().nullable(), field: z.string().min(1).max(120), message: z.string().trim().min(10, "Tell us what looks wrong (10+ characters).").max(1000) })
    .safeParse({ university: form.get("university"), program: str(form.get("program")), field: form.get("field"), message: form.get("message") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const uid = await getUniversityId(parsed.data.university);
  if (!uid) return { error: "Unknown university." };
  const user = await getCurrentUser();
  const db = await getDb();
  // Reports never touch the data itself — an admin reviews them (§69).
  await db.insert(dataReports).values({ universityId: uid, programSlug: parsed.data.program, fieldLabel: parsed.data.field, message: parsed.data.message, reporterId: user?.id ?? null });
  return { ok: true };
}

/* ------------------------------- admin ------------------------------- */

export async function resolveReport(form: FormData) {
  const admin = await requireAdmin();
  const id = Number(form.get("id"));
  const status = form.get("status") === "accepted" ? "accepted" : "dismissed";
  const db = await getDb();
  const [r] = await db.update(dataReports).set({ status, resolvedBy: admin.id, resolvedAt: new Date() }).where(eq(dataReports.id, id)).returning();
  if (r) await db.insert(auditLog).values({ universityId: r.universityId, userId: admin.id, action: status === "accepted" ? "report-accepted" : "report-dismissed", summary: `Report on "${r.fieldLabel}": ${status}` });
  revalidatePath("/admin");
}

export type EditState = { ok?: boolean; errors?: string[] } | undefined;

export async function saveUniversityRecord(_prev: EditState, form: FormData): Promise<EditState> {
  const admin = await requireAdmin();
  let json: unknown;
  try {
    json = JSON.parse(String(form.get("json") ?? ""));
  } catch (e) {
    return { errors: [`Invalid JSON: ${(e as Error).message}`] };
  }
  const verify = form.get("verify") === "on";
  if (verify && json && typeof json === "object") (json as { lastVerified: string }).lastVerified = new Date().toISOString().slice(0, 10);
  const parsed = UniversitySchema.safeParse(json);
  if (!parsed.success) return { errors: parsed.error.issues.slice(0, 15).map((i) => `${i.path.join(".")}: ${i.message}`) };
  if (parsed.data.slug !== String(form.get("slug"))) return { errors: ["The slug can't be changed here."] };
  await upsertUniversity(await getDb(), parsed.data, { force: true, userId: admin.id, action: verify ? "verify" : "edit" });
  revalidatePath(`/universities/${parsed.data.slug}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminUniversityJson(slug: string) {
  await requireAdmin();
  const db = await getDb();
  const [row] = await db.select({ data: universities.data }).from(universities).where(eq(universities.slug, slug));
  return row ? JSON.stringify(row.data, null, 2) : null;
}
