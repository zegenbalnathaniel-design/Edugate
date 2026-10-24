"use client";

import { useEffect } from "react";

/**
 * One cursor listener for every interactive surface on the page.
 *
 * The spotlight and glow-border effects need the pointer position in
 * --mx/--my. Doing that per element meant wrapping each card in a component,
 * which is why the effects only ever reached a handful of places. A single
 * delegated listener lets the CSS apply to `.glass-interactive` everywhere —
 * 160 cards on /universities — with one handler instead of 160.
 *
 * Coalesced into a rAF so a fast pointer cannot queue more style writes than
 * there are frames, and skipped entirely for coarse pointers and reduced
 * motion, where a cursor spotlight means nothing.
 */
export function SurfaceFX() {
  useEffect(() => {
    const m = window.matchMedia("(pointer: fine)");
    if (!m.matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      pending = null;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(
        ".glass-interactive, .spotlight-surface, .glow-border",
      ) as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      pending = { el: target, x: e.clientX - r.left, y: e.clientY - r.top };
      frame ||= requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
