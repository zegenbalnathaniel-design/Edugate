# 01 — Technical Architecture

## Stack

| Layer | Choice | Why this and not the obvious alternative |
|---|---|---|
| Framework | Next.js (App Router), TypeScript `strict` | Server Components let content render as HTML so §96 (SEO) survives a WebGL-heavy build. Pages Router would push us toward client-rendering everything. |
| 3D | React Three Fiber + `@react-three/drei` + hand-written GLSL | §86 requires real WebGL. `drei` for camera/controls/loaders only — the visual identity comes from custom shaders, not from `drei`'s stock materials, which are recognizable and read as template work. |
| Post-processing | `@react-three/postprocessing`, used sparingly | Bloom on the hero and constellation only. Full effect stacks are the single biggest mobile perf cost. |
| Scroll | Lenis | §87. Single instance at root, exposed via context so R3F and GSAP read one scroll source. |
| Animation | GSAP + ScrollTrigger (DOM/timeline), R3F `useFrame` (scene) | Two systems, one clock — see *Motion Integration* below. |
| Styling | Tailwind v4 CSS-first tokens + CSS Modules for editorial/WebGL-adjacent components | Tailwind for spacing/layout rhythm consistency; CSS Modules where §08's editorial layouts need real CSS (grid areas, `clip-path`, blend modes) that utility classes make illegible. |
| State | Zustand (client), Server Components (server data) | Small, no provider tree, works outside React — which matters because the WebGL layer needs to read state inside `useFrame` without re-rendering. |
| Charts | Visx primitives + custom SVG/Canvas | §15/§69 need bespoke visualizations. Recharts/Chart.js have a look, and that look is "generic dashboard" — exactly §06's prohibition. |
| Forms | React Hook Form + Zod | Zod schemas are shared with the data layer, so onboarding validation and fixture validation are the same source of truth. |
| Data | Repository layer over typed fixtures | See below. |
| Auth | NextAuth-shaped interface, demo adapter behind it | Swap adapter for real providers without touching consumers. |

**Deliberately excluded:** UI component libraries (shadcn/MUI/Chakra). §06 forbids the generic-SaaS look, and that look is substantially *these libraries' defaults*. The component vocabulary is built from the design system in `05-design-system.md`.

---

## The data layer — the decision that determines whether this survives

The product must work with no backend (§97) *and* be able to acquire one without a rewrite. So nothing imports fixtures directly.

```
lib/data/
  types.ts            — entity types, all carrying `provenance`
  schema.ts           — Zod schemas; fixtures are validated against these at build
  repositories/
    institutions.ts   — export const institutions: InstitutionRepo
    courses.ts
    careers.ts
    scholarships.ts
    applications.ts
    passion.ts
    ...
  adapters/
    demo/             — in-memory + localStorage persistence
    http/             — placeholder; same interface, fetch-backed
  fixtures/           — the closed fictional universe (D2)
```

Every repository is an interface of async methods:

```ts
interface InstitutionRepo {
  list(q: InstitutionQuery): Promise<Page<Institution>>
  bySlug(slug: string): Promise<Institution | null>
  compare(ids: string[]): Promise<ComparisonMatrix>
}
```

Three properties follow, and all three matter:

1. **Async from day one.** Every consumer already handles pending and error states, so adding a network later changes no call sites and reveals no new loading bugs.
2. **Writes persist.** The demo adapter writes to `localStorage` under a namespaced key. An evaluator saves a college, reloads, and it is still saved. This is the difference between a demo and a mockup, and it is why §109 is achievable.
3. **Reset is a feature.** A `?reset=1` param and a settings action clear demo state, so evaluation always starts from a known-good universe.

---

## Rendering strategy

The tension: §11 wants a WebGL hero; §96 forbids rendering the site as a canvas.

**Rule — the canvas is never load-bearing for meaning.** Every WebGL scene has a DOM counterpart carrying the same information, always present in the HTML, never `display:none` when it is the accessible path.

- Server Components render content, headings, links, and data as real HTML.
- WebGL mounts client-side via `next/dynamic` with `ssr: false`, layered behind or beside the DOM.
- With JS off, `prefers-reduced-motion: reduce`, or a WebGL init failure, the page is still complete and still comprehensible (§95).

This is also the accessibility answer: the canvas is `aria-hidden` and the DOM layer is the real interface.

---

## Motion integration — one clock

Three animation systems fighting over `requestAnimationFrame` is the classic failure mode here. Prevented structurally:

1. Lenis is the only scroll authority. Native scroll is not read by anything else.
2. GSAP's ticker drives Lenis (`gsap.ticker.add(time => lenis.raf(time * 1000))`), and `ScrollTrigger.scrollerProxy` is wired to Lenis.
3. R3F's internal loop is disabled in favour of a single `useFrame` render driven from the same tick, so scene updates and DOM animation never tear.
4. Scroll velocity from Lenis is written into a Zustand store read inside `useFrame` — not into React state, which would re-render the tree every frame.

---

## Performance budget (§94)

Three device tiers, detected once at boot (GPU renderer string, `deviceMemory`, `hardwareConcurrency`, viewport, `prefers-reduced-motion`) and stored in context. Every scene reads its tier and scales itself.

| | High | Mid | Low / reduced-motion |
|---|---|---|---|
| Hero nodes | 8k instanced | 2.5k | 400, static DOM-composited |
| Passion particles | 60k GPGPU | 15k | 2k, or CSS-only reveal |
| Post-processing | Bloom + FXAA | FXAA | none |
| DPR cap | 2 | 1.5 | 1 |
| Shadow maps | none anywhere | — | — |

Non-negotiables: no scene runs `useFrame` work when off-screen (Intersection Observer → `frameloop="demand"`); textures are KTX2/Basis; particle systems use instancing or GPGPU, never per-particle meshes; route-level `dynamic()` boundaries around every canvas so dashboards never ship three.js.

**Target:** LCP < 2.0s on mid-tier mobile, hero interactive < 3.5s, 60fps desktop / 30fps floor mobile.

---

## Folder structure

```
app/
  (public)/            — landing, discover, compare, methodology, about, …
  (auth)/              — login, signup, onboarding, password flows
  (student)/student/
  (parent)/parent/
  (institution)/institution/
  (admin)/admin/
  college/[slug]/  course/[slug]/  career/[slug]/
components/
  primitives/          — Button, Field, Card, Table, Provenance, Badge …
  data-viz/            — Scatter, RadialCompare, Funnel, PathwayGraph, CostOutcome
  webgl/
    canvas/            — scene roots, one per signature experience
    shaders/           — .glsl, co-located with their material
    hooks/             — useDeviceTier, useScrollVelocity, useCursorField
  layout/              — nav, sidebars, mobile tab bars, command palette
lib/
  data/  auth/  passion/  decision/  utils/
tests/
  invariants.spec.ts   — D3/D4/D2 enforcement
```

Route groups, not middleware conditionals, carry role layouts — the sidebar/tab-bar shell differs per role (§20/§53/§63/§85) and groups express that in the filesystem where it is visible.
