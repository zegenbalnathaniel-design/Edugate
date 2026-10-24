import type { SourceRef } from "@/lib/data/types";
import { formatDate } from "@/lib/unis/format";
import { HairlineRule } from "@/components/primitives/Hairline";

/**
 * Renders the citations behind a real, verified record (docs/00-decisions.md
 * → D2, superseded). This is what makes "accurate" checkable by a visitor
 * rather than a claim they have to take on faith — every link here is where
 * the adjoining facts actually came from.
 */
export function Sources({ sources, className = "" }: { sources: SourceRef[]; className?: string }) {
  if (sources.length === 0) return null;

  return (
    <div className={className}>
      <p className="meta text-current/45">Sources</p>
      <HairlineRule className="mb-2 mt-2" />
      <ul className="space-y-1">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-[0.8125rem] text-cyan-deep"
            >
              {s.label}
            </a>
            <span className="meta ml-2 text-current/35">retrieved {formatDate(s.retrievedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
