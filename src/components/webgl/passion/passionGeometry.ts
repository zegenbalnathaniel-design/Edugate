import { SIGNAL_KEYS } from "@/lib/data/types";

/** Deterministic PRNG — same reasoning as universeGeometry.ts: stable across reload. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SIGNAL_COUNT = SIGNAL_KEYS.length;

export interface PassionParticleData {
  chaos: Float32Array; // vec3 per particle — the unresolved starting cloud
  jitter: Float32Array; // vec3 per particle — local offset within its signal cluster
  signalIndex: Float32Array; // 0..12, which signal cluster this particle belongs to
  seed: Float32Array;
  scale: Float32Array;
}

/**
 * Builds the particle field the Passion Projector scene interpolates across
 * its four phases (docs/04-passion-engine.md §8). Every particle is assigned
 * to exactly one of the 13 signals up front — the shader reads that signal's
 * *live* strength every frame, so cluster tightness, orbit radius and
 * brightness all track the actual answers, not a canned animation.
 */
export function buildPassionField(count: number): PassionParticleData {
  const rand = rng(20260928);

  const chaos = new Float32Array(count * 3);
  const jitter = new Float32Array(count * 3);
  const signalIndex = new Float32Array(count);
  const seed = new Float32Array(count);
  const scale = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Unresolved cloud: a dense scatter, deliberately tighter than the hero's
    // so it reads as "a mind full of undifferentiated attention", not dust.
    chaos[i3] = (rand() - 0.5) * 13;
    chaos[i3 + 1] = (rand() - 0.5) * 9;
    chaos[i3 + 2] = (rand() - 0.5) * 12;

    // Local offset within the particle's eventual signal cluster — a soft
    // spherical blob so clusters read as loose gatherings, not hard discs.
    const jr = Math.cbrt(rand()) * 1.15;
    const jt = rand() * Math.PI * 2;
    const jp = Math.acos(1 - 2 * rand());
    jitter[i3] = Math.sin(jp) * Math.cos(jt) * jr;
    jitter[i3 + 1] = Math.cos(jp) * jr * 0.7;
    jitter[i3 + 2] = Math.sin(jp) * Math.sin(jt) * jr;

    signalIndex[i] = Math.floor(rand() * SIGNAL_COUNT);
    seed[i] = rand();
    scale[i] = rand() > 0.97 ? 2.2 + rand() * 1.6 : 0.5 + rand() * 0.85;
  }

  return { chaos, jitter, signalIndex, seed, scale };
}
