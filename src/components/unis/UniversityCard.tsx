import Link from "next/link";
import type { UniversityRow } from "@/lib/unis/repo";
import { BASIS_SHORT, dateLabel, inrCompact, moneyRange, qsLabel, TEST_POLICY_LABEL } from "@/lib/unis/format";
import { satPolicy } from "@/lib/unis/extract";
import { isPast } from "@/lib/unis/freshness";
import { INSTITUTION_TYPE_LABEL } from "@/lib/unis/geo";
import { normalizeDegree, normalizeTests, TEST_LABEL } from "@/lib/unis/taxonomy";

/** Latest edition of an organisation's main table, e.g. NIRF "Colleges" or "Overall". */
function latest(u: UniversityRow["data"], org: string) {
  return u.rankings.filter((r) => r.org === org && !/subject/i.test(r.category)).sort((a, b) => b.edition - a.edition)[0] ?? null;
}

/** Discovery card (§52). Every figure here is also sourced on the profile page. */
export function UniversityCard({ row, why }: { row: UniversityRow; why?: string[] }) {
  const u = row.data;
  const india = u.countryCode === "IN";
  const qs = qsLabel(u);
  const nirf = latest(u, "NIRF");
  const naac = u.accreditation.find((a) => a.body === "NAAC" && a.grade);
  const degrees = [...new Set(u.programs.map((p) => normalizeDegree(p.degree, p.level)).filter((d) => d !== "Other"))];
  const routes = [...new Set(u.programs.flatMap((p) => p.admission?.basis ?? []))];
  const tests = normalizeTests([...u.testing.map((t) => t.test), ...u.programs.flatMap((p) => [...p.tests.map((t) => t.test), ...(p.admission?.entranceTests ?? [])])]);
  const intlFee = moneyRange(u.costs.internationalTuition.value, u.costs.currency);
  const sat = satPolicy(u);
  const next = [...u.deadlines, ...u.programs.flatMap((p) => p.deadlines)].filter((d) => !isPast(d.date)).sort((a, b) => a.date.localeCompare(b.date))[0];
  const place = india ? `${u.locality ? `${u.locality}, ` : ""}${row.hub ?? u.city}, ${u.region}` : `${u.city}, ${u.country}`;

  return (
    <Link href={`/universities/${u.slug}`} className="glass glass-interactive flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="meta text-current/55">{place}</p>
        <span className="flex shrink-0 flex-wrap justify-end gap-1">
          {nirf && <span className="meta rounded-full border border-electric/40 px-2 py-0.5 text-electric">NIRF {nirf.edition}: #{nirf.rank}</span>}
          {!nirf && qs && <span className="meta rounded-full border border-electric/40 px-2 py-0.5 text-electric">{qs.text}</span>}
        </span>
      </div>
      <h3 className="mt-2 font-display text-[1.25rem] leading-tight text-current">{u.name}</h3>
      <p className="mt-1 text-[0.8125rem] text-current/60">
        {[u.institutionType ? INSTITUTION_TYPE_LABEL[u.institutionType] : null, u.affiliation.value, naac ? `NAAC ${naac.grade}` : null].filter(Boolean).join(" · ") ||
          `${u.control.replace("-", "–")} · ${u.category.replaceAll("-", " ")}`}
      </p>
      <p className="mt-2 text-[0.8125rem] text-current/70">
        {u.programs.length} programme{u.programs.length === 1 ? "" : "s"} on Edugate{degrees.length ? ` · ${degrees.slice(0, 6).join(", ")}${degrees.length > 6 ? "…" : ""}` : ""}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.8125rem]">
        {(india ? row.costInrMin != null : !!intlFee) && (
          <div>
            <dt className="meta text-current/45">{india ? "Yearly fee from" : "Intl tuition"}</dt>
            <dd className="tabular">{india ? inrCompact(row.costInrMin!) : intlFee}</dd>
          </div>
        )}
        {(india ? routes.length + tests.length > 0 : !!sat) && (
          <div>
            <dt className="meta text-current/45">{india ? "Admission" : "SAT"}</dt>
            <dd>{india ? [...routes.map((r) => BASIS_SHORT[r] ?? r), ...tests.map((t) => TEST_LABEL[t] ?? t)].slice(0, 3).join(", ") : TEST_POLICY_LABEL[sat!]}</dd>
          </div>
        )}
        {next && (
          <div>
            <dt className="meta text-current/45">Next deadline</dt>
            <dd>{dateLabel(next.date)}</dd>
          </div>
        )}
        <div>
          <dt className="meta text-current/45">Verified</dt>
          <dd>{dateLabel(u.lastVerified)}</dd>
        </div>
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
