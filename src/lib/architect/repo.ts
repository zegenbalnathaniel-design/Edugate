import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, gt, sum } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { architectProjects, architectUsage } from "@/lib/db/schema";
import type { SavedProject } from "./schemas";

/*
 * Metering. Steps are weighted by roughly how much model output they need,
 * so the daily allowance maps to "about two full blueprints a day" whatever
 * mix of steps a student uses. ARCHITECT_DAILY_UNITS overrides the default.
 */
export const STEP_UNITS = { interview: 1, ideate: 4, research: 3, blueprint: 5 } as const;
export type Step = keyof typeof STEP_UNITS;

export const dailyAllowance = () => {
  const n = Number(process.env.ARCHITECT_DAILY_UNITS);
  return Number.isFinite(n) && n > 0 ? n : 60;
};

export async function unitsUsedToday(userId: string) {
  const db = await getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({ used: sum(architectUsage.units) })
    .from(architectUsage)
    .where(and(eq(architectUsage.userId, userId), gt(architectUsage.createdAt, since)));
  return Number(row?.used ?? 0);
}

/** Reserve units before calling the model; returns null when the allowance is spent. */
export async function reserve(userId: string, step: Step): Promise<{ id: number } | null> {
  const units = STEP_UNITS[step];
  if ((await unitsUsedToday(userId)) + units > dailyAllowance()) return null;
  const db = await getDb();
  const [row] = await db.insert(architectUsage).values({ userId, step, units }).returning({ id: architectUsage.id });
  return row;
}

/** Give units back when the call failed for reasons that aren't the student's doing. */
export async function refund(id: number) {
  const db = await getDb();
  await db.delete(architectUsage).where(eq(architectUsage.id, id));
}

export async function saveProject(userId: string, project: SavedProject) {
  const db = await getDb();
  const id = randomBytes(9).toString("base64url");
  await db.insert(architectProjects).values({ id, userId, title: project.title, data: project });
  return id;
}

export async function listProjects(userId: string) {
  const db = await getDb();
  return db
    .select({ id: architectProjects.id, title: architectProjects.title, createdAt: architectProjects.createdAt })
    .from(architectProjects)
    .where(eq(architectProjects.userId, userId))
    .orderBy(desc(architectProjects.createdAt));
}

export async function getProject(userId: string, id: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(architectProjects)
    .where(and(eq(architectProjects.id, id), eq(architectProjects.userId, userId)));
  return row ?? null;
}

export async function deleteProject(userId: string, id: string) {
  const db = await getDb();
  await db.delete(architectProjects).where(and(eq(architectProjects.id, id), eq(architectProjects.userId, userId)));
}
