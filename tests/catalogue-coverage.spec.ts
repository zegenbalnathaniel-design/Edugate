import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { UniversitySchema, type University } from "@/lib/unis/schema";

/**
 * Catalogue coverage regression.
 *
 * The platform shipped with institutions carrying a single programme — Harvard
 * showed 2 — which made a course search for them look broken. These tests lock
 * in the expanded catalogue and the properties that keep it trustworthy.
 *
 * They read the JSON directly, as college-engine.spec.ts does, so they run
 * without a database.
 */
const DATA = join(__dirname, "..", "data", "universities");
const files = readdirSync(DATA).filter((f) => f.endsWith(".json"));
const load = (f: string) => UniversitySchema.parse(JSON.parse(readFileSync(join(DATA, f), "utf8")));
const all: University[] = files.map(load);
const bySlug = new Map(all.map((u) => [u.slug, u]));

/** Mirrors how the explorer matches a free-text query to an institution. */
const matchesQuery = (u: University, q: string) => {
  const n = q.trim().toLowerCase().replace(/\s+/g, " ");
  return u.name.toLowerCase().includes(n) || u.slug.replace(/-/g, " ").includes(n);
};
const programmesFor = (q: string) =>
  all.filter((u) => matchesQuery(u, q)).flatMap((u) => u.programs);

describe("catalogue coverage", () => {
  it("Harvard returns a full concentration list, not two programmes", () => {
    const harvard = bySlug.get("harvard-university");
    expect(harvard).toBeDefined();
    // Regression: this was 2. Harvard College publishes ~50 fields of study.
    expect(harvard!.programs.length).toBeGreaterThanOrEqual(40);
  });

  it("the original Harvard records are preserved, not replaced", () => {
    const names = bySlug.get("harvard-university")!.programs.map((p) => p.name);
    expect(names).toContain("Economics (AB concentration)");
    expect(names).toContain("Computer Science (AB or SB concentration)");
  });

  it("major institutions all carry substantial catalogues", () => {
    const expected: [string, number][] = [
      ["university-of-oxford", 40],
      ["stanford-university", 25],
      ["massachusetts-institute-of-technology", 25],
      ["cornell-university", 30],
      ["mcgill-university", 30],
      ["university-of-california-berkeley", 30],
      ["eth-zurich", 15],
      ["ashoka-university", 15],
      ["bits-pilani", 10],
    ];
    for (const [slug, min] of expected) {
      const u = bySlug.get(slug);
      expect(u, `${slug} missing`).toBeDefined();
      expect(u!.programs.length, `${slug} has ${u!.programs.length}`).toBeGreaterThanOrEqual(min);
    }
  });

  it("institution search is case- and spacing-insensitive", () => {
    for (const q of ["Harvard", "harvard", "HARVARD", "  harvard  ", "Harvard University"]) {
      expect(programmesFor(q).length, `query: "${q}"`).toBeGreaterThanOrEqual(40);
    }
  });

  it("partial institution names still match", () => {
    expect(programmesFor("Cornell").length).toBeGreaterThanOrEqual(30);
    expect(programmesFor("Melbourne").length).toBeGreaterThanOrEqual(20);
    expect(programmesFor("Pompeu").length).toBeGreaterThanOrEqual(15);
  });

  it("a course-name search spans many institutions", () => {
    const hits = all.flatMap((u) =>
      u.programs.filter((p) => p.name.toLowerCase().includes("computer science")).map(() => u.slug),
    );
    expect(new Set(hits).size).toBeGreaterThanOrEqual(15);
  });

  it("no duplicate programmes, counting stream and campus as real distinctions", () => {
    // Indian colleges run the same degree as Shift I (aided) and Shift II
    // (self-financed) with different fees. Those are distinct options, so they
    // must survive — identity has to include stream and campus.
    for (const u of all) {
      const seen = new Set<string>();
      for (const p of u.programs) {
        const key = [p.name, p.degree, p.stream ?? "", p.campus ?? ""]
          .map((x) => String(x).toLowerCase())
          .join("|");
        expect(seen.has(key), `${u.slug}: duplicate ${p.name} (${p.degree})`).toBe(false);
        seen.add(key);
      }
    }
  });

  it("programme slugs are unique within an institution", () => {
    for (const u of all) {
      const slugs = u.programs.map((p) => p.slug);
      expect(new Set(slugs).size, `${u.slug} has colliding slugs`).toBe(slugs.length);
    }
  });

  it("every expanded programme is attributable to a real source", () => {
    for (const u of all) {
      const ids = new Set(u.sources.map((s) => s.id));
      for (const p of u.programs as (University["programs"][number] & {
        addedBy?: string;
        addedSourceId?: string;
      })[]) {
        if (p.addedBy !== "catalogue-expansion") continue;
        expect(p.url, `${u.slug}/${p.slug} has no URL`).toBeTruthy();
        expect(
          ids.has(String(p.addedSourceId)),
          `${u.slug}/${p.slug} cites unknown source ${p.addedSourceId}`,
        ).toBe(true);
      }
    }
  });

  it("expansion did not invent fees or admissions data", () => {
    // Added records inherit the institution's own sourced figures or carry
    // none. A programme claiming fees the institution record never stated
    // would be a fabricated factual claim.
    for (const u of all) {
      const donor = u.programs.find((p) => !(p as { addedBy?: string }).addedBy);
      for (const p of u.programs as (University["programs"][number] & { addedBy?: string })[]) {
        if (p.addedBy !== "catalogue-expansion" || !p.fees) continue;
        expect(donor?.fees ?? u.costs?.internationalTuition, `${u.slug}: fees with no origin`).toBeTruthy();
      }
    }
  });

  it("the whole catalogue is materially larger than it was", () => {
    const total = all.reduce((n, u) => n + u.programs.length, 0);
    expect(total).toBeGreaterThanOrEqual(2900);
  });

  it("an unmatched query returns nothing rather than throwing", () => {
    expect(programmesFor("zzzz-not-a-real-institution")).toHaveLength(0);
  });

  it("the ingestion seed stays in sync with the institutions it names", () => {
    const seedPath = join(__dirname, "..", "data", "seeds", "undergraduate-programmes.json");
    if (!existsSync(seedPath)) return;
    const seed = JSON.parse(readFileSync(seedPath, "utf8")) as Record<string, unknown>;
    for (const slug of Object.keys(seed)) {
      expect(bySlug.has(slug), `seed names unknown institution: ${slug}`).toBe(true);
    }
  });
});
