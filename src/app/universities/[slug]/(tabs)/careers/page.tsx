import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { getUniversity } from "@/lib/unis/repo";

export async function generateMetadata({ params }: PageProps<"/universities/[slug]/careers">): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} careers — where graduates go` : "Careers" };
}

export default async function CareersPage({ params }: PageProps<"/universities/[slug]/careers">) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const withCareers = u.programs.filter((p) => p.careers && (p.careers.paths.length || p.careers.higherStudy.length));
  const careerOpps = u.opportunities.filter((o) => ["careers", "internships", "industry", "entrepreneurship", "networking"].includes(o.category));
  const programOpps = u.programs.flatMap((p) => p.opportunities.filter((o) => ["internships", "industry", "research"].includes(o.category)).map((o) => ({ p, o })));

  return (
    <div className="space-y-14">
      <Block title="Career paths & higher study by course" note="As the institution or programme describes them. Graduate outcomes with numbers are on the Placements tab.">
        {withCareers.length === 0 ? (
          <NotYet>No course-specific career pathways verified yet. <Link href={`/universities/${u.slug}/placements`} className="text-cyan">See placements</Link> for published outcomes.</NotYet>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {withCareers.map((p) => (
              <div key={p.slug} className="glass p-5">
                <Link href={`/universities/${u.slug}/programs/${p.slug}`} className="font-display text-[1.125rem] hover:text-cyan">{p.name}</Link>
                {p.careers!.paths.length > 0 && (
                  <p className="mt-2 text-[0.875rem]"><span className="meta text-paper/50">Careers </span>{p.careers!.paths.join(", ")}</p>
                )}
                {p.careers!.higherStudy.length > 0 && (
                  <p className="mt-1 text-[0.875rem]"><span className="meta text-paper/50">Higher study </span>{p.careers!.higherStudy.join(", ")}</p>
                )}
                <p className="mt-2 text-[0.75rem]"><Sourced sourceId={p.careers!.sourceId} sources={S} confidence={p.careers!.confidence}>Source</Sourced></p>
              </div>
            ))}
          </div>
        )}
      </Block>

      <Block title="Internships, industry & entrepreneurship">
        {careerOpps.length + programOpps.length === 0 ? (
          <NotYet>No career-service, internship or incubator programmes documented yet.</NotYet>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {careerOpps.map((o) => (
              <li key={o.name} className="glass p-4">
                <p className="meta text-paper/45">{o.category}</p>
                <p className="mt-1 font-medium"><Sourced sourceId={o.sourceId} sources={S}>{o.name}</Sourced></p>
                <p className="mt-1 text-[0.875rem] text-paper/70">{o.description}</p>
              </li>
            ))}
            {programOpps.map(({ p, o }) => (
              <li key={`${p.slug}-${o.name}`} className="glass p-4">
                <p className="meta text-paper/45">{p.name} · {o.category}</p>
                <p className="mt-1 font-medium"><Sourced sourceId={o.sourceId} sources={S}>{o.name}</Sourced></p>
                <p className="mt-1 text-[0.875rem] text-paper/70">{o.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Alumni">
        {u.details.alumni.length === 0 ? (
          <NotYet>No alumni documented yet.</NotYet>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {u.details.alumni.map((a) => (
              <li key={a.name} className="text-[0.9375rem]">
                <Sourced sourceId={a.sourceId} sources={S}><strong>{a.name}</strong></Sourced>
                <span className="block text-[0.8125rem] text-paper/65">{a.note}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
    </div>
  );
}
