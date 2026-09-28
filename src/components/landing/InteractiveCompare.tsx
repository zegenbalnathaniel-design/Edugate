"use client";

import { useState } from "react";
import { Provenance } from "@/components/primitives/Provenance";

/**
 * Live comparison across the ten dimensions of §15.
 *
 * Clicking a dimension compares two illustrative institutions on it. The point
 * being demonstrated is that institutions do not rank uniformly — pick a
 * different dimension and the winner changes. That is the argument for
 * comparison-as-a-tool rather than a single ranking, made by letting the
 * reader discover it instead of being told.
 *
 * Every figure here is fictional and marked (D2).
 */
const A = "Meridian Institute of Technology";
const B = "Calder School of Design";

type Band = "limited" | "moderate" | "strong";

const BAND_LABEL: Record<Band, string> = {
  limited: "Limited",
  moderate: "Moderate",
  strong: "Strong",
};
// Bar width only — a relative visual encoding, never displayed as a number.
// Showing "82 vs 74" would be exactly the fabricated-precision D2.4 forbids.
const BAND_WIDTH: Record<Band, number> = { limited: 32, moderate: 60, strong: 88 };

const DIMENSIONS: {
  key: string;
  a: Band;
  b: Band;
  note: string;
}[] = [
  { key: "Academics", a: "strong", b: "moderate", note: "Entry requirements and teaching depth" },
  { key: "Courses", a: "moderate", b: "strong", note: "Breadth of programmes in your field" },
  { key: "Fees", a: "limited", b: "strong", note: "Lower total cost bands higher" },
  { key: "Location", a: "moderate", b: "moderate", note: "Against your stated preferences" },
  { key: "Admissions", a: "limited", b: "moderate", note: "How achievable entry is for you" },
  { key: "Scholarships", a: "strong", b: "limited", note: "Availability you may be eligible for" },
  { key: "Career pathways", a: "strong", b: "moderate", note: "Routes out of the course" },
  { key: "Outcomes", a: "moderate", b: "moderate", note: "Where graduates report going next" },
  { key: "Campus", a: "limited", b: "strong", note: "Facilities relevant to the course" },
  { key: "Student experience", a: "moderate", b: "strong", note: "Reported day-to-day life" },
];

export function InteractiveCompare() {
  const [active, setActive] = useState(DIMENSIONS[2]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <p className="meta mb-4 text-ink/45">Pick a dimension</p>
        <ul className="glass grid gap-px overflow-hidden p-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {DIMENSIONS.map((d, i) => {
            const on = d.key === active.key;
            return (
              <li key={d.key}>
                <button
                  type="button"
                  onClick={() => setActive(d)}
                  aria-pressed={on}
                  className={[
                    "flex w-full items-center gap-3 rounded-md px-4 py-3 text-left",
                    "transition-colors duration-[var(--dur-quick)] cursor-pointer",
                    on
                      ? "bg-ink text-paper"
                      : "text-ink/75 hover:bg-ink/[0.05]",
                  ].join(" ")}
                >
                  <span
                    className={`tabular text-[0.6875rem] ${on ? "text-cyan" : "text-ink/35"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.9375rem]">{d.key}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="glass self-start p-7 md:p-8">
        <p className="meta text-ink/45">Comparing on</p>
        <p className="display-s mt-2 text-ink">{active.key}</p>
        <p className="mt-2 text-[0.9375rem] text-ink/55">{active.note}</p>

        <div className="mt-8 space-y-6">
          {[
            { name: A, band: active.a },
            { name: B, band: active.b },
          ].map((row) => {
            const leads = BAND_WIDTH[row.band] === Math.max(BAND_WIDTH[active.a], BAND_WIDTH[active.b]) && active.a !== active.b;
            return (
              <div key={row.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.9375rem] text-ink">{row.name}</span>
                  <span
                    className={`meta ${leads ? "text-electric" : "text-ink/45"}`}
                  >
                    {BAND_LABEL[row.band]}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-[var(--dur-base)] [transition-timing-function:var(--ease-out-edu)]"
                    style={{
                      width: `${BAND_WIDTH[row.band]}%`,
                      background: leads
                        ? "var(--color-electric)"
                        : "var(--color-grey-400)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 border-t border-ink/10 pt-5 text-[0.875rem] leading-[1.55] text-ink/60">
          Change the dimension and the leader changes. This is why Edugate
          compares rather than ranks — a single ordering would have to pretend
          one of these columns matters more than the others to everyone.
        </p>

        <div className="mt-5">
          <Provenance kind="illustrative" />
        </div>
      </div>
    </div>
  );
}
