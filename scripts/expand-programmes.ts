/**
 * Expands institution programme catalogues from compact seed lists.
 *
 *   npx vite-node scripts/expand-programmes.ts [--dry]
 *
 * WHY A SCRIPT AND NOT HAND-EDITED JSON
 * Each full Program record is ~60 lines once requirements, tests and fees are
 * included. Hand-writing those for hundreds of programmes guarantees drift
 * between institutions. This reads a compact seed (official programme name +
 * field) and expands it against the institution's OWN already-sourced data.
 *
 * WHAT IT INHERITS RATHER THAN INVENTS
 * `requirements`, `tests` and `fees` are copied from an existing programme at
 * the same institution where one exists, otherwise derived from the
 * institution-level `testing` and `costs` blocks. Nothing admissions- or
 * money-related is fabricated: if the institution record does not state it,
 * the new programme does not claim it either.
 *
 * WHAT IS GENUINELY NEW
 * The programme name, field, school and official URL, taken from the
 * institution's published catalogue named in the seed's `source` block. That
 * source is appended to the institution's `sources` array so every added
 * record is traceable, and `addedBy` marks it as catalogue-expanded rather
 * than passing it off as pre-existing platform data.
 *
 * IDEMPOTENT: keyed on programme slug. Re-running adds nothing.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry");
const UNI_DIR = "data/universities";
const SEED_FILE = "data/seeds/undergraduate-programmes.json";

type Seed = {
  source: { url: string; label: string; retrievedAt: string };
  defaults: {
    degree: string;
    level?: "bachelors" | "integrated" | "masters";
    school?: string | null;
    durationYears?: number | null;
    summaryTemplate?: string;
  };
  programmes: {
    name: string;
    field: string;
    degree?: string;
    school?: string | null;
    subfield?: string | null;
    url?: string;
    summary?: string;
    level?: "bachelors" | "integrated" | "masters";
  }[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Ensure a source exists for this URL; return its id. */
function ensureSource(uni: Record<string, unknown>, src: Seed["source"]): string {
  const sources = (uni.sources ?? []) as { id: string; url: string }[];
  const hit = sources.find((s) => s.url === src.url);
  if (hit) return hit.id;
  // New id that cannot collide with the existing s<n> sequence.
  const nums = sources
    .map((s) => Number(/^s(\d+)$/.exec(s.id)?.[1] ?? NaN))
    .filter((n) => Number.isFinite(n));
  const id = `s${(nums.length ? Math.max(...nums) : 0) + 1}`;
  sources.push({
    id,
    label: src.label,
    url: src.url,
    type: "university",
    retrievedAt: src.retrievedAt,
  } as never);
  uni.sources = sources;
  return id;
}

type Prog = Record<string, unknown>;

/**
 * Admissions and money are inherited, never invented. Prefer an existing
 * programme at the same institution so new records match the house style
 * exactly; fall back to the institution-level blocks.
 */
function inherit(uni: Record<string, unknown>) {
  const existing = (uni.programs ?? []) as Prog[];
  const donor = existing[0];
  if (donor) {
    return {
      requirements: donor.requirements ?? [],
      tests: donor.tests ?? [],
      english: donor.english ?? [],
      fees: donor.fees ?? null,
    };
  }
  const testing = (uni.testing ?? []) as unknown[];
  const costs = uni.costs as { internationalTuition?: unknown } | undefined;
  return {
    requirements: [],
    tests: testing,
    english: (uni.english ?? []) as unknown[],
    fees: costs?.internationalTuition ?? null,
  };
}

function main() {
  if (!existsSync(SEED_FILE)) {
    console.error(`No seed file at ${SEED_FILE}`);
    process.exit(1);
  }
  const seeds = JSON.parse(readFileSync(SEED_FILE, "utf8")) as Record<string, Seed>;

  let added = 0;
  let skipped = 0;
  let failed = 0;
  const report: { slug: string; before: number; after: number; added: number }[] = [];

  for (const [uniSlug, seed] of Object.entries(seeds)) {
    const file = join(UNI_DIR, `${uniSlug}.json`);
    if (!existsSync(file)) {
      console.log(`✗ ${uniSlug}: no institution file — skipped entirely`);
      failed += seed.programmes.length;
      continue;
    }

    const uni = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    const programs = (uni.programs ?? []) as Prog[];
    const before = programs.length;
    const seen = new Set(programs.map((p) => String(p.slug)));
    const seenIdentity = new Set(
      programs.map((p) =>
        [
          String(p.name).toLowerCase(),
          String(p.degree).toLowerCase(),
          String(p.stream ?? "").toLowerCase(),
          String(p.campus ?? "").toLowerCase(),
        ].join("|"),
      ),
    );

    const sourceId = ensureSource(uni, seed.source);
    const base = inherit(uni);
    const d = seed.defaults;

    for (const p of seed.programmes) {
      const degree = p.degree ?? d.degree;

      /**
       * Dedup on NAME + DEGREE, not on slug.
       *
       * Keying on slug alone is not idempotent: when the base slug is taken
       * the disambiguator mints a `-degree` variant, so every re-run creates
       * another copy. Identity has to come from the record's own content.
       * (Caught by re-running the script: Stanford went 34 → 64.)
       */
      const identity = [
        p.name.toLowerCase(),
        degree.toLowerCase(),
        String((p as { stream?: string }).stream ?? "").toLowerCase(),
        String((p as { campus?: string }).campus ?? "").toLowerCase(),
      ].join("|");
      if (seenIdentity.has(identity)) {
        skipped++;
        continue;
      }

      // Same subject at a different award IS a legitimate distinction, so it
      // still needs a unique slug of its own.
      let slug = slugify(p.name);
      if (seen.has(slug)) slug = slugify(`${p.name}-${degree}`);
      let n = 2;
      while (seen.has(slug)) slug = `${slugify(p.name)}-${n++}`;

      const school = p.school !== undefined ? p.school : (d.school ?? null);
      const summary =
        p.summary ??
        (d.summaryTemplate
          ? d.summaryTemplate.replace("{name}", p.name)
          : `${p.name} at ${String(uni.name)}, listed in the institution's published programme catalogue.`);

      programs.push({
        slug,
        name: p.name,
        degree,
        level: p.level ?? d.level ?? "bachelors",
        field: p.field,
        subfield: p.subfield ?? null,
        school,
        durationYears: d.durationYears ?? null,
        url: p.url ?? seed.source.url,
        summary,
        curriculum: [],
        curriculumSourceId: null,
        requirements: base.requirements,
        tests: base.tests,
        english: base.english,
        fees: base.fees,
        // Marks this as catalogue-expanded rather than original platform data.
        addedBy: "catalogue-expansion",
        addedSourceId: sourceId,
      });
      seen.add(slug);
      seenIdentity.add(identity);
      added++;
    }

    uni.programs = programs;
    report.push({ slug: uniSlug, before, after: programs.length, added: programs.length - before });
    if (!DRY) writeFileSync(file, JSON.stringify(uni, null, 2) + "\n");
  }

  console.log(DRY ? "DRY RUN — nothing written\n" : "");
  for (const r of report.sort((a, b) => b.added - a.added)) {
    if (r.added > 0) console.log(`  ${r.slug.padEnd(50)} ${r.before} → ${r.after}  (+${r.added})`);
  }
  console.log(`\nadded ${added} · skipped ${skipped} (already present) · failed ${failed}`);
  console.log(`institutions touched: ${report.filter((r) => r.added > 0).length}`);
}

main();
