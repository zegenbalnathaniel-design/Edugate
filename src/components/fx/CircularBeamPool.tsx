"use client";

import { useRef, useState } from "react";

const SATELLITES = [
  { label: "Colleges", angle: -90 },
  { label: "Courses", angle: -30 },
  { label: "Careers", angle: 30 },
  { label: "Scholarships", angle: 90 },
  { label: "Outcomes", angle: 150 },
  { label: "Schools", angle: 210 },
];

/**
 * Circular sweeping beam over a rotating pool.
 *
 * Read it as the decision loop: the pool beneath is the mass of options still
 * in motion; the beam is the pass that resolves them; the satellites are the
 * parts of the ecosystem it sweeps across. Hovering a satellite holds the beam
 * against it and names what it covers — so the ornament is also the legend.
 *
 * Built from conic-gradient + mask rather than canvas: three compositor-only
 * rotations cost far less than a render loop, and it degrades cleanly to a
 * static ring under reduced motion.
 */
export function CircularBeamPool({
  className = "",
}: {
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={hostRef}
      className={`relative aspect-square w-full max-w-[520px] ${className}`}
      onMouseLeave={() => setHovered(null)}
    >
      {/* ---- rotating pool: layered blurred gradients, clipped to the disc ---- */}
      <div className="absolute inset-[12%] overflow-hidden rounded-full">
        <div
          aria-hidden
          className="pool-spin absolute inset-[-40%] opacity-70 blur-2xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(47,107,255,0.55), rgba(55,212,230,0.38), rgba(27,58,107,0.15), rgba(47,107,255,0.55))",
          }}
        />
        <div
          aria-hidden
          className="pool-spin-slow absolute inset-[-25%] opacity-55 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 35%, rgba(55,212,230,0.6), transparent 55%), radial-gradient(circle at 70% 65%, rgba(47,107,255,0.55), transparent 55%)",
          }}
        />
        {/* Darken the middle so the pool reads as depth, not as a flat glow. */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(5,7,13,0.88) 28%, rgba(5,7,13,0.25) 62%, transparent 78%)",
          }}
        />
      </div>

      {/* ---- sweeping beam: conic gradient masked to a ring ---- */}
      <div
        aria-hidden
        className="beam-spin absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(55,212,230,0.12) 300deg, rgba(55,212,230,0.75) 350deg, rgba(255,255,255,0.95) 359deg, transparent 360deg)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
        }}
      />

      {/* Static ring beneath the beam, so the circle exists when motion stops. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border border-paper/15"
      />
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full border border-paper/10"
      />
      <div
        aria-hidden
        className="absolute inset-[26%] rounded-full border border-dashed border-paper/8"
      />

      {/* ---- satellites ---- */}
      {SATELLITES.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * 50;
        const y = 50 + Math.sin(rad) * 50;
        const on = hovered === s.label;
        return (
          <button
            key={s.label}
            type="button"
            onMouseEnter={() => setHovered(s.label)}
            onFocus={() => setHovered(s.label)}
            onBlur={() => setHovered(null)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={s.label}
          >
            <span
              className={[
                "block rounded-full transition-all duration-[var(--dur-quick)]",
                "[transition-timing-function:var(--ease-out-edu)]",
                on
                  ? "size-3.5 bg-cyan shadow-[0_0_18px_4px_rgba(55,212,230,0.55)]"
                  : "size-2.5 bg-paper/45",
              ].join(" ")}
            />
            <span
              className={[
                "meta absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap",
                "transition-opacity duration-[var(--dur-quick)]",
                on ? "text-paper opacity-100" : "text-paper/0 opacity-0",
              ].join(" ")}
            >
              {s.label}
            </span>
          </button>
        );
      })}

      {/* ---- centre ---- */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <p className="font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-paper">
          EDUGATE
        </p>
        <p
          className="meta mt-2 text-cyan/80 transition-opacity duration-[var(--dur-quick)]"
          style={{ opacity: hovered ? 1 : 0.5 }}
        >
          {hovered ?? "One decision loop"}
        </p>
      </div>
    </div>
  );
}
