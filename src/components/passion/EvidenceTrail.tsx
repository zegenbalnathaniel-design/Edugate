import type { PassionSession, SignalKey } from "@/lib/data/types";
import { PASSION_QUESTIONS } from "@/lib/data/fixtures/passion/questions";

/**
 * `<WhyThisAppears>` — docs/04-passion-engine.md §6, docs/05-design-system.md.
 *
 * Renders real stored evidence: the actual question and the actual option
 * the student chose, looked up from the session's own responses. Generated
 * prose could sound like this; only stored evidence *is* this — it's what
 * lets a 16-year-old disagree with the output.
 */
export function WhyThisAppears({
  session,
  signalKey,
}: {
  session: PassionSession;
  signalKey: SignalKey;
}) {
  const entries = session.profile?.evidence.bySignal[signalKey] ?? [];

  const rows = entries
    .map((e) => {
      const response = session.responses.find((r) => r.questionId === e.responseId);
      const question = PASSION_QUESTIONS.find((q) => q.id === e.responseId);
      const option = question?.options.find((o) => o.id === response?.optionId);
      if (!question || !option) return null;
      return { question, option, contribution: e.contribution };
    })
    .filter((r): r is NonNullable<typeof r> => !!r)
    .sort((a, b) => b.contribution - a.contribution);

  if (rows.length === 0) {
    return (
      <p className="text-[0.8125rem] text-current/50">
        No responses have contributed to this signal yet.
      </p>
    );
  }

  return (
    <div className="space-y-2 border-l border-current/15 pl-4">
      <p className="meta text-current/45">This came from how you answered</p>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <li key={i} className="text-[0.875rem] leading-relaxed text-current/75">
            <span className="text-current/50">{r.question.prompt}</span>
            {" → "}
            <span className="text-current/95">&ldquo;{r.option.label}&rdquo;</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
