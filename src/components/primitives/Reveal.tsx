"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered entrance.
 *
 * One shared IntersectionObserver for the whole page rather than one per
 * element: a results page can hold hundreds of rows, and an observer each
 * would cost more than the animation is worth. Elements opt in with
 * [data-reveal] or [data-stagger]; the observer only flips [data-shown].
 *
 * Under prefers-reduced-motion the CSS shows everything immediately and this
 * never runs, so there is no flash of hidden content.
 */
let observer: IntersectionObserver | null = null;

function shared(): IntersectionObserver | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.shown = "true";
        observer?.unobserve(e.target); // one-shot; never animates on scroll back
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
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
    const io = shared();
    if (!io) {
      el.dataset.shown = "true"; // reduced motion, or no observer available
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  const attrs = stagger ? { "data-stagger": "" } : { "data-reveal": "" };
  return (
    <Tag ref={ref} className={className} {...attrs}>
      {children}
    </Tag>
  );
}
