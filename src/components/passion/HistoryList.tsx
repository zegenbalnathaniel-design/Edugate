"use client";

import { useEffect, useState } from "react";
import type { PassionSession } from "@/lib/data/types";
import { SIGNAL_LABELS } from "@/lib/data/types";
import { getLocalStudentId } from "@/lib/data/adapters/demo/storage";
import { passionRepo } from "@/lib/data/repositories/passion";

/**
 * /student/passion-projector/history — docs/04 §9 (Evolution).
 *
 * Sessions are immutable and never overwritten; retakes create new sessions.
 * The delta across dates is the point: seeing your own interests move is
 * more valuable to a 15-year-old than any single result.
 */
export function HistoryList() {
  const [sessions, setSessions] = useState<PassionSession[] | null>(null);

  useEffect(() => {
    passionRepo
      .listSessions(getLocalStudentId())
      .then((all) => setSessions(all.filter((s) => s.status === "complete")));
  }, []);

  if (sessions === null) return <p className="meta text-current/40">Loading…</p>;

  if (sessions.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <p className="mb-4 text-[0.9375rem] text-current/70">
          No completed sessions yet.
        </p>
        <a href="/passion-projector" className="link-underline text-cyan-deep">
          Start Passion Projector
        </a>
      </div>
    );
  }

  return (
    <ol className="space-y-6">
      {sessions.map((s) => {
        const top5 = [...(s.profile?.signals ?? [])]
          .sort((a, b) => b.normalized - a.normalized)
          .slice(0, 5);
        return (
          <li key={s.id} className="glass p-6">
            <p className="meta mb-3 text-current/45">
              {s.completedAt ? new Date(s.completedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {top5.map((sig) => (
                <span
                  key={sig.key}
                  className="rounded-full border border-current/15 px-3 py-1 text-[0.8125rem] text-current/80"
                >
                  {SIGNAL_LABELS[sig.key]}
                </span>
              ))}
            </div>
            {s.profile?.archetype && (
              <p className="mt-3 text-[0.875rem] text-current/60">
                Pattern: {s.profile.archetype.name}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
