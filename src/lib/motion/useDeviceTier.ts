"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "high" | "mid" | "low";

export interface TierBudget {
  tier: DeviceTier;
  /** Instanced node count for the hero field. */
  nodes: number;
  /** Connection lines drawn between nodes. */
  connections: number;
  /** Particle count for the Passion Projector scene (docs/01 perf budget). */
  passionParticles: number;
  dpr: [number, number];
  postProcessing: boolean;
  /** True when the user asked for reduced motion — scenes go static. */
  reducedMotion: boolean;
}

const BUDGETS: Record<DeviceTier, Omit<TierBudget, "tier" | "reducedMotion">> = {
  high: { nodes: 8000, connections: 260, passionParticles: 60000, dpr: [1, 2], postProcessing: true },
  mid: { nodes: 2500, connections: 120, passionParticles: 15000, dpr: [1, 1.5], postProcessing: false },
  low: { nodes: 400, connections: 40, passionParticles: 2000, dpr: [1, 1], postProcessing: false },
};

/**
 * Detect once at boot and never re-measure. Re-running this on resize would
 * cause scenes to rebuild their buffers mid-scroll, which reads as a stutter.
 * (docs/01-architecture.md → Performance budget)
 */
function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "mid";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  // Probe the GPU string. Software renderers (SwiftShader/llvmpipe) must never
  // get the high tier — they report plenty of cores and then run at 4fps.
  let software = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "low";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      const renderer = String(
        gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),
      ).toLowerCase();
      software =
        renderer.includes("swiftshader") ||
        renderer.includes("llvmpipe") ||
        renderer.includes("software");
    }
  } catch {
    return "low";
  }

  if (software) return "low";
  if (narrow || (coarse && cores <= 6)) return "mid";
  if (cores >= 8 && memory >= 8) return "high";
  if (cores >= 4) return "mid";
  return "low";
}

export function useDeviceTier(): TierBudget {
  // SSR and first paint assume "mid": high enough to look right, cheap enough
  // that a low-end device is never briefly asked to render 8k nodes.
  const [tier, setTier] = useState<DeviceTier>("mid");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    setTier(detectTier());
    return () => mq.removeEventListener("change", apply);
  }, []);

  const effective: DeviceTier = reducedMotion ? "low" : tier;
  return { tier: effective, reducedMotion, ...BUDGETS[effective] };
}
