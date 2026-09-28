/**
 * Geometry check for the hero universe.
 *
 * Guards the one property the whole scene depends on: the *ordered* state must
 * be visibly structured, and must stay visibly different from the chaotic
 * state once projected through the real camera.
 *
 * This caught two genuine bugs during the build:
 *  1. Nested spheres instead of rings — projects to a filled disc, visually
 *     identical to chaos.
 *  2. A camera sitting inside the rings' own plane — every orbit collapses to
 *     a flat band, again indistinguishable from chaos.
 *
 * Both looked fine in code review and only showed up on screen.
 *
 * Run: node --experimental-strip-types scripts/check-universe.mts
 */
import * as THREE from "three";
import { buildUniverse } from "../src/components/webgl/universeGeometry.ts";

const COUNT = 4000;
const { chaos, order, linePositions } = buildUniverse(COUNT, 160);

/**
 * Count radial bands by *prominence*, not by bare local maxima.
 *
 * A plain "greater than both neighbours" test is useless here: with 4000
 * samples across 40 bins, ordinary sampling jitter produces a dozen local
 * maxima in a perfectly smooth distribution. A real ring is a bin that towers
 * over its neighbourhood, so require it to exceed the local mean by 60%.
 */
const countBands = (get: (i: number) => number, max: number) => {
  const bins = new Array(40).fill(0);
  for (let i = 0; i < COUNT; i++) {
    bins[Math.min(39, Math.floor((get(i) / max) * 40))]++;
  }
  let peaks = 0;
  for (let i = 2; i < 38; i++) {
    const window = bins.slice(i - 2, i + 3);
    const localMean = window.reduce((a, b) => a + b, 0) / window.length;
    const isMax = bins[i] >= Math.max(...window);
    if (isMax && bins[i] > localMean * 1.6 && bins[i] > 60) peaks++;
  }
  return peaks;
};

const orderedPeaks = countBands(
  (i) => Math.hypot(order[i * 3], order[i * 3 + 2]),
  7.2,
);
const chaoticPeaks = countBands(
  (i) => Math.hypot(chaos[i * 3], chaos[i * 3 + 2]),
  12,
);

// Project the outermost ring through the hero camera and measure how elliptical
// it is. An aspect near zero means we are viewing the orbits edge-on.
const cam = new THREE.PerspectiveCamera(52, 1440 / 900, 0.1, 100);
cam.position.set(0, 4.2, 13.0);
cam.lookAt(0, 0, 0);
cam.updateMatrixWorld();

const outer: THREE.Vector3[] = [];
for (let i = 0; i < COUNT; i++) {
  const r = Math.hypot(order[i * 3], order[i * 3 + 2]);
  if (r > 6.2 && r < 6.8) {
    outer.push(new THREE.Vector3().fromArray(order, i * 3).project(cam));
  }
}
const xs = outer.map((v) => v.x);
const ys = outer.map((v) => v.y);
const aspect =
  (Math.max(...ys) - Math.min(...ys)) / (Math.max(...xs) - Math.min(...xs));

// Everything must also stay inside the frustum, or the structure is cropped.
const inFrame =
  outer.filter((v) => Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1).length /
  outer.length;

console.log("ordered radial peaks   (want >= 4):", orderedPeaks);
console.log("chaotic radial peaks   (want <= 1):", chaoticPeaks);
console.log("outer ring samples             :", outer.length);
console.log(
  "projected ellipse aspect (want > 0.15):",
  aspect.toFixed(3),
);
console.log(
  "outer ring inside frame  (want > 0.85):",
  inFrame.toFixed(3),
);
console.log("connection vertices            :", linePositions.length / 3);

const checks = [
  ["ordered state forms rings", orderedPeaks >= 4],
  ["chaotic state is unstructured", chaoticPeaks <= 1],
  ["rings project as ellipses, not bands", aspect > 0.15],
  ["orbital structure fits the frame", inFrame > 0.85],
  ["connections exist", linePositions.length > 0],
] as const;

let failed = 0;
for (const [name, pass] of checks) {
  if (!pass) {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}
console.log(failed === 0 ? "\nPASS" : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
