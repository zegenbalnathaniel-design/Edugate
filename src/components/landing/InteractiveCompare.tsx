"use client";

import { useState } from "react";
import { Provenance } from "@/components/primitives/Provenance";
import { Sources } from "@/components/primitives/Sources";
import { INSTITUTIONS } from "@/lib/data/fixtures/education/institutions";
import { COURSES } from "@/lib/data/fixtures/education/courses";
import { SCHOLARSHIPS } from "@/lib/data/fixtures/education/scholarships";
import type { Institution } from "@/lib/data/types";

/**
 * Live comparison of two real institutions from the sourced dataset.
 *
 * Every value is read straight from the fixtures, which carry citations —
 * nothing here is scored or invented. The point is still that no single
 * ordering exists: the engineering institute is far cheaper, the liberal-arts
 * university teaches in small seminars, and which of those matters is the
 * student's call, not a ranking's.
 */
const PAIR = ["col_iit_bombay", "col_ashoka_university"]
  .map((id) => INSTITUTIONS.find((i) => i.id === id))
  .filter((i): i is Institution => Boolean(i));

const inr = (n: number) => `₹${(n / 1e5).toFixed(1)}L`;

const DIMENSIONS: { key: string; note: string; value: (i: Institution) => string }[] = [
  {
    key: "Fees",
    note: "Published tuition range, before any aid",
    value: (i) => `${inr(i.tuition.min)}–${inr(i.tuition.max)} per ${i.tuition.period}`,
  },
  {
    key: "Admissions",
    note: "How you get in",
    value: (i) => i.admissions.requirements[0] ?? "—",
  },
  {
    key: "Programs",
    note: "Programs listed on Edugate so far",
    value: (i) =>
      COURSES.filter((c) => c.institutions.includes(i.id))
        .map((c) => c.name)
        .join(" · ") || "—",
  },
  {
    key: "Class size",
    note: "What a typical class looks like",
    value: (i) => i.studentExperience.classSizeDescriptor,
  },
  {
    key: "Scholarships",
    note: "Aid linked to this institution",
    value: (i) =>
      SCHOLARSHIPS.filter((s) => i.scholarships.includes(s.id))
        .map((s) => s.name)
        .join(" · ") || "None linked yet",
  },
  {
    key: "Campus",
    note: "Setting and size",
    value: (i) => i.campus.sizeDescriptor,
  },
  {
    key: "Location",
    note: "Where you would live",
    value: (i) => `${i.location.city}, ${i.location.state}`,
  },
  {
    key: "Track record",
    note: "Year founded",
    value: (i) => `Founded ${i.founded}`,
  },
];

export function InteractiveCompare() {
  const [active, setActive] = useState(DIMENSIONS[0]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <p className="meta mb-4 text-ink/55">Pick a dimension</p>
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
                    on ? "bg-ink text-paper" : "text-ink/80 hover:bg-ink/[0.06]",
                  ].join(" ")}
                >
                  <span className={`tabular text-[0.6875rem] ${on ? "text-[#f2bf2a]" : "text-ink/40"}`}>
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
        <p className="meta text-ink/55">Comparing on</p>
        <p className="display-s mt-2 text-ink">{active.key}</p>
        <p className="mt-2 text-[0.9375rem] text-ink/60">{active.note}</p>

        <div className="mt-8 space-y-6">
          {PAIR.map((inst) => (
            <div key={inst.id} className="border-l-2 border-electric pl-4">
              <p className="meta text-ink/55">{inst.name}</p>
              <p className="mt-1.5 text-[1rem] leading-snug text-ink">{active.value(inst)}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 border-t border-ink/15 pt-5 text-[0.875rem] leading-[1.55] text-ink/70">
          Change the dimension and the better fit changes. This is why Edugate
          compares rather than ranks — a single ordering would have to pretend
          one of these rows matters more than the others to everyone.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Provenance kind="verified" />
          <Sources sources={PAIR.flatMap((i) => i.sources.slice(0, 1))} />
        </div>
      </div>
    </div>
  );
}
