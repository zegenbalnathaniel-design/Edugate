import { CURRICULA } from "../profile/schema";
import { FieldKey } from "./schema";

/*
 * Filter state lives in the URL (docs/07 §6) so searches are shareable and
 * savable. Within one filter values are OR'd; across filters, AND'd; "NOT"
 * is expressed with explicit negative values (sat=not-required).
 */

export const QS_BANDS = { "1-50": [1, 50], "51-100": [51, 100], "101-250": [101, 250], "251+": [251, 100000] } as const;
export type QsBand = keyof typeof QS_BANDS;
export const SORTS = { qs: "QS rank", name: "Name", cost: "Lowest international tuition" } as const;
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
    control: list(sp.control).filter((c) => ["public", "private", "public-private"].includes(c)),
    sort,
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
  return p.toString();
}

export function activeFilterCount(f: Filters) {
  return [f.q, f.countries.length, f.fields.length, f.curricula.length, f.qs.length, f.sat, f.maxUsd, f.control.length].filter(Boolean).length;
}

export const FIELD_NAMES: Record<string, string> = {
  economics: "Economics", business: "Business", finance: "Finance", "computer-science": "Computer Science", engineering: "Engineering",
  medicine: "Medicine", law: "Law", psychology: "Psychology", mathematics: "Mathematics", physics: "Physics", biology: "Biology",
  chemistry: "Chemistry", "political-science": "Political Science", "international-relations": "International Relations",
  humanities: "Humanities", architecture: "Architecture", design: "Design", media: "Media", "social-sciences": "Social Sciences",
  environmental: "Environmental Studies", "liberal-arts": "Liberal Arts",
};
