"use client";

import { useState } from "react";
import { INVERTED_KEYS, MATRIX_KEYS, MATRIX_LABELS, type Ideation } from "@/lib/architect/schemas";
import { inputCls, primaryBtnCls, secondaryBtnCls } from "@/components/forms/styles";
import { LevelPill } from "./LevelPill";

const MAX_COMBINE = 3;

/** Parts II–IV and the user-selection step: profile, concepts, fit matrix, and what to do next. */
export function ConceptBoard({
  ideation,
  selected,
  onSelect,
  onBuild,
  onNewRound,
  onMoreDiscovery,
}: {
  ideation: Ideation;
  selected: string[];
  onSelect: (ids: string[]) => void;
  onBuild: () => void;
  onNewRound: (feedback: string, rejectAll: boolean) => void;
  onMoreDiscovery: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [view, setView] = useState<"cards" | "matrix">("cards");
  const { profile, concepts, matrix } = ideation;
  const title = (id: string) => concepts.find((c) => c.id === id)?.title ?? id;

  const toggle = (id: string) =>
    onSelect(selected.includes(id) ? selected.filter((x) => x !== id) : selected.length < MAX_COMBINE ? [...selected, id] : selected);

  return (
    <div className="space-y-10">
      <section className="glass p-6 sm:p-8">
        <p className="meta text-cyan">Your profile</p>
        <p className="mt-3 max-w-3xl text-body-l text-paper/85">{profile.summary}</p>
        <div className="mt-6 grid gap-6 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Core interests", profile.coreInterests],
              ["Patterns you didn't name", profile.hiddenInterests],
              ["Strengths", profile.strengths],
              ["Constraints", profile.constraints],
            ] as const
          ).map(([label, items]) =>
            items.length ? (
              <div key={label}>
                <p className="meta mb-1.5 text-paper/45">{label}</p>
                <ul className="space-y-1 text-paper/80">
                  {items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.75rem]">{concepts.length} project concepts</h2>
            <p className="mt-1 max-w-2xl text-[0.9375rem] text-paper/65">
              Pick one to build — or up to {MAX_COMBINE} to combine into a single project. {ideation.recommendation}
            </p>
          </div>
          <div className="flex rounded-full border border-paper/20 p-0.5 text-[0.8125rem]" role="tablist" aria-label="View">
            {(["cards", "matrix"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-3.5 py-1.5 ${view === v ? "bg-paper/15 text-paper" : "text-paper/60"}`}
              >
                {v === "cards" ? "Concepts" : "Fit matrix"}
              </button>
            ))}
          </div>
        </div>

        {view === "cards" ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {concepts.map((c) => {
              const on = selected.includes(c.id);
              return (
                <article key={c.id} className={`glass flex flex-col p-5 sm:p-6 ${on ? "ring-2 ring-electric" : ""}`}>
                  <p className="meta text-paper/45">{c.category}</p>
                  <h3 className="mt-1 font-display text-[1.25rem] leading-snug">{c.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-paper/80">{c.oneLine}</p>
                  <dl className="mt-4 space-y-2.5 text-[0.875rem]">
                    {(
                      [
                        ["Problem", c.problem],
                        ["Why it fits you", c.whyItFitsYou],
                        ["Unique angle", c.uniqueAngle],
                        ["First version", c.firstVersion],
                        ["Who benefits", c.whoBenefits],
                        ["Time to first result", c.timeToFirstResult],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k}>
                        <dt className="meta text-paper/40">{k}</dt>
                        <dd className="text-paper/80">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <details className="mt-3 text-[0.875rem]">
                    <summary className="cursor-pointer text-paper/60">More: skills, resources, risks, long-term</summary>
                    <div className="mt-2 space-y-2 text-paper/75">
                      <p><span className="text-paper/45">Why it matters:</span> {c.whyItMatters}</p>
                      <p><span className="text-paper/45">Core idea:</span> {c.coreIdea}</p>
                      <p><span className="text-paper/45">Long-term:</span> {c.longTermPotential}</p>
                      <p><span className="text-paper/45">Skills you&apos;d build:</span> {c.skillsDeveloped.join(", ")}</p>
                      <p><span className="text-paper/45">Resources:</span> {c.resourcesNeeded.join(", ")}</p>
                      <p><span className="text-paper/45">Risks:</span> {c.keyRisks.join("; ")}</p>
                    </div>
                  </details>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-[0.8125rem] text-paper/55">
                      Difficulty <LevelPill level={c.difficulty} inverted />
                    </span>
                    <button
                      onClick={() => toggle(c.id)}
                      aria-pressed={on}
                      disabled={!on && selected.length >= MAX_COMBINE}
                      className={on ? primaryBtnCls : secondaryBtnCls}
                    >
                      {on ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[var(--radius-md)] border border-paper/10">
            <table className="w-full min-w-[900px] border-collapse text-left text-[0.8125rem]">
              <caption className="sr-only">Project fit matrix — qualitative ratings, not scores</caption>
              <thead className="bg-paper/5">
                <tr>
                  <th scope="col" className="sticky left-0 bg-navy-900 px-3 py-2.5 font-normal text-paper/55">Concept</th>
                  {MATRIX_KEYS.map((k) => (
                    <th key={k} scope="col" className="px-2 py-2.5 font-normal text-paper/55">
                      {MATRIX_LABELS[k]}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2.5 font-normal text-paper/55">Tradeoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper/10">
                {matrix.map((r) => (
                  <tr key={r.conceptId} className={`align-top ${selected.includes(r.conceptId) ? "bg-electric/5" : ""}`}>
                    <th scope="row" className="sticky left-0 min-w-[190px] bg-navy-900 px-3 py-2.5 font-medium">
                      <button onClick={() => toggle(r.conceptId)} className="text-left hover:text-electric">
                        {selected.includes(r.conceptId) ? "✓ " : ""}
                        {title(r.conceptId)}
                      </button>
                    </th>
                    {MATRIX_KEYS.map((k) => (
                      <td key={k} className="px-2 py-2.5">
                        <LevelPill level={r[k]} inverted={INVERTED_KEYS.has(k)} />
                      </td>
                    ))}
                    <td className="min-w-[220px] px-3 py-2.5 text-paper/75">{r.tradeoff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[0.75rem] text-paper/45">
          Ratings are qualitative judgements from your answers, not scores. For &ldquo;Resources needed&rdquo;, &ldquo;Risk&rdquo; and difficulty, higher means harder.
        </p>
      </section>

      <section className="glass sticky bottom-4 z-10 space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBuild} disabled={selected.length === 0} className={primaryBtnCls}>
            {selected.length > 1 ? `Combine ${selected.length} into one blueprint` : "Build the full blueprint"}
          </button>
          <p className="text-[0.875rem] text-paper/65">
            {selected.length ? selected.map(title).join(" + ") : "Select a concept above."}
          </p>
        </div>
        <details>
          <summary className="cursor-pointer text-[0.875rem] text-paper/60">None of these right? Another round, or refine them</summary>
          <div className="mt-3 space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 1500))}
              rows={2}
              placeholder="e.g. more hands-on, less app-building · something I can do with my school's robotics club · smaller budget"
              aria-label="Direction for the next round"
              className={inputCls}
            />
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNewRound(feedback, true)} className={secondaryBtnCls}>
                Reject all — new round
              </button>
              <button onClick={() => onNewRound(feedback, false)} disabled={!feedback.trim()} className={secondaryBtnCls}>
                Refine with my feedback
              </button>
              <button onClick={onMoreDiscovery} className={secondaryBtnCls}>
                Back to discovery questions
              </button>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
