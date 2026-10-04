import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Crumbs } from "@/components/explore/Crumbs";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { ABROAD_REGIONS, abroadRegionOf } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";
import { geoFacets } from "@/lib/unis/repo";

export const metadata: Metadata = { title: "Study abroad — universities by destination" };

export default async function AbroadPage() {
  await connection(); // counts change with every data update; never serve a build-time snapshot
  const facets = (await geoFacets()).filter((f) => f.countryCode !== "IN");
  const regions = ABROAD_REGIONS.map((r) => {
    const rows = facets.filter((f) => abroadRegionOf(f.countryCode).slug === r.slug);
    const countries = [...new Map(rows.map((f) => [f.countryCode, { code: f.countryCode, name: f.country, n: 0 }])).values()];
    for (const c of countries) c.n = rows.filter((f) => f.countryCode === c.code).reduce((a, f) => a + f.institutions, 0);
    return { ...r, n: rows.reduce((a, f) => a + f.institutions, 0), programs: rows.reduce((a, f) => a + f.programs, 0), countries };
  }).filter((r) => r.n > 0);
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <Crumbs items={[{ label: "Explore", href: explorePath.root }, { label: "Abroad" }]} />
        <SectionLabel index="04" className="mt-6">Abroad</SectionLabel>
        <h1 className="display-m mt-3">Universities abroad, by destination</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          The same profile depth as Indian institutions — entry requirements for CBSE, ISC, state boards and IB, tests, tuition in the local currency with a dated rupee/dollar conversion, aid and outcomes.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {regions.map((r) => (
            <div key={r.slug} className="glass flex flex-col p-5">
              <Link href={`/explore/abroad/${r.slug}`} className="font-display text-[1.375rem] hover:text-cyan">{r.label}</Link>
              <p className="mt-1 text-[0.8125rem] text-paper/55">{r.n} universit{r.n === 1 ? "y" : "ies"} · {r.programs} programmes</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-[0.8125rem]">
                {r.countries.map((c) => (
                  <li key={c.code}>
                    <Link href={`/universities/countries/${c.code}`} className="inline-flex rounded-full border border-paper/20 px-3 py-1 hover:border-paper/60">
                      {c.name} <span className="ml-1 text-paper/45">{c.n}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
