import Link from "next/link";
import { CHENNAI_DIRECTORY, directoryCoverage } from "@/lib/unis/directory";
import { dateLabel } from "@/lib/unis/format";

/** Every college on the Greater Chennai Corporation's list, linked to a full profile where Edugate has one. */
export function ChennaiDirectory() {
  const d = CHENNAI_DIRECTORY;
  const cov = directoryCoverage(d);
  return (
    <section aria-labelledby="gcc-directory" className="mt-16 border-t border-paper/10 pt-10">
      <h2 id="gcc-directory" className="font-display text-[1.5rem]">Every college in Chennai</h2>
      <p className="measure mt-2 text-[0.875rem] text-paper/60">
        The Greater Chennai Corporation&apos;s list of colleges in the city, by category — {cov.total} colleges, {cov.profiled} with a full Edugate profile so far.
        Source:{" "}
        <a href={d.source.url} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">{d.source.label} ↗</a>
        <span className="text-paper/45"> · retrieved {dateLabel(d.source.retrievedAt)}</span>
      </p>
      <div className="mt-6 space-y-3">
        {d.categories.map((c) => {
          const profiled = c.colleges.filter((e) => e.slug).length;
          return (
            <details key={c.key} className="glass group" open={c.key === "arts-and-science"}>
              <summary className="flex cursor-pointer items-baseline justify-between gap-3 px-5 py-4">
                <span className="font-display text-[1.125rem]">{c.label}</span>
                <span className="text-[0.8125rem] text-paper/50">
                  {c.colleges.length} college{c.colleges.length === 1 ? "" : "s"} · {profiled} profiled
                </span>
              </summary>
              <ul className="grid gap-x-6 border-t border-paper/10 px-5 py-4 text-[0.9375rem] sm:grid-cols-2 xl:grid-cols-3">
                {c.colleges.map((e) => (
                  <li key={e.name} className="border-b border-paper/5 py-2">
                    {e.slug ? (
                      <Link href={`/universities/${e.slug}`} className="hover:text-cyan">
                        {e.name} <span aria-hidden className="text-electric">→</span>
                      </Link>
                    ) : (
                      <span className="text-paper/75">{e.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
