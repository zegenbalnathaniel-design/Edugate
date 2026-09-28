"use client";

import { createElement, useRef, type ReactNode } from "react";

/**
 * Concrete union rather than ElementType: a fully generic polymorphic `as`
 * makes TS collapse the remaining props to `never` once a ref is involved.
 * These four cover every use on the page.
 */
type Tag = "div" | "li" | "section" | "article";

/**
 * Writes cursor position into --mx/--my on the element, driving the
 * `.spotlight-surface` and `.glow-border` treatments in globals.css.
 *
 * Coordinates go to CSS custom properties rather than React state on purpose:
 * pointermove fires at pointer rate, and re-rendering a section subtree on
 * every move would be far more expensive than a style write the compositor
 * already has to do.
 */
export function Spotlight({
  children,
  className = "",
  as = "div",
  variant = "spotlight-surface",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
  variant?: "spotlight-surface" | "glow-border" | "both";
}) {
  const ref = useRef<HTMLElement>(null);

  const cls =
    variant === "both" ? "spotlight-surface glow-border" : variant;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.dataset.active = "true";
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.dataset.active = "false";
  };

  return createElement(
    as,
    {
      ref,
      onPointerMove: onMove,
      onPointerLeave: onLeave,
      className: `${cls} ${className}`,
    },
    children,
  );
}
