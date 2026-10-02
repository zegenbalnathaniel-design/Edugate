import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { and, eq, notInArray } from "drizzle-orm";
import { UniversitySchema, type University } from "../unis/schema";
import { extractColumns } from "../unis/extract";
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

/**
 * Upsert one university and its programs. A repo record only replaces the DB
 * row when its `lastVerified` is newer (or `force`), so a deploy never
 * clobbers a more recent admin edit (docs/07 §19).
 */
export async function upsertUniversity(db: DB, u: University, opts: { force?: boolean; userId?: string | null; action?: "seed" | "edit" | "verify" } = {}) {
  const cols = extractColumns(u);
  const [existing] = await db.select({ id: universities.id, lastVerified: universities.lastVerified }).from(universities).where(eq(universities.slug, u.slug));
  if (existing && !opts.force && existing.lastVerified >= u.lastVerified) return { id: existing.id, changed: false };

  let id: number;
  if (existing) {
    await db.update(universities).set({ ...cols, data: u, updatedAt: new Date() }).where(eq(universities.id, existing.id));
    id = existing.id;
  } else {
    const [row] = await db.insert(universities).values({ ...cols, data: u }).returning({ id: universities.id });
    id = row.id;
  }

  for (const p of u.programs) {
    const values = { universityId: id, slug: p.slug, name: p.name, field: p.field, level: p.level, degree: p.degree, data: p };
    await db
      .insert(programs)
      .values(values)
      .onConflictDoUpdate({ target: [programs.universityId, programs.slug], set: values });
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
