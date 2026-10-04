/*
 * The discovery hierarchy (docs/09 §2): Chennai → Tamil Nadu → India → Abroad.
 * Inside India: State → City → Institution → Program. A campus outside a city's
 * limits but listed under it by students (e.g. Kattankulathur for Chennai)
 * carries `hub` = that city, and keeps its real locality on the record.
 */

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");

/** Indian states and UTs in the order students asked to browse them; the rest follow alphabetically. */
export const INDIA_STATE_ORDER = [
  "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "West Bengal", "Telangana", "Andhra Pradesh", "Kerala", "Gujarat",
  "Rajasthan", "Uttar Pradesh", "Haryana", "Punjab",
];

export const STATE_LABEL: Record<string, string> = { Delhi: "Delhi NCR" };
export const stateLabel = (s: string) => STATE_LABEL[s] ?? s;

export function sortStates<T extends { name: string }>(rows: T[]): T[] {
  const idx = (n: string) => {
    const i = INDIA_STATE_ORDER.indexOf(n);
    return i < 0 ? 999 : i;
  };
  return [...rows].sort((a, b) => idx(a.name) - idx(b.name) || a.name.localeCompare(b.name));
}

/** The home-hub tier for an Indian student. */
export const HOME_HUB = { city: "Chennai", state: "Tamil Nadu" } as const;

export type Tier = "chennai" | "tamil-nadu" | "india" | "abroad";
export const TIER_LABEL: Record<Tier, string> = { chennai: "Chennai", "tamil-nadu": "Tamil Nadu", india: "Rest of India", abroad: "Abroad" };
export const TIERS: Tier[] = ["chennai", "tamil-nadu", "india", "abroad"];

export function tierOf(r: { countryCode: string; region: string; hub: string | null; city: string }): Tier {
  if (r.countryCode !== "IN") return "abroad";
  if ((r.hub ?? r.city) === HOME_HUB.city) return "chennai";
  if (r.region === HOME_HUB.state) return "tamil-nadu";
  return "india";
}

/** Destinations abroad, grouped the way Indian students shortlist them. */
export const ABROAD_REGIONS: { slug: string; label: string; countries: string[] | "rest" }[] = [
  { slug: "usa", label: "USA", countries: ["US"] },
  { slug: "uk", label: "UK", countries: ["GB"] },
  { slug: "canada", label: "Canada", countries: ["CA"] },
  { slug: "australia", label: "Australia", countries: ["AU", "NZ"] },
  { slug: "singapore", label: "Singapore", countries: ["SG"] },
  {
    slug: "europe",
    label: "Europe",
    countries: ["IE", "NL", "DE", "FR", "IT", "ES", "CH", "SE", "DK", "FI", "NO", "BE", "AT", "PT", "PL", "CZ", "HU"],
  },
  { slug: "uae", label: "UAE", countries: ["AE"] },
  { slug: "hong-kong", label: "Hong Kong", countries: ["HK"] },
  { slug: "other", label: "Other destinations", countries: "rest" },
];

export function abroadRegionOf(countryCode: string) {
  return (
    ABROAD_REGIONS.find((r) => r.countries !== "rest" && r.countries.includes(countryCode)) ?? ABROAD_REGIONS[ABROAD_REGIONS.length - 1]
  );
}

export const INSTITUTION_TYPE_LABEL: Record<string, string> = {
  "central-university": "Central university",
  "state-university": "State university",
  "state-private-university": "State private university",
  "deemed-university": "Deemed-to-be university",
  "institute-of-national-importance": "Institute of National Importance",
  "autonomous-college": "Autonomous college",
  "affiliated-college": "Affiliated college",
  "constituent-college": "Constituent college",
  "standalone-institute": "Standalone institute",
  "foreign-university": "University",
};

/** Order institution types appear in on a city page. */
export const INSTITUTION_TYPE_ORDER = [
  "institute-of-national-importance", "central-university", "state-university", "deemed-university", "state-private-university",
  "autonomous-college", "constituent-college", "affiliated-college", "standalone-institute", "foreign-university",
];
