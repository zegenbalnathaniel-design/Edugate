import type { ReactNode } from "react";
import { HairlineRule } from "./Hairline";
import { Reveal as RevealBlock } from "./Reveal";

export type Register = "dark" | "deep" | "light" | "warm";

/**
 * A page section in one of four visual registers.
 *
 * The landing page alternates dark-immersive → light-editorial → data →
 * product-UI, and never runs two consecutive sections in the same register
 * (§08). `RegisterGuard` in the page file asserts that at build time.
 */
export function Section({
  register,
  children,
  className = "",
  id,
  label,
}: {
  register: Register;
  children: ReactNode;
  className?: string;
  id?: string;
  label?: string;
}) {
  return (
    <section
      id={id}
      data-register={register}
      aria-label={label}
      className={`relative w-full ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * A block that rises into place as it enters the viewport.
 *
 * Deliberately a separate export rather than a flag on Section: Section is a
 * server component used in layouts, and this needs the client observer.
 */
export { Reveal } from "./Reveal";

export function Container({
  children,
  className = "",
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow";
}) {
  const w = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-[1600px]",
  }[width];
  return (
    <div className={`mx-auto w-full ${w} px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Small uppercase metadata label with an index, e.g. "01 — DISCOVER" (§08).
 *
 * Carries a hairline beneath it by default. Because this primitive is used on
 * nearly every page, the rule is what gives the whole product one consistent
 * sense of structure without each page having to draw its own — and it costs
 * a single pixel of currentColor rather than a border-and-fill card.
 *
 * Pass `rule={false}` where the label sits inline or already has a divider.
 */
export function SectionLabel({
  index,
  children,
  className = "",
  rule = true,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <RevealBlock className={className}>
      <p className="meta opacity-55">
        {index && <span className="mr-3">{index}</span>}
        {children}
      </p>
      {rule && <HairlineRule className="mt-2.5" />}
    </RevealBlock>
  );
}
