import Link from "next/link";
import type { StudentProfile } from "@/lib/profile/schema";
import { fitDimensions, preferenceAlignment, STATE_GLYPH, STATE_LABEL, type FitState } from "@/lib/unis/fit";
import type { Program, University } from "@/lib/unis/schema";

const TONE: Record<FitState, string> = { aligned: "text-verified", partial: "text-pending", misaligned: "text-attention", unknown: "text-current/50" };

/** §18–19: transparent per-dimension fit. Explicitly not an admission chance. */
export function FitPanel({ u, profile, program }: { u: University; profile: StudentProfile | null; program?: Program }) {
  if (!profile) {
    return (
      <div className="glass p-6">
        <h2 className="meta text-current/60">How this fits you</h2>
        <p className="mt-3 text-[0.9375rem] text-current/75">
          <Link href={`/login?next=${encodeURIComponent(`/universities/${u.slug}`)}`} className="link-underline text-cyan">Sign in</Link> and build your profile to see
          which published requirements you already meet — curriculum, subjects, tests, English, budget and location.
        </p>
      </div>
    );
  }
  const dims = fitDimensions(u, profile, program);
  const pa = preferenceAlignment(dims, profile.weights);
  return (
    <div className="glass p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="meta text-current/60">How this fits you{program ? ` — ${program.name}` : ""}</h2>
        {pa.percent != null && (
          <details className="text-right text-[0.8125rem]">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              Preference alignment (your weights): <strong>{pa.percent}%</strong> <span className="text-cyan">ⓘ</span>
            </summary>
            <p className="mt-2 max-w-sm text-left text-current/70">
              Not an admission chance. Each known dimension scores 1 (aligned), ½ (partly) or 0, weighted by the priorities in your
              profile; unknown dimensions are left out ({pa.unknownShare}% of your weight is unknown here). <Link href="/profile" className="text-cyan">Change weights</Link>
            </p>
          </details>
        )}
      </div>
      <ul className="mt-4 divide-y divide-current/10">
        {dims.map((d) => (
          <li key={d.key} className="py-3">
            <details>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span>{d.label}</span>
                <span className={`text-[0.875rem] ${TONE[d.state]}`}>{STATE_GLYPH[d.state]} {STATE_LABEL[d.state]}</span>
              </summary>
              <ul className="mt-2 space-y-1 text-[0.8125rem] text-current/70">
                {d.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
