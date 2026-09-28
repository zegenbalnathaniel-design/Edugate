"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollStore } from "@/lib/motion/scrollStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * One clock for three animation systems.
 *
 * Lenis is the only scroll authority; GSAP's ticker drives it; ScrollTrigger
 * reads Lenis through a scrollerProxy. Without this, GSAP's rAF and Lenis's rAF
 * run independently and DOM animation tears against scroll position.
 * (docs/01-architecture.md → Motion integration)
 *
 * Under prefers-reduced-motion we do not instantiate Lenis at all — native
 * scroll is restored so browser find-on-page and anchor navigation behave
 * normally (§87: do not break native browser navigation).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      // Still publish scroll state so WebGL scenes have something to read.
      const onScroll = () => {
        const max = document.body.scrollHeight - window.innerHeight;
        useScrollStore.getState().set({
          scroll: window.scrollY,
          progress: max > 0 ? window.scrollY / max : 0,
          velocity: 0,
          normalizedVelocity: 0,
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    lenis.on(
      "scroll",
      ({
        scroll,
        progress,
        velocity,
      }: {
        scroll: number;
        progress: number;
        velocity: number;
      }) => {
        useScrollStore.getState().set({
          scroll,
          progress,
          velocity,
          // Clamp so a fast flick can't push shader uniforms out of range.
          normalizedVelocity: Math.max(-1, Math.min(1, velocity / 40)),
        });
        ScrollTrigger.update();
      },
    );

    // GSAP owns the frame. Lenis is driven from it, not from its own rAF.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (value !== undefined) lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    });
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
