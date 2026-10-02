"use client";

import { useActionState } from "react";
import { reportOutdated, type ReportState } from "@/lib/user/actions";

export function ReportForm({ university, program }: { university: string; program?: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(reportOutdated, undefined);
  if (state?.ok) return <p className="text-[0.875rem] text-verified">✓ Thanks — an Edugate editor will review it. Verified data isn&apos;t changed until they do.</p>;
  return (
    <details className="text-[0.875rem]">
      <summary className="cursor-pointer text-current/60 hover:text-current">⚑ Report outdated or incorrect information</summary>
      <form action={action} className="mt-3 grid max-w-xl gap-3">
        <input type="hidden" name="university" value={university} />
        <input type="hidden" name="program" value={program ?? ""} />
        <label className="grid gap-1">
          <span className="meta text-current/55">Which information?</span>
          <input name="field" required maxLength={120} placeholder="e.g. IB requirement, tuition, deadline" className="rounded-[var(--radius-md)] border border-current/20 bg-transparent px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="meta text-current/55">What&apos;s wrong, and where did you see the correct version?</span>
          <textarea name="message" required minLength={10} maxLength={1000} rows={3} className="rounded-[var(--radius-md)] border border-current/20 bg-transparent px-3 py-2" />
        </label>
        {state?.error && <p role="alert" className="text-attention">⚠ {state.error}</p>}
        <button disabled={pending} className="w-fit rounded-full border border-current/30 px-4 py-2 hover:border-current/70">{pending ? "Sending…" : "Send report"}</button>
      </form>
    </details>
  );
}
