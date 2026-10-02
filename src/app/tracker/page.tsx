import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { requireUser } from "@/lib/auth/session";
import { APPLICATION_STATUSES } from "@/lib/db/schema";
import { dateLabel } from "@/lib/unis/format";
import { isPast } from "@/lib/unis/freshness";
import { updateTracker } from "@/lib/user/actions";
import { listTracker } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Application tracker" };

const NEXT: Record<string, "done" | "in-progress" | "todo"> = { todo: "in-progress", "in-progress": "done", done: "todo" };
const GLYPH = { done: "✓", "in-progress": "◐", todo: "○", missing: "⚠" } as const;
const WORD = { done: "Completed", "in-progress": "In progress", todo: "Not started", missing: "Missing — deadline passed" } as const;

export default async function TrackerPage() {
  const user = await requireUser("/tracker");
  const entries = await listTracker(user.id);
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">Application tracker</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Your applications</h1>
        <p className="measure mb-10 text-[0.9375rem] text-paper/65">
          Checklists are built from each university&apos;s published requirements. Tap an item to move it ○ → ◐ → ✓. Always confirm the
          final list on the university&apos;s own site.
        </p>
        {entries.length === 0 ? (
          <div className="glass p-8 text-center">
            <p>Nothing saved yet.</p>
            <Link href="/universities" className="mt-3 inline-block text-cyan">Find universities to track →</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((e) => {
              const done = e.items.filter((i) => e.checklist[i.key] === "done").length;
              return (
                <article key={e.id} className="glass p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-[1.375rem]"><Link href={`/universities/${e.university.slug}`} className="hover:text-cyan">{e.university.name}</Link></h2>
                      <p className="mt-1 text-[0.875rem] text-paper/65">
                        {e.program ? <Link href={`/universities/${e.university.slug}/programs/${e.program.slug}`} className="hover:text-cyan">{e.program.name}</Link> : "No program chosen"} · {e.university.country}
                        {e.nextDeadline && <> · Next: <strong>{dateLabel(e.nextDeadline.date)}</strong> {e.nextDeadline.label}</>}
                      </p>
                    </div>
                    <form action={updateTracker} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={e.id} />
                      <label className="sr-only" htmlFor={`status-${e.id}`}>Status</label>
                      <select id={`status-${e.id}`} name="status" defaultValue={e.status} className="rounded-[var(--radius-md)] border border-paper/20 bg-navy-800 px-3 py-2 text-[0.875rem] capitalize">
                        {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="rounded-full border border-paper/25 px-3 py-2 text-[0.8125rem]">Update</button>
                    </form>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper/10" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={e.items.length} aria-label="Checklist progress">
                    <div className="h-full bg-electric" style={{ width: `${(done / Math.max(1, e.items.length)) * 100}%` }} />
                  </div>
                  <ul className="mt-4 divide-y divide-paper/10">
                    {e.items.map((it) => {
                      const st = e.checklist[it.key] ?? "todo";
                      const shown = st !== "done" && it.due && isPast(it.due) ? "missing" : st;
                      return (
                        <li key={it.key}>
                          <form action={updateTracker} className="flex items-start gap-3 py-2.5">
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="item" value={it.key} />
                            <input type="hidden" name="itemState" value={NEXT[st]} />
                            <button className={`mt-0.5 w-6 shrink-0 text-left ${shown === "done" ? "text-verified" : shown === "missing" ? "text-attention" : shown === "in-progress" ? "text-pending" : "text-paper/50"}`} aria-label={`${it.label}: ${WORD[shown]}. Change status`}>
                              {GLYPH[shown]}
                            </button>
                            <span className="flex-1 text-[0.9375rem]">
                              {it.label}
                              <span className="ml-2 text-[0.75rem] text-paper/45">{WORD[shown]}</span>
                              {(it.detail || it.due) && <span className="block text-[0.8125rem] text-paper/55">{[it.detail, it.due && `Due ${dateLabel(it.due)}`].filter(Boolean).join(" · ")}</span>}
                            </span>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                  <form action={updateTracker} className="mt-4 grid gap-2">
                    <input type="hidden" name="id" value={e.id} />
                    <label className="meta text-paper/50" htmlFor={`notes-${e.id}`}>Notes</label>
                    <textarea id={`notes-${e.id}`} name="notes" defaultValue={e.notes ?? ""} rows={2} maxLength={2000} className="rounded-[var(--radius-md)] border border-paper/20 bg-navy-800 px-3 py-2 text-[0.875rem]" />
                    <div className="flex gap-2">
                      <button className="rounded-full border border-paper/25 px-3 py-1.5 text-[0.8125rem]">Save notes</button>
                      <button name="remove" value="1" className="rounded-full px-3 py-1.5 text-[0.8125rem] text-paper/50 hover:text-attention">Remove from tracker</button>
                    </div>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
