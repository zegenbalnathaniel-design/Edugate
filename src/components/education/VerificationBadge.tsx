import type { VerificationRecord, VerifiableCategory } from "@/lib/data/types";

const STATE_LABEL: Record<string, string> = {
  unverified: "Not yet verified",
  pending: "Verification pending",
  verified: "Verified",
  needs_information: "Needs information",
  rejected: "Verification rejected",
};

const STATE_COLOR: Record<string, string> = {
  unverified: "text-grey-500",
  pending: "text-pending",
  verified: "text-verified",
  needs_information: "text-pending",
  rejected: "text-attention",
};

const CATEGORY_LABEL: Record<VerifiableCategory, string> = {
  academics: "Academics",
  programs: "Programs",
  fees: "Fees",
  admissions: "Admissions",
  campus: "Campus",
  outcomes: "Outcomes",
};

/**
 * Per-category verification, not one blunt flag (docs/03 §Verification): an
 * institution's fee data can be verified while its outcomes data is not.
 * `record === null` renders the honest default — "Not yet verified" — rather
 * than inventing a state (§22, D2.5).
 */
export function VerificationBadge({ record }: { record: VerificationRecord | null }) {
  if (!record) {
    return <span className="meta text-grey-500">{STATE_LABEL.unverified}</span>;
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {record.categories.map((c) => (
        <span key={c.key} className="meta">
          {CATEGORY_LABEL[c.key]}{" "}
          <span className={STATE_COLOR[c.state]}>{STATE_LABEL[c.state]}</span>
        </span>
      ))}
    </div>
  );
}
