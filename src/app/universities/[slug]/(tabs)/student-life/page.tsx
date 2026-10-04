import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { getUniversity } from "@/lib/unis/repo";

export async function generateMetadata({ params }: PageProps<"/universities/[slug]/student-life">): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} student life — clubs, festivals & support` : "Student life" };
}

const GROUPS: { title: string; cats: string[] }[] = [
  { title: "Clubs & societies", cats: ["club", "society", "mun", "investment", "entrepreneurship"] },
  { title: "Festivals & culture", cats: ["festival", "cultural"] },
  { title: "Sport", cats: ["sport"] },
  { title: "Service & outreach", cats: ["service"] },
  { title: "International & exchange", cats: ["exchange"] },
  { title: "Support & career services", cats: ["student-support", "career-services"] },
  { title: "More", cats: ["other"] },
];

export default async function StudentLifePage({ params }: PageProps<"/universities/[slug]/student-life">) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const life = u.details.studentLife;
  const opps = u.opportunities.filter((o) => o.category === "student-life" || o.category === "international" || o.category === "exchange");

  return (
    <div className="space-y-14">
      {life.length === 0 && opps.length === 0 ? (
        <NotYet>Clubs, festivals and student services aren&apos;t documented on Edugate yet for {u.name} — that isn&apos;t the same as none existing.</NotYet>
      ) : (
        <>
          {GROUPS.map((g) => {
            const items = life.filter((x) => g.cats.includes(x.category));
            if (!items.length) return null;
            return (
              <Block key={g.title} title={g.title}>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((x) => (
                    <li key={x.name} className="glass p-4">
                      <p className="font-medium"><Sourced sourceId={x.sourceId} sources={S}>{x.name}</Sourced></p>
                      {x.description && <p className="mt-1 text-[0.875rem] text-paper/70">{x.description}</p>}
                    </li>
                  ))}
                </ul>
              </Block>
            );
          })}
          {opps.length > 0 && (
            <Block title="Opportunities beyond the classroom">
              <ul className="grid gap-4 sm:grid-cols-2">
                {opps.map((o) => (
                  <li key={o.name} className="glass p-4">
                    <p className="font-medium"><Sourced sourceId={o.sourceId} sources={S}>{o.name}</Sourced></p>
                    <p className="mt-1 text-[0.875rem] text-paper/70">{o.description}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </>
      )}
    </div>
  );
}
