import Link from "next/link";
import type { Career } from "@/lib/data/types";
import { FIELD_LABELS } from "@/lib/data/types";
import { Provenance } from "@/components/primitives/Provenance";

export function CareerCard({ career }: { career: Career }) {
  return (
    <Link
      href={`/career/${career.slug}`}
      className="glass glass-interactive glow-border block p-6"
    >
      <p className="meta text-current/45">{career.fields.map((f) => FIELD_LABELS[f]).join(" · ")}</p>
      <h3 className="mt-1 text-[1.0625rem] font-medium text-current">{career.title}</h3>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-current/65">{career.description}</p>
      <p className="mt-3 text-[0.8125rem] text-current/50">{career.skills.slice(0, 3).join(", ")}</p>
      <Provenance kind={career.provenance} className="mt-4" />
    </Link>
  );
}
