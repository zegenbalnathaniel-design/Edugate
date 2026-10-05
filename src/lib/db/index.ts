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
const g = globalThis as unknown as { __edugateDb?: Promise<{ db: DB; mode: DbMode }> | null; __edugateDbReady?: boolean };

async function init() {
  const conn = await connect();
  if (conn.mode !== "postgres") {
    await migrateDb(conn.db, conn.mode);
    const { records, errors } = loadUniversityFiles();
    for (const e of errors) console.warn(`[edugate] skipped invalid university file — ${e}`);
    await seedUniversities(conn.db, records);
  }
  g.__edugateDbReady = true;
  return conn;
}

function ready() {
  g.__edugateDb ??= init().catch((e) => {
    g.__edugateDb = null;
    throw e;
  });
  return g.__edugateDb;
}

/** Start connecting (and, for the embedded database, migrating and seeding) without waiting for it. */
export function warmDb() {
  void ready().catch((e) => console.error("[edugate] database warm-up failed", e));
}

/**
 * True while an in-memory preview database is still starting. PGlite's WASM
 * start-up plus seeding takes several seconds on a cold start; read-only
 * catalogue pages serve the (identical) validated data files meanwhile.
 */
export function catalogueFromFiles(): boolean {
  const memory = !process.env.DATABASE_URL && (process.env.NODE_ENV === "production" || process.env.EDUGATE_DB === "memory");
  return memory && !g.__edugateDbReady;
}

/** Same answer as accountsAvailable(), without waiting for the database to start. */
export function accountsConfigured(): boolean {
  return !!process.env.DATABASE_URL || (process.env.NODE_ENV !== "production" && process.env.EDUGATE_DB !== "memory");
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
