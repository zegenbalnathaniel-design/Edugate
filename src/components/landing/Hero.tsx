"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { Button } from "@/components/primitives/Button";
import { Container } from "@/components/primitives/Section";
import { useScrollStore } from "@/lib/motion/scrollStore";

// The canvas never blocks first paint or SSR. With JS disabled the hero below
// is still complete — the universe is an enhancement, not the interface (§96).
const EducationUniverse = dynamic(
  () =>
    import("@/components/webgl/EducationUniverse").then(
      (m) => m.EducationUniverse,
    ),
  { ssr: false },
);

const ECOSYSTEM = [
  "Schools",
  "Colleges",
  "Courses",
  "Careers",
  "Scholarships",
  "Outcomes",
];

/** Scroll runway, in viewport heights, over which the network organises. */
const RUNWAY = 0.85;

export function Hero() {
  const copyRef = useRef<HTMLDivElement>(null);

  /**
   * The copy yields to the resolved network at the end of the runway.
   *
   * Written straight to style from a store subscription rather than held in
   * React state — this updates on every scroll frame, and re-rendering the
   * hero 60x/second to change one opacity would be wasteful.
   */
  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const apply = (scroll: number) => {
      const runway = window.innerHeight * RUNWAY;
      // Hold the copy fully legible for the first 55% of the runway, then fade.
      const t = Math.max(0, Math.min(1, (scroll / runway - 0.55) / 0.45));
      el.style.opacity = String(1 - t);
      el.style.transform = `translateY(${-t * 28}px)`;
      // Once invisible it must stop intercepting clicks on what's beneath.
      el.style.pointerEvents = t > 0.9 ? "none" : "";
    };

    apply(useScrollStore.getState().scroll);
    return useScrollStore.subscribe((s) => apply(s.scroll));
  }, []);

  return (
    <section
      data-register="dark"
      aria-label="Edugate — education is too important to guess"
      className="relative"
      style={{ height: `${100 + RUNWAY * 100}svh` }}
    >
      {/* Pinned viewport: the canvas stays in frame for the whole runway, so
          the chaos→order transformation is watched rather than scrolled past. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <EducationUniverse runway={RUNWAY} />

        {/* Vignette: keeps display type legible over the brightest part of the
            field without dimming the field itself into mush. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,transparent_38%,rgba(5,7,13,0.5)_78%,rgba(5,7,13,0.88)_100%)]"
        />

        {/* pt clears the fixed nav; pb reserves the ecosystem strip below, so
            the headline block can centre without overflowing into either. */}
        <Container
          width="wide"
          className="relative z-10 flex h-full flex-col justify-center pb-24 pt-20 md:pb-28 md:pt-24"
        >
          <div ref={copyRef} className="max-w-[54rem] will-change-[opacity,transform]">
            <p className="meta mb-7 text-cyan/75">
              <span className="mr-3">01</span>Education decision intelligence
            </p>

            <h1 className="display-xl text-paper">
              Education
              <br />
              is too
              <br />
              important
              <br />
              to guess.
            </h1>

            <p className="measure mt-7 text-[var(--text-body-l)] leading-[1.6] text-paper/68">
              Turn fragmented education information into a clearer path
              forward. Edugate brings discovery, comparison and
              decision-making into one place — so a choice this large stops
              depending on whichever tab you happened to open.
            </p>

            {/* Full-width stacked on small screens: two lg buttons cannot sit
                side by side at 375px, and letting them wrap ragged looks
                accidental rather than designed. */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button href="/discover" size="lg" className="w-full sm:w-auto">
                Start exploring
              </Button>
              <Button
                href="#how"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                How Edugate works
              </Button>
            </div>

            <p className="mt-6 text-[0.875rem] text-paper/45">
              Free for students, parents and institutions.{" "}
              <a
                href="/signup"
                className="link-underline text-paper/75 hover:text-paper"
              >
                Create an account
              </a>
            </p>
          </div>

        </Container>

        {/*
          The DOM counterpart to the canvas. This is the accessible description
          of what the universe depicts, and it is what a screen reader, a
          crawler, or a JS-disabled browser gets instead.
        */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-6 md:pb-8">
          <Container width="wide">
            <div className="border-t border-paper/12 pt-5 md:pt-6">
              {/* Label is decorative framing for the list beneath it; on short
                  viewports the vertical budget is better spent on the list. */}
              <p className="meta mb-3.5 hidden text-paper/38 md:block">
                The education ecosystem, in one place
              </p>
              <ul className="flex flex-wrap gap-x-7 gap-y-2">
                {ECOSYSTEM.map((item) => (
                  <li
                    key={item}
                    className="text-[0.9375rem] text-paper/58 transition-colors duration-[var(--dur-quick)] hover:text-paper"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
