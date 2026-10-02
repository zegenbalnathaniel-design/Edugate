"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { accountsAvailable, getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, getCurrentUser, isAdminEmail } from "./session";

export type AuthState = { error?: string; fields?: { email?: string; name?: string } } | undefined;

const Email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);
const Password = z.string().min(10, "Use at least 10 characters.").max(200);

/** Only same-site relative paths — never an open redirect. */
function safeNext(raw: FormDataEntryValue | null) {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/account";
}

const UNAVAILABLE = "Accounts aren't available on this preview yet — no permanent database is connected.";

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!(await accountsAvailable())) return { error: UNAVAILABLE };
  const parsed = z
    .object({ email: Email, password: Password, name: z.string().trim().max(80).optional() })
    .safeParse({ email: form.get("email"), password: form.get("password"), name: form.get("name") || undefined });
  const fields = { email: String(form.get("email") ?? ""), name: String(form.get("name") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  const db = await getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email));
  if (existing) return { error: "An account with that email already exists. Sign in instead.", fields };

  const id = randomUUID();
  await db.insert(users).values({
    id,
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    passwordHash: await hashPassword(parsed.data.password),
    role: isAdminEmail(parsed.data.email) ? "admin" : "student",
  });
  await createSession(id);
  redirect(safeNext(form.get("next")) === "/account" ? "/profile" : safeNext(form.get("next")));
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!(await accountsAvailable())) return { error: UNAVAILABLE };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Same message either way: don't reveal which emails have accounts.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match.", fields: { email } };
  }
  await createSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function deleteAccount(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (form.get("confirm") !== "DELETE") redirect("/account?delete=confirm");
  const db = await getDb();
  // Sessions, profile, tracker rows and saved searches cascade with the user.
  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  redirect("/?account=deleted");
}
