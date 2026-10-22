import type { ReactNode } from "react";

/**
 * Hairline primitives.
 *
 * Structure without boxes. A catalogue page carrying hundreds of programmes
 * needs division, and borders-plus-fills turn that into a wall of cards; one
 * pixel of currentColor does the same job and disappears when it should.
 *
 * Styles live in globals.css under HAIRLINE SYSTEM so they inherit whatever
 * register they are dropped into.
 */

export function HairlineRule({
  label,
  className = "",
}: {
  label?: ReactNode;
  className?: string;
}) {
  if (!label) return <hr className={`hr-line ${className}`} />;
  return (
    <div className={`hr-label ${className}`}>
      <span className="meta shrink-0 opacity-55">{label}</span>
    </div>
  );
}

/** A measured scale. Decorative only, so it is hidden from assistive tech. */
export function HairlineTicks({
  count = 40,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={`hr-ticks ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

/** Corner marks — frames a region without enclosing it. */
export function HairlineFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`hr-frame ${className}`}>
      <span aria-hidden className="hr-c" />
      {children}
    </div>
  );
}

/** Indexed register row: `01 ──── content`. */
export function HairlineRow({
  index,
  children,
  className = "",
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`hr-row ${className}`}>
      <span className="tabular shrink-0 text-[0.6875rem] opacity-40">
        {String(index).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
