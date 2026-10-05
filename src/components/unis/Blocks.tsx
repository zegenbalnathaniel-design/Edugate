import type { ReactNode } from "react";

/* Shared building blocks for the university profile tabs. */

export function Block({ title, children, note, id }: { title: string; children: ReactNode; note?: ReactNode; id?: string }) {
  return (
    <section id={id} className="block-section scroll-mt-36">
      <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.01em]">{title}</h2>
      {note && <p className="mt-1 max-w-3xl text-[0.8125rem] text-paper/55">{note}</p>}
      <div className="block-body mt-5">{children}</div>
    </section>
  );
}

export function DataTable({ head, rows, caption, minWidth = 560 }: { head: string[]; rows: ReactNode[][]; caption: string; minWidth?: number }) {
  return (
    <div className="glass overflow-x-auto">
      <table className="w-full text-left text-[0.875rem]" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-paper/10 text-paper/55">
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-paper/5 align-top last:border-0">
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-4 py-3 font-medium text-paper">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="px-4 py-3 text-paper/85">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Placeholder for data Edugate hasn't verified. Renders nothing: unverified
 * boxes are never shown, and a Block left with no content hides itself
 * (globals.css, `.block-section:has(> .block-body:empty)`).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function NotYet(_: { children: ReactNode }) {
  return null;
}

/** A real empty state worth stating — no filter match, or data the institution doesn't publish. */
export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-[var(--radius-md)] border border-paper/10 px-4 py-3 text-[0.9375rem] text-paper/60">{children}</p>;
}
