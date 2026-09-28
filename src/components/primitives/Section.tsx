import type { ReactNode } from "react";

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

/** Small uppercase metadata label with an index, e.g. "01 — DISCOVER" (§08). */
export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`meta opacity-55 ${className}`}>
      {index && <span className="mr-3">{index}</span>}
      {children}
    </p>
  );
}
