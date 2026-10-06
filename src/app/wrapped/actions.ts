"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";
import { StudentProfileSchema } from "@/lib/profile/schema";
import { allUniversities, getUniversityId } from "@/lib/unis/repo";
import { FieldKey } from "@/lib/unis/schema";
import { computeWrapped, toStudentProfile, type WrappedResult } from "@/lib/wrapped/match";
import { BUDGET_MAX_INR, buildProfile } from "@/lib/wrapped/profile";
import { getProfile, programId } from "@/lib/user/repo";
import { and, eq, isNull } from "drizzle-orm";
import { applications } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

/* University Wrapped server actions (docs/10). Answers are the only input; nothing is stored unless the student asks. */

const AnswersSchema = z.record(z.string().max(40), z.union([z.string().max(40), z.array(z.string().max(100)).max(40), z.number().min(0).max(10)])).refine((a) => Object.keys(a).length <= 80);

export async function runWrapped(raw: unknown): Promise<WrappedResult | { error: string }> {
  const parsed = AnswersSchema.safeParse(raw);
  if (!parsed.success) return { error: "Those answers didn't look right — try again." };
  return computeWrapped(parsed.data, (await allUniversities()).map((r) => r.data));
}

const PicksSchema = z.array(z.object({ university: z.string().max(120), program: z.string().max(160).nullable() })).max(20);

/** "Build my university list": adds the chosen mix to the application tracker. */
export async function buildMyList(form: FormData) {
  const back = String(form.get("back") ?? "/wrapped");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back.startsWith("/wrapped") ? back : "/wrapped")}`);
  const picks = PicksSchema.safeParse(JSON.parse(String(form.get("picks") ?? "[]")));
  if (!picks.success) redirect("/wrapped");
  const db = await getDb();
  for (const pk of picks.data) {
    const uid = await getUniversityId(pk.university);
    if (!uid) continue;
    const pid = await programId(uid, pk.program);
    const [exists] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.userId, user.id), eq(applications.universityId, uid), pid ? eq(applications.programId, pid) : isNull(applications.programId)));
    if (!exists) await db.insert(applications).values({ userId: user.id, universityId: uid, programId: pid });
  }
  revalidatePath("/tracker");
  redirect("/tracker");
}

/** Copies what the quiz learned into the student's profile, so Discover and course pages use it too. */
export async function saveWrappedToProfile(form: FormData) {
  const back = String(form.get("back") ?? "/wrapped");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back.startsWith("/wrapped") ? back : "/wrapped")}`);
  const answers = AnswersSchema.safeParse(JSON.parse(String(form.get("answers") ?? "{}")));
  if (!answers.success) redirect("/wrapped");
  const p = buildProfile(answers.data);
  const sp = toStudentProfile(p);
  const current = await getProfile(user.id);
  const max = p.facts.budget ? BUDGET_MAX_INR[p.facts.budget] : null;
  const next = StudentProfileSchema.parse({
    ...current,
    curriculum: sp.curriculum ?? current.curriculum,
    predictedTotal: sp.predictedTotal ?? current.predictedTotal,
    subjects: current.subjects.length ? current.subjects : sp.subjects,
    fields: p.subjects.map((s) => s.key).filter((k) => FieldKey.safeParse(k).success).slice(0, 5),
    budgetInrPerYear: max != null && Number.isFinite(max) ? max : current.budgetInrPerYear,
    preferredStates: p.facts.distance === "state" || p.facts.distance === "city" ? ["Tamil Nadu"] : current.preferredStates,
  });
  const db = await getDb();
  await db
    .insert(studentProfiles)
    .values({ userId: user.id, data: next })
    .onConflictDoUpdate({ target: studentProfiles.userId, set: { data: next, updatedAt: new Date() } });
  revalidatePath("/discover");
  redirect("/profile?saved=wrapped");
}
