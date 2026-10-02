import type { RankingItem, University } from "./schema";
import { toUsd } from "./fx";

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

export function extractColumns(u: University) {
  const qs = latestRanking(u, "QS");
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
    fields: [...new Set(u.programs.map((p) => p.field))],
    curricula: [
      ...new Set(u.programs.flatMap((p) => p.requirements.filter((r) => r.accepted !== false).map((r) => r.curriculum))),
    ],
    satPolicy: satPolicy(u),
    intlTuitionUsdMin: annualIntlTuitionUsd(u),
    lastVerified: u.lastVerified,
  };
}
