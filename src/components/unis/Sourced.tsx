import type { ReactNode } from "react";
import type { ConfidenceLevel, Source } from "@/lib/unis/schema";
import { CONFIDENCE_LABEL, SOURCE_TYPE_LABEL, dateLabel } from "@/lib/unis/format";
import { SourceToggle } from "./SourceToggle";

const DOT: Record<ConfidenceLevel, string> = {
  official: "bg-verified",
  high: "bg-verified/70",
  secondary: "bg-pending",
  estimated: "bg-pending",
  "requires-verification": "bg-grey-500",
};

/**
 * A fact plus where it came from (§44): source, type, date, confidence,
 * notes. Built from <span>/<button> (phrasing content) so it's valid inside
 * paragraphs and table cells — <details> isn't.
 */
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
  const src = sources.find((s) => s.id === sourceId) ?? null;
  const conf: ConfidenceLevel = confidence ?? (src ? "official" : "requires-verification");
  // Unverified or empty values are never shown.
  if ((!src && conf === "requires-verification") || children == null || children === "" || children === false) return null;
  return (
    <SourceToggle dot={DOT[conf]} label={CONFIDENCE_LABEL[conf]} asOf={asOf ?? null} notes={notes ?? null}
      source={src ? { label: src.label, url: src.url, type: SOURCE_TYPE_LABEL[src.type], retrieved: dateLabel(src.retrievedAt) } : null}>
      {children}
    </SourceToggle>
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
