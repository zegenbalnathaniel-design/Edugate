/**
 * Validates university data files against the sourced-data contract.
 *   npx vite-node scripts/validate-universities.ts [file-or-dir ...]
 * Defaults to data/universities/. Exits non-zero on any failure.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { UniversitySchema } from "../src/lib/unis/schema";

const args = process.argv.slice(2);
const targets = args.length ? args : ["data/universities"];
const files = targets.flatMap((t) =>
  statSync(t).isDirectory()
    ? readdirSync(t).filter((f) => f.endsWith(".json")).map((f) => join(t, f))
    : [t],
);

let failed = 0;
for (const f of files) {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(f, "utf8"));
  } catch (e) {
    failed++;
    console.log(`✗ ${f}: invalid JSON — ${(e as Error).message}`);
    continue;
  }
  const r = UniversitySchema.safeParse(json);
  if (r.success) {
    const u = r.data;
    const unverified = JSON.stringify(u).split('"requires-verification"').length - 1;
    console.log(`✓ ${f}: ${u.programs.length} program(s), ${u.sources.length} source(s), ${unverified} field(s) needing verification`);
  } else {
    failed++;
    console.log(`✗ ${f}`);
    for (const i of r.error.issues.slice(0, 25)) console.log(`   ${i.path.join(".")}: ${i.message}`);
  }
}
console.log(`\n${files.length - failed}/${files.length} valid`);
process.exit(failed ? 1 : 0);
