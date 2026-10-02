import Link from "next/link";
import type { UniversityRow } from "@/lib/unis/repo";
import { moneyRange, qsLabel, TEST_POLICY_LABEL } from "@/lib/unis/format";
import { FIELD_NAMES } from "@/lib/unis/filters";
import { satPolicy } from "@/lib/unis/extract";
import { isPast } from "@/lib/unis/freshness";
import { dateLabel } from "@/lib/unis/format";

/** Discovery card (§52). Every figure here is also sourced on the profile page. */
export function UniversityCard({ row, why }: { row: UniversityRow; why?: string[] }) {
  const u = row.data;
  const qs = qsLabel(u);
  const fee = moneyRange(u.costs.internationalTuition.value, u.costs.currency);
  const sat = satPolicy(u);
  const next = u.deadlines.filter((d) => !isPast(d.date)).sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <Link href={`/universities/${u.slug}`} className="glass glass-interactive flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="meta text-current/55">{u.city}, {u.country}</p>
        {qs && <span className="meta shrink-0 rounded-full border border-electric/40 px-2 py-0.5 text-electric">{qs.text}</span>}
      </div>
      <h3 className="mt-2 font-display text-[1.25rem] leading-tight text-current">{u.name}</h3>
      <p className="mt-2 text-[0.8125rem] text-current/65">{u.programs.map((p) => p.name).join(" · ")}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.8125rem]">
        <div><dt className="meta text-current/45">Intl tuition</dt><dd className="tabular">{fee ?? "Not verified"}</dd></div>
        <div><dt className="meta text-current/45">SAT</dt><dd>{sat ? TEST_POLICY_LABEL[sat] : "—"}</dd></div>
        <div><dt className="meta text-current/45">Fields</dt><dd>{[...new Set(u.programs.map((p) => FIELD_NAMES[p.field] ?? p.field))].join(", ")}</dd></div>
        <div><dt className="meta text-current/45">Next deadline</dt><dd>{next ? `${dateLabel(next.date)}` : "None listed"}</dd></div>
      </dl>
      {u.scholarships.length > 0 && <p className="mt-3 text-[0.8125rem] text-verified">● {u.scholarships.length} scholarship/aid option{u.scholarships.length > 1 ? "s" : ""}</p>}
      {why && why.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-current/10 pt-3 text-[0.8125rem] text-current/75">
          <li className="meta text-current/45">Why this appeared for you</li>
          {why.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}
    </Link>
  );
}
