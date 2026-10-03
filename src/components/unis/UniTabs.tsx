"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type TabDef = { href: string; label: string; count?: number };

/** Section tabs for a university profile — each is its own URL, so it can be linked and shared. */
export function UniTabs({ tabs }: { tabs: TabDef[] }) {
  const path = usePathname();
  return (
    <nav aria-label="University sections" className="sticky top-16 z-30 -mx-6 mt-8 border-b border-paper/10 bg-void/90 px-6 backdrop-blur-xl md:top-18 md:-mx-10 md:px-10">
      <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <li key={t.href} className="shrink-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-3.5 text-[0.875rem] transition-colors ${
                  active ? "border-electric text-paper" : "border-transparent text-paper/60 hover:text-paper"
                }`}
              >
                {t.label}
                {t.count != null && <span className="rounded-full bg-paper/10 px-1.5 text-[0.6875rem] tabular text-paper/60">{t.count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
