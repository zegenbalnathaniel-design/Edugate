"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-triggered reveal.
 *
 * Uses IntersectionObserver rather than a GSAP ScrollTrigger per element —
 * dozens of ScrollTriggers each with their own start/end calculation is a
 * measurable scroll cost, and this only needs a one-shot class toggle.
 *
 * Under reduced motion the content is simply visible from the start (§95).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.style.transitionDelay = `${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = "none";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(16px)",
        transition:
          "opacity var(--dur-base) var(--ease-out-edu), transform var(--dur-base) var(--ease-out-edu)",
      }}
    >
      {children}
    </Tag>
  );
}
