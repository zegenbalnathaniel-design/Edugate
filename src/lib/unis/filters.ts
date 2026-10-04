import { CURRICULA } from "../profile/schema";
import { AdmissionBasis, FieldKey, InstitutionType } from "./schema";
import { SELECTIVITY } from "./selectivity";
import { DEGREES, SUBJECTS, TESTS } from "./taxonomy";
import { TIERS, type Tier } from "./geo";

/*
 * Filter state lives in the URL (docs/07 §6) so searches are shareable and
 * savable. Within one filter values are OR'd; across filters, AND'd; "NOT"
 * is expressed with explicit negative values (sat=not-required).
 */

export const QS_BANDS = { "1-50": [1, 50], "51-100": [51, 100], "101-250": [101, 250], "251+": [251, 100000] } as const;
export type QsBand = keyof typeof QS_BANDS;
export const SORTS = { qs: "QS rank", name: "Name", cost: "Lowest international tuition", "cost-inr": "Lowest yearly fee (₹)" } as const;

/** Yearly fee bands in rupees (tuition as published; converted at dated reference rates for institutions abroad). */
export const COST_BANDS = {
  "lt-1l": { label: "Under ₹1 lakh", min: 0, max: 100000 },
  "1-3l": { label: "₹1–3 lakh", min: 100000, max: 300000 },
  "3-5l": { label: "₹3–5 lakh", min: 300000, max: 500000 },
  "5-10l": { label: "₹5–10 lakh", min: 500000, max: 1000000 },
  "10-25l": { label: "₹10–25 lakh", min: 1000000, max: 2500000 },
  "25l+": { label: "₹25 lakh+", min: 2500000, max: Number.MAX_SAFE_INTEGER },
} as const;
export type CostBand = keyof typeof COST_BANDS;

export const BASIS_LABEL: Record<string, string> = {
  merit: "Merit (Class XII marks)",
  entrance: "Entrance test",
  interview: "Interview",
  "group-discussion": "Group discussion",
  portfolio: "Portfolio",
  audition: "Audition",
  holistic: "Holistic review",
  counselling: "Centralised counselling",
};
export type SortKey = keyof typeof SORTS;

export type Filters = {
  q: string;
  countries: string[];
  fields: string[];
  curricula: string[];
  qs: QsBand[];
  sat: "" | "required" | "not-required";
  maxUsd: number | null;
  control: string[];
  sort: SortKey;
  // Indian structure & course explorer
  tiers: Tier[];
  states: string[];
  hubs: string[];
  degrees: string[];
  costBands: CostBand[];
  bases: string[];
  tests: string[];
  selectivity: string[];
  types: string[];
};

type SP = Record<string, string | string[] | undefined>;
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : (v ?? "").split(",")).map((s) => s.trim()).filter(Boolean);

export function parseFilters(sp: SP): Filters {
  const fields = new Set<string>(FieldKey.options);
  const curr = new Set<string>(CURRICULA);
  const maxUsd = Number(sp.maxUsd);
  const sat = typeof sp.sat === "string" ? sp.sat : "";
  const sort = typeof sp.sort === "string" && sp.sort in SORTS ? (sp.sort as SortKey) : "qs";
  return {
    q: typeof sp.q === "string" ? sp.q.slice(0, 100) : "",
    countries: list(sp.country).map((c) => c.toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c)),
    fields: list(sp.field).filter((f) => fields.has(f)),
    curricula: list(sp.curriculum).filter((c) => curr.has(c)),
    qs: list(sp.qs).filter((b): b is QsBand => b in QS_BANDS),
    sat: sat === "required" || sat === "not-required" ? sat : "",
    maxUsd: Number.isFinite(maxUsd) && maxUsd > 0 ? Math.round(maxUsd) : null,
    control: list(sp.control).filter((c) => ["public", "private", "public-private", "government-aided"].includes(c)),
    sort,
    tiers: list(sp.tier).filter((t): t is Tier => (TIERS as string[]).includes(t)),
    states: list(sp.state).map((x) => x.slice(0, 60)),
    hubs: list(sp.city).map((x) => x.slice(0, 60)),
    degrees: list(sp.degree).filter((d) => (DEGREES as readonly string[]).includes(d)),
    costBands: list(sp.cost).filter((b): b is CostBand => b in COST_BANDS),
    bases: list(sp.basis).filter((b) => AdmissionBasis.options.includes(b as never)),
    tests: list(sp.test).filter((t) => TESTS.some((x) => x.key === t)),
    selectivity: list(sp.sel).filter((x) => (SELECTIVITY as readonly string[]).includes(x)),
    types: list(sp.type).filter((x) => InstitutionType.options.includes(x as never)),
  };
}

