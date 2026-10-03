import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { applications, architectProjects, savedSearches, studentProfiles, users } from "@/lib/db/schema";

/** Data export (§70): everything stored about the signed-in user, as JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Not signed in", { status: 401 });
  const db = await getDb();
  const [account] = await db
    .select({ email: users.email, name: users.name, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, user.id));
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, user.id));
  const tracker = await db.select().from(applications).where(eq(applications.userId, user.id));
  const searches = await db.select().from(savedSearches).where(eq(savedSearches.userId, user.id));
  const projects = await db.select().from(architectProjects).where(eq(architectProjects.userId, user.id));
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), account, profile: profile?.data ?? null, tracker, savedSearches: searches, passionProjects: projects }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="edugate-export.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
