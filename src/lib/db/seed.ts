import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { and, eq, notInArray } from "drizzle-orm";
import { UniversitySchema, type University } from "../unis/schema";
import { extractColumns, programColumns } from "../unis/extract";
import type { DB } from "./core";
import { auditLog, programs, universities } from "./schema";

export const DATA_DIR = join(process.cwd(), "data", "universities");

/** Reads and validates every data file. Invalid files are reported, never loaded. */
export function loadUniversityFiles(dir = DATA_DIR): { records: University[]; errors: string[] } {
  const records: University[] = [];
  const errors: string[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const r = UniversitySchema.safeParse(JSON.parse(readFileSync(join(dir, f), "utf8")));
    if (r.success) records.push(r.data);
    else errors.push(`${f}: ${r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  }
  return { records, errors };
}

/** Bump when extracted columns change meaning, so every row is re-extracted on next seed. */
export const EXTRACT_VERSION = 3;

export function dataHash(u: University) {
  return createHash("sha256").update(`${EXTRACT_VERSION}:${JSON.stringify(u)}`).digest("hex");
}

/**
 * Upsert one university and its programs. A repo record never replaces a DB
 * row with a *newer* `lastVerified` (an admin edit), so a deploy never
 * clobbers it (docs/07 §19). Otherwise the row is rewritten whenever its
 * content or the extraction logic changed (tracked by `data_hash`).
 */
export async function upsertUniversity(db: DB, u: University, opts: { force?: boolean; userId?: string | null; action?: "seed" | "edit" | "verify" } = {}) {
  const hash = dataHash(u);
  const adminMark = `admin:v${EXTRACT_VERSION}`;
  const admin = opts.action === "edit" || opts.action === "verify";
  const cols = { ...extractColumns(u), dataHash: admin ? adminMark : hash };
  const [existing] = await db
    .select({ id: universities.id, lastVerified: universities.lastVerified, dataHash: universities.dataHash, data: universities.data })
    .from(universities)
    .where(eq(universities.slug, u.slug));
  if (existing && !opts.force) {
    const adminEdited = existing.dataHash?.startsWith("admin:") ?? false;
    if (existing.lastVerified > u.lastVerified || (adminEdited && existing.lastVerified >= u.lastVerified)) {
      // Keep the admin's record, but re-extract its filter columns if the extraction logic moved on.
      if (existing.dataHash !== adminMark) {
        const kept = UniversitySchema.parse(existing.data);
        await db.update(universities).set({ ...extractColumns(kept), dataHash: adminMark }).where(eq(universities.id, existing.id));
      }
      return { id: existing.id, changed: false };
    }
    if (existing.dataHash === hash) return { id: existing.id, changed: false };
  }

  let id: number;
  if (existing) {
    await db.update(universities).set({ ...cols, data: u, updatedAt: new Date() }).where(eq(universities.id, existing.id));
    id = existing.id;
  } else {
    const [row] = await db.insert(universities).values({ ...cols, data: u }).returning({ id: universities.id });
    id = row.id;
  }

  const rows = u.programs.map((p) => ({ universityId: id, slug: p.slug, name: p.name, field: p.field, level: p.level, degree: p.degree, ...programColumns(u, p), data: p }));
  if (!existing) {
    // A new institution has no programme rows yet: one multi-row insert (a cold-start seed does ~2,000 of these).
    if (rows.length) await db.insert(programs).values(rows);
  } else {
    for (const values of rows) {
      await db
        .insert(programs)
        .values(values)
        .onConflictDoUpdate({ target: [programs.universityId, programs.slug], set: values });
    }
  }
  const keep = u.programs.map((p) => p.slug);
  await db.delete(programs).where(and(eq(programs.universityId, id), notInArray(programs.slug, keep)));

  await db.insert(auditLog).values({
    universityId: id,
    userId: opts.userId ?? null,
    action: opts.action ?? "seed",
    summary: `${existing ? "Updated" : "Added"} ${u.name} (${u.programs.length} programs, verified ${u.lastVerified})`,
    verified: opts.action === "verify",
  });
  return { id, changed: true };
}

export async function seedUniversities(db: DB, records: University[]) {
  let changed = 0;
  for (const u of records) if ((await upsertUniversity(db, u)).changed) changed++;
  return changed;
}
