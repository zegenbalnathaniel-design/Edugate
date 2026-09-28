import Link from "next/link";
import type { Institution } from "@/lib/data/types";
import { Provenance } from "@/components/primitives/Provenance";

const SELECTIVITY_LABEL: Record<Institution["admissions"]["selectivity"], string> = {
  "highly-selective": "Highly selective",
  selective: "Selective",
  moderate: "Moderate admissions",
  open: "Open admissions",
};

export function InstitutionCard({ institution }: { institution: Institution }) {
  return (
    <Link
      href={`/college/${institution.slug}`}
      className="glow-border block rounded-md border border-current/12 p-6 transition-colors duration-[var(--dur-quick)] hover:border-cyan/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="meta text-current/45">
            {institution.location.city}, {institution.location.country}
          </p>
          <h3 className="mt-1 text-[1.1875rem] font-medium text-current">{institution.name}</h3>
        </div>
        <span className="meta shrink-0 rounded-full border border-current/20 px-2.5 py-1 text-current/60">
          {institution.type}
        </span>
      </div>

      <p className="mt-3 text-[0.875rem] leading-relaxed text-current/65">{institution.description}</p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-current/55">
        <div>
          <dt className="sr-only">Tuition</dt>
          <dd className="tabular">
            {institution.tuition.currency} {institution.tuition.min.toLocaleString()}–
            {institution.tuition.max.toLocaleString()} / {institution.tuition.period}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Selectivity</dt>
          <dd>{SELECTIVITY_LABEL[institution.admissions.selectivity]}</dd>
        </div>
        <div>
          <dt className="sr-only">Programs</dt>
          <dd>{institution.programs.length} programs</dd>
        </div>
      </dl>

      <Provenance kind={institution.provenance} className="mt-4" />
    </Link>
  );
}
