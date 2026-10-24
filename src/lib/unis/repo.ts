import "server-only";
import { cache } from "react";
import { and, arrayOverlaps, asc, eq, gte, inArray, isNull, lte, max, or, sql, type SQL } from "drizzle-orm";
import { catalogueFromFiles, getDb, warmDb } from "@/lib/db";
import { loadUniversityFiles } from "@/lib/db/seed";
import { extractColumns, programColumns } from "./extract";
import { programs, universities } from "@/lib/db/schema";
import { COST_BANDS, QS_BANDS, subjectsInQuery, type Filters } from "./filters";
import { HOME_HUB, type Tier } from "./geo";
import type { Program } from "./schema";
import { UniversitySchema, type University } from "./schema";

/* Data access layer for the catalogue — pages never touch SQL directly. */

const NOT_REQUIRED = ["optional", "test-blind", "not-considered", "not-applicable"];

const esc = (q: string) => `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;

/** Geographic tier as SQL (docs/09 §2). */
function tierSql(t: Tier): SQL {
  const hub = sql`coalesce(${universities.hub}, ${universities.city})`;
  if (t === "abroad") return sql`${universities.countryCode} <> 'IN'`;
  if (t === "chennai") return sql`${universities.countryCode} = 'IN' and ${hub} = ${HOME_HUB.city}`;
  if (t === "tamil-nadu") return sql`${universities.countryCode} = 'IN' and ${universities.region} = ${HOME_HUB.state} and ${hub} <> ${HOME_HUB.city}`;
  return sql`${universities.countryCode} = 'IN' and ${universities.region} <> ${HOME_HUB.state}`;
}

/** Indian-structure filters shared by the institution directory and course search. */
function sharedWhere(f: Filters, costCol: SQL | typeof universities.costInrMin): (SQL | undefined)[] {
  const c: (SQL | undefined)[] = [];
  if (f.tiers.length) c.push(or(...f.tiers.map(tierSql)));
  if (f.states.length) c.push(inArray(universities.region, f.states));
  if (f.hubs.length) c.push(sql`coalesce(${universities.hub}, ${universities.city}) in ${f.hubs}`);
  if (f.types.length) c.push(inArray(universities.institutionType, f.types));
  if (f.selectivity.length) c.push(inArray(universities.selectivity, f.selectivity));
  if (f.costBands.length) c.push(or(...f.costBands.map((b) => sql`(${costCol} >= ${COST_BANDS[b].min} and ${costCol} < ${COST_BANDS[b].max})`)));
  return c;
}

function where(f: Filters): SQL | undefined {
  const c: (SQL | undefined)[] = [...sharedWhere(f, universities.costInrMin)];
  if (f.degrees.length) c.push(arrayOverlaps(universities.degrees, f.degrees));
  if (f.bases.length) c.push(arrayOverlaps(universities.admissionBases, f.bases));
  if (f.tests.length) c.push(arrayOverlaps(universities.tests, f.tests));
  if (f.countries.length) c.push(inArray(universities.countryCode, f.countries));
  if (f.fields.length) c.push(arrayOverlaps(universities.fields, f.fields));
  if (f.curricula.length) c.push(arrayOverlaps(universities.curricula, f.curricula));
  if (f.control.length) c.push(inArray(universities.control, f.control));
  if (f.qs.length) c.push(or(...f.qs.map((b) => and(gte(universities.qsRank, QS_BANDS[b][0]), lte(universities.qsRank, QS_BANDS[b][1])))));
  if (f.sat === "required") c.push(eq(universities.satPolicy, "required"));
  if (f.sat === "not-required") c.push(inArray(universities.satPolicy, NOT_REQUIRED)); // unknown policy never counts as a match
  if (f.maxUsd) c.push(lte(universities.intlTuitionUsdMin, f.maxUsd));
  if (f.q) {
    const like = esc(f.q);
    c.push(
      or(
        sql`${universities.name} ilike ${like}`,
        sql`${universities.city} ilike ${like}`,
        sql`${universities.region} ilike ${like}`,
        sql`coalesce(${universities.hub}, '') ilike ${like}`,
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
  region: string;
  hub: string | null;
  institutionType: string | null;
  selectivity: string | null;
  costInrMin: number | null;
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
  region: universities.region,
  hub: universities.hub,
  institutionType: universities.institutionType,
  selectivity: universities.selectivity,
  costInrMin: universities.costInrMin,
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

/** Records saved before a schema addition lack its defaults; fill them on read (the seed normally rewrites them first). */
const hydrate = (r: UniversityRow): UniversityRow => {
  if (r.data.details && "institutionType" in r.data) return r;
  const parsed = UniversitySchema.safeParse(r.data);
  return parsed.success ? { ...r, data: parsed.data } : r;
};


/**
 * Institution-level equivalent of where(f), for the file-backed path.
 *
 * Mirrors the SQL in `where` so /universities and /explore get the same
 * instant cold start the catalogue pages already had. Anything the file rows
 * cannot answer (curricula, control, QS bands, SAT policy) falls through to
 * the database rather than being silently ignored — see uniFileEligible.
 */
function uniRowMatches(f: Filters, r: UniversityRow): boolean {
  if (!rowMatches(f, r)) return false;
  if (f.maxUsd && !(r.intlTuitionUsdMin != null && r.intlTuitionUsdMin <= f.maxUsd)) return false;
  if (f.costBands.length && !inCostBand(r.costInrMin, f.costBands)) return false;
  if (f.q) {
    const n = f.q.toLowerCase();
    const hit =
      r.name.toLowerCase().includes(n) ||
      r.city.toLowerCase().includes(n) ||
      r.region.toLowerCase().includes(n) ||
      (r.hub ?? "").toLowerCase().includes(n) ||
      r.country.toLowerCase().includes(n) ||
      r.data.programs.some((p) => p.name.toLowerCase().includes(n));
    if (!hit) return false;
  }
  if (f.fields.length || f.degrees.length || f.bases.length || f.tests.length) {
    const cols = r.data.programs.map((p) => programColumns(r.data, p));
    const has = (key: "subjects" | "admissionBases" | "tests", want: string[]) =>
      !want.length || cols.some((c) => (c[key] as readonly string[]).some((x) => want.includes(x)));
    if (!has("subjects", f.fields)) return false;
    if (!has("admissionBases", f.bases)) return false;
    if (!has("tests", f.tests)) return false;
    if (f.degrees.length && !cols.some((c) => c.degreeNorm && f.degrees.includes(c.degreeNorm))) return false;
  }
  return true;
}

/**
 * Filters the file rows cannot evaluate faithfully. When one is active we wait
 * for the database rather than return a subtly wrong list — a fast wrong
 * answer is worse than a slow right one.
 */
function uniFileEligible(f: Filters): boolean {
  return !f.curricula.length && !f.control.length && !f.qs.length && !f.sat;
}

export async function searchUniversities(f: Filters): Promise<{ rows: UniversityRow[]; total: number; unknownFeesHidden: number }> {
  if (catalogueFromFiles() && uniFileEligible(f)) {
    warmDb();
    const all = [...fileRows().values()];
    const rows = all.filter((r) => uniRowMatches(f, r));
    const byName = (a: UniversityRow, b: UniversityRow) => a.name.localeCompare(b.name);
    const nullsLast = (x: number | null) => x ?? Number.POSITIVE_INFINITY;
    rows.sort((a, b) =>
      f.sort === "name"
        ? byName(a, b)
        : f.sort === "cost"
          ? nullsLast(a.intlTuitionUsdMin) - nullsLast(b.intlTuitionUsdMin) || byName(a, b)
          : f.sort === "cost-inr"
            ? nullsLast(a.costInrMin) - nullsLast(b.costInrMin) || byName(a, b)
            : nullsLast(a.qsRank) - nullsLast(b.qsRank) || byName(a, b),
    );
    const unknownFeesHidden = f.maxUsd
      ? all.filter((r) => uniRowMatches({ ...f, maxUsd: null }, r) && r.intlTuitionUsdMin == null).length
      : 0;
    return { rows, total: all.length, unknownFeesHidden };
  }
  const db = await getDb();
  const order =
    f.sort === "name"
      ? [asc(universities.name)]
      : f.sort === "cost"
        ? [sql`${universities.intlTuitionUsdMin} asc nulls last`, asc(universities.name)]
        : f.sort === "cost-inr"
          ? [sql`${universities.costInrMin} asc nulls last`, asc(universities.name)]
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
  return { rows: rows.map(hydrate), total, unknownFeesHidden };
}

/* The validated data files as rows, for cold starts of the in-memory preview database. */
const fg = globalThis as unknown as { __edugateFileRows?: Map<string, UniversityRow> };
function fileRows(): Map<string, UniversityRow> {
  if (!fg.__edugateFileRows) {
    fg.__edugateFileRows = new Map(
      loadUniversityFiles().records.map((u) => {
        const c = extractColumns(u);
        const row: UniversityRow = {
          slug: c.slug, region: c.region, hub: c.hub, institutionType: c.institutionType, selectivity: c.selectivity, costInrMin: c.costInrMin, name: c.name,
          country: c.country, countryCode: c.countryCode, city: c.city, control: c.control, qsRank: c.qsRank, qsEdition: c.qsEdition, intlTuitionUsdMin: c.intlTuitionUsdMin, data: u,
        };
        return [u.slug, row];
      }),
    );
  }
  return fg.__edugateFileRows;
}

/* ---------------------------------------------------------------------- *
 * In-memory equivalents of the SQL filters above.
 *
 * The course explorer's three queries — geoFacets, subjectCounts and
 * searchPrograms — used to go straight to the database with no file fallback,
 * so /courses blocked on the cold-start seed while every other catalogue page
 * had an instant path. That is the "have to click it twice" lag: the first
 * request sat through PGlite's WASM start-up and a ~3,200-programme seed.
 *
 * These mirror sharedWhere/searchPrograms exactly and reuse programColumns,
 * the same helper the seeder uses, so the two paths cannot drift apart.
 * ---------------------------------------------------------------------- */

const hubOf = (r: UniversityRow) => r.hub ?? r.city;

function tierMatch(t: Tier, r: UniversityRow): boolean {
  if (t === "abroad") return r.countryCode !== "IN";
  if (t === "chennai") return r.countryCode === "IN" && hubOf(r) === HOME_HUB.city;
  if (t === "tamil-nadu") return r.countryCode === "IN" && r.region === HOME_HUB.state && hubOf(r) !== HOME_HUB.city;
  return r.countryCode === "IN" && r.region !== HOME_HUB.state;
}

/** Institution-level predicates shared by the file-backed queries. */
function rowMatches(f: Filters, r: UniversityRow): boolean {
  if (f.tiers.length && !f.tiers.some((t) => tierMatch(t, r))) return false;
  if (f.states.length && !f.states.includes(r.region)) return false;
  if (f.hubs.length && !f.hubs.includes(hubOf(r))) return false;
  if (f.types.length && !(r.institutionType && f.types.includes(r.institutionType))) return false;
  if (f.selectivity.length && !(r.selectivity && f.selectivity.includes(r.selectivity))) return false;
  if (f.countries.length && !f.countries.includes(r.countryCode)) return false;
  return true;
}

const overlaps = (a: readonly string[], b: readonly string[]) => a.some((x) => b.includes(x));
const inCostBand = (cost: number | null, bands: (keyof typeof COST_BANDS)[]) =>
  !bands.length || (cost != null && bands.some((b) => cost >= COST_BANDS[b].min && cost < COST_BANDS[b].max));


export const getUniversity = cache(async (slug: string): Promise<UniversityRow | null> => {
  if (catalogueFromFiles()) {
    warmDb();
    return fileRows().get(slug) ?? null;
  }
  const db = await getDb();
  const [row] = await db.select(cols).from(universities).where(eq(universities.slug, slug));
  return row ? hydrate(row) : null;
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
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter((r): r is UniversityRow => !!r).map(hydrate);
}

export async function allUniversities(): Promise<UniversityRow[]> {
  if (catalogueFromFiles()) {
    warmDb();
    return [...fileRows().values()].sort((a, b) => (a.qsRank ?? Infinity) - (b.qsRank ?? Infinity) || a.name.localeCompare(b.name));
  }
  const db = await getDb();
  const rows = await db.select(cols).from(universities).orderBy(sql`${universities.qsRank} asc nulls last`, asc(universities.name));
  return rows.map(hydrate);
}

export async function countryFacets(): Promise<{ code: string; name: string; regions: string[]; count: number }[]> {
  if (catalogueFromFiles()) {
    warmDb();
    const by = new Map<string, { code: string; name: string; regions: Set<string>; count: number }>();
    for (const r of fileRows().values()) {
      const e = by.get(r.countryCode) ?? { code: r.countryCode, name: r.country, regions: new Set<string>(), count: 0 };
      e.count += 1;
      e.regions.add(r.region);
      by.set(r.countryCode, e);
    }
    return [...by.values()]
      .map((e) => ({ code: e.code, name: e.name, regions: [...e.regions], count: e.count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
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
  if (catalogueFromFiles()) {
    warmDb();
    const eds = [...fileRows().values()].map((r) => r.qsEdition).filter((e): e is number => e != null);
    return eds.length ? Math.max(...eds) : null;
  }
  const db = await getDb();
  const [r] = await db.select({ e: max(universities.qsEdition) }).from(universities);
  return r?.e ?? null;
});

/* ------------------------- geography & courses ------------------------- */

export type GeoFacet = { countryCode: string; country: string; region: string; hub: string; institutions: number; programs: number };

/** Institution and program counts per country → state/region → city hub. */
export const geoFacets = cache(async (): Promise<GeoFacet[]> => {
  if (catalogueFromFiles()) {
    warmDb();
    const by = new Map<string, GeoFacet>();
    for (const r of fileRows().values()) {
      const key = `${r.countryCode}|${r.region}|${hubOf(r)}`;
      const g = by.get(key) ?? {
        countryCode: r.countryCode, country: r.country, region: r.region, hub: hubOf(r), institutions: 0, programs: 0,
      };
      g.institutions += 1;
      g.programs += r.data.programs.length;
      by.set(key, g);
    }
    return [...by.values()].sort((a, b) => a.country.localeCompare(b.country) || a.region.localeCompare(b.region));
  }
  const db = await getDb();
  return db
    .select({
      countryCode: universities.countryCode,
      country: universities.country,
      region: universities.region,
      hub: sql<string>`coalesce(${universities.hub}, ${universities.city})`,
      institutions: sql<number>`count(*)::int`,
      programs: sql<number>`coalesce(sum(jsonb_array_length(${universities.data}->'programs')), 0)::int`,
    })
    .from(universities)
    .groupBy(universities.countryCode, universities.country, universities.region, sql`coalesce(${universities.hub}, ${universities.city})`)
    .orderBy(universities.country, universities.region);
});

export async function universitiesWhere(opts: { countryCodes?: string[]; region?: string; hub?: string; notCountryCodes?: string[] }): Promise<UniversityRow[]> {
  if (catalogueFromFiles()) {
    warmDb();
    return [...fileRows().values()]
      .filter((r) => {
        if (opts.countryCodes?.length && !opts.countryCodes.includes(r.countryCode)) return false;
        if (opts.notCountryCodes?.length && opts.notCountryCodes.includes(r.countryCode)) return false;
        if (opts.region && r.region !== opts.region) return false;
        if (opts.hub && hubOf(r) !== opts.hub) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (a.qsRank ?? Number.POSITIVE_INFINITY) - (b.qsRank ?? Number.POSITIVE_INFINITY) ||
          a.name.localeCompare(b.name),
      );
  }
  const db = await getDb();
  const c: (SQL | undefined)[] = [];
  if (opts.countryCodes?.length) c.push(inArray(universities.countryCode, opts.countryCodes));
  if (opts.notCountryCodes?.length) c.push(sql`${universities.countryCode} not in ${opts.notCountryCodes}`);
  if (opts.region) c.push(eq(universities.region, opts.region));
  if (opts.hub) c.push(sql`coalesce(${universities.hub}, ${universities.city}) = ${opts.hub}`);
  const rows = await db
    .select(cols)
    .from(universities)
    .where(and(...c.filter((x): x is SQL => !!x)))
    .orderBy(sql`${universities.qsRank} asc nulls last`, asc(universities.name));
  return rows.map(hydrate);
}

export type ProgramHit = {
  program: Program;
  subjects: string[];
  degreeNorm: string | null;
  costInr: number | null;
  admissionBases: string[];
  tests: string[];
  uni: { slug: string; name: string; city: string; hub: string | null; region: string; country: string; countryCode: string; institutionType: string | null; selectivity: string | null; qsRank: number | null; lastVerified: string; currency: string };
};

/**
 * Program-level search for the course explorer: subject (with synonyms and
 * joint-degree queries), geography tier, degree, yearly cost in ₹, admission
 * route, entrance test, selectivity and institution type.
 */
export async function searchPrograms(f: Filters): Promise<ProgramHit[]> {
  if (catalogueFromFiles()) {
    warmDb();
    const parsed = f.q ? subjectsInQuery(f.q) : null;
    const needle = parsed?.rest ? parsed.rest.toLowerCase() : null;
    const hits: ProgramHit[] = [];

    for (const r of fileRows().values()) {
      if (!rowMatches(f, r)) continue;
      const uniNameHit = needle ? r.name.toLowerCase().includes(needle) : false;

      for (const p of r.data.programs) {
        const col = programColumns(r.data, p);
        if (!inCostBand(col.costInr, f.costBands)) continue;
        if (f.fields.length && !overlaps(col.subjects, f.fields)) continue;
        if (f.degrees.length && !(col.degreeNorm && f.degrees.includes(col.degreeNorm))) continue;
        if (f.bases.length && !overlaps(col.admissionBases, f.bases)) continue;
        if (f.tests.length && !overlaps(col.tests, f.tests)) continue;
        // `@>` in SQL: every parsed subject must be present, not merely one.
        // subjects is a narrowed FieldKey[]; the parsed query is plain strings.
        const subjects: readonly string[] = col.subjects;
        if (parsed?.all.length && !parsed.all.every((k) => subjects.includes(k))) continue;
        if (needle) {
          const spec = String((p as { specialization?: string | null }).specialization ?? "").toLowerCase();
          if (!uniNameHit && !p.name.toLowerCase().includes(needle) && !spec.includes(needle)) continue;
        }
        hits.push({
          program: p,
          subjects: col.subjects,
          degreeNorm: col.degreeNorm,
          costInr: col.costInr,
          admissionBases: col.admissionBases,
          tests: col.tests,
          uni: {
            slug: r.slug, name: r.name, city: r.city, hub: r.hub, region: r.region, country: r.country,
            countryCode: r.countryCode, institutionType: r.institutionType, selectivity: r.selectivity,
            qsRank: r.qsRank, lastVerified: r.data.lastVerified,
            currency: r.data.costs?.currency ?? "INR",
          },
        });
      }
    }

    const byCost = f.sort === "cost-inr" || f.sort === "cost";
    hits.sort((a, b) => {
      if (byCost) {
        // "asc nulls last"
        const ac = a.costInr ?? Number.POSITIVE_INFINITY;
        const bc = b.costInr ?? Number.POSITIVE_INFINITY;
        if (ac !== bc) return ac - bc;
      }
      return a.uni.name.localeCompare(b.uni.name) || a.program.name.localeCompare(b.program.name);
    });
    return hits.slice(0, 2000);
  }

  const db = await getDb();
  const c: (SQL | undefined)[] = [...sharedWhere(f, sql`${programs.costInr}`)];
  if (f.countries.length) c.push(inArray(universities.countryCode, f.countries));
  if (f.fields.length) c.push(arrayOverlaps(programs.subjects, f.fields));
  if (f.degrees.length) c.push(inArray(programs.degreeNorm, f.degrees));
  if (f.bases.length) c.push(arrayOverlaps(programs.admissionBases, f.bases));
  if (f.tests.length) c.push(arrayOverlaps(programs.tests, f.tests));
  if (f.q) {
    const { all, rest } = subjectsInQuery(f.q);
    if (all.length) c.push(sql`${programs.subjects} @> ${sql.raw(`ARRAY[${all.map((k) => `'${k.replace(/'/g, "")}'`).join(",")}]::text[]`)}`);
    if (rest) {
      const like = esc(rest);
      c.push(or(sql`${programs.name} ilike ${like}`, sql`${universities.name} ilike ${like}`, sql`${programs.data}->>'specialization' ilike ${like}`));
    }
  }
  const rows = await db
    .select({
      program: programs.data,
      subjects: programs.subjects,
      degreeNorm: programs.degreeNorm,
      costInr: programs.costInr,
      admissionBases: programs.admissionBases,
      tests: programs.tests,
      slug: universities.slug,
      name: universities.name,
      city: universities.city,
      hub: universities.hub,
      region: universities.region,
      country: universities.country,
      countryCode: universities.countryCode,
      institutionType: universities.institutionType,
      selectivity: universities.selectivity,
      qsRank: universities.qsRank,
      lastVerified: universities.lastVerified,
      currency: sql<string>`${universities.data}->'costs'->>'currency'`,
    })
    .from(programs)
    .innerJoin(universities, eq(programs.universityId, universities.id))
    .where(and(...c.filter((x): x is SQL => !!x)))
    .orderBy(
      ...(f.sort === "cost-inr" || f.sort === "cost" ? [sql`${programs.costInr} asc nulls last`] : []),
      asc(universities.name),
      asc(programs.name),
    )
    .limit(2000);
  return rows.map((r) => ({
    program: r.program,
    subjects: r.subjects,
    degreeNorm: r.degreeNorm,
    costInr: r.costInr,
    admissionBases: r.admissionBases,
    tests: r.tests,
    uni: {
      slug: r.slug, name: r.name, city: r.city, hub: r.hub, region: r.region, country: r.country, countryCode: r.countryCode,
      institutionType: r.institutionType, selectivity: r.selectivity, qsRank: r.qsRank, lastVerified: r.lastVerified, currency: r.currency,
    },
  }));
}

/** Programs per subject, for the course hub. */
export const subjectCounts = cache(async (): Promise<Record<string, number>> => {
  if (catalogueFromFiles()) {
    warmDb();
    const out: Record<string, number> = {};
    for (const r of fileRows().values())
      for (const p of r.data.programs)
        for (const sub of programColumns(r.data, p).subjects) out[sub] = (out[sub] ?? 0) + 1;
    return out;
  }
  const db = await getDb();
  const rows = await db.execute<{ s: string; n: number }>(sql`select unnest(${programs.subjects}) as s, count(*)::int as n from ${programs} group by 1`);
  const list = (rows as unknown as { rows?: { s: string; n: number }[] }).rows ?? (rows as unknown as { s: string; n: number }[]);
  return Object.fromEntries(list.map((r) => [r.s, Number(r.n)]));
});
