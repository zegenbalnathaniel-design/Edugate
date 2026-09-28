/**
 * GLSL for the education universe.
 *
 * The governing idea (§111): every animated quantity must encode something.
 *  · uOrder      — scroll progress: fragmented information → organised system
 *  · uMouse      — cursor presence, as a local disturbance in the field
 *  · uVelocity   — scroll velocity, stretching points along their motion
 *  · aCategory   — which part of the education ecosystem a node belongs to
 *
 * Nothing here moves for decoration alone.
 */

export const nodeVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uOrder;
  uniform float uVelocity;
  uniform vec3  uMouse;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute vec3  aChaos;
  attribute vec3  aOrder;
  attribute float aSeed;
  attribute float aCategory;
  attribute float aScale;

  varying float vCategory;
  varying float vAlpha;
  varying float vOrder;

  // Cheap 3D rotation about Y — the ordered field rotates slowly, the chaotic
  // one barely does, so "settling" also means "finding a common rhythm".
  vec3 rotateY(vec3 p, float a) {
    float s = sin(a), c = cos(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  void main() {
    // Ease the mix so the transition has a sense of arrival rather than a
    // linear slide. Matches --ease-out-edu in spirit.
    float o = uOrder * uOrder * (3.0 - 2.0 * uOrder);

    // Chaotic drift: unresolved, never settles.
    vec3 chaos = aChaos;
    chaos.x += sin(uTime * 0.22 + aSeed * 31.0) * 0.55;
    chaos.y += cos(uTime * 0.19 + aSeed * 17.0) * 0.45;
    chaos.z += sin(uTime * 0.16 + aSeed * 23.0) * 0.5;

    // Ordered orbit: shells rotate at slightly different speeds by radius, so
    // the system has differential motion like a real orbital structure.
    float radius = length(aOrder.xz);
    vec3 ordered = rotateY(aOrder, uTime * (0.10 - radius * 0.007));
    // A small residual breath keeps the resolved state alive rather than frozen.
    ordered.y += sin(uTime * 0.5 + aSeed * 12.0) * 0.045;

    vec3 pos = mix(chaos, ordered, o);

    // --- cursor field: a soft local push (§13) ---
    float md = distance(pos.xy, uMouse.xy);
    float influence = smoothstep(3.4, 0.0, md) * uMouse.z;
    pos.xy += normalize(pos.xy - uMouse.xy + 0.0001) * influence * 0.55;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Scroll velocity stretches points slightly — motion you feel rather than
    // see, and it ties the WebGL layer to the Lenis scroll (§87).
    float stretch = 1.0 + abs(uVelocity) * 0.5;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * stretch * (14.0 / -mv.z);

    vCategory = aCategory;
    vOrder = o;
    // Chaotic nodes are dimmer: the ecosystem literally becomes clearer.
    // The floor stays high enough that the field is legible as a subject in
    // its own right at scroll 0, not just as texture behind the headline.
    vAlpha = mix(0.62, 1.0, o) * (0.82 + influence * 0.5);
  }
`;

export const nodeFragmentShader = /* glsl */ `
  precision mediump float;

  varying float vCategory;
  varying float vAlpha;
  varying float vOrder;

  // Palette drawn from the design tokens (docs/05-design-system.md).
  vec3 categoryColor(float c) {
    if (c < 0.5) return vec3(0.184, 0.420, 1.000);  // electric — institutions
    if (c < 1.5) return vec3(0.216, 0.831, 0.902);  // cyan — courses
    if (c < 2.5) return vec3(0.400, 0.600, 0.980);  // academic-lt — careers
    if (c < 3.5) return vec3(0.106, 0.639, 0.722);  // cyan-deep — scholarships
    if (c < 4.5) return vec3(0.969, 0.973, 0.980);  // paper — students
    return vec3(0.294, 0.545, 0.918);               // academic — outcomes
  }

  void main() {
    // Soft round sprite. Discarding outside the radius keeps points circular
    // without a texture fetch.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 2.6);

    vec3 color = categoryColor(vCategory);
    // Resolved nodes gain a little warmth toward white at their centre.
    color = mix(color, color + vec3(0.25), glow * vOrder * 0.5);

    gl_FragColor = vec4(color, glow * vAlpha);
    if (gl_FragColor.a < 0.01) discard;
  }
`;

export const lineVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uOrder;

  attribute float aStrength;
  varying float vStrength;
  varying float vOrder;

  vec3 rotateY(vec3 p, float a) {
    float s = sin(a), c = cos(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  void main() {
    float o = uOrder * uOrder * (3.0 - 2.0 * uOrder);
    float radius = length(position.xz);
    vec3 p = rotateY(position, uTime * (0.10 - radius * 0.007));

    // Connections only exist in the ordered state — they emerge from the
    // centre outward as the field resolves, so the network is seen forming.
    float reach = smoothstep(0.0, 1.0, o * 1.5 - radius * 0.06);
    p = mix(p * 0.55, p, reach);

    vStrength = aStrength * reach;
    vOrder = o;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const lineFragmentShader = /* glsl */ `
  precision mediump float;
  varying float vStrength;
  varying float vOrder;

  void main() {
    vec3 color = mix(vec3(0.106, 0.227, 0.420), vec3(0.216, 0.831, 0.902), vStrength);
    gl_FragColor = vec4(color, vStrength * vOrder * 0.32);
    if (gl_FragColor.a < 0.005) discard;
  }
`;
