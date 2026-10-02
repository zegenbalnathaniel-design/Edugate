import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { parseFilters } from "@/lib/unis/filters";
import { searchUniversities } from "@/lib/unis/repo";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rows } = await searchUniversities(parseFilters({ country: (await params).code }));
  return { title: rows[0] ? `Universities in ${rows[0].country}` : "Country" };
}

export default async function CountryPage({ params }: Props) {
  const code = (await params).code.toUpperCase();
  const { rows } = await searchUniversities(parseFilters({ country: code }));
  if (!rows.length) notFound();
  const byRegion = Object.entries(Object.groupBy(rows, (r) => r.data.region)).sort(([a], [b]) => a.localeCompare(b));
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <nav aria-label="Breadcrumb" className="meta text-paper/50">
          <Link href="/universities/countries" className="hover:text-paper">Countries</Link> › {rows[0].country}
        </nav>
        <h1 className="display-m mt-3 mb-10">{rows[0].country}</h1>
        {byRegion.map(([region, list]) => (
          <section key={region} className="mb-12">
            <h2 className="meta mb-4 text-paper/60">{region}</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{list!.map((r) => <UniversityCard key={r.slug} row={r} />)}</div>
          </section>
        ))}
        <Link href={`/universities?country=${code}`} className="text-cyan">Filter these further →</Link>
      </Container>
    </Section>
  );
}
