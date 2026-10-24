"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A short entrance on every navigation.
 *
 * Deliberately a CSS animation with `both` fill, replayed by remounting on
 * `key={pathname}` — not a JS class flip.
 *
 * The first version hid the wrapper from an effect and revealed it on the
 * next frame. If that second step ever failed to run, the page stayed at
 * opacity 0: an entrance animation is not worth a blank-page failure mode,
 * and it got stuck in testing. A keyframe cannot fail that way, because its
 * final state is the visible one.
 */
export function RouteReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} data-route-reveal>
      {children}
    </div>
  );
}
