import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { Sourced } from "@/components/unis/Sourced";
import { Sources } from "@/components/primitives/Sources";
import { getCurrentUser } from "@/lib/auth/session";
import { SCHOLARSHIPS } from "@/lib/data/fixtures/education/scholarships";
import { dateLabel } from "@/lib/unis/format";
import { isPast } from "@/lib/unis/freshness";
import { allUniversities } from "@/lib/unis/repo";
import { getProfile } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Scholarships" };

const KINDS = ["merit", "need", "international", "full", "partial", "automatic", "competitive"] as const;

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<{ kind?: string; country?: string }> }) {
  const { kind, country } = await searchParams;
  const [unis, user] = await Promise.all([allUniversities(), getCurrentUser()]);
  const profile = user ? await getProfile(user.id) : null;
  const institutional = unis
    .flatMap((r) => r.data.scholarships.map((s) => ({ s, u: r.data })))
    .filter(({ s, u }) => (!kind || s.kind.includes(kind as never)) && (!country || u.countryCode === country));
  const countries = [...new Map(unis.map((r) => [r.countryCode, r.country])).entries()].sort((a, b) => a[1].localeCompare(b[1]));

  /** §27: never "you will receive" — only what the published criteria appear to say. */
  const hint = (u: { countryCode: string; country: string }, kinds: string[]) => {
    if (!profile?.citizenship) return null;
    const international = profile.citizenship !== u.countryCode;
    if (kinds.includes("international") && international) return { tone: "text-verified", text: "✓ Open to international students — you appear to meet this published criterion. Check the full eligibility on the source." };
    if (kinds.includes("domestic") && international) return { tone: "text-attention", text: `✗ Published as domestic-only — you don't appear eligible as a non-${u.country} citizen.` };
    return { tone: "text-paper/60", text: "◐ Eligibility unclear from the published summary — read the source." };
  };

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">Scholarships</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Scholarships & financial aid</h1>
        <p className="measure mb-8 text-[0.9375rem] text-paper/65">
          University aid programmes and major external awards, each linked to its official source.{" "}
          {profile ? "Hints below compare the published criteria with your profile — they are never a promise of an award." : <><Link href="/login?next=/scholarships" className="text-cyan">Sign in</Link> to see which published criteria you appear to meet.</>}
        </p>

        <form method="get" className="glass mb-10 flex flex-wrap items-end gap-4 p-4">
          <label className="grid gap-1">
            <span className="meta text-paper/55">Type</span>
            <select name="kind" defaultValue={kind ?? ""} className="rounded-[var(--radius-md)] border border-paper/20 bg-navy-800 px-3 py-2 text-[0.875rem]">
              <option value="">Any</option>
              {KINDS.map((k) => <option key={k} value={k} className="capitalize">{k}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="meta text-paper/55">University country</span>
            <select name="country" defaultValue={country ?? ""} className="rounded-[var(--radius-md)] border border-paper/20 bg-navy-800 px-3 py-2 text-[0.875rem]">
              <option value="">Any</option>
              {countries.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </label>
          <button className="h-10 rounded-full bg-electric px-5 text-[0.875rem] font-semibold text-[var(--on-electric)]">Filter</button>
        </form>

        <section className="mb-16">
          <h2 className="meta mb-4 text-paper/60">University aid ({institutional.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {institutional.map(({ s, u }) => {
              const h = hint(u, s.kind);
              return (
                <article key={`${u.slug}-${s.name}`} className="glass p-5">
                  <p className="meta text-paper/50"><Link href={`/universities/${u.slug}`} className="hover:text-paper">{u.name}</Link> · {u.country}</p>
                  <h3 className="mt-1.5 font-display text-[1.125rem]">{s.name}</h3>
                  <p className="meta mt-1 text-electric">{s.kind.join(" · ")}</p>
                  <p className="mt-2 text-[0.875rem] text-paper/75">{s.eligibility}</p>
                  <p className="mt-2 text-[0.875rem]">
                    <Sourced sourceId={s.sourceId} sources={u.sources} confidence={s.confidence}>
                      {[s.coverage, s.deadline && `${isPast(s.deadline) ? "Deadline passed" : "Deadline"} ${dateLabel(s.deadline)}`, s.renewable && "Renewable"].filter(Boolean).join(" · ") || "Details on source"}
                    </Sourced>
                  </p>
                  {h && <p className={`mt-3 text-[0.8125rem] ${h.tone}`}>{h.text}</p>}
                </article>
              );
            })}
          </div>
        </section>

        {!kind && !country && (
          <section>
            <h2 className="meta mb-4 text-paper/60">External scholarships & fellowships ({SCHOLARSHIPS.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {SCHOLARSHIPS.map((s) => (
                <article key={s.id} className="glass p-5">
                  <p className="meta text-paper/50">{s.provider}</p>
                  <h3 className="mt-1.5 font-display text-[1.125rem]">{s.name}</h3>
                  <p className="meta mt-1 text-electric">{s.basis.join(" · ")}</p>
                  <p className="mt-2 text-[0.875rem] text-paper/75">{s.eligibility.description}</p>
                  <p className="mt-2 text-[0.8125rem] text-paper/60">Published deadline on record: {dateLabel(s.deadline)}{isPast(s.deadline) ? " (passed — check the next cycle)" : ""}</p>
                  <Sources sources={s.sources} className="mt-3" />
                </article>
              ))}
            </div>
          </section>
        )}
      </Container>
    </Section>
  );
}
