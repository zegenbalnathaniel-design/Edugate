import Link from "next/link";
import { Fragment } from "react";

/** Explore › India › Tamil Nadu › Chennai › … — the drill-down path, always clickable back up. */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="meta flex flex-wrap items-center gap-x-2 gap-y-1 text-paper/50">
      {items.map((it, i) => (
        <Fragment key={`${it.label}-${i}`}>
          {i > 0 && <span aria-hidden>›</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-paper">{it.label}</Link>
          ) : (
            <span aria-current="page" className="text-paper/75">{it.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
