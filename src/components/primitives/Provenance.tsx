import type { Provenance as ProvenanceKind } from "@/lib/data/types";

const LABEL: Record<ProvenanceKind, string> = {
  illustrative: "Illustrative demo data",
  "institution-supplied": "Institution-supplied",
  verified: "Verified",
};

const DOT: Record<ProvenanceKind, string> = {
  illustrative: "bg-grey-500",
  "institution-supplied": "bg-pending",
  verified: "bg-verified",
};

/**
 * Renders the provenance marker for any displayed record.
 *
 * This component is the mechanism that makes §98 structural rather than a thing
 * we have to remember: every entity carries a mandatory `provenance` field
 * (docs/03-data-model.md), and tests/invariants assert that illustrative
 * records reach the screen with this marker attached.
 *
 * Deliberately quiet — present, never shouting (docs/05-design-system.md).
 */
export function Provenance({
  kind,
  className = "",
}: {
  kind: ProvenanceKind;
  className?: string;
}) {
  return (
    <span
      className={`meta inline-flex items-center gap-1.5 text-grey-500 ${className}`}
      data-provenance={kind}
    >
      <span className={`size-1 rounded-full ${DOT[kind]}`} aria-hidden />
      {LABEL[kind]}
    </span>
  );
}
