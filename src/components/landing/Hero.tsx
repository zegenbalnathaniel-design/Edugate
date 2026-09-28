"use client";

import { Button } from "@/components/primitives/Button";
import { Container } from "@/components/primitives/Section";
import { Spotlight } from "@/components/fx/Spotlight";

const ECOSYSTEM = [
  "Schools",
  "Colleges",
  "Courses",
  "Careers",
  "Scholarships",
  "Outcomes",
];

/**
 * The hero. No WebGL, no scroll-pinned runway — a single viewport with a
 * liquid gradient-mesh ground and a cursor-tracked spotlight. Simpler,
 * sturdier across viewport sizes, and the motion budget goes toward things
 * that stay legible rather than a particle field.
 */
export function Hero() {
  return (
    <section
      data-register="dark"
      aria-label="Edugate — education is too important to guess"
      className="mesh-ground grain relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* Orbit rings — a static, decorative echo of "a resolved system",
          without a single particle running on the main thread. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-60">
        <div className="relative size-[130vmin] max-w-none">
          {[0.32, 0.5, 0.7, 0.92].map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full border"
              style={{
                inset: `${(1 - size) * 50}%`,
                borderColor: i % 2 === 0 ? "rgba(55,212,230,0.14)" : "rgba(47,107,255,0.12)",
                transform: `rotate(${i * 14}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      <Spotlight
        as="div"
        variant="spotlight-surface"
        className="relative z-10 flex min-h-[100svh] w-full flex-col"
      >
        <Container
          width="wide"
          className="flex flex-1 flex-col justify-center pb-24 pt-28 md:pb-28 md:pt-32"
        >
          <div className="max-w-[54rem]">
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

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="moving-border w-full sm:w-auto">
                <Button href="/discover" size="lg" magnetic={false} className="w-full sm:w-auto">
                  Start exploring
                </Button>
              </div>
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

        <div className="relative z-10 border-t border-paper/12 pb-6 pt-5 md:pb-8 md:pt-6">
          <Container width="wide">
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
          </Container>
        </div>
      </Spotlight>
    </section>
  );
}
