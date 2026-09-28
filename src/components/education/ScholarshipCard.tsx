import type { Scholarship } from "@/lib/data/types";
import { Provenance } from "@/components/primitives/Provenance";

const BASIS_LABEL: Record<string, string> = {
  merit: "Merit-based",
  need: "Need-based",
  field: "Field-specific",
  demographic: "Demographic",
};

function coverageLabel(coverage: Scholarship["coverage"]): string {
  if (coverage.type === "full") return "Full coverage";
  if (coverage.amount) {
    return `${coverage.amount.currency} ${coverage.amount.min.toLocaleString()}–${coverage.amount.max.toLocaleString()}`;
  }
  return coverage.type === "partial" ? "Partial coverage" : "Fixed amount";
}

export function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  return (
    <div className="glass p-6">
      <p className="meta text-current/45">{scholarship.basis.map((b) => BASIS_LABEL[b]).join(" · ")}</p>
      <h3 className="mt-1 text-[1.0625rem] font-medium text-current">{scholarship.name}</h3>
      <p className="mt-1 text-[0.8125rem] text-current/55">{scholarship.provider}</p>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-current/65">{scholarship.eligibility.description}</p>
      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[0.8125rem] text-current/55">
        <div>
          <dt className="sr-only">Coverage</dt>
          <dd className="tabular">{coverageLabel(scholarship.coverage)}</dd>
        </div>
        <div>
          <dt className="sr-only">Deadline</dt>
          <dd className="tabular">
            Deadline: {new Date(scholarship.deadline).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </dd>
        </div>
      </dl>
      <Provenance kind={scholarship.provenance} className="mt-4" />
    </div>
  );
}
