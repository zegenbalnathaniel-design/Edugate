# 00 — Decisions & Resolved Contradictions

Every decision below is a commitment. If one is wrong, change it *here* first, then propagate — do not let the code and this document diverge.

---

## D1. The route-count vs. no-dead-buttons contradiction

**Conflict.** §109 forbids empty pages, placeholders, and dead buttons. §09–§76 specify ~92 routes across four role platforms. Both cannot hold at full depth in any realistic build.

**Resolution — tiered depth, no tier is fake.** Every route ships with real data, real state, and working interactions. What varies is *ambition*, not *completeness*.

| Tier | Meaning | Routes |
|---|---|---|
| **A — Signature** | Original WebGL, bespoke layout, iterated visual design. These are what people remember. | 5 |
| **B — Product** | Full CRUD-feel interactions, filtering, sorting, state transitions, persisted to the demo layer. Shared component vocabulary. | ~30 |
| **C — Structural** | Real rendered data, real navigation, read-mostly. Fewer interaction affordances but no stubs, no lorem, no disabled buttons. | ~57 |

**The rule that makes this honest:** a Tier C page may have *fewer* actions, but every action it does show must work. A Tier C page never says "Coming soon."

---

## D2. Demo data vs. no fabricated claims

**Conflict.** §97 wants a fully explorable product without a backend. §98 forbids inventing institutions, scholarships, placement rates, rankings, and statistics.

**Original resolution (superseded 2026-09-28) — a closed fictional universe.** The first build of this section invented every institution, course, career and scholarship, on the theory that inventing nothing real was the safest way to satisfy §98. In practice this produced the opposite of what §98 wanted: a demo that looked complete but named nothing a visitor could check. Feedback from actual use was direct — a fabricated-institutions catalog reads as fake, not as an honest placeholder, and undermines trust more than a smaller, real dataset would.

**Current resolution — real entities, every claim sourced.**

1. **Institutions, courses and scholarships name real, currently-operating organizations.** `src/lib/data/fixtures/education/institutions.ts`, `courses.ts` and `scholarships.ts` hold a deliberately small, deliberately real set — 10 institutions, a flagship program or two each, and 7 real scholarship/fellowship programs — rather than a large invented catalog. Small-and-checkable beats large-and-fictional.
2. **Every real record carries a `sources` array** (`SourceRef[]` — label, URL, `retrievedAt`) citing the official page (or, failing that, a reputable secondary aggregator) the facts were drawn from. `provenance: "verified"` may not be set without at least one source — enforced by a Zod `.refine()` on `InstitutionSchema` (docs/03 → schema.ts), the same mechanism that previously enforced "verified requires a verification record."
3. **Numbers that vary year to year (fees, coverage amounts) are the provider's most recently published range**, not an invented one — D2.4's "ranges, never points" still holds, it's just grounded in a real published range now. Admission deadlines are left unset rather than given a specific date, since admission cycles shift annually and a stale fabricated-looking date is worse than pointing at the source link.
4. **`outcomes` still stays unset everywhere.** Real placement and outcome statistics exist for some of these institutions but weren't independently verified in this pass — the same "don't set a field you haven't actually checked" discipline from the original D2.4, now applied to real data instead of admitting there's nothing to set.
5. **Career descriptions stay illustrative** — generic occupational information (what a software engineer's day looks like) was never a claim about a specific real entity, so it didn't need to change. What did change: `relatedCourses`/`relatedInstitutions` on each career now point at real records where a genuine connection exists, and are left empty rather than forced into a weak match.
6. **The old fictional-universe invariant tests (real-name collision denylist) are removed** — the whole point now is real names — and replaced with a "verified provenance requires real sources" structural test (docs `tests/invariants.spec.ts`).

If this needs to expand — more institutions, deeper per-course detail — the constraint stays research time, not permission: every addition needs its own real source before it ships, following the same pattern the 10 already here set.

---

## D3. Business model — hard invariants

Free is a product philosophy, not a marketing beat (§03). Encoded as *absences* that are enforced, not remembered:

- No route matching `/pricing`, `/plans`, `/upgrade`, `/billing`, `/checkout`.
- No `tier`, `plan`, `subscription`, `premium`, `isPaid`, or `entitlement` field anywhere in the data model.
- No `sponsored`, `promoted`, `featured` (in the paid sense), or `boost` field on institutions or listings.
- Ranking and recommendation functions take no argument derived from payment, because no such field exists to pass.
- The word "free" appears in at most two places sitewide: the footer statement (§105) and the methodology page. Repetition would undercut it.

**Superseded:** the original Edugate materials' subscription / institutional-fee / sponsored-visibility model (§04). Not implemented.

---

## D4. Removed features — hard invariants

Per §25: **no mock tests, no exam prep, no practice tests, no test-preparation hub.** No route, no nav item, no data model, no copy. Passion Projector occupies that conceptual slot entirely.

---

## D5. Missing input — the original business materials

§04 instructs using original Edugate materials for architecture, audiences, terminology, and workflows. **These were not provided.** This plan derives all of that from the specification text itself.

**Consequence:** terminology in this plan is provisional. Before Phase 2, either supply the source materials or accept the vocabulary defined in `03-data-model.md` as canonical. Reconciling later is cheap in docs and expensive in code.

---

## D6. Recommendation language

§16 and §33 forbid unexplained or prescriptive output. Enforced as a copy contract:

| Never | Always |
|---|---|
| "You should study X" | "One pathway worth exploring" |
| "Your perfect career" | "Where this could lead" |
| "You are 87% entrepreneur" | "Strong signal: Creation" |
| "Best match" | "Why this appears" + criteria list |
| Personality type codes | Interest signals with evidence |

Every recommendation surface renders an evidence trail — the specific responses or profile fields that produced it (§102). This is a data-model requirement, not a copywriting one: see `04-passion-engine.md` → Provenance.

---

## D7. Invariants are tested, not trusted

A single test suite (`tests/invariants.spec.ts`) asserts D3, D4, and D2.3 by walking the route manifest and the fixture set. These are the constraints most likely to erode silently across many files, so they get a machine check rather than a code review.

---

## Open questions — need your answer before Phase 2

1. **Geography.** ₹ figures in §29 imply India-first. Does v1 cover Indian institutions only, or international pathways too? This changes the data model (boards vs. curricula, single vs. multi-currency), the discovery filters, and the Institution Analytics map (§69).
2. **Curriculum/board vocabulary.** CBSE / ICSE / State / IB / IGCSE / A-Levels — which set is canonical for onboarding (§19)?
3. **Parent–student permissions.** §55 says "where permission allows." Who grants it — student opt-in per category, or parent-visible-by-default with student opt-out? This is a trust-defining default and genuinely your call.
4. **Auth reality.** Demo-only local sessions for now, or wire a real provider (§17 mentions Google) from the start?
5. **Source materials** — see D5.
