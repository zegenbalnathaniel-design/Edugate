import type { ReactNode } from "react";

/* Shared building blocks for the university profile tabs. */

export function Block({ title, children, note, id }: { title: string; children: ReactNode; note?: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-36">
      <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.01em]">{title}</h2>
      {note && <p className="mt-1 max-w-3xl text-[0.8125rem] text-paper/55">{note}</p>}
      <div className="mt-5">{children}</div>
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

/** An honest empty state: absence of verified data is not absence of the thing. */
export function NotYet({ children }: { children: ReactNode }) {
  return <p className="rounded-[var(--radius-md)] border border-paper/10 px-4 py-3 text-[0.9375rem] text-paper/60">{children}</p>;
}
