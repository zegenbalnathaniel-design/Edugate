/**
 * Migrate + seed a real Postgres (Neon). Runs in `npm run build`; a no-op when
 * DATABASE_URL isn't set (embedded PGlite seeds itself at runtime instead).
 *   npx vite-node scripts/db-setup.ts
 */
import { connect, migrateDb } from "../src/lib/db/core";
import { loadUniversityFiles, seedUniversities } from "../src/lib/db/seed";

async function main() {
  if (!process.env.DATABASE_URL && process.env.EDUGATE_DB !== "disk") {
    console.log("[db-setup] DATABASE_URL not set — skipping (embedded database seeds at runtime).");
    return;
  }
  const { db, mode } = await connect();
  await migrateDb(db, mode);
  const { records, errors } = loadUniversityFiles();
  errors.forEach((e) => console.warn(`[db-setup] skipped invalid file — ${e}`));
  const changed = await seedUniversities(db, records);
  console.log(`[db-setup] ${mode}: ${records.length} universities valid, ${changed} inserted/updated.`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
