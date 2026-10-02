import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { applications, dataReports, programs, studentProfiles, universities, users } from "@/lib/db/schema";
import { EMPTY_PROFILE, StudentProfileSchema, type StudentProfile } from "@/lib/profile/schema";
import type { Program, University } from "@/lib/unis/schema";
import { isPast } from "@/lib/unis/freshness";

export async function getProfile(userId: string): Promise<StudentProfile> {
  const db = await getDb();
  const [row] = await db.select({ data: studentProfiles.data }).from(studentProfiles).where(eq(studentProfiles.userId, userId));
  const parsed = StudentProfileSchema.safeParse(row?.data ?? {});
  return parsed.success ? parsed.data : EMPTY_PROFILE;
}

/* ------------------------------ tracker ------------------------------ */

export type ChecklistItem = { key: string; label: string; detail?: string; due?: string };

/** §39: derived only from what the university/program actually publishes. */
export function checklistFor(u: University, p: Program | null): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const reqs = p?.requirements ?? [];
  for (const r of reqs.filter((r) => r.accepted !== false)) {
    items.push({ key: `req:${r.curriculum}`, label: `Meet ${r.curriculum.replace("_", " ")} entry requirements`, detail: [r.minimum, ...r.subjects.filter((s) => s.status === "required").map((s) => `${s.subject}${s.level ? ` ${s.level}` : ""}${s.minGrade ? ` ≥ ${s.minGrade}` : ""}`)].filter(Boolean).join(" · ") || undefined });
  }
  for (const t of [...(p?.tests ?? []), ...u.testing].filter((t) => t.policy === "required")) {
    if (!items.some((i) => i.key === `test:${t.test}`)) items.push({ key: `test:${t.test}`, label: `Take ${t.test}`, detail: t.notes });
  }
  const english = p?.english.length ? p.english : u.english;
  if (english.length) items.push({ key: "english", label: "English proficiency score", detail: english.map((e) => `${e.test.replace("_IBT", " iBT")}${e.minOverall ? ` ≥ ${e.minOverall}` : ""}`).join(" / ") });
  if (u.applicationPlatform.value) items.push({ key: "platform", label: `Apply via ${u.applicationPlatform.value}`, detail: u.applicationFee.value ? `Fee: ${u.applicationFee.value}` : undefined });
  for (const d of u.deadlines) items.push({ key: `deadline:${d.label}`, label: d.label, detail: d.intake, due: d.date });
  for (const s of u.scholarships.filter((s) => s.deadline)) items.push({ key: `scholarship:${s.name}`, label: `Scholarship: ${s.name}`, due: s.deadline ?? undefined });
  items.push({ key: "documents", label: "Transcripts / school report", detail: "Common to most applications — confirm the exact documents on the university's site" });
  return items;
}

export type TrackerEntry = {
  id: number;
  status: (typeof applications.$inferSelect)["status"];
  checklist: Record<string, "done" | "in-progress" | "todo">;
  notes: string | null;
  university: University;
  program: Program | null;
  items: ChecklistItem[];
  nextDeadline: { label: string; date: string } | null;
};

export async function listTracker(userId: string): Promise<TrackerEntry[]> {
  const db = await getDb();
  const rows = await db
    .select({ a: applications, u: universities.data, p: programs.data })
    .from(applications)
    .innerJoin(universities, eq(universities.id, applications.universityId))
    .leftJoin(programs, eq(programs.id, applications.programId))
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt));
  return rows.map(({ a, u, p }) => {
    const items = checklistFor(u, p);
    const upcoming = items.filter((i) => i.due && !isPast(i.due)).sort((x, y) => x.due!.localeCompare(y.due!))[0];
    return { id: a.id, status: a.status, checklist: a.checklist, notes: a.notes, university: u, program: p, items, nextDeadline: upcoming ? { label: upcoming.label, date: upcoming.due! } : null };
  });
}

export async function trackedSlugs(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .select({ slug: universities.slug, program: programs.slug })
    .from(applications)
    .innerJoin(universities, eq(universities.id, applications.universityId))
    .leftJoin(programs, eq(programs.id, applications.programId))
    .where(eq(applications.userId, userId));
  return new Set(rows.map((r) => `${r.slug}/${r.program ?? ""}`));
}

/* ------------------------------ reports ------------------------------ */

export async function listReports(status: "open" | "accepted" | "dismissed" = "open") {
  const db = await getDb();
  return db
    .select({ r: dataReports, uniName: universities.name, uniSlug: universities.slug, reporter: users.email })
    .from(dataReports)
    .innerJoin(universities, eq(universities.id, dataReports.universityId))
    .leftJoin(users, eq(users.id, dataReports.reporterId))
    .where(eq(dataReports.status, status))
    .orderBy(desc(dataReports.createdAt));
}

export async function programId(universityId: number, slug: string | null) {
  if (!slug) return null;
  const db = await getDb();
  const [row] = await db.select({ id: programs.id }).from(programs).where(and(eq(programs.universityId, universityId), eq(programs.slug, slug)));
  return row?.id ?? null;
}
