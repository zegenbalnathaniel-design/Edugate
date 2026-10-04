import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, NotYet } from "@/components/unis/Blocks";
import { getUniversity, searchPrograms, universitiesWhere } from "@/lib/unis/repo";
import { parseFilters } from "@/lib/unis/filters";
import { tierOf } from "@/lib/unis/geo";
import { programSubjects } from "@/lib/unis/taxonomy";

export async function generateMetadata({ params }: PageProps<"/universities/[slug]/compare">): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `Compare ${row.name}` : "Compare" };
}

/**
 * Starting points for comparison: similar institutions nearby, and the same
 * kind of course elsewhere — chosen only by shared subjects and location.
 */
export default async function CompareTab({ params }: PageProps<"/universities/[slug]/compare">) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const subjects = [...new Set(u.programs.flatMap((p) => programSubjects(p)))];
  const nearby = (u.countryCode === "IN" ? await universitiesWhere({ countryCodes: ["IN"], region: u.region }) : await universitiesWhere({ countryCodes: [u.countryCode] }))
    .filter((r) => r.slug !== u.slug)
    .map((r) => ({ r, shared: new Set(r.data.programs.flatMap((p) => programSubjects(p)).filter((s) => subjects.includes(s))).size }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.r.name.localeCompare(b.r.name))
    .slice(0, 6);
  const mine = u.programs.slice(0, 40);
  const firstSubject = programSubjects(u.programs[0])[0];
  const alternatives = (await searchPrograms({ ...parseFilters({}), fields: [firstSubject] }))
    .filter((h) => h.uni.slug !== u.slug && tierOf(h.uni) === tierOf({ countryCode: u.countryCode, region: u.region, hub: u.hub, city: u.city }))
    .slice(0, 12);

  return (
    <div className="space-y-14">
      <Block title="Compare with similar institutions" note={u.countryCode === "IN" ? `In ${u.region}, offering courses in the same subjects.` : `In ${u.country}, offering courses in the same subjects.`}>
        {nearby.length === 0 ? (
          <NotYet>No similar institution nearby on Edugate yet.</NotYet>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map(({ r, shared }) => (
                <li key={r.slug} className="glass flex items-center justify-between gap-3 p-4">
                  <span>
                    <Link href={`/universities/${r.slug}`} className="font-medium hover:text-cyan">{r.name}</Link>
                    <span className="block text-[0.75rem] text-paper/50">{r.hub ?? r.city} · {shared} shared subject{shared === 1 ? "" : "s"}</span>
                  </span>
                  <Link href={`/compare?u=${u.slug},${r.slug}`} className="shrink-0 rounded-full border border-paper/25 px-3 py-1 text-[0.8125rem] hover:border-paper/60">Compare</Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.875rem]">
              <Link href={`/compare?u=${[u.slug, ...nearby.slice(0, 3).map((x) => x.r.slug)].join(",")}`} className="text-cyan hover:underline">Compare {u.name} with the first three →</Link>
            </p>
          </>
        )}
      </Block>

      <Block title="Compare courses" note="Tick courses here and, optionally, the same kind of course elsewhere — then compare them side by side (up to 5).">
        <form action="/compare/programs" method="get" className="grid gap-6 lg:grid-cols-2">
          <fieldset className="glass p-5">
            <legend className="meta px-1 text-paper/55">At {u.name}</legend>
            <div className="mt-2 grid max-h-96 gap-1.5 overflow-y-auto pr-1">
              {mine.map((p) => (
                <label key={p.slug} className="flex items-start gap-2 text-[0.875rem]">
                  <input type="checkbox" name="p" value={`${u.slug}/${p.slug}`} className="mt-1 accent-[var(--color-electric)]" />
                  <span>{p.name}{p.stream ? <span className="text-paper/50"> · {p.stream}</span> : null}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="glass p-5">
            <legend className="meta px-1 text-paper/55">Similar courses nearby</legend>
            {alternatives.length === 0 ? (
              <p className="mt-2 text-[0.875rem] text-paper/60">None on Edugate yet.</p>
            ) : (
              <div className="mt-2 grid max-h-96 gap-1.5 overflow-y-auto pr-1">
                {alternatives.map((h) => (
                  <label key={`${h.uni.slug}/${h.program.slug}`} className="flex items-start gap-2 text-[0.875rem]">
                    <input type="checkbox" name="p" value={`${h.uni.slug}/${h.program.slug}`} className="mt-1 accent-[var(--color-electric)]" />
                    <span>{h.program.name} <span className="text-paper/50">· {h.uni.name}</span></span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <div className="lg:col-span-2">
            <button className="h-10 rounded-full bg-electric px-5 text-[0.875rem] font-semibold text-[var(--on-electric)]">Compare selected →</button>
          </div>
        </form>
      </Block>
    </div>
  );
}
