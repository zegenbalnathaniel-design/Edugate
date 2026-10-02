import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { countryFacets } from "@/lib/unis/repo";

export const metadata: Metadata = { title: "Universities by country" };

export default async function CountriesPage() {
  const countries = await countryFacets();
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">Country explorer</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Where could you study?</h1>
        <p className="measure mb-10 text-[0.9375rem] text-paper/65">Country → region → university. Counts reflect what&apos;s verified on Edugate so far, not every university in each country.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c) => (
            <Link key={c.code} href={`/universities/countries/${c.code}`} className="glass glass-interactive block p-5">
              <p className="font-display text-[1.375rem]">{c.name}</p>
              <p className="mt-1 text-[0.875rem] text-paper/65">{c.count} universit{c.count === 1 ? "y" : "ies"} · {c.regions.join(", ")}</p>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
