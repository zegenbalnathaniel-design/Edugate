"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered entrance.
 *
 * One shared IntersectionObserver for the whole page rather than one per
 * element: a results page can hold hundreds of rows, and an observer each
 * would cost more than the animation is worth.
 *
 * FAIL-OPEN BY DESIGN. Content starts at opacity 0, so anything that stops
 * the observer firing would hide the page — exactly the failure the route
 * entrance already hit once. Three guards, in order:
 *   1. Reduced motion, or no observer at all, shows immediately.
 *   2. An element already on screen at mount shows immediately, so
 *      above-the-fold content never waits for a scroll.
 *   3. A timeout shows it regardless. If the observer never fires for any
 *      reason, the worst case is a missing animation, never missing content.
 */
const SHOW_ANYWAY_MS = 1200;

let observer: IntersectionObserver | null = null;

function shared(): IntersectionObserver | null {
  if (typeof window === "undefined") return null;
  if (typeof IntersectionObserver === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.shown = "true";
        observer?.unobserve(e.target); // one-shot; never replays on scroll back
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  return observer;
}

export function Reveal({
  children,
  as: Tag = "div" as ElementType,
  stagger = false,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  stagger?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => {
      el.dataset.shown = "true";
    };

    const io = shared();
    if (!io) {
      show();
      return;
    }

    // Already on screen: show now rather than waiting for a scroll that may
    // never come on a short page.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      show();
      return;
    }

    io.observe(el);
    const timer = window.setTimeout(show, SHOW_ANYWAY_MS);
    return () => {
      window.clearTimeout(timer);
      io.unobserve(el);
    };
  }, []);

  const attrs = stagger ? { "data-stagger": "" } : { "data-reveal": "" };
  return (
    <Tag ref={ref} className={className} {...attrs}>
      {children}
    </Tag>
  );
}
