import "server-only";
import { cache } from "react";
import { and, arrayOverlaps, asc, eq, gte, inArray, isNull, lte, max, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { programs, universities } from "@/lib/db/schema";
import { QS_BANDS, type Filters } from "./filters";
import type { University } from "./schema";

/* Data access layer for the catalogue — pages never touch SQL directly. */

const NOT_REQUIRED = ["optional", "test-blind", "not-considered", "not-applicable"];

function where(f: Filters): SQL | undefined {
  const c: (SQL | undefined)[] = [];
  if (f.countries.length) c.push(inArray(universities.countryCode, f.countries));
  if (f.fields.length) c.push(arrayOverlaps(universities.fields, f.fields));
  if (f.curricula.length) c.push(arrayOverlaps(universities.curricula, f.curricula));
  if (f.control.length) c.push(inArray(universities.control, f.control));
  if (f.qs.length) c.push(or(...f.qs.map((b) => and(gte(universities.qsRank, QS_BANDS[b][0]), lte(universities.qsRank, QS_BANDS[b][1])))));
  if (f.sat === "required") c.push(eq(universities.satPolicy, "required"));
  if (f.sat === "not-required") c.push(inArray(universities.satPolicy, NOT_REQUIRED)); // unknown policy never counts as a match
  if (f.maxUsd) c.push(lte(universities.intlTuitionUsdMin, f.maxUsd));
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    c.push(
      or(
        sql`${universities.name} ilike ${like}`,
        sql`${universities.city} ilike ${like}`,
        sql`${universities.country} ilike ${like}`,
        sql`exists (select 1 from ${programs} p where p.university_id = ${universities.id} and p.name ilike ${like})`,
      ),
    );
  }
  const defined = c.filter((x): x is SQL => !!x);
  return defined.length ? and(...defined) : undefined;
}

export type UniversityRow = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  control: string;
  qsRank: number | null;
  qsEdition: number | null;
  intlTuitionUsdMin: number | null;
  data: University;
};

const cols = {
  slug: universities.slug,
  name: universities.name,
  country: universities.country,
  countryCode: universities.countryCode,
  city: universities.city,
  control: universities.control,
  qsRank: universities.qsRank,
  qsEdition: universities.qsEdition,
  intlTuitionUsdMin: universities.intlTuitionUsdMin,
  data: universities.data,
};

export async function searchUniversities(f: Filters): Promise<{ rows: UniversityRow[]; total: number; unknownFeesHidden: number }> {
  const db = await getDb();
  const order =
    f.sort === "name"
      ? [asc(universities.name)]
      : f.sort === "cost"
        ? [sql`${universities.intlTuitionUsdMin} asc nulls last`, asc(universities.name)]
        : [sql`${universities.qsRank} asc nulls last`, asc(universities.name)];
  const rows = await db.select(cols).from(universities).where(where(f)).orderBy(...order);
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(universities);
  let unknownFeesHidden = 0;
  if (f.maxUsd) {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(universities)
      .where(and(where({ ...f, maxUsd: null }), isNull(universities.intlTuitionUsdMin)));
    unknownFeesHidden = n;
  }
  return { rows, total, unknownFeesHidden };
}

export const getUniversity = cache(async (slug: string): Promise<UniversityRow | null> => {
  const db = await getDb();
  const [row] = await db.select(cols).from(universities).where(eq(universities.slug, slug));
  return row ?? null;
});

export const getUniversityId = cache(async (slug: string): Promise<number | null> => {
  const db = await getDb();
  const [row] = await db.select({ id: universities.id }).from(universities).where(eq(universities.slug, slug));
  return row?.id ?? null;
});

export async function getUniversitiesBySlugs(slugs: string[]): Promise<UniversityRow[]> {
  if (!slugs.length) return [];
  const db = await getDb();
  const rows = await db.select(cols).from(universities).where(inArray(universities.slug, slugs));
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter((r): r is UniversityRow => !!r);
}

export async function allUniversities(): Promise<UniversityRow[]> {
  const db = await getDb();
  return db.select(cols).from(universities).orderBy(sql`${universities.qsRank} asc nulls last`, asc(universities.name));
}

export async function countryFacets(): Promise<{ code: string; name: string; regions: string[]; count: number }[]> {
  const db = await getDb();
  const rows = await db
    .select({
      code: universities.countryCode,
      name: universities.country,
      count: sql<number>`count(*)::int`,
      regions: sql<string[]>`array_agg(distinct ${universities.region})`,
    })
    .from(universities)
    .groupBy(universities.countryCode, universities.country)
    .orderBy(universities.country);
  return rows;
}

export const latestQsEdition = cache(async (): Promise<number | null> => {
  const db = await getDb();
  const [r] = await db.select({ e: max(universities.qsEdition) }).from(universities);
  return r?.e ?? null;
});
