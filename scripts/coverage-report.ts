/**
 * Catalogue coverage audit.
 *   npx vite-node scripts/coverage-report.ts
 *
 * Distinguishes programmes that were already on the platform from those added
 * by catalogue expansion, because conflating the two would misrepresent
 * researched data as pre-existing platform data.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = "data/universities";
const SEED = "data/seeds/undergraduate-programmes.json";

type Prog = {
  slug: string; name: string; degree: string; field: string;
  stream?: string | null; campus?: string | null; addedBy?: string;
};
type Uni = { slug: string; name: string; country: string; programs: Prog[]; sources: unknown[] };

const unis: Uni[] = readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")) as Uni);

const seeded = existsSync(SEED)
  ? new Set(Object.keys(JSON.parse(readFileSync(SEED, "utf8")) as Record<string, unknown>))
  : new Set<string>();

let total = 0, added = 0, original = 0;
const dupes: string[] = [];
const missingUrl: string[] = [];
const thin: Uni[] = [];

for (const u of unis) {
  total += u.programs.length;
  const seen = new Set<string>();
  for (const p of u.programs) {
    if (p.addedBy === "catalogue-expansion") added++; else original++;
    /**
     * Identity includes stream and campus.
     *
     * Indian colleges run the same degree as Shift I (aided) and Shift II
     * (self-financed), with different fees and admission. Those are distinct
     * programmes a student must choose between, not duplicates — collapsing
     * them would delete real options.
     */
    const key = [
      p.name.toLowerCase(),
      p.degree.toLowerCase(),
      (p.stream ?? "").toLowerCase(),
      (p.campus ?? "").toLowerCase(),
    ].join("|");
    if (seen.has(key)) dupes.push(`${u.slug}: ${p.name} (${p.degree})`);
    seen.add(key);
    if (!(p as { url?: string }).url) missingUrl.push(`${u.slug}: ${p.name}`);
  }
  if (u.programs.length < 8) thin.push(u);
}

const byCountry = new Map<string, { unis: number; progs: number }>();
for (const u of unis) {
  const c = byCountry.get(u.country) ?? { unis: 0, progs: 0 };
  c.unis++; c.progs += u.programs.length;
  byCountry.set(u.country, c);
}

console.log("EDUGATE CATALOGUE COVERAGE\n");
console.log(`Total institutions          ${unis.length}`);
console.log(`Institutions expanded       ${seeded.size}`);
console.log(`Total programmes            ${total}`);
console.log(`  already on the platform   ${original}`);
console.log(`  added by expansion        ${added}  (official university catalogues, 2026-10-22)`);
console.log(`Duplicates (name+degree)    ${dupes.length}`);
console.log(`Programmes without a URL    ${missingUrl.length}`);
console.log(`Still thin (<8 programmes)  ${thin.length}`);

console.log("\nBY COUNTRY");
for (const [c, v] of [...byCountry.entries()].sort((a, b) => b[1].progs - a[1].progs))
  console.log(`  ${c.padEnd(26)} ${String(v.unis).padStart(3)} institutions  ${String(v.progs).padStart(5)} programmes`);

if (thin.length) {
  console.log("\nSTILL THIN — not claimed as complete");
  for (const u of thin.sort((a, b) => a.programs.length - b.programs.length))
    console.log(`  ${String(u.programs.length).padStart(2)}  ${u.slug.padEnd(50)} ${u.country}`);
}
if (dupes.length) {
  console.log("\nDUPLICATES");
  for (const d of dupes.slice(0, 20)) console.log("  " + d);
}
