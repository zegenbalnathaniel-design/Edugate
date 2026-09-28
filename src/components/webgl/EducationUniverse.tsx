"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildUniverse } from "./universeGeometry";
import {
  nodeVertexShader,
  nodeFragmentShader,
  lineVertexShader,
  lineFragmentShader,
} from "./shaders";
import { useScrollStore } from "@/lib/motion/scrollStore";
import { useDeviceTier, type TierBudget } from "@/lib/motion/useDeviceTier";

function Field({
  budget,
  runwayPx,
}: {
  budget: TierBudget;
  runwayPx: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { size, camera } = useThree();

  const data = useMemo(
    () => buildUniverse(budget.nodes, budget.connections),
    [budget.nodes, budget.connections],
  );

  // Smoothed pointer + order values. Lerping toward a target rather than
  // assigning directly is what keeps cursor response from feeling twitchy.
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const mouseTarget = useRef(new THREE.Vector3(0, 0, 0));
  const order = useRef(0.16);

  const nodeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOrder: { value: 0 },
      uVelocity: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uSize: { value: 7.4 },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

  const lineUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOrder: { value: 0 } }),
    [],
  );

  useEffect(() => {
    nodeUniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      budget.dpr[1],
    );
  }, [budget.dpr, nodeUniforms]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      // Map to world-ish units matching the camera framing.
      mouseTarget.current.set(
        ((e.clientX / window.innerWidth) * 2 - 1) * 7,
        (-(e.clientY / window.innerHeight) * 2 + 1) * 4,
        1,
      );
    };
    const onLeave = () => mouseTarget.current.z = 0;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05); // clamp so a tab-switch doesn't jump
    const t = state.clock.elapsedTime;

    // Read scroll imperatively — subscribing would re-render every frame.
    const { scroll, normalizedVelocity } = useScrollStore.getState();

    // Order resolves across the hero's sticky runway. Because the canvas is
    // pinned for that whole span, the user actually watches the network
    // organise rather than scrolling past the moment it happens.
    const scrolled = Math.min(1, scroll / Math.max(runwayPx, 1));
    // Never start at pure chaos: a small amount of resting structure is what
    // separates "an ecosystem not yet organised" from "random noise".
    const target = budget.reducedMotion ? 1 : 0.16 + scrolled * 0.84;

    order.current += (target - order.current) * Math.min(1, d * 3.2);
    mouse.current.lerp(mouseTarget.current, Math.min(1, d * 6));

    nodeUniforms.uTime.value = t;
    nodeUniforms.uOrder.value = order.current;
    nodeUniforms.uVelocity.value = budget.reducedMotion
      ? 0
      : normalizedVelocity;
    nodeUniforms.uMouse.value.copy(mouse.current);

    lineUniforms.uTime.value = t;
    lineUniforms.uOrder.value = order.current;

    // Camera drifts inward as the field organises: we move from surveying
    // chaos to standing inside a structured system (§13).
    if (!budget.reducedMotion) {
      const o = order.current;
      camera.position.x += (mouse.current.x * 0.12 - camera.position.x) * d * 1.4;
      // Elevation is what makes the orbits legible. Viewed from within their
      // own plane the rings project to overlapping flat bands — visually
      // identical to the chaotic state. Looking down on them at ~18° turns
      // each one into a distinct ellipse.
      camera.position.y +=
        (mouse.current.y * 0.1 + 4.2 - camera.position.y) * d * 1.4;
      // Pull back slightly as the rings resolve so the full orbital structure
      // fits the frame instead of overflowing it.
      camera.position.z += (13.0 - o * 1.2 - camera.position.z) * d * 1.2;
    }
    // Always aim at the centre — including under reduced motion, where the
    // camera never moves but still must be pointed at the resolved structure.
    camera.lookAt(0, 0, 0);
  });

  useEffect(() => {
    nodeUniforms.uSize.value = size.width < 768 ? 5.6 : 7.4;
  }, [size.width, nodeUniforms]);

  return (
    <group>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.order, 3]}
          />
          <bufferAttribute attach="attributes-aChaos" args={[data.chaos, 3]} />
          <bufferAttribute attach="attributes-aOrder" args={[data.order, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[data.seed, 1]} />
          <bufferAttribute
            attach="attributes-aCategory"
            args={[data.category, 1]}
          />
          <bufferAttribute attach="attributes-aScale" args={[data.scale, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={nodeVertexShader}
          fragmentShader={nodeFragmentShader}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-aStrength"
            args={[data.lineStrength, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={lineVertexShader}
          fragmentShader={lineFragmentShader}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/**
 * The hero's WebGL layer.
 *
 * Purely presentational and aria-hidden: the DOM beside it carries every piece
 * of information this conveys, so the page is complete with the canvas absent
 * (docs/01-architecture.md → Rendering strategy, §95).
 */
export function EducationUniverse({ runway = 0.85 }: { runway?: number }) {
  const budget = useDeviceTier();
  const [visible, setVisible] = useState(true);
  const [runwayPx, setRunwayPx] = useState(800);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => setRunwayPx(window.innerHeight * runway);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [runway]);

  // Stop rendering entirely once scrolled past — a hero canvas running behind
  // the rest of the page is the most common hidden cost in builds like this.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <Canvas
        dpr={budget.dpr}
        frameloop={visible ? "always" : "never"}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
        camera={{ position: [0, 4.2, 13.0], fov: 52, near: 0.1, far: 100 }}
      >
        <Field budget={budget} runwayPx={runwayPx} />
      </Canvas>
    </div>
  );
}
