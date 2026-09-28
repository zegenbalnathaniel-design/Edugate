"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useScrollStore } from "@/lib/motion/scrollStore";
import { Button } from "@/components/primitives/Button";

const NAV = [
  { label: "Discover", href: "/discover" },
  { label: "Compare", href: "/compare" },
  { label: "Passion Projector", href: "/passion-projector" },
  { label: "Decision Engine", href: "/compare" },
  { label: "Students", href: "/student" },
  { label: "Parents", href: "/parents" },
  { label: "Institutions", href: "/discover" },
  { label: "Methodology", href: "/methodology" },
];

/**
 * Minimal floating navigation (§10). Becomes more opaque and structured once
 * scrolled — the only place in the product that uses backdrop-blur, because it
 * has to stay legible over both dark and light registers.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Subscribe imperatively: this only needs to flip a boolean at a threshold,
    // not re-render on every frame of scroll.
    const unsub = useScrollStore.subscribe((s) => {
      const next = s.scroll > 40;
      setScrolled((prev) => (prev === next ? prev : next));
    });
    return unsub;
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl",
        "transition-[background-color,border-color] duration-[var(--dur-base)]",
        "[transition-timing-function:var(--ease-out-edu)]",
        // Always a real background — never fully transparent. That is what
        // keeps light nav text legible over a light-register page and what
        // stops content scrolling underneath from ghosting through it.
        scrolled
          ? "border-paper/10 bg-void/96"
          : "border-paper/6 bg-void/62",
      ].join(" ")}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1600px] items-center gap-8 px-6 md:h-18 md:px-10"
      >
        <Link
          href="/"
          className="shrink-0 text-paper"
          aria-label="Edugate — home"
        >
          <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
            EDUGATE
          </span>
        </Link>

        <ul className="ml-2 hidden flex-1 items-center gap-6 xl:flex">
          {NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="link-underline text-[0.8125rem] text-paper/62 transition-colors duration-[var(--dur-quick)] hover:text-paper"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <Link
            href="/student"
            className="link-underline hidden px-2 text-[0.8125rem] text-paper/62 transition-colors hover:text-paper sm:block"
          >
            Your hub
          </Link>
          <Button href="/passion-projector" size="sm" magnetic={false}>
            Get started
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="ml-1 flex size-9 items-center justify-center text-paper xl:hidden"
          >
            <span className="sr-only">
              {open ? "Close menu" : "Open menu"}
            </span>
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
              <path
                d={open ? "M2 2 L16 10 M16 2 L2 10" : "M0 1 H18 M0 11 H18"}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-paper/10 bg-void/97 backdrop-blur-xl xl:hidden"
        >
          <ul className="flex flex-col px-6 py-4">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-paper/8 py-3.5 text-[0.9375rem] text-paper/80"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/student"
                onClick={() => setOpen(false)}
                className="block py-3.5 text-[0.9375rem] text-paper/80"
              >
                Your hub
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
