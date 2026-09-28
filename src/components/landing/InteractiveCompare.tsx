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

const DIMENSIONS: {
  key: string;
  a: number;
  b: number;
  note: string;
}[] = [
  { key: "Academics", a: 82, b: 74, note: "Entry requirements and teaching depth" },
  { key: "Courses", a: 68, b: 88, note: "Breadth of programmes in your field" },
  { key: "Fees", a: 54, b: 79, note: "Lower total cost scores higher" },
  { key: "Location", a: 71, b: 63, note: "Against your stated preferences" },
  { key: "Admissions", a: 45, b: 72, note: "How achievable entry is for you" },
  { key: "Scholarships", a: 77, b: 51, note: "Availability you may be eligible for" },
  { key: "Career pathways", a: 86, b: 69, note: "Routes out of the course" },
  { key: "Outcomes", a: 64, b: 66, note: "Where graduates report going next" },
  { key: "Campus", a: 58, b: 84, note: "Facilities relevant to the course" },
  { key: "Student experience", a: 73, b: 81, note: "Reported day-to-day life" },
];

export function InteractiveCompare() {
  const [active, setActive] = useState(DIMENSIONS[2]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <p className="meta mb-4 text-ink/45">Pick a dimension</p>
        <ul className="grid gap-px overflow-hidden rounded-md border border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-1">
          {DIMENSIONS.map((d, i) => {
            const on = d.key === active.key;
            return (
              <li key={d.key}>
                <button
                  type="button"
                  onClick={() => setActive(d)}
                  aria-pressed={on}
                  className={[
                    "flex w-full items-center gap-3 px-5 py-3 text-left",
                    "transition-colors duration-[var(--dur-quick)] cursor-pointer",
                    on
                      ? "bg-ink text-paper"
                      : "bg-paper-warm text-ink/75 hover:bg-ink/[0.04]",
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

      <div className="self-start rounded-md border border-ink/12 bg-paper p-7 md:p-8">
        <p className="meta text-ink/45">Comparing on</p>
        <p className="display-s mt-2 text-ink">{active.key}</p>
        <p className="mt-2 text-[0.9375rem] text-ink/55">{active.note}</p>

        <div className="mt-8 space-y-6">
          {[
            { name: A, v: active.a },
            { name: B, v: active.b },
          ].map((row) => {
            const leads = row.v === Math.max(active.a, active.b);
            return (
              <div key={row.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.9375rem] text-ink">{row.name}</span>
                  <span
                    className={`tabular text-[0.9375rem] ${leads ? "text-electric" : "text-ink/45"}`}
                  >
                    {row.v}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-[var(--dur-base)] [transition-timing-function:var(--ease-out-edu)]"
                    style={{
                      width: `${row.v}%`,
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
