import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { dateLabel } from "@/lib/unis/format";
import { getUniversity } from "@/lib/unis/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} scholarships & financial aid` : "Scholarships" };
}

export default async function ScholarshipsPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;

  return (
    <div className="space-y-14">
      <Block title={`Scholarships & aid (${u.scholarships.length})`} note="Awards listed by the institution — its own, and government schemes it administers. Eligibility is summarised; always read the official terms.">
        {u.scholarships.length === 0 ? (
          <NotYet>
            None verified on Edugate yet — that isn&apos;t the same as none existing. See <Link href="/scholarships" className="text-cyan">external scholarships</Link>.
          </NotYet>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {[...u.scholarships].sort((a, b) => (a.provider === "government" ? 1 : 0) - (b.provider === "government" ? 1 : 0)).map((s) => (
              <li key={s.name} className="glass flex flex-col p-5">
                <p className="meta text-paper/50">{[s.provider === "government" ? "Government" : s.provider === "external" ? "External" : null, ...s.kind].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 font-display text-[1.125rem]">{s.name}</p>
                <p className="mt-2 text-[0.875rem] text-paper/75">{s.eligibility}</p>
                <dl className="mt-3 space-y-1 text-[0.875rem]">
                  {s.coverage && (
                    <div>
                      <dt className="inline text-paper/50">Covers: </dt>
                      <dd className="inline">{s.coverage}</dd>
                    </div>
                  )}
                  {s.deadline && (
                    <div>
                      <dt className="inline text-paper/50">Deadline: </dt>
                      <dd className="inline">{dateLabel(s.deadline)}</dd>
                    </div>
                  )}
                  {s.renewable != null && (
                    <div>
                      <dt className="inline text-paper/50">Renewable: </dt>
                      <dd className="inline">{s.renewable ? "Yes" : "No"}</dd>
                    </div>
                  )}
                  {s.renewalConditions && (
                    <div>
                      <dt className="inline text-paper/50">To keep it: </dt>
                      <dd className="inline">{s.renewalConditions}</dd>
                    </div>
                  )}
                  {s.applicationProcess && (
                    <div>
                      <dt className="inline text-paper/50">How to apply: </dt>
                      <dd className="inline">{s.applicationProcess}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-auto flex flex-wrap gap-4 pt-4 text-[0.8125rem]">
                  <Sourced sourceId={s.sourceId} sources={S} confidence={s.confidence}>Source</Sourced>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">Official page ↗</a>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-[0.875rem] text-paper/65">
          Also check national and state schemes open to students at any institution on the{" "}
          <Link href="/scholarships" className="text-cyan hover:underline">scholarships page</Link>.
        </p>
        {u.financialAidUrl && (
          <p className="mt-5 text-[0.875rem]">
            <a href={u.financialAidUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">Official financial aid page ↗</a>
          </p>
        )}
      </Block>
    </div>
  );
}
