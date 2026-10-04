import { abroadRegionOf, slugify } from "./geo";

/* Canonical URLs for the Explore hierarchy, so every page builds the same breadcrumbs. */

export const explorePath = {
  root: "/explore",
  india: "/explore/india",
  state: (state: string) => `/explore/india/${slugify(state)}`,
  city: (state: string, city: string) => `/explore/india/${slugify(state)}/${slugify(city)}`,
  abroad: "/explore/abroad",
  abroadRegion: (countryCode: string) => `/explore/abroad/${abroadRegionOf(countryCode).slug}`,
};

/** Breadcrumb trail for an institution: Explore › India › Tamil Nadu › Chennai, or Explore › Abroad › UK › London. */
export function placeCrumbs(u: { countryCode: string; country: string; region: string; city: string; hub?: string | null }) {
  const hub = u.hub ?? u.city;
  if (u.countryCode === "IN") {
    return [
      { label: "Explore", href: explorePath.root },
      { label: "India", href: explorePath.india },
      { label: u.region === "Delhi" ? "Delhi NCR" : u.region, href: explorePath.state(u.region) },
      { label: hub, href: explorePath.city(u.region, hub) },
    ];
  }
  const r = abroadRegionOf(u.countryCode);
  return [
    { label: "Explore", href: explorePath.root },
    { label: "Abroad", href: explorePath.abroad },
    { label: r.label, href: `/explore/abroad/${r.slug}` },
    { label: u.country, href: `/universities/countries/${u.countryCode}` },
  ];
}
