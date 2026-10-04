import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/explore/Crumbs";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { HOME_HUB, slugify, stateLabel } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";
import { geoFacets, universitiesWhere } from "@/lib/unis/repo";

async function resolve(slug: string) {
  const facets = (await geoFacets()).filter((f) => f.countryCode === "IN");
  const name = facets.find((f) => slugify(f.region) === slug)?.region;
  return name ? { name, facets: facets.filter((f) => f.region === name) } : null;
}

export async function generateMetadata({ params }: PageProps<"/explore/india/[state]">): Promise<Metadata> {
  const r = await resolve((await params).state);
  return { title: r ? `Colleges in ${stateLabel(r.name)}` : "State" };
}

export default async function StatePage({ params }: PageProps<"/explore/india/[state]">) {
  const r = await resolve((await params).state);
  if (!r) notFound();
  const rows = await universitiesWhere({ countryCodes: ["IN"], region: r.name });
  const cities = [...r.facets].sort((a, b) => (a.hub === HOME_HUB.city ? -1 : b.hub === HOME_HUB.city ? 1 : b.institutions - a.institutions || a.hub.localeCompare(b.hub)));
  const label = stateLabel(r.name);

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <Crumbs items={[{ label: "Explore", href: explorePath.root }, { label: "India", href: explorePath.india }, { label }]} />
        <SectionLabel index={r.name === HOME_HUB.state ? "02" : "03"} className="mt-6">{label}</SectionLabel>
        <h1 className="display-m mt-3">Colleges in {label}</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          {rows.length} institution{rows.length === 1 ? "" : "s"} across {cities.length} cit{cities.length === 1 ? "y" : "ies"} on Edugate so far. Choose a city to see every institution there, grouped by type.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li key={c.hub}>
              <Link href={explorePath.city(r.name, c.hub)} className="glass glass-interactive inline-flex items-baseline gap-2 px-4 py-2.5">
                <span className="font-display text-[1.125rem]">{c.hub}</span>
                <span className="text-[0.8125rem] text-paper/55">{c.institutions} · {c.programs} programmes</span>
              </Link>
            </li>
          ))}
        </ul>
        {cities.map((c) => {
          const list = rows.filter((u) => (u.hub ?? u.city) === c.hub);
          return (
            <section key={c.hub} className="mt-14" aria-labelledby={`city-${slugify(c.hub)}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 id={`city-${slugify(c.hub)}`} className="font-display text-[1.5rem]">{c.hub}</h2>
                <Link href={explorePath.city(r.name, c.hub)} className="text-[0.875rem] text-cyan hover:underline">All of {c.hub} →</Link>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((u) => <UniversityCard key={u.slug} row={u} />)}
              </div>
            </section>
          );
        })}
      </Container>
    </Section>
  );
}
