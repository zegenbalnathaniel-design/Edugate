import type { PassionSession, SignalKey } from "@/lib/data/types";
import { SignalMeter } from "./SignalMeter";
import { WhyThisAppears } from "./EvidenceTrail";

/**
 * All 13 signals, each with a native disclosure for "why did this appear" —
 * the evidence trail is always one click away, never hidden behind a
 * separate page (docs/04 §6).
 */
export function SignalList({ session }: { session: PassionSession }) {
  const signals = session.profile?.signals ?? [];
  const ranked = [...signals].sort((a, b) => b.normalized - a.normalized);

  return (
    <ul className="divide-y divide-current/10">
      {ranked.map((score) => (
        <li key={score.key}>
          <details className="group">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <SignalMeter score={score} />
            </summary>
            <div className="pb-4">
              <WhyThisAppears session={session} signalKey={score.key as SignalKey} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
