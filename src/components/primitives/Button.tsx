"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-electric text-[var(--on-electric)] hover:bg-electric-dim border border-transparent",
  secondary:
    "bg-transparent text-current border border-current/25 hover:border-current/50 hover:bg-current/5",
  ghost: "bg-transparent text-current border border-transparent hover:bg-current/8",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.875rem]",
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-[1rem]",
};

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  magnetic?: boolean;
  type?: "button" | "submit";
  "aria-label"?: string;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  magnetic = true,
  type = "button",
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);

  /**
   * Magnetic pull, capped at 6px and translate-only (§92).
   * Gated to fine pointers: on touch there is no hover, and running this on
   * every touchmove would fight the scroller.
   */
  const onMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 12;
    const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * 12;
    ref.current.style.transform = `translate(${Math.max(-6, Math.min(6, dx))}px, ${Math.max(-6, Math.min(6, dy))}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const cls = [
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium",
    "transition-[background-color,border-color,transform] duration-[var(--dur-quick)]",
    "[transition-timing-function:var(--ease-out-edu)]",
    "whitespace-nowrap select-none cursor-pointer",
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(" ");

  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      className={cls}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </button>
  );
}
