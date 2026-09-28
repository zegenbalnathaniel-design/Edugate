# 06 — Build Plan

§110 lists 22 phases. That ordering is sound but it front-loads breadth and leaves the signature feature at #10 — by which point quality is competing with fatigue. This plan re-sequences so the **riskiest, most differentiating work happens while there is room to iterate on it**, and so there is a demonstrable product at the end of every stage rather than only at the end.

---

## Stage 0 — Foundation

Next.js + TS scaffold · tokens and type scale as CSS variables · ~20 primitives · the repository interface layer with a demo adapter · Lenis/GSAP/R3F integrated on one clock · device-tier detection · `tests/invariants.spec.ts` (D3/D4/D2) wired into CI.

**Done when:** a throwaway page renders primitives in both registers, a repository read/write round-trips through `localStorage`, and the invariant suite passes.

Nothing here is visible to a user, and skipping it is how the other stages become slow.

---

## Stage 1 — Passion Projector, end to end ★

The §113 feature, built first, while it can still be iterated.

Signal and axis model · ~70-question bank (the largest single authoring cost here — budget real time for it; scenario quality *is* the feature) · adaptive selector · normalized scoring with confidence · ~14 archetypes with the 0.82 floor · evidence/provenance capture · GPGPU particle scene across all four phases · cinematic reveal · signals→fields→degrees→careers mapping · ~60 project templates · project acceptance writing real `Project` entities · history and evolution.

**Done when:** a stranger completes it unprompted, the particles visibly respond to their answers, every signal can be interrogated with "why did this appear," and they leave with a project whose first step they could start tonight.

**This is the stage that decides whether the product is memorable.** If it needs a second pass, take it here rather than adding routes.

---

## Stage 2 — Public site & the education universe

Hero WebGL network (nodes, orbits, mouse field, scroll-driven camera) · the chaos→order scroll narrative · Discover/Discern/Decide sections · `/discover` constellation · `/compare` engine · `/decision-engine` with `<WhyThisAppears>` · `/methodology` including the ranking≠payment section (§78) · audience pages · nav, footer, loading sequence, cursor.

The hero and the Passion constellation share shader and particle infrastructure — which is precisely why Stage 1 comes first. Building the hero first would mean building that infrastructure twice.

**Done when:** the landing page works with JS disabled, scores ≥90 Lighthouse performance on mid-tier mobile, and the closing CTA's organized network visibly answers the opening chaos.

---

## Stage 3 — Auth, onboarding, student core

Auth routes and the demo session adapter · role selection · 7-step cinematic onboarding · student dashboard · `/student/discover` with 13 filters · college/course/career profiles · saved items · profile & completeness · command palette · notifications.

**Done when:** signup → onboarding → dashboard → discover → save → compare runs end to end with persistence across reload.

---

## Stage 4 — Student depth

Applications kanban with real stage transitions · application detail with checklist and uploads · document vault on IndexedDB · scholarships · projects surface · progress · curriculum reality · degree ROI · transition · application support.

**Done when:** an application can be driven from `research` to `accepted` with documents attached at each step, surviving reload.

---

## Stage 5 — Parent platform

`ChildLink` permissions enforced in the repository layer · parent dashboard · child profiles · budget planner with interactive breakdown · cost↔outcome comparison · application visibility (read-only by interface, per §58) · counselling and workshops with demo booking · community with posts/comments/moderation · alerts.

**Done when:** a student revokes a permission category and the parent's view reflects it immediately — verified against the repository, not just the UI.

---

## Stage 6 — Institution platform

Profile management with edit-triggers-reverification · public listing preview · programs · admissions pipeline · leads · analytics (funnel, geographic intensity, trends, matrices) · events with registrations · communications · virtual campus (Tier A WebGL) · multi-user capability scoping.

---

## Stage 7 — Admin platform

Dashboard with charts · user management · **the verification workflow** (the trust model's operational half, §76) · content · moderation · reports · analytics · system settings.

---

## Stage 8 — Mobile, performance, accessibility, polish

Role-aware bottom tab bars — designed, not shrunk (§85) · touch interactions for constellation and comparison · WebGL tier verification on real devices · bundle audit (assert zero three.js on dashboard routes) · full keyboard pass · screen-reader pass · reduced-motion pass across every scene · final motion timing.

Accessibility is *listed* last but **built throughout** — semantic markup, focus management, and DOM counterparts are Stage 0 habits. This stage is verification, not remediation. Deferring the substance of it to the end would mean rebuilding every scene.

---

## Sequencing rationale, in one line each

- **Signature feature first** — it carries the most design risk and the most product value, and it needs iteration room.
- **Shared infrastructure before its second consumer** — particles and shaders are built once, in Stage 1, then reused.
- **Auth before role platforms** — the permission model is load-bearing for Stages 5–7 and expensive to retrofit.
- **Parent before institution** — `ChildLink` exercises the repository-level access control that institutions and admin then reuse.
- **Every stage ends demonstrable** — there is no point at which the project is a half-built skeleton.

---

## Honest scoping note

This is a multi-person, multi-month product. Anyone who tells you the 92 routes, 5 WebGL experiences, adaptive engine, 70-question bank, and 60 project templates arrive in a weekend is describing 92 stub pages.

What is genuinely achievable at high quality, and in what order, is what this document describes. **Stages 0–2 alone — foundation, Passion Projector, and the public universe — would be a compelling, complete, demonstrable product** and would prove every hard technical question in the spec. If the timeline is short, ship those and hold the rest. Shipping three stages well beats shipping eight thinly, and the spec's own quality bar (§114) agrees.

---

## Before Stage 0

`00-decisions.md` closes with five open questions. Questions 1 (geography), 2 (curriculum vocabulary), and 3 (parent permission default) shape the data model and should be answered before Stage 0. Questions 4 (auth reality) and 5 (source materials) can wait until Stage 3.
