"use client";

import { useActionState } from "react";
import { saveUniversityRecord, type EditState } from "@/lib/user/actions";

export function RecordEditor({ slug, json }: { slug: string; json: string }) {
  const [state, action, pending] = useActionState<EditState, FormData>(saveUniversityRecord, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <label className="block">
        <span className="meta mb-2 block text-paper/60">Record (validated against the sourced-data schema before saving)</span>
        <textarea name="json" defaultValue={json} spellCheck={false} rows={32} className="w-full rounded-[var(--radius-md)] border border-paper/20 bg-navy-800 p-3 font-mono text-[0.75rem] leading-relaxed" />
      </label>
      <label className="flex items-center gap-2 text-[0.875rem]">
        <input type="checkbox" name="verify" className="accent-[var(--color-electric)]" /> I checked this record against its sources — mark verified today
      </label>
      {state?.errors && (
        <ul role="alert" className="space-y-1 rounded-[var(--radius-md)] border border-attention/50 bg-attention/10 p-3 text-[0.8125rem]">
          {state.errors.map((e) => <li key={e}>⚠ {e}</li>)}
        </ul>
      )}
      {state?.ok && <p role="status" className="text-verified">✓ Saved and logged.</p>}
      <button disabled={pending} className="inline-flex h-11 items-center rounded-full bg-electric px-6 font-semibold text-[var(--on-electric)]">{pending ? "Validating…" : "Save record"}</button>
    </form>
  );
}
