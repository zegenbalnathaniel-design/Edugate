import type { RankingItem, University } from "./schema";
import { perYear, toInr, toUsd } from "./fx";
import { selectivity } from "./selectivity";
import { normalizeDegree, normalizeTests, programSubjects } from "./taxonomy";
import type { Program } from "./schema";

/**
 * Columns extracted from the sourced record for indexed filtering
 * (docs/07 §3–4). Recomputed on every write so they can't drift from `data`.
 */
export function latestRanking(u: University, org: RankingItem["org"] = "QS"): RankingItem | null {
  const rows = u.rankings.filter(
    (r) => r.org === org && (org !== "QS" || /world university rankings/i.test(r.category)),
  );
  return rows.sort((a, b) => b.edition - a.edition)[0] ?? null;
}

/** "=25" → 25, "101-150" → 101, "1001+" → 1001. */
export function rankLowerBound(rank: string): number | null {
  const m = rank.match(/\d+/);
  return m ? Number(m[0]) : null;
}

export function annualIntlTuitionUsd(u: University): number | null {
  const t = u.costs.internationalTuition.value;
  if (!t) return null;
  const years = u.programs.find((p) => p.durationYears)?.durationYears ?? 4;
  const perYear =
    t.period === "year" ? t.min : t.period === "semester" ? t.min * 2 : t.period === "total" ? t.min / years : null;
  if (perYear == null) return null;
  const usd = toUsd(perYear, u.costs.currency);
  return usd == null ? null : Math.round(usd);
}

export function satPolicy(u: University): string | null {
  const row =
    u.testing.find((t) => t.test.toUpperCase() === "SAT") ??
    u.programs.flatMap((p) => p.tests).find((t) => t.test.toUpperCase() === "SAT");
  return row?.policy ?? null;
}

/**
 * What a student in India would pay per year, in rupees, for one program:
 * the program's own published fee, else the university-wide figure that
 * applies (domestic for Indian institutions, international elsewhere).
 */
export function programCostInr(u: University, p: Program): number | null {
  const india = u.countryCode === "IN";
  const v = p.fees?.value ?? (india ? u.costs.domesticTuition.value : u.costs.internationalTuition.value);
  const y = perYear(v, p.durationYears ?? (india ? null : 4));
  if (y == null) return null;
  const inr = toInr(y, u.costs.currency);
  return inr == null ? null : Math.round(inr);
}

export function programTests(u: University, p: Program): string[] {
  const named = [...p.tests.filter((t) => t.policy === "required" || t.policy === "optional" || t.policy === "recommended").map((t) => t.test), ...(p.admission?.entranceTests ?? [])];
  const uni = u.testing.filter((t) => t.policy === "required" || t.policy === "optional" || t.policy === "recommended").map((t) => t.test);
  return normalizeTests([...named, ...uni]);
}

export function programColumns(u: University, p: Program) {
  return {
    subjects: programSubjects(p),
    degreeNorm: normalizeDegree(p.degree, p.level),
    costInr: programCostInr(u, p),
    admissionBases: p.admission?.basis ?? [],
    tests: programTests(u, p),
  };
}

export function extractColumns(u: University) {
  const qs = latestRanking(u, "QS");
  const progs = u.programs.map((p) => programColumns(u, p));
  const costs = progs.map((p) => p.costInr).filter((n): n is number => n != null);
  return {
    slug: u.slug,
    name: u.name,
    country: u.country,
    countryCode: u.countryCode,
    region: u.region,
    city: u.city,
    control: u.control,
    category: u.category,
    qsRank: qs ? rankLowerBound(qs.rank) : null,
    qsEdition: qs?.edition ?? null,
    fields: [...new Set(progs.flatMap((p) => p.subjects))],
    curricula: [
      ...new Set(u.programs.flatMap((p) => p.requirements.filter((r) => r.accepted !== false).map((r) => r.curriculum))),
    ],
    satPolicy: satPolicy(u),
    intlTuitionUsdMin: annualIntlTuitionUsd(u),
    lastVerified: u.lastVerified,
    hub: u.hub ?? u.city,
    institutionType: u.institutionType,
    degrees: [...new Set(progs.map((p) => p.degreeNorm))],
    admissionBases: [...new Set(progs.flatMap((p) => p.admissionBases))],
    tests: [...new Set(progs.flatMap((p) => p.tests))],
    costInrMin: costs.length ? Math.min(...costs) : null,
    selectivity: selectivity(u)?.band ?? null,
  };
}