export function filtersToQuery(f: Partial<Filters>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.countries?.length) p.set("country", f.countries.join(","));
  if (f.fields?.length) p.set("field", f.fields.join(","));
  if (f.curricula?.length) p.set("curriculum", f.curricula.join(","));
  if (f.qs?.length) p.set("qs", f.qs.join(","));
  if (f.sat) p.set("sat", f.sat);
  if (f.maxUsd) p.set("maxUsd", String(f.maxUsd));
  if (f.control?.length) p.set("control", f.control.join(","));
  if (f.sort && f.sort !== "qs") p.set("sort", f.sort);
  if (f.tiers?.length) p.set("tier", f.tiers.join(","));
  if (f.states?.length) p.set("state", f.states.join(","));
  if (f.hubs?.length) p.set("city", f.hubs.join(","));
  if (f.degrees?.length) p.set("degree", f.degrees.join(","));
  if (f.costBands?.length) p.set("cost", f.costBands.join(","));
  if (f.bases?.length) p.set("basis", f.bases.join(","));
  if (f.tests?.length) p.set("test", f.tests.join(","));
  if (f.selectivity?.length) p.set("sel", f.selectivity.join(","));
  if (f.types?.length) p.set("type", f.types.join(","));
  return p.toString();
}

export function activeFilterCount(f: Filters) {
  return [
    f.q, f.countries.length, f.fields.length, f.curricula.length, f.qs.length, f.sat, f.maxUsd, f.control.length,
    f.tiers.length, f.states.length, f.hubs.length, f.degrees.length, f.costBands.length, f.bases.length, f.tests.length,
    f.selectivity.length, f.types.length,
  ].filter(Boolean).length;
}

/**
 * "Economics + Finance", "econ & data science", "psychology" → the subjects a
 * free-text course query names. Parts joined by +, & or "and" must ALL match
 * (a joint programme); unrecognised text falls back to a name search.
 */
export function subjectsInQuery(q: string): { all: string[]; rest: string } {
  const parts = q
    .toLowerCase()
    .split(/\s*(?:\+|&|\band\b|,)\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
  const all: string[] = [];
  const rest: string[] = [];
  for (const part of parts) {
    const hit =
      SUBJECTS.find((s) => s.label.toLowerCase() === part || s.key === part) ??
      SUBJECTS.find((s) => s.label.toLowerCase().startsWith(part) && part.length >= 3) ??
      SUBJECTS.find((s) => s.patterns.some((re) => re.test(part)));
    if (hit) all.push(hit.key);
    else rest.push(part);
  }
  return { all: [...new Set(all)], rest: rest.join(" ") };
}

export const FIELD_NAMES: Record<string, string> = {
  economics: "Economics", business: "Business", finance: "Finance", "computer-science": "Computer Science", engineering: "Engineering",
  medicine: "Medicine", law: "Law", psychology: "Psychology", mathematics: "Mathematics", physics: "Physics", biology: "Biology",
  chemistry: "Chemistry", "political-science": "Political Science", "international-relations": "International Relations",
  humanities: "Humanities", architecture: "Architecture", design: "Design", media: "Media", "social-sciences": "Social Sciences",
  environmental: "Environmental Studies", "liberal-arts": "Liberal Arts",
  ...Object.fromEntries(SUBJECTS.map((x) => [x.key, x.label])),
};
