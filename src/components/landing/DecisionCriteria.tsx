"use client";

import { useMemo, useState } from "react";
import { Provenance } from "@/components/primitives/Provenance";
import { Spotlight } from "@/components/fx/Spotlight";

/**
 * The Decision Engine's transparency, made operable.
 *
 * Toggle a criterion and the shortlist recomputes in front of you, with each
 * option showing exactly which criteria it satisfies. This is §16 and §102
 * demonstrated rather than described: the reader can turn a criterion off and
 * watch an option disappear, which is what "you can disagree with it" means.
 */
type CriterionKey =
  | "academic"
  | "interest"
  | "budget"
  | "timeline"
  | "location";

const CRITERIA: { key: CriterionKey; label: string; detail: string }[] = [
  { key: "academic", label: "Academic alignment", detail: "Entry requirements within your range" },
  { key: "interest", label: "Interest alignment", detail: "Matches your Passion Projector signals" },
  { key: "budget", label: "Budget alignment", detail: "Total cost inside your stated range" },
  { key: "timeline", label: "Timeline compatible", detail: "Application window fits your intake" },
  { key: "location", label: "Location fit", detail: "Within your preferred cities" },
];

const OPTIONS: {
  name: string;
  course: string;
  place: string;
  meets: CriterionKey[];
}[] = [
  {
    name: "Meridian Institute of Technology",
    course: "B.Tech Computer Science",
    place: "Pune, Maharashtra",
    meets: ["academic", "interest", "budget", "timeline", "location"],
  },
  {
    name: "Calder School of Design",
    course: "B.Des Interaction Design",
    place: "Bengaluru, Karnataka",
    meets: ["interest", "timeline", "location"],
  },
  {
    name: "Northfield University",
    course: "BSc Economics & Data Science",
    place: "Hyderabad, Telangana",
    meets: ["academic", "budget", "timeline"],
  },
  {
    name: "Ashgrove College of Science",
    course: "BSc Applied Mathematics",
    place: "Chennai, Tamil Nadu",
    meets: ["academic", "budget"],
  },
];

export function DecisionCriteria() {
  const [on, setOn] = useState<Set<CriterionKey>>(
    new Set(["academic", "interest", "budget"]),
  );

  const toggle = (k: CriterionKey) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  // An option qualifies only if it satisfies every active criterion. Ranking
  // by "how many extra boxes it ticks" would smuggle in a hidden weighting —
  // the whole point is that the reader sets the bar, not us.
  const shortlist = useMemo(
    () =>
      OPTIONS.filter((o) => [...on].every((k) => o.meets.includes(k))),
    [on],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
      <div>
        <p className="meta mb-4 text-paper/45">Your criteria</p>
        <ul className="space-y-2.5">
          {CRITERIA.map((c) => {
            const active = on.has(c.key);
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => toggle(c.key)}
                  aria-pressed={active}
                  className={[
                    "flex w-full items-start gap-3.5 rounded-md border px-4 py-3.5 text-left",
                    "transition-all duration-[var(--dur-quick)] cursor-pointer",
                    "[transition-timing-function:var(--ease-out-edu)]",
                    active
                      ? "border-cyan/45 bg-cyan/[0.07]"
                      : "border-paper/12 bg-paper/[0.02] hover:border-paper/25",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className={[
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-[var(--dur-instant)]",
                      active
                        ? "border-cyan bg-cyan text-void"
                        : "border-paper/30",
                    ].join(" ")}
                  >
                    {active && (
                      <svg width="10" height="8" viewBox="0 0 10 8">
                        <path
                          d="M1 4 L3.6 6.4 L9 1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span
                      className={`block text-[0.9375rem] ${active ? "text-paper" : "text-paper/70"}`}
                    >
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-paper/45">
                      {c.detail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <p className="meta text-paper/45">Your shortlist</p>
          <p className="tabular text-[0.8125rem] text-paper/55">
            {shortlist.length} of {OPTIONS.length}
          </p>
        </div>

        {shortlist.length === 0 ? (
          <div className="rounded-md border border-dashed border-paper/20 px-6 py-12 text-center">
            <p className="text-[0.9375rem] text-paper/70">
              Nothing meets all five criteria.
            </p>
            <p className="measure mx-auto mt-2 text-[0.875rem] text-paper/45">
              That is a real answer, not an error — it tells you which
              constraint to reconsider first. Turn one off to see what opens up.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {shortlist.map((o) => (
              <Spotlight
                key={o.name}
                as="li"
                variant="both"
                className="rounded-md border border-paper/14 bg-navy-800/50 p-5 transition-colors duration-[var(--dur-quick)]"
              >
                <p className="text-[1rem] text-paper">{o.name}</p>
                <p className="mt-1 text-[0.875rem] text-paper/50">
                  {o.course} · {o.place}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {[...on].map((k) => {
                    const c = CRITERIA.find((x) => x.key === k)!;
                    return (
                      <li
                        key={k}
                        className="meta rounded-full border border-cyan/35 bg-cyan/10 px-2.5 py-1 text-cyan"
                      >
                        {c.label}
                      </li>
                    );
                  })}
                </ul>
              </Spotlight>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <Provenance kind="illustrative" />
        </div>
      </div>
    </div>
  );
}
