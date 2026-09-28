"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SIGNAL_KEYS, type SignalKey, type SignalScore } from "@/lib/data/types";
import { buildPassionField } from "./passionGeometry";
import { passionVertexShader, passionFragmentShader } from "./passionShaders";
import { useDeviceTier, type TierBudget } from "@/lib/motion/useDeviceTier";

export interface PassionImpulse {
  nonce: number;
  signals: { key: SignalKey; weight: number }[];
}

function packSignalTexture(scores: SignalScore[]): THREE.DataTexture {
  const data = new Uint8Array(SIGNAL_KEYS.length * 4);
  const byKey = new Map(scores.map((s) => [s.key, s]));
  SIGNAL_KEYS.forEach((key, i) => {
    const s = byKey.get(key);
    data[i * 4] = Math.round(Math.max(0, Math.min(1, s?.normalized ?? 0)) * 255);
    data[i * 4 + 1] = Math.round(Math.max(0, Math.min(1, s?.confidence ?? 0)) * 255);
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 255;
  });
  const tex = new THREE.DataTexture(data, SIGNAL_KEYS.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function Field({
  budget,
  signalScores,
  phaseTarget,
  impulse,
}: {
  budget: TierBudget;
  signalScores: SignalScore[];
  phaseTarget: number;
  impulse: PassionImpulse | null;
}) {
  const { size } = useThree();
  const data = useMemo(() => buildPassionField(budget.passionParticles), [budget.passionParticles]);

  const signalTexture = useMemo(() => packSignalTexture(signalScores), []); // eslint-disable-line react-hooks/exhaustive-deps
  const phase = useRef(0);
  const mouse = useRef(new THREE.Vector3());
  const mouseTarget = useRef(new THREE.Vector3());
  const lastImpulseNonce = useRef(-1);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uSignalMap: { value: signalTexture },
      uMouse: { value: new THREE.Vector3() },
      uSize: { value: 8.5 },
      uPixelRatio: { value: 1 },
      uImpulseSignal: { value: [-1, -1, -1] },
      uImpulseStart: { value: [-1000, -1000, -1000] },
      uImpulseMagnitude: { value: [0, 0, 0] },
    }),
    [signalTexture],
  );

  // Rewrite the signal texture whenever scores change — this is the whole
  // mechanism by which the field encodes real answers rather than a canned
  // animation (§111).
  useEffect(() => {
    const byKey = new Map(signalScores.map((s) => [s.key, s]));
    const img = signalTexture.image.data as Uint8Array;
    SIGNAL_KEYS.forEach((key, i) => {
      const s = byKey.get(key);
      img[i * 4] = Math.round(Math.max(0, Math.min(1, s?.normalized ?? 0)) * 255);
      img[i * 4 + 1] = Math.round(Math.max(0, Math.min(1, s?.confidence ?? 0)) * 255);
    });
    signalTexture.needsUpdate = true;
  }, [signalScores, signalTexture]);

  useEffect(() => {
    uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, budget.dpr[1]);
  }, [budget.dpr, uniforms]);

  useEffect(() => {
    uniforms.uSize.value = size.width < 768 ? 6.5 : 8.5;
  }, [size.width, uniforms]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseTarget.current.set(
        ((e.clientX / window.innerWidth) * 2 - 1) * 6,
        (-(e.clientY / window.innerHeight) * 2 + 1) * 3.6,
        1,
      );
    };
    const onLeave = () => (mouseTarget.current.z = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    if (budget.reducedMotion) {
      uniforms.uPhase.value = phaseTarget;
    } else {
      phase.current += (phaseTarget - phase.current) * Math.min(1, d * 1.6);
      uniforms.uPhase.value = phase.current;
      mouse.current.lerp(mouseTarget.current, Math.min(1, d * 6));
      uniforms.uMouse.value.copy(mouse.current);
    }

    if (impulse && impulse.nonce !== lastImpulseNonce.current) {
      lastImpulseNonce.current = impulse.nonce;
      const top = [...impulse.signals]
        .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
        .slice(0, 3);
      const sig = uniforms.uImpulseSignal.value as number[];
      const start = uniforms.uImpulseStart.value as number[];
      const mag = uniforms.uImpulseMagnitude.value as number[];
      for (let i = 0; i < 3; i++) {
        const entry = top[i];
        sig[i] = entry ? SIGNAL_KEYS.indexOf(entry.key) : -1;
        start[i] = entry ? t : -1000;
        mag[i] = entry ? Math.max(0.3, Math.min(1, Math.abs(entry.weight) / 3)) : 0;
      }
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.chaos, 3]} />
        <bufferAttribute attach="attributes-aChaos" args={[data.chaos, 3]} />
        <bufferAttribute attach="attributes-aJitter" args={[data.jitter, 3]} />
        <bufferAttribute attach="attributes-aSignalIndex" args={[data.signalIndex, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seed, 1]} />
        <bufferAttribute attach="attributes-aScale" args={[data.scale, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={passionVertexShader}
        fragmentShader={passionFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * The Passion Projector's continuous WebGL scene (docs/04 §8) — chaos through
 * to the constellation reveal, all one field, never per-screen animations.
 * Purely presentational: aria-hidden, with every signal also rendered as real
 * DOM (SignalMeter, AxisIndicator) beside it, so the page is complete with
 * this canvas absent (docs/01-architecture.md → Rendering strategy).
 */
export function PassionParticles({
  signalScores,
  phaseTarget,
  impulse,
}: {
  signalScores: SignalScore[];
  phaseTarget: number;
  impulse: PassionImpulse | null;
}) {
  const budget = useDeviceTier();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        dpr={budget.dpr}
        frameloop="always"
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 2.4, 10.5], fov: 50, near: 0.1, far: 100 }}
      >
        <Field budget={budget} signalScores={signalScores} phaseTarget={phaseTarget} impulse={impulse} />
      </Canvas>
    </div>
  );
}
