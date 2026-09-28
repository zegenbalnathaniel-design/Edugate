# Edugate — Handoff

**Status as of 2026-09-28:** Stage 0 (foundation), Stage 1 (Passion Projector) and Stage 2 (public landing page) are complete and verified. Build passes, typecheck clean, `npm run test` passes (24 tests), `/` prerenders as static HTML.

---

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build           # build + typecheck
npm run test            # vitest — invariants (D7) + passion engine logic
npm run check:universe  # asserts the hero geometry actually forms rings
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
| Entity types + Passion/Project domain | `src/lib/data/types.ts` |
| Geometry regression check | `scripts/check-universe.mts` |
| Data layer: repositories, demo/localStorage adapter, Zod schemas | `src/lib/data/{repositories,adapters,schema.ts}` |
| Passion engine: adaptive selection, scoring, archetypes, fields, projects | `src/lib/passion/` |
| Passion content: 70 questions, 14 archetypes, 60 project templates, field weights | `src/lib/data/fixtures/passion/` |
| Passion Projector UI + WebGL particle scene (4 phases) | `src/components/passion/`, `src/components/webgl/passion/` |
| Invariant tests (D7) + passion engine tests | `tests/` |

**Three pages exist:** `/`, `/passion-projector`, `/student/projects`, `/student/passion-projector/history` (four, plus the not-found page). Every other nav link points at a route that is not built yet.

---

## What is NOT done

1. **88 of 92 routes.** See `docs/02-routes.md` for the full tiered manifest.
2. **Auth, onboarding, and three of the four role platforms** (parent, institution, admin — student has only the two Passion Projector routes above, no dashboard shell). `/student/projects` and `/student/passion-projector/history` are standalone routes, not yet inside a real dashboard layout.
3. **The rest of the data layer.** Only the Passion/Project repositories exist. Institution/Course/Career/Scholarship/Application/etc. have types (`src/lib/data/types.ts`, Stage 0) but no repositories, fixtures, or schemas yet.
4. **Document vault, applications kanban, everything past Stage 2** per `docs/06-build-plan.md`'s Stage 3+.

Passion Projector's local student identity (`getLocalStudentId()` in `src/lib/data/adapters/demo/storage.ts`) is a placeholder for real auth — Stage 3 should replace it, not layer on top of it.

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

> I'm continuing the Edugate build. Stages 0, 1 and 2 are complete and verified — foundation, Passion Projector end to end, and the public landing page. **Read `HANDOFF.md`, then `docs/00-decisions.md`, then `docs/06-build-plan.md` before writing any code.**
>
> Build **Stage 3: Auth, onboarding, student core**, per `docs/06-build-plan.md`. In order:
>
> - Auth routes and a demo session adapter (`docs/01-architecture.md` describes a NextAuth-shaped interface with a demo adapter behind it). This should *replace* `getLocalStudentId()` in `src/lib/data/adapters/demo/storage.ts` — Passion Projector and its Project entities already key off a student id, so wiring real sessions in means swapping what produces that id, not adding a parallel identity system.
> - Role selection, the 7-step cinematic onboarding, and `StudentProfile` (types exist in `docs/03-data-model.md` but the entity, repository and fixtures don't exist yet — build them the same repository-over-fixtures way `src/lib/data/repositories/passion.ts` does).
> - The student dashboard shell (route group layout with sidebar/tab-bar per `docs/01-architecture.md` → Folder structure) — `/student/projects` and `/student/passion-projector/history` currently stand alone with no shell and should move under it.
> - `/student/discover` with the 13 filters, college/course/career profiles, saved items, profile & completeness, command palette, notifications.
>
> **Done when** (per the build plan): signup → onboarding → dashboard → discover → save → compare runs end to end with persistence across reload.
>
> Match the existing design system exactly — tokens in `src/app/globals.css`, component vocabulary in `src/components/primitives/`, `src/components/fx/` and now `src/components/passion/`. Do not introduce a UI component library.
>
> Verify with `npm run build`, `npm run test`, `npm run check:universe`, and drive the actual flow in a browser before claiming it works.

---

## Passion Projector — decisions made that weren't fully specified

`docs/04-passion-engine.md` didn't cover everything; these were filled in during Stage 1 and should be treated the same as `docs/00-decisions.md` — changeable, but don't relitigate silently:

- **`provenance` on `PassionSession`/`Project`.** Both extend `Entity` per `docs/03-data-model.md`, which mandates the field, but neither "illustrative" nor "institution-supplied" fits a student's own real answers. Used `"verified"` to mean "authentic, not fabricated" rather than "institutionally verified" — documented inline at both repositories. If this reads as misleading once the Institution verification workflow exists (Stage 7), reconsider.
- **Axis scoring formula.** §4 gives the signal normalization formula explicitly but not axes. `src/lib/passion/scoring.ts` extends the same "normalize against what was askable" logic to axes' -1..+1 position, with the same ~5-observation confidence floor. Reasoning is inline in `scoreAxes`.
- **Project intake (grade, weekly hours).** There's no `StudentProfile` yet (Stage 3), so grade/time-budget are collected as transient local state on the intro screen, not persisted as profile fields. Once `StudentProfile` exists, this should read from it instead of asking again.
- **The WebGL "GPGPU"** in §8 is implemented as a single 13×1 `DataTexture` (signal strength + confidence) sampled per-particle, rewritten on every answer — not a multi-pass ping-pong simulation. Same technique the existing hero (`src/components/webgl/`) already uses (precomputed attribute buffers blended by a uniform), extended with a texture so per-signal state can update live. Encodes real answers correctly; just isn't literally GPGPU.
- **Local identity.** `getLocalStudentId()` (`src/lib/data/adapters/demo/storage.ts`) is a randomly generated id persisted to localStorage, standing in for a logged-in student until Stage 3 wires real auth.

Also fixed in passing: the global nav's un-scrolled state (`src/components/layout/SiteNav.tsx`) renders light text assuming a dark backdrop, which is invisible on a light-register page before scrolling. `/student/projects` and `/student/passion-projector/history` use `register="deep"` to avoid it. Stage 3's dashboard shell should either make the nav register-aware or not reuse the marketing nav on product routes at all.

---

## Open questions still unanswered

From `docs/00-decisions.md`:

1. Geography — India-only or international pathways too?
2. Curriculum board vocabulary — which set is canonical?
3. Parent–student permissions — student opt-in, or parent-visible with opt-out? (Currently assumed opt-in.)
4. Auth — demo-only sessions, or wire a real provider?
5. The original Edugate business materials referenced in §04 were never supplied. All terminology in `docs/` is derived from the spec text and is provisional.
