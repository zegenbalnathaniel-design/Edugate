/**
 * Reference exchange rates used ONLY to show approximate USD equivalents and
 * to apply a student's USD budget across currencies. Every converted figure
 * in the UI is labelled "≈" with this date; native-currency figures are
 * always shown first.
 *
 * ECB euro reference rates, 1 Oct 2026 (converted to per-USD); AED and QAR
 * are fixed pegs set by their central banks.
 */
export const FX_AS_OF = "2026-10-01";
export const FX_SOURCE = "ECB euro reference rates (1 Oct 2026); AED/QAR central-bank pegs";

const EUR_PER = { USD: 1.1298, GBP: 0.85373, INR: 108.832, JPY: 178.49, CHF: 0.9437, AUD: 1.6255, CAD: 1.6095, HKD: 8.8658, KRW: 1537.96, SGD: 1.446 };

export const PER_USD: Record<string, number> = {
  USD: 1,
  EUR: 1 / EUR_PER.USD,
  ...Object.fromEntries(
    Object.entries(EUR_PER)
      .filter(([c]) => c !== "USD")
      .map(([c, v]) => [c, v / EUR_PER.USD]),
  ),
  AED: 3.6725,
  QAR: 3.64,
};

export function toUsd(amount: number, currency: string): number | null {
  const rate = PER_USD[currency];
  return rate ? amount / rate : null;
}
