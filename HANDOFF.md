# Edugate — Handoff

**Status as of 2026-09-28:** Stage 0 (foundation) and Stage 2 (public landing page) are complete and verified. Build passes, typecheck clean, `/` prerenders as static HTML.

---

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # build + typecheck
npm run check:universe # asserts the hero geometry actually forms rings
```

Node 20+. No env vars, no backend, no external services.

---

## What exists

| Area | Files |
|---|---|
| Design tokens, registers, beams/pool keyframes, textures, reduced-motion | `src/app/globals.css` |
| Single-clock Lenis + GSAP + R3F integration | `src/components/motion/SmoothScroll.tsx` |
| Scroll store (imperative, no per-frame re-render) | `src/lib/motion/scrollStore.ts` |
| Device tiering / perf budget | `src/lib/motion/useDeviceTier.ts` |
| Hero WebGL universe (chaos → orbital rings) | `src/components/webgl/` |
| Animated beams, circular beam pool, spotlight | `src/components/fx/` |
| Landing narrative + interactive sections | `src/components/landing/` |
| Primitives (Button, Section, Provenance) | `src/components/primitives/` |
| Entity types | `src/lib/data/types.ts` |
| Geometry regression check | `scripts/check-universe.mts` |

**One page exists: `/`.** Every nav link points at a route that is not built yet.

---

## What is NOT done

1. **91 of 92 routes.** See `docs/02-routes.md` for the full tiered manifest.
2. **The data layer.** `src/lib/data/types.ts` has the entity types; there are **no repositories, no adapters, no fixtures**. `docs/01-architecture.md` specifies the repository-over-fixtures design.
3. **`tests/invariants.spec.ts`** (D7). The free/no-fabrication invariants are currently enforced only by the type system, not by a machine check.
4. **Passion Projector** — the signature feature. Fully specified in `docs/04-passion-engine.md`, zero lines written.
5. **Auth, onboarding, all four role platforms.**

---

## Decisions already made — do not relitigate

Read `docs/00-decisions.md` first. The load-bearing ones:

- **Tiered route depth (D1).** All 92 routes ship real and functional; only 5 get signature WebGL. A Tier C page may have fewer actions, but every action it shows must work. No "coming soon", no lorem, no placeholder rectangles.
- **Everything is free (D3).** No pricing route. No `tier`/`plan`/`subscription`/`premium`/`isPaid`/`sponsored`/`promoted` field anywhere in the data model — so a ranking function cannot take payment as an argument, because there is nothing to pass. The word "free" appears in at most two places sitewide.
- **Nothing fabricated (D2).** Every entity carries a mandatory `provenance` field. Demo data is a closed fictional universe; no real institution, scholarship or counsellor is ever named. Numbers that imply measurement are ranges, never points. Verification dates are never invented.
- **Nothing prescribed (D6).** Every recommendation renders an evidence trail from *stored* provenance — never generated prose that resembles one. "One pathway worth exploring", never "you should study X".
- **No mock tests / exam prep (D4).** Passion Projector occupies that slot entirely.

**Working assumptions** made to unblock Stage 0, reversible: India-first (model supports multi-country), curriculum enum covers CBSE/ICSE/State/IB/IGCSE/A-Levels, parent permissions default to student opt-in.

---

## Three bugs already found and fixed — don't reintroduce them

These all looked correct in code and only failed on screen:

1. **Nested spheres instead of rings.** Nested spheres project to a filled disc — pixel-identical to the chaotic state, which destroys the entire chaos→order transition. Use tilted rings.
2. **Camera inside the rings' plane.** Every orbit collapses to a flat band. Same failure mode. The camera sits at ~18° elevation for a reason.
3. **Transformation completing after the hero scrolled away.** The hero is a sticky scroll runway so the resolution is watched, not scrolled past.

`npm run check:universe` guards all three. Keep it passing.

---

## Continuation prompt

> I'm continuing the Edugate build. The repo contains a complete architecture plan in `docs/` and a working foundation + landing page. **Read `HANDOFF.md`, then `docs/00-decisions.md`, then `docs/06-build-plan.md` before writing any code.**
>
> Build **Stage 1: Passion Projector, end to end**, per `docs/04-passion-engine.md`. That document is the spec — follow it precisely, especially:
>
> - **13 unipolar interest signals and 5 bipolar working-style axes are scored differently.** Axes never get star ratings; a 5-star "independence" score would imply collaboration is a deficiency.
> - **Normalize scores against the questions actually asked.** Adaptive branching means two students see different question sets, so raw sums are not comparable — a student asked eight technology questions out-scores one asked three regardless of orientation. This is the subtle bug that would quietly invalidate every downstream recommendation.
> - **Signals with fewer than ~5 observations render "not enough signal yet"**, never stars. No percentages, no decimals, no "87%".
> - **Archetypes are matched by cosine similarity with a 0.82 floor.** Below it, `archetype = null` and the reveal leads with top signals instead. A person who doesn't match a named pattern is a normal outcome, not a failure.
> - **Every derived claim stores the response IDs that produced it.** "Why did this appear?" must render real stored evidence, not generated prose. Generated text would sound identical and be worthless — it's what lets a 16-year-old disagree with the output.
> - **Questions are scenarios, not self-assessments.** "What would you do with a free Saturday", never "rate your creativity 1–5".
> - **Accepting a project creates a real `Project` entity** that appears in `/student/projects` with status transitions. This loop is what makes the feature a product rather than a quiz result. It is the last thing to cut.
>
> Build the data layer first (repositories over typed fixtures, async from day one, writes persisted to localStorage) since Passion Projector needs it — see `docs/01-architecture.md`. Also write `tests/invariants.spec.ts` per D7.
>
> Reuse the existing particle/shader infrastructure in `src/components/webgl/` for the chaos → patterns → signals → constellation sequence (§89). The visual must encode actual signal state: if it would look identical regardless of the answers, cut it.
>
> Match the existing design system exactly — tokens in `src/app/globals.css`, component vocabulary in `src/components/primitives/` and `src/components/fx/`. Do not introduce a UI component library.
>
> Verify with `npm run build` and `npm run check:universe`, and drive the actual flow in a browser before claiming it works.

---

## Open questions still unanswered

From `docs/00-decisions.md`:

1. Geography — India-only or international pathways too?
2. Curriculum board vocabulary — which set is canonical?
3. Parent–student permissions — student opt-in, or parent-visible with opt-out? (Currently assumed opt-in.)
4. Auth — demo-only sessions, or wire a real provider?
5. The original Edugate business materials referenced in §04 were never supplied. All terminology in `docs/` is derived from the spec text and is provisional.
