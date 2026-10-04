import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/explore/Crumbs";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { ABROAD_REGIONS } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";
import { universitiesWhere } from "@/lib/unis/repo";

const named = ABROAD_REGIONS.flatMap((r) => (r.countries === "rest" ? [] : r.countries)).concat("IN");

export async function generateMetadata({ params }: PageProps<"/explore/abroad/[region]">): Promise<Metadata> {
  const { region } = await params;
  const r = ABROAD_REGIONS.find((x) => x.slug === region);
  return { title: r ? `Universities in ${r.label}` : "Abroad" };
}

export default async function AbroadRegionPage({ params }: PageProps<"/explore/abroad/[region]">) {
  const { region } = await params;
  const r = ABROAD_REGIONS.find((x) => x.slug === region);
  if (!r) notFound();
  const rows = r.countries === "rest" ? await universitiesWhere({ notCountryCodes: named }) : await universitiesWhere({ countryCodes: r.countries });
  const byCountry = Object.entries(Object.groupBy(rows, (u) => u.country));
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <Crumbs items={[{ label: "Explore", href: explorePath.root }, { label: "Abroad", href: explorePath.abroad }, { label: r.label }]} />
        <SectionLabel index="04" className="mt-6">{r.label}</SectionLabel>
        <h1 className="display-m mt-3">Universities in {r.label}</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">{rows.length} universit{rows.length === 1 ? "y" : "ies"} on Edugate so far.</p>
        {byCountry.map(([country, list]) => (
          <section key={country} className="mt-12">
            {byCountry.length > 1 && <h2 className="font-display text-[1.5rem]">{country}</h2>}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {list!.map((u) => <UniversityCard key={u.slug} row={u} />)}
            </div>
          </section>
        ))}
      </Container>
    </Section>
  );
}
