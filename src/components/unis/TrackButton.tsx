import { trackUniversity } from "@/lib/user/actions";

export function TrackButton({ university, program, back, tracked }: { university: string; program?: string; back: string; tracked?: boolean }) {
  if (tracked) return <a href="/tracker" className="inline-flex h-10 items-center rounded-full border border-verified/50 px-4 text-[0.875rem] text-verified">✓ In your tracker</a>;
  return (
    <form action={trackUniversity}>
      <input type="hidden" name="university" value={university} />
      <input type="hidden" name="program" value={program ?? ""} />
      <input type="hidden" name="back" value={back} />
      <button className="inline-flex h-10 items-center rounded-full bg-electric px-4 text-[0.875rem] font-semibold text-[var(--on-electric)] hover:bg-electric-dim">
        + Add to application tracker
      </button>
    </form>
  );
}
