import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

/*
 * Database sessions (Next.js authentication guide → Database Sessions).
 * The cookie holds a random 256-bit token; the DB stores only its SHA-256,
 * so a leaked sessions table can't be replayed. No signing secret needed.
 */

const COOKIE = "edugate_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export type SessionUser = { id: string; email: string; name: string | null; role: "student" | "admin" };

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS);
  const db = await getDb();
  await db.insert(sessions).values({ id: digest(token), userId, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.id, digest(token)));
  }
  store.delete(COOKIE);
}

/** Memoised per request (React `cache`), so pages can call it freely. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, digest(token)), gt(sessions.expiresAt, new Date())));
  return row ?? null;
});

export async function requireUser(next = "/account"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") notFound();
  return user;
}

/** Comma-separated ADMIN_EMAILS env var decides who is created as admin. */
export function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}
