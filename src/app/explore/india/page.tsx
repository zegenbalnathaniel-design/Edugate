import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Crumbs } from "@/components/explore/Crumbs";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { sortStates, stateLabel } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";
import { geoFacets } from "@/lib/unis/repo";

export const metadata: Metadata = { title: "Colleges in India by state" };

export default async function IndiaPage() {
  await connection(); // counts change with every data update; never serve a build-time snapshot
  const facets = (await geoFacets()).filter((f) => f.countryCode === "IN");
  const states = sortStates(
    Object.values(
      facets.reduce<Record<string, { name: string; institutions: number; programs: number; cities: { hub: string; n: number }[] }>>((acc, f) => {
        acc[f.region] ??= { name: f.region, institutions: 0, programs: 0, cities: [] };
        acc[f.region].institutions += f.institutions;
        acc[f.region].programs += f.programs;
        acc[f.region].cities.push({ hub: f.hub, n: f.institutions });
        return acc;
      }, {}),
    ),
  );
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <Crumbs items={[{ label: "Explore", href: explorePath.root }, { label: "India" }]} />
        <SectionLabel index="03" className="mt-6">India</SectionLabel>
        <h1 className="display-m mt-3">Colleges across India, state by state</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          Pick a state, then a city. Counts are what Edugate has verified so far — coverage grows Chennai first, then Tamil Nadu, then the rest of India.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {states.map((s) => (
            <div key={s.name} className="glass flex flex-col p-5">
              <Link href={explorePath.state(s.name)} className="font-display text-[1.375rem] hover:text-cyan">{stateLabel(s.name)}</Link>
              <p className="mt-1 text-[0.8125rem] text-paper/55">
                {s.institutions} institution{s.institutions === 1 ? "" : "s"} · {s.programs} programmes
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-[0.8125rem]">
                {s.cities.sort((a, b) => b.n - a.n || a.hub.localeCompare(b.hub)).map((c) => (
                  <li key={c.hub}>
                    <Link href={explorePath.city(s.name, c.hub)} className="inline-flex rounded-full border border-paper/20 px-3 py-1 hover:border-paper/60">
                      {c.hub} <span className="ml-1 text-paper/45">{c.n}</span>
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
