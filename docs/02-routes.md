# 02 — Route Manifest

**92 routes.** Tier per D1: **A** = signature WebGL/bespoke, **B** = full product interactions, **C** = real data, read-mostly, no stubs.

This file is the source of truth for the nav, the sitemap, and `tests/invariants.spec.ts`.

---

## Public (§09)

| Route | Tier | What it does |
|---|---|---|
| `/` | **A** | 3D education universe, scroll story chaos→order, Discover/Discern/Decide (§11–16, §104) |
| `/discover` | **A** | Interactive constellation, hover previews, explore/compare/save (§14) |
| `/compare` | **B** | Comparison engine, up to 4 entities, 10 dimensions, bespoke charts (§15) |
| `/decision-engine` | **A** | Inputs → shortlist with explicit "why this appears" (§16, §102) |
| `/passion-projector` | **A** | Public entry to the signature experience; completes without an account, prompts to save |
| `/students` | C | Audience page — the student journey as editorial narrative |
| `/parents` | C | Audience page |
| `/institutions` | C | Audience page |
| `/methodology` | B | Data collection, verification, ranking logic, disputes; ranking≠payment section (§77, §78) |
| `/about` | C | Mission, philosophy, the "too important to guess" thesis |

## Entity profiles (public, deep-linkable)

| Route | Tier | Notes |
|---|---|---|
| `/college/[slug]` | **B** | 12 sections (§22). Verification state honest per D2.5 |
| `/course/[slug]` | **B** | Includes "Where could this take you?" pathway graph (§23) |
| `/career/[slug]` | C | Description, fields, degrees, skills, related courses/institutions/projects (§24) |
| `/scholarship/[slug]` | C | Eligibility, coverage, deadline, process (§41) |

## Auth (§17–18)

| Route | Tier |
|---|---|
| `/login` | B |
| `/signup` | B — role selection determines everything downstream (§18) |
| `/forgot-password` | C |
| `/reset-password` | C |
| `/verify-email` | C |
| `/onboarding` | **B** — 7 cinematic steps, branches by role (§19) |

---

## Student (§20–52) — 24 routes

| Route | Tier | Notes |
|---|---|---|
| `/student/dashboard` | **B** | 10 modules (§20) |
| `/student/discover` | **B** | Search + 13 filters, saved-state aware (§21) |
| `/student/passion-projector` | **A** | The signature feature (§25–38) |
| `/student/passion-projector/history` | B | Retakes, evolution timeline (§39–40) |
| `/student/colleges` | C | Saved + recommended, with reasons |
| `/student/courses` | C | |
| `/student/careers` | B | Explore by interest/field/skill/degree/industry/work-style (§24) |
| `/student/compare` | **B** | Shares the comparison engine with `/compare` |
| `/student/scholarships` | B | 8 filters (§41) |
| `/student/applications` | **B** | 10-stage kanban with real transitions (§42) |
| `/student/applications/[id]` | **B** | 8-item checklist, uploads, completion tracking (§43) |
| `/student/application-support` | C | Guidance resources (§44) |
| `/student/transition` | C | Post-admit; offer comparison, enrollment checklist (§45). Carries an advisory disclaimer — no authoritative visa/legal guidance |
| `/student/projects` | **B** | Active/completed/saved; status transitions, evidence, reflection (§103) |
| `/student/projects/[id]` | B | Single project execution view |
| `/student/profile` | B | Completeness with actionable gaps (§47) |
| `/student/progress` | B | Readiness across 7 dimensions — no invented psychometric scores (§48) |
| `/student/documents` | **B** | Vault, 8 categories, upload/preview/rename/attach/delete (§46) |
| `/student/saved` | B | 5 tabs, compare/remove/notes (§51) |
| `/student/notifications` | B | 7 types (§52) |
| `/student/curriculum-reality` | B | What studying a field actually involves (§49) |
| `/student/degree-roi` | **B** | User-input-driven cost/time/outcome modelling, labelled estimates (§50) |
| `/student/settings` | C | Shares `/settings` sections (§81) |

## Parent (§53–62) — 15 routes

| Route | Tier | Notes |
|---|---|---|
| `/parent/dashboard` | **B** | "Clarity for the decisions that matter" (§54) |
| `/parent/discover` | B | Shared discovery, parent framing |
| `/parent/compare` | **B** | Headline visualization: cost vs. outcomes (§57) |
| `/parent/children` | B | Multi-child list + switcher (§83) |
| `/parent/child/[id]` | **B** | Permission-gated view of student data (§55, open question 3) |
| `/parent/budget` | **B** | 6 inputs, interactive breakdown charts; planning tool, not advice (§56) |
| `/parent/applications` | B | Visibility without override (§58) |
| `/parent/scholarships` | C | |
| `/parent/alerts` | B | |
| `/parent/counselling` | B | Discovery + demo booking flow; fictional counsellors, marked (§59) |
| `/parent/workshops` | B | Upcoming/past, registration (§60) |
| `/parent/community` | **B** | 5 categories, posts, comments, save, report; demo content marked (§61) |
| `/parent/documents` | C | Permission-scoped (§62) |
| `/parent/settings` | C | |

## Institution (§63–72) — 14 routes

| Route | Tier | Notes |
|---|---|---|
| `/institution/dashboard` | B | |
| `/institution/profile` | **B** | Edits trigger re-verification (§64, §76) |
| `/institution/listing` | B | Public-facing preview + verification badge (§65) |
| `/institution/programs` | B | |
| `/institution/admissions` | **B** | 7-stage pipeline (§68) |
| `/institution/applications` | B | |
| `/institution/leads` | B | Interest signals, 5 filters (§67) |
| `/institution/analytics` | **B** | Funnel, geographic map, trends, course matrices (§69) |
| `/institution/insights` | C | Benchmarking, no paid placement (§72) |
| `/institution/events` | **B** | Create/edit/publish 5 event types + registrations (§70) |
| `/institution/campus` | **A** | Virtual campus — 3D spatial visualization (§66) |
| `/institution/communications` | B | Messages, announcements, templates (§71) |
| `/institution/documents` | C | |
| `/institution/settings` | C | Multi-user roles: admin/admissions/comms/analytics (§84) |

## Admin (§73–76) — 18 routes

Not in public nav. `/admin` plus: `users`, `students`, `parents`, `institutions`, `verification`, `listings`, `courses`, `scholarships`, `careers`, `passion-projector`, `applications`, `content`, `reports`, `moderation`, `notifications`, `analytics`, `settings`.

Tier **B**: `/admin` (dashboard with charts, §74), `/admin/verification` (the 4-state workflow — central to the trust model, §76), `/admin/users` (view/verify/edit/suspend/flag/delete, §75). Remainder Tier C.

## Global

| Route | Tier |
|---|---|
| `/settings` | B — 7 sections (§81) |
| `/notifications` | B — role-aware (§80) |

**Not routes, but global surfaces:** command palette (`⌘K`, §79), notification bell, role-aware mobile tab bar (§85).

---

## Tier A count check

`/`, `/discover`, `/decision-engine`, `/passion-projector` (+ `/student/passion-projector`, same experience), `/institution/campus` — **5 signature experiences**, matching §88's instruction that WebGL be concentrated, not sprayed.

---

## Roles & access (§82)

`student` · `parent` · `institution_admin` · `institution_staff` · `edugate_admin`

Enforced at the route-group layout (redirect on mismatch) *and* in the repository layer (queries are scoped by actor). Layout-only guards are theatre; the data layer is where it has to be real.

`institution_staff` further scoped by capability: `admissions` · `communications` · `analytics` (§84).
