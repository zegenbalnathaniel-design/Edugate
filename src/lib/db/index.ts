import "server-only";
import { connect, migrateDb, type DB, type DbMode } from "./core";
import { loadUniversityFiles, seedUniversities } from "./seed";

/*
 * The single entry point server code uses. Embedded databases migrate and
 * seed themselves on first use; a real Postgres is migrated/seeded at build
 * time by scripts/db-setup.ts.
 */

// One instance per process, shared across Next's separate server bundles
// (pages, server actions and route handlers each get their own module graph,
// so a module-level variable would open a second embedded database).
const g = globalThis as unknown as { __edugateDb?: Promise<{ db: DB; mode: DbMode }> | null };

async function init() {
  const conn = await connect();
  if (conn.mode !== "postgres") {
    await migrateDb(conn.db, conn.mode);
    const { records, errors } = loadUniversityFiles();
    for (const e of errors) console.warn(`[edugate] skipped invalid university file — ${e}`);
    await seedUniversities(conn.db, records);
  }
  return conn;
}

function ready() {
  g.__edugateDb ??= init().catch((e) => {
    g.__edugateDb = null;
    throw e;
  });
  return g.__edugateDb;
}

export async function getDb(): Promise<DB> {
  return (await ready()).db;
}

export async function getDbMode(): Promise<DbMode> {
  return (await ready()).mode;
}

/**
 * Serverless functions don't share memory, so on a deployment with no
 * DATABASE_URL an in-memory database can't hold accounts consistently.
 * Accounts are only offered when they will actually persist.
 */
export async function accountsAvailable(): Promise<boolean> {
  return (await getDbMode()) !== "embedded-memory";
}

export type { DB };
