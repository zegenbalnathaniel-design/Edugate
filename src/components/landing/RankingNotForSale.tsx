"use client";

import { useState } from "react";

/**
 * §78, made operable.
 *
 * Drag the hypothetical payment as high as it goes; the order never moves.
 * Stating "ranking ≠ payment" asks for trust. Handing the reader the lever and
 * letting them fail to move anything demonstrates it — and lands the actual
 * claim, which is not that we refuse payment but that there is no mechanism
 * for it to act through (D3: no such field exists in the data model).
 */
// Real institutions ordered for one example student. The payer is left
// unnamed on purpose: naming a real college as trying to buy a ranking
// would be a claim about it we have no basis for.
const RESULTS = [
  { name: "Vellore Institute of Technology", match: "Meets 5 of 5 of this student's criteria" },
  { name: "National Institute of Design, Ahmedabad", match: "Meets 5 of 5" },
  { name: "Indian Institute of Technology Bombay", match: "Meets 4 of 5" },
  { name: "Ashoka University", match: "Meets 2 of 5" },
];
const PAYER = RESULTS.length - 1;

const formatINR = (lakhs: number) =>
  lakhs === 0 ? "₹0" : `₹${lakhs.toFixed(1)} lakh`;

export function RankingNotForSale() {
  const [amount, setAmount] = useState(0);
  const paying = amount > 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div>
        <label htmlFor="bid" className="meta block text-ink/45">
          Hypothetical payment to move result #4 up
        </label>
        <p className="tabular mt-4 text-[2.5rem] leading-none text-ink">
          {formatINR(amount)}
        </p>

        <input
          id="bid"
          type="range"
          min={0}
          max={50}
          step={0.5}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-7 w-full cursor-pointer accent-[var(--color-electric)]"
        />

        <div className="mt-2 flex justify-between">
          <span className="tabular text-[0.75rem] text-ink/40">₹0</span>
          <span className="tabular text-[0.75rem] text-ink/40">₹50 lakh</span>
        </div>

        <p
          className="measure mt-8 text-[0.9375rem] leading-[1.6] transition-colors duration-[var(--dur-base)]"
          style={{
            color: paying ? "var(--color-ink)" : "var(--color-grey-500)",
          }}
        >
          {paying
            ? "Nothing moved. There is no field on an institution that a payment could write to, and no ranking function that takes one as an argument."
            : "Drag the slider. Try to buy a better position."}
        </p>
      </div>

      <div>
        <p className="meta mb-4 text-ink/45">Results for this student</p>
        <ol className="glass divide-y divide-current/10 overflow-hidden">
          {RESULTS.map((r, i) => {
            const isPayer = i === PAYER;
            return (
              <li
                key={r.name}
                className={[
                  "flex items-center gap-4 px-5 py-4",
                  isPayer && paying ? "bg-attention/[0.06]" : "",
                ].join(" ")}
              >
                <span className="tabular w-6 shrink-0 text-[0.875rem] text-ink/35">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9375rem] text-ink">
                    {r.name}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] text-ink/50">
                    {r.match}
                  </span>
                </span>
                {isPayer && paying && (
                  <span className="meta shrink-0 rounded-full border border-attention/40 px-2.5 py-1 text-attention">
                    Offered {formatINR(amount)} · unchanged
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <p className="meta mt-5 text-ink/55">
          Example student · the payment is hypothetical; no institution offered one
        </p>
      </div>
    </div>
  );
}
