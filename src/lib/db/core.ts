import { join } from "node:path";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

/*
 * Connection + migrations, usable from Next.js *and* plain scripts (so no
 * `server-only` here — that lives in ./index.ts).
 *
 *  DATABASE_URL set   → Neon serverless (production)
 *  otherwise          → embedded PGlite: on disk at .pglite in development,
 *                       in memory in production ("preview mode" — catalogue
 *                       reseeded on cold start, user data may reset).
 */

export type DB = PgliteDatabase<typeof schema>;
export type DbMode = "postgres" | "embedded-disk" | "embedded-memory";

export const MIGRATIONS = join(process.cwd(), "drizzle");

export async function connect(): Promise<{ db: DB; mode: DbMode }> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    // The query-builder surface we use is identical across drivers.
    return { db: drizzle(neon(url), { schema }) as unknown as DB, mode: "postgres" };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const inMemory = process.env.NODE_ENV === "production" || process.env.EDUGATE_DB === "memory";
  const client = inMemory ? new PGlite() : new PGlite(join(process.cwd(), ".pglite"));
  return { db: drizzle(client, { schema }), mode: inMemory ? "embedded-memory" : "embedded-disk" };
}

export async function migrateDb(db: DB, mode: DbMode) {
  if (mode === "postgres") {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: MIGRATIONS });
  } else {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db, { migrationsFolder: MIGRATIONS });
  }
}
