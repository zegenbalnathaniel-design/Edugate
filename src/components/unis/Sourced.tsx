import type { ReactNode } from "react";
import type { ConfidenceLevel, Source } from "@/lib/unis/schema";
import { CONFIDENCE_LABEL, SOURCE_TYPE_LABEL, dateLabel } from "@/lib/unis/format";

const DOT: Record<ConfidenceLevel, string> = {
  official: "bg-verified",
  high: "bg-verified/70",
  secondary: "bg-pending",
  estimated: "bg-pending",
  "requires-verification": "bg-grey-500",
};

/** A fact plus where it came from (§44): source, type, date, confidence, notes. */
export function Sourced({
  children,
  sourceId,
  sources,
  confidence,
  asOf,
  notes,
}: {
  children: ReactNode;
  sourceId: string | null;
  sources: Source[];
  confidence?: ConfidenceLevel;
  asOf?: string | null;
  notes?: string;
}) {
  const src = sources.find((s) => s.id === sourceId);
  const conf: ConfidenceLevel = confidence ?? (src ? "official" : "requires-verification");
  if (!src && conf === "requires-verification") {
    return <span className="text-current/50">Not currently verified</span>;
  }
  return (
    <details className="group inline">
      <summary className="inline cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span>{children}</span>
        <span className="ml-1.5 inline-flex translate-y-[-1px] items-center gap-1 align-middle text-[0.6875rem] text-current/45 group-open:text-cyan" aria-label="Show source">
          <span className={`size-1.5 rounded-full ${DOT[conf]}`} aria-hidden />ⓘ
        </span>
      </summary>
      <span className="mt-2 block rounded-[var(--radius-md)] border border-current/15 bg-current/[0.04] p-3 text-[0.8125rem] leading-relaxed">
        <span className="block font-medium">{CONFIDENCE_LABEL[conf]}{asOf ? ` · ${asOf}` : ""}</span>
        {src && (
          <span className="mt-1 block">
            <a href={src.url} target="_blank" rel="noopener noreferrer" className="link-underline text-cyan">{src.label}</a>
            <span className="text-current/55"> · {SOURCE_TYPE_LABEL[src.type]} · retrieved {dateLabel(src.retrievedAt)}</span>
          </span>
        )}
        {notes && <span className="mt-1 block text-current/70">{notes}</span>}
      </span>
    </details>
  );
}

export function TrustBar({ lastVerified, sources }: { lastVerified: string; sources: Source[] }) {
  return (
    <details className="glass mt-6 p-4">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 text-[0.875rem] [&::-webkit-details-marker]:hidden">
        <span>✓ Data verified <strong>{dateLabel(lastVerified)}</strong></span>
        <span>Sources: <strong>{sources.length}</strong></span>
        <span className="text-cyan">Where did this information come from? ▾</span>
      </summary>
      <ol className="mt-4 space-y-1.5 text-[0.8125rem]">
        {sources.map((s) => (
          <li key={s.id} className="flex flex-wrap gap-x-2">
            <span className="tabular text-current/40">{s.id}</span>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline text-cyan">{s.label}</a>
            <span className="text-current/50">{SOURCE_TYPE_LABEL[s.type]} · {dateLabel(s.retrievedAt)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[0.75rem] text-current/55">
        Verify all admissions information with the university before applying. Figures marked “High confidence” were read from the official page via a search summary rather than fetched directly.
      </p>
    </details>
  );
}
