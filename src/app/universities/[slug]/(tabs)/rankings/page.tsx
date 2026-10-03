import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, DataTable, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { ORG_LABEL } from "@/lib/unis/format";
import { getUniversity } from "@/lib/unis/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} rankings` : "Rankings" };
}

export default async function RankingsPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const byOrg = Object.entries(Object.groupBy([...u.rankings].sort((a, b) => b.edition - a.edition), (r) => r.org));

  return (
    <div className="space-y-14">
      <Block
        title="Rankings"
        note="Each row names the publisher's own edition year. Rankings weigh things like research output and reputation — they say little about teaching quality or fit for you, and Edugate never sells placement in them."
      >
        {byOrg.length === 0 ? (
          <NotYet>No ranking verified for this university.</NotYet>
        ) : (
          <div className="space-y-8">
            {byOrg.map(([org, list]) => (
              <div key={org}>
                <h3 className="meta mb-3 text-paper/55">{ORG_LABEL[org] ?? org}</h3>
                <DataTable
                  caption={`${ORG_LABEL[org] ?? org} rankings`}
                  head={["Table", "Edition", "Rank"]}
                  minWidth={420}
                  rows={list!.map((r) => [
                    r.category,
                    r.edition,
                    <Sourced key="r" sourceId={r.sourceId} sources={S}>
                      <strong>#{r.rank}</strong>
                    </Sourced>,
                  ])}
                />
              </div>
            ))}
          </div>
        )}
      </Block>
    </div>
  );
}
