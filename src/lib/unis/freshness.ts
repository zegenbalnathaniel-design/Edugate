import type { University } from "./schema";

/*
 * Freshness rules (spec §68, §85), computed at read time so stale data is
 * never presented as current.
 */

export function currentAcademicYear(today = new Date()): string {
  const y = today.getUTCFullYear();
  const start = today.getUTCMonth() >= 7 ? y : y - 1; // academic year flips in August
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

function academicStart(asOf: string | null): number | null {
  const m = asOf?.match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

export type FreshnessFlag = { kind: "ranking" | "deadline" | "fees" | "requirements" | "verification"; message: string };

export function freshnessFlags(u: University, latestQsEdition: number | null, today = new Date()): FreshnessFlag[] {
  const flags: FreshnessFlag[] = [];
  const cur = academicStart(currentAcademicYear(today))!;
  const qs = u.rankings.filter((r) => r.org === "QS").sort((a, b) => b.edition - a.edition)[0];
  if (qs && latestQsEdition && qs.edition < latestQsEdition) {
    flags.push({ kind: "ranking", message: `QS rank is from the ${qs.edition} edition; ${latestQsEdition} is the latest on Edugate.` });
  }
  const iso = today.toISOString().slice(0, 10);
  const past = u.deadlines.filter((d) => d.date < iso);
  if (past.length) flags.push({ kind: "deadline", message: `${past.length} listed deadline(s) have passed.` });
  const fee = u.costs.internationalTuition;
  const feeStart = academicStart(fee.asOf);
  if (fee.value && feeStart != null && feeStart < cur) {
    flags.push({ kind: "fees", message: `International tuition is for ${fee.asOf}; check the current year's fees.` });
  }
  const oldReq = u.programs.flatMap((p) => p.requirements).filter((r) => {
    const s = academicStart(r.asOf);
    return s != null && s < cur - 1;
  });
  if (oldReq.length) flags.push({ kind: "requirements", message: `${oldReq.length} entry requirement(s) describe an older admissions cycle.` });
  const ageDays = (today.getTime() - new Date(u.lastVerified).getTime()) / 86400000;
  if (ageDays > 180) flags.push({ kind: "verification", message: `Last verified ${Math.round(ageDays / 30)} months ago.` });
  return flags;
}

export function isPast(dateIso: string, today = new Date()) {
  return dateIso < today.toISOString().slice(0, 10);
}
