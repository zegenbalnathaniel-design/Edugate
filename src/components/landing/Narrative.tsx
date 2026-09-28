import Link from "next/link";
import {
  Section,
  Container,
  SectionLabel,
} from "@/components/primitives/Section";
import { Reveal } from "./Reveal";
import { Button } from "@/components/primitives/Button";
import { Spotlight } from "@/components/fx/Spotlight";
import { BeamConvergence } from "./BeamConvergence";
import { InteractiveCompare } from "./InteractiveCompare";
import { DecisionCriteria } from "./DecisionCriteria";
import { RankingNotForSale } from "./RankingNotForSale";
import { CircularBeamPool } from "@/components/fx/CircularBeamPool";

/* ------------------------------------------------------------------ */
/* 02 — The problem (§02)                                              */
/* ------------------------------------------------------------------ */

export function ProblemSection() {
  return (
    <Section
      register="light"
      id="how"
      label="The problem"
      className="relative overflow-hidden py-28 md:py-40"
    >
      {/* Technical grid, masked at the edges — the section never sits on a
          flat fill, but the texture stays beneath the type. */}
      <div aria-hidden className="bg-grid absolute inset-0 text-ink" />

      <Container width="wide" className="relative">
        <div className="max-w-3xl">
          <SectionLabel index="02" className="text-ink/45">
            The problem
          </SectionLabel>
          <Reveal>
            <h2 className="display-l mt-7 text-ink">
              Twelve tabs.
              <br />
              No answer.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="measure mt-7 text-[var(--text-body-l)] leading-[1.6] text-ink/65">
              The information needed to choose a course, a college and a career
              already exists. It is simply scattered across a dozen places that
              were never designed to be read together — and none of which were
              built to answer <em className="not-italic text-ink">your</em>{" "}
              question.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-16">
            <BeamConvergence />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <p className="meta mt-6 text-center text-ink/40">
            Hover a source to trace a single thread
          </p>
        </Reveal>

        {/* The transformation chain (§02), as a typographic ladder. */}
        <div className="mt-24 border-t border-ink/10 pt-12 md:mt-32">
          <SectionLabel className="text-ink/45">
            What Edugate does with it
          </SectionLabel>
          <ol className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-4">
            {[
              "Fragmented",
              "Verified",
              "Context",
              "Comparison",
              "Personal",
              "Planning",
              "Action",
              "Decision",
            ].map((step, i, arr) => (
              <Reveal as="li" key={step} delay={i * 55}>
                <span
                  className={`display-s ${
                    i === arr.length - 1 ? "text-electric" : "text-ink/30"
                  }`}
                >
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span aria-hidden className="ml-3 text-ink/20">
                    →
                  </span>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — Discover (§14)                                                 */
/* ------------------------------------------------------------------ */

const DISCOVER_FACETS = [
  {
    k: "Institutions",
    v: "Schools, colleges and universities",
    n: "Verified where verification exists",
  },
  {
    k: "Courses",
    v: "Degrees, durations, subjects and requirements",
    n: "Including what studying it actually involves",
  },
  {
    k: "Careers",
    v: "Where a field of study can actually lead",
    n: "Multiple pathways, never one prescribed route",
  },
  {
    k: "Scholarships",
    v: "Eligibility, coverage and deadlines",
    n: "Filtered against your profile",
  },
];

export function DiscoverSection() {
  return (
    <Section
      register="deep"
      label="Discover"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div aria-hidden className="bg-dots absolute inset-0 text-cyan" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(47,107,255,0.14),transparent_70%)]"
      />

      <Container width="wide" className="relative">
        <div className="max-w-3xl">
          <SectionLabel index="03" className="text-cyan/70">
            Discover
          </SectionLabel>
          <Reveal>
            <h2 className="display-l mt-7 text-paper">
              Start with everything.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="measure mt-7 text-[var(--text-body-l)] leading-[1.6] text-paper/65">
              Discovery should widen the field before it narrows it. Edugate
              opens with the whole education ecosystem — institutions, courses,
              careers, scholarships and the routes between them — so options
              are found rather than merely confirmed.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVER_FACETS.map((f, i) => (
            <Reveal as="li" key={f.k} delay={i * 70}>
              <Spotlight
                variant="both"
                className="glass glass-interactive h-full p-7"
              >
                <p className="display-s text-paper">{f.k}</p>
                <p className="mt-3 text-[0.9375rem] leading-[1.55] text-paper/55">
                  {f.v}
                </p>
                <p className="meta mt-5 border-t border-paper/10 pt-4 text-cyan/65">
                  {f.n}
                </p>
              </Spotlight>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={140}>
          <div className="mt-10">
            <Button href="/discover" variant="secondary">
              Open the discovery map
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — Discern (§15)                                                  */
/* ------------------------------------------------------------------ */

export function DiscernSection() {
  return (
    <Section
      register="warm"
      label="Discern"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div aria-hidden className="bg-grid absolute inset-0 text-ink" />

      <Container width="wide" className="relative">
        <div className="max-w-3xl">
          <SectionLabel index="04" className="text-ink/45">
            Discern
          </SectionLabel>
          <Reveal>
            <h2 className="display-l mt-7 text-ink">
              Then make it small
              <br />
              enough to think about.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="measure mt-7 text-[var(--text-body-l)] leading-[1.6] text-ink/65">
              Thousands of possibilities are not a decision — they are a
              different kind of paralysis. Comparison is where the universe
              contracts: ten dimensions, side by side, on the things that
              actually differ.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-14">
            <InteractiveCompare />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-10">
            <Button href="/compare" variant="secondary">
              Open the comparison engine
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 05 — Decide (§16)                                                   */
/* ------------------------------------------------------------------ */

export function DecideSection() {
  return (
    <Section
      register="deep"
      label="Decide"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div aria-hidden className="bg-dots absolute inset-0 text-electric" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_10%,rgba(55,212,230,0.12),transparent_70%)]"
      />

      <Container width="wide" className="relative">
        <div className="max-w-3xl">
          <SectionLabel index="05" className="text-cyan/70">
            Decide
          </SectionLabel>
          <Reveal>
            <h2 className="display-l mt-7 text-paper">
              And show your working.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="measure mt-7 text-[var(--text-body-l)] leading-[1.6] text-paper/65">
              Edugate never returns an unexplained recommendation. Every option
              arrives with the criteria that put it there — so you can disagree
              with it. Turn a criterion off and watch the shortlist change.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-14">
            <DecisionCriteria />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button href="/decision-engine">Open the Decision Engine</Button>
            <Button href="/passion-projector" variant="secondary">
              Start with Passion Projector
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 06 — Ranking ≠ payment (§78)                                        */
/* ------------------------------------------------------------------ */

export function TrustSection() {
  return (
    <Section
      register="light"
      label="Ranking is not payment"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div aria-hidden className="bg-grid absolute inset-0 text-ink" />

      <Container width="wide" className="relative">
        <SectionLabel index="06" className="text-ink/45">
          Trust
        </SectionLabel>

        <Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
            <span className="display-l text-ink">Ranking</span>
            <span className="display-l text-attention" aria-label="is not">
              ≠
            </span>
            <span className="display-l text-ink">Payment</span>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <p className="measure mt-9 text-[var(--text-body-l)] leading-[1.6] text-ink/65">
            No institution can pay to raise its position, alter a
            recommendation, or buy a place on a shortlist. Not as a policy we
            enforce — as a capability the platform does not have.
          </p>
        </Reveal>

        <Reveal delay={130}>
          <div className="mt-14">
            <RankingNotForSale />
          </div>
        </Reveal>

        <Reveal delay={170}>
          <div className="mt-12">
            <Link
              href="/methodology"
              className="link-underline text-[1rem] font-medium text-ink"
            >
              Read the methodology
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 07 — Closing (§104)                                                 */
/* ------------------------------------------------------------------ */

export function ClosingSection() {
  return (
    <Section
      register="dark"
      label="Find your direction"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(47,107,255,0.14),transparent_62%)]"
      />
      <div aria-hidden className="bg-dots absolute inset-0 text-cyan" />

      <Container width="wide" className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <h2 className="display-l text-paper">
                Don&rsquo;t just find an option.
                <br />
                <span className="text-paper/45">Find your direction.</span>
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <p className="mt-10 font-display text-[1.75rem] leading-[1.2] font-medium tracking-[-0.02em] text-paper md:text-[2.125rem]">
                Discover.
                <br />
                Discern.
                <br />
                Decide.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-11 flex flex-wrap gap-3">
                <Button href="/discover" size="lg">
                  Start exploring
                </Button>
                <Button href="/signup" variant="secondary" size="lg">
                  Create free account
                </Button>
              </div>
            </Reveal>
          </div>

          {/* The opening universe answered: the field that began as scatter
              now turns as one resolved system (§104). */}
          <Reveal delay={120}>
            <div className="flex justify-center lg:justify-end">
              <CircularBeamPool />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
