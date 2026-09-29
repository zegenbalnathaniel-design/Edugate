"use client";

import type { PassionOption, PassionQuestion } from "@/lib/data/types";

/**
 * One question, presented as a scenario with concrete options — never a
 * self-rating (docs/04 §2). Options are buttons, not radios + submit: a
 * chosen answer commits immediately.
 */
export function QuestionCard({
  question,
  onAnswer,
  disabled,
}: {
  question: PassionQuestion;
  onAnswer: (option: PassionOption) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="display-s mb-8 leading-snug">{question.prompt}</h2>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(option)}
            className={[
              // Opaque surface, no backdrop-filter: Safari's blur+saturate
              // over the drifting mesh washed these out to unreadable bone.
              "rounded-[var(--radius-lg)] border border-paper/15 bg-navy-800 px-5 py-4 text-left text-[0.9375rem] text-paper",
              "cursor-pointer transition-[border-color,background-color,transform] duration-[var(--dur-quick)]",
              "hover:-translate-y-px hover:border-electric/70 hover:bg-navy-700",
              "focus-visible:border-electric",
              "disabled:pointer-events-none disabled:opacity-50",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
