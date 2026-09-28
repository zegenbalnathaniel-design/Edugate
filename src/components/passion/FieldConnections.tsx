import type { FieldConnection } from "@/lib/data/types";
import { FIELD_LABELS, SIGNAL_LABELS } from "@/lib/data/types";
import { FIELD_CONNECTION_LABELS } from "@/lib/passion/fields";

/**
 * Signals → fields — docs/04-passion-engine.md §7. Banded labels only, never
 * a number. "One pathway worth exploring," always plural, never prescribed.
 */
export function FieldConnections({ connections }: { connections: FieldConnection[] }) {
  if (connections.length === 0) {
    return (
      <p className="text-[0.9375rem] text-current/60">
        No field connections have cleared the exploring threshold yet — answer
        a few more questions to see where your signals point.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {connections.map((fc) => (
        <li key={fc.field} className="border-b border-current/10 pb-4 last:border-none">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[1.0625rem] font-medium text-current">
              {FIELD_LABELS[fc.field]}
            </span>
            <span className="meta text-cyan-deep">{FIELD_CONNECTION_LABELS[fc.band]}</span>
          </div>
          <p className="mt-1.5 text-[0.8125rem] text-current/50">
            Driven mostly by{" "}
            {fc.contributions
              .slice(0, 2)
              .map((c) => SIGNAL_LABELS[c.signal])
              .join(" and ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
