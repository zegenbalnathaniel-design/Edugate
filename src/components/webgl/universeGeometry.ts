import * as THREE from "three";

/**
 * Deterministic PRNG (mulberry32).
 *
 * The universe must look identical on every load and across SSR/hydration —
 * Math.random() would reshuffle the composition on each refresh, which makes
 * the hero feel unstable and makes visual regressions impossible to spot.
 */
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

/**
 * Six categories of education entity (§11). Category drives colour, so the
 * field reads as a structured ecosystem rather than undifferentiated confetti.
 */
export const CATEGORIES = [
  "institutions",
  "courses",
  "careers",
  "scholarships",
  "students",
  "outcomes",
] as const;

export interface UniverseData {
  chaos: Float32Array;
  order: Float32Array;
  seed: Float32Array;
  category: Float32Array;
  scale: Float32Array;
  linePositions: Float32Array;
  lineStrength: Float32Array;
}

/**
 * Builds the two position sets the hero interpolates between.
 *
 * `chaos` — uniform scatter in a large volume: fragmented information.
 * `order` — concentric orbital shells around a centre: an organised system.
 *
 * The scroll-driven uOrder uniform mixes one into the other. That mix *is* the
 * thesis of the product (§104), which is why the geometry is built as two
 * explicit states rather than as one state plus noise.
 */
export function buildUniverse(count: number, connections: number): UniverseData {
  const rand = rng(20260927);

  const chaos = new Float32Array(count * 3);
  const order = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const category = new Float32Array(count);
  const scale = new Float32Array(count);

  /**
   * Orbital rings, each with its own radius and tilt.
   *
   * These are rings, not shells. Nested *spheres* project to a filled disc and
   * read as an undifferentiated starfield — indistinguishable from the chaotic
   * state, which destroys the entire point of the transition. Tilted rings
   * project to visible ellipses, so "organised" is legible at a glance.
   */
  const rings = [
    { r: 1.95, tiltX: 0.22, tiltZ: -0.16 },
    { r: 2.75, tiltX: -0.3, tiltZ: 0.1 },
    { r: 3.6, tiltX: 0.14, tiltZ: 0.26 },
    { r: 4.5, tiltX: -0.18, tiltZ: -0.24 },
    { r: 5.45, tiltX: 0.3, tiltZ: 0.08 },
    { r: 6.5, tiltX: -0.1, tiltZ: 0.2 },
  ];

  // Rotate a point by the ring's tilt so each orbit sits on its own plane.
  const tilt = (
    x: number,
    y: number,
    z: number,
    ax: number,
    az: number,
  ): [number, number, number] => {
    const cy = Math.cos(ax);
    const sy = Math.sin(ax);
    let ny = y * cy - z * sy;
    let nz = y * sy + z * cy;
    const cz = Math.cos(az);
    const sz = Math.sin(az);
    const nx = x * cz - ny * sz;
    ny = x * sz + ny * cz;
    return [nx, ny, nz];
  };

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // --- chaotic state: dense, unstructured scatter ---
    // Kept deliberately tight. Spread too wide and the field reads as sparse
    // background dust — "meaningless particles" (§06) — rather than as a mass
    // of information that has not been organised yet.
    chaos[i3] = (rand() - 0.5) * 17;
    chaos[i3 + 1] = (rand() - 0.5) * 11;
    chaos[i3 + 2] = (rand() - 0.5) * 15;

    // --- ordered state ---
    let ringIndex: number;
    if (rand() < 0.07) {
      // The core: EDUGATE at the centre of the ecosystem (§11).
      ringIndex = 0;
      const cr = rand() * 0.6;
      const ct = rand() * Math.PI * 2;
      const cp = Math.acos(1 - 2 * rand());
      order[i3] = Math.sin(cp) * Math.cos(ct) * cr;
      order[i3 + 1] = Math.cos(cp) * cr * 0.7;
      order[i3 + 2] = Math.sin(cp) * Math.sin(ct) * cr;
    } else {
      // Weight selection by circumference so rings have even visual density
      // rather than the inner ones looking crowded.
      const pick = rand() * rings.reduce((s, r) => s + r.r, 0);
      let acc = 0;
      ringIndex = rings.length - 1;
      for (let k = 0; k < rings.length; k++) {
        acc += rings[k].r;
        if (pick <= acc) {
          ringIndex = k;
          break;
        }
      }
      const ring = rings[ringIndex];
      const theta = rand() * Math.PI * 2;
      const radius = ring.r + (rand() - 0.5) * 0.3;
      // Thin out-of-plane jitter keeps the ring from looking machine-drawn.
      const drift = (rand() - 0.5) * 0.16;
      const [x, y, z] = tilt(
        Math.cos(theta) * radius,
        drift,
        Math.sin(theta) * radius,
        ring.tiltX,
        ring.tiltZ,
      );
      order[i3] = x;
      order[i3 + 1] = y;
      order[i3 + 2] = z;
    }

    seed[i] = rand();
    category[i] = ringIndex % CATEGORIES.length;
    // A few nodes are noticeably larger — these read as the major entities and
    // give the eye something to fix on while the field moves.
    scale[i] = rand() > 0.965 ? 2.6 + rand() * 1.8 : 0.55 + rand() * 0.9;
  }

  // --- connections: only drawn between nodes that are close in the ORDERED
  // state, so the network visibly resolves as the field organises ---
  const linePos: number[] = [];
  const lineStr: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  let made = 0;
  let attempts = 0;

  while (made < connections && attempts < connections * 220) {
    attempts++;
    const i = Math.floor(rand() * count);
    const j = Math.floor(rand() * count);
    if (i === j) continue;

    a.fromArray(order, i * 3);
    b.fromArray(order, j * 3);
    const d = a.distanceTo(b);
    // Tight threshold: links should trace along the rings and bridge adjacent
    // orbits, not cut across the centre, which would muddy the structure.
    if (d > 0.95 || d < 0.18) continue;

    linePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    // Shorter links are stronger: the network gains local density first.
    const s = 1 - d / 0.95;
    lineStr.push(s, s);
    made++;
  }

  return {
    chaos,
    order,
    seed,
    category,
    scale,
    linePositions: new Float32Array(linePos),
    lineStrength: new Float32Array(lineStr),
  };
}
