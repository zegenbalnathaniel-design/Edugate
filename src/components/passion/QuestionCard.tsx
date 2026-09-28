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
              "glass glass-interactive px-5 py-4 text-left text-[0.9375rem]",
              "hover:!bg-cyan/[0.07]",
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
