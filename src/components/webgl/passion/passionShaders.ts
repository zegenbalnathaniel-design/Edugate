/**
 * GLSL for the Passion Projector scene (docs/04-passion-engine.md §8).
 *
 * The governing rule (§111): if the visual would look identical regardless
 * of the answers, it communicates nothing and should be cut. So every
 * particle carries a fixed `aSignalIndex` (which of the 13 signals it
 * belongs to) and reads that signal's *live* normalized strength each frame
 * from `uSignalMap` — a 13×1 data texture the React layer rewrites after
 * every response. Position, tightness, brightness and orbit radius all
 * follow from that texture, not from a canned animation.
 *
 * uPhase drives which of the four phases (chaos → patterns → signals →
 * constellation) the scene is in; it moves in whole steps as the session
 * progresses through its stages, and its fractional part is what actually
 * eases the transition — the same "ease then arrive" shape as the hero.
 */

export const passionVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;        // 0..3
  uniform sampler2D uSignalMap; // R = normalized strength, G = confidence
  uniform vec3  uMouse;
  uniform float uSize;
  uniform float uPixelRatio;

  uniform float uImpulseSignal[3];
  uniform float uImpulseStart[3];
  uniform float uImpulseMagnitude[3];

  attribute vec3  aChaos;
  attribute vec3  aJitter;
  attribute float aSignalIndex;
  attribute float aSeed;
  attribute float aScale;

  varying float vStrength;
  varying float vConfidence;
  varying float vPhaseAmt;

  const float TAU = 6.28318530718;
  const float SIGNAL_COUNT = 13.0;

  vec3 clusterCenter(float idx) {
    float angle = (idx + 0.5) / SIGNAL_COUNT * TAU;
    float radius = 3.3;
    float y = sin(angle * 2.0) * 0.9;
    return vec3(cos(angle) * radius, y, sin(angle) * radius);
  }

  vec3 orbitPosition(float idx, float seed, float strength, float time) {
    float slice = (TAU / SIGNAL_COUNT) * 0.7;
    float angle = (idx + 0.5) / SIGNAL_COUNT * TAU + (seed - 0.5) * slice + time * 0.045;
    float radius = mix(6.2, 1.6, strength);
    float y = sin(angle * 2.0 + time * 0.3) * 0.45;
    return vec3(cos(angle) * radius, y, sin(angle) * radius);
  }

  void main() {
    vec2 mapUv = vec2((aSignalIndex + 0.5) / SIGNAL_COUNT, 0.5);
    vec2 sig = texture2D(uSignalMap, mapUv).rg;
    float strength = sig.r;
    float confidence = sig.g;

    // Chaotic drift — the only thing active in phase 0, and it never stops.
    vec3 chaos = aChaos;
    chaos.x += sin(uTime * 0.25 + aSeed * 29.0) * 0.5;
    chaos.y += cos(uTime * 0.21 + aSeed * 19.0) * 0.4;
    chaos.z += sin(uTime * 0.18 + aSeed * 23.0) * 0.45;

    float p01 = smoothstep(0.0, 1.0, uPhase); // chaos -> patterns
    float p12 = smoothstep(1.0, 2.0, uPhase); // patterns -> signals
    float p23 = smoothstep(2.0, 3.0, uPhase); // signals -> constellation

    // Patterns/signals: a loose blob per signal that tightens as it resolves.
    vec3 center = clusterCenter(aSignalIndex);
    float jitterScale = mix(1.0, 0.4, p12);
    vec3 clusterPos = center + aJitter * jitterScale;

    vec3 orbitPos = orbitPosition(aSignalIndex, aSeed, strength, uTime);

    vec3 pos = mix(chaos, clusterPos, p01);
    pos = mix(pos, orbitPos, p23);

    // Per-answer impulse: a real, decaying outward push on exactly the
    // particles whose signal that answer touched (§111 — not decorative).
    vec3 centerNow = mix(center, orbitPos, p23);
    vec3 pushed = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      float target = i == 0 ? uImpulseSignal[0] : (i == 1 ? uImpulseSignal[1] : uImpulseSignal[2]);
      if (abs(aSignalIndex - target) < 0.5) {
        float start = i == 0 ? uImpulseStart[0] : (i == 1 ? uImpulseStart[1] : uImpulseStart[2]);
        float mag = i == 0 ? uImpulseMagnitude[0] : (i == 1 ? uImpulseMagnitude[1] : uImpulseMagnitude[2]);
        float age = uTime - start;
        if (age >= 0.0) {
          float decay = exp(-age * 2.2);
          vec3 dir = normalize(pos - centerNow + 0.0001);
          pushed += dir * mag * decay * 0.8;
        }
      }
    }
    pos += pushed;

    // Cursor field — a soft local disturbance, same technique as the hero.
    float md = distance(pos.xy, uMouse.xy);
    float influence = smoothstep(3.0, 0.0, md) * uMouse.z;
    pos.xy += normalize(pos.xy - uMouse.xy + 0.0001) * influence * 0.4;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (13.0 / -mv.z);

    vStrength = strength;
    vConfidence = confidence;
    vPhaseAmt = uPhase / 3.0;
  }
`;

export const passionFragmentShader = /* glsl */ `
  precision mediump float;

  varying float vStrength;
  varying float vConfidence;
  varying float vPhaseAmt;

  vec3 signalColor(float t) {
    vec3 c0 = vec3(0.184, 0.420, 1.000); // electric
    vec3 c1 = vec3(0.216, 0.831, 0.902); // cyan
    vec3 c2 = vec3(0.400, 0.600, 0.980); // academic-lt
    return t < 0.5 ? mix(c0, c1, t * 2.0) : mix(c1, c2, (t - 0.5) * 2.0);
  }

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 2.6);

    // Brightness follows real signal strength once structure begins — a
    // uniform 0.5 baseline in pure chaos, where strength has no meaning yet.
    float brightness = mix(0.5, mix(0.32, 1.0, vStrength), vPhaseAmt);
    vec3 color = signalColor(vStrength);
    color = mix(color, color + vec3(0.22), glow * vPhaseAmt * vConfidence * 0.5);

    gl_FragColor = vec4(color, glow * brightness);
    if (gl_FragColor.a < 0.01) discard;
  }
`;
