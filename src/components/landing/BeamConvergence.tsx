"use client";

import { useRef, useState, createRef } from "react";
import { AnimatedBeam } from "@/components/fx/AnimatedBeam";

/**
 * Twelve scattered sources, one destination.
 *
 * This is §02 stated as a diagram: the information already exists, it is just
 * spread across places that were never meant to be read together. The beams
 * are the argument, not ornament — hovering any source isolates its own beam
 * so the viewer can trace a single thread out of the tangle.
 */
const SOURCES = [
  "Google",
  "College websites",
  "Ranking sites",
  "YouTube",
  "Reddit",
  "Counsellors",
  "Spreadsheets",
  "Scholarship portals",
  "Application portals",
  "WhatsApp",
  "School websites",
  "Notes app",
];

const LEFT = SOURCES.slice(0, 6);
const RIGHT = SOURCES.slice(6);

export function BeamConvergence() {
  const container = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Stable refs, created once — recreating them per render would make the
  // beams recompute their paths on every hover.
  const leftRefs = useRef(LEFT.map(() => createRef<HTMLLIElement>()));
  const rightRefs = useRef(RIGHT.map(() => createRef<HTMLLIElement>()));

  const chip = (label: string) =>
    [
      "glass relative z-10 flex items-center justify-center !rounded-sm px-3.5 py-2.5",
      "text-[0.8125rem] transition-all duration-[var(--dur-quick)]",
      "[transition-timing-function:var(--ease-out-edu)] cursor-default",
      hovered === label ? "!border-cyan/60 !bg-cyan/10 text-ink" : "text-ink/55",
      hovered && hovered !== label ? "opacity-40" : "opacity-100",
    ].join(" ");

  return (
    <div
      ref={container}
      className="relative mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 py-6 sm:gap-10"
    >
      <ul className="flex flex-col gap-3">
        {LEFT.map((label, i) => (
          <li
            key={label}
            ref={leftRefs.current[i]}
            className={chip(label)}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
          >
            {label}
          </li>
        ))}
      </ul>

      {/* Destination */}
      <div
        ref={hub}
        className="relative z-10 flex size-24 shrink-0 flex-col items-center justify-center rounded-full border border-ink/15 bg-ink text-paper shadow-[0_0_0_10px_rgba(10,15,26,0.04)] sm:size-32"
      >
        <span className="font-display text-[0.8125rem] font-semibold tracking-[-0.01em] sm:text-[0.9375rem]">
          EDUGATE
        </span>
        <span className="meta mt-1 text-cyan/85">One place</span>
      </div>

      <ul className="flex flex-col gap-3">
        {RIGHT.map((label, i) => (
          <li
            key={label}
            ref={rightRefs.current[i]}
            className={chip(label)}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
          >
            {label}
          </li>
        ))}
      </ul>

      {/* Beams sit behind the chips (z-0) and are aria-hidden — the lists above
          already carry the same information as text. */}
      <div className="absolute inset-0 text-academic">
        {LEFT.map((label, i) => (
          <AnimatedBeam
            key={label}
            containerRef={container}
            fromRef={leftRefs.current[i]}
            toRef={hub}
            curvature={(i - 2.5) * 16}
            duration={3.4 + i * 0.22}
            delay={i * 0.28}
            active={hovered === label}
          />
        ))}
        {RIGHT.map((label, i) => (
          <AnimatedBeam
            key={label}
            containerRef={container}
            fromRef={rightRefs.current[i]}
            toRef={hub}
            curvature={(i - 2.5) * 16}
            duration={3.4 + i * 0.22}
            delay={0.9 + i * 0.28}
            active={hovered === label}
          />
        ))}
      </div>
    </div>
  );
}
