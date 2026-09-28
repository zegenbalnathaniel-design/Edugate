"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";

interface Props {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  /** Arc height. Negative bows up, positive bows down. */
  curvature?: number;
  /** Seconds for one pulse to traverse the path. */
  duration?: number;
  delay?: number;
  /** Brightens the travelling pulse — used on hover of the source. */
  active?: boolean;
  reverse?: boolean;
}

/**
 * A beam running between two DOM elements, with a pulse travelling along it.
 *
 * The beams are not decoration: each one carries information from a scattered
 * source into Edugate, which is the §02 thesis rendered literally. Hovering a
 * source brightens its own beam, so the connection is legible rather than
 * ambient (§111 — if it communicates nothing, it should not exist).
 *
 * Implemented with stroke-dashoffset rather than an animated gradient: it is a
 * single compositable property, so N beams cost one style recalc each instead
 * of N gradient re-evaluations per frame.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 3,
  delay = 0,
  active = false,
  reverse = false,
}: Props) {
  const id = useId().replace(/:/g, "");
  const [path, setPath] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [len, setLen] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const compute = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;

      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      setBox({ w: cr.width, h: cr.height });

      const x1 = ar.left - cr.left + ar.width / 2;
      const y1 = ar.top - cr.top + ar.height / 2;
      const x2 = br.left - cr.left + br.width / 2;
      const y2 = br.top - cr.top + br.height / 2;

      // Quadratic control point offset perpendicular-ish to the run, so beams
      // fan out instead of stacking into one straight bundle.
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - curvature;
      setPath(`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`);
    };

    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    if (fromRef.current) ro.observe(fromRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [containerRef, fromRef, toRef, curvature]);

  useEffect(() => {
    if (pathRef.current && path) setLen(pathRef.current.getTotalLength());
  }, [path]);

  if (!path) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
      fill="none"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--color-cyan)" stopOpacity="1" />
          <stop
            offset="55%"
            stopColor="var(--color-electric)"
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="var(--color-electric)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {/* Resting track: always visible, so the topology reads even when the
          pulses are off (reduced motion) or between cycles. A fixed token
          color, never `currentColor` — inheriting ambient text color made
          this render as a flat white line in dark sections. */}
      <path
        ref={pathRef}
        d={path}
        stroke="var(--color-cyan-deep)"
        strokeWidth={1}
        strokeOpacity={active ? 0.6 : 0.25}
        className="transition-[stroke-opacity] duration-[var(--dur-quick)]"
      />

      {/* Travelling pulse */}
      {len > 0 && (
        <path
          d={path}
          stroke={`url(#g-${id})`}
          strokeWidth={active ? 2.4 : 1.6}
          strokeLinecap="round"
          strokeDasharray={`${len * 0.16} ${len}`}
          className="beam-pulse"
          style={{
            // Custom properties drive the keyframes so every beam shares one
            // animation definition instead of generating a stylesheet each.
            ["--beam-len" as string]: `${len * 1.16}`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
            opacity: active ? 1 : 0.72,
          }}
        />
      )}
    </svg>
  );
}
