import type { ConfidenceLevel, University } from "./schema";
import { FX_AS_OF, toUsd } from "./fx";

type Range = { min: number; max: number; period: string };

const SYMBOL: Record<string, string> = { USD: "US$", GBP: "£", EUR: "€", INR: "₹", CAD: "C$", AUD: "A$", SGD: "S$", HKD: "HK$", CHF: "CHF ", AED: "AED ", JPY: "¥", KRW: "₩", QAR: "QAR " };

export function money(n: number, currency: string) {
  return `${SYMBOL[currency] ?? `${currency} `}${Math.round(n).toLocaleString("en-US")}`;
}

export function moneyRange(r: Range | null, currency: string) {
  if (!r) return null;
  const per = r.period === "year" ? "/yr" : r.period === "semester" ? "/semester" : r.period === "credit" ? "/credit" : " total";
  return r.min === r.max ? `${money(r.min, currency)}${per}` : `${money(r.min, currency)}–${money(r.max, currency).replace(/^\D+/, "")}${per}`;
}

/** "≈ US$ 38,000" — always labelled approximate and dated. */
export function usdApprox(r: Range | null, currency: string) {
  if (!r || currency === "USD") return null;
  const lo = toUsd(r.min, currency);
  const hi = toUsd(r.max, currency);
  if (lo == null || hi == null) return null;
  const f = (n: number) => Math.round(n / 100) * 100;
  return `≈ US$${f(lo).toLocaleString("en-US")}${hi !== lo ? `–${f(hi).toLocaleString("en-US")}` : ""} (rates ${FX_AS_OF})`;
}

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  official: "Official source",
  high: "High confidence",
  secondary: "Secondary source",
  estimated: "Estimated",
  "requires-verification": "Not currently verified",
};

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  university: "University",
  government: "Government",
  "testing-org": "Testing body",
  "ranking-org": "Ranking organisation",
  secondary: "Secondary source",
  journalism: "Journalism",
};

export const TEST_POLICY_LABEL: Record<string, string> = {
  required: "Required",
  optional: "Optional",
  recommended: "Recommended",
  "test-blind": "Not considered (test-blind)",
  "not-considered": "Not considered",
  "not-applicable": "Not applicable",
};

export function qsLabel(u: University) {
  const qs = u.rankings.filter((r) => r.org === "QS" && /world university/i.test(r.category)).sort((a, b) => b.edition - a.edition)[0];
  return qs ? { text: `QS ${qs.edition}: #${qs.rank.replace(/^=/, "=")}`, ranking: qs } : null;
}

export function dateLabel(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
