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

**Resolution — a closed fictional universe, marked at every boundary.**

1. **No real entity is ever named.** No real college, university, scholarship, counsellor, or company appears anywhere — not in fixtures, not in screenshots, not in copy. Fictional names are drawn from an invented set that is obviously not real on inspection (see `05-design-system.md` → Demo Provenance).
2. **Every demo record carries `provenance: "illustrative"`** in the type system. It is not an optional field.
3. **The UI renders provenance, not the developer's discipline.** A shared `<Provenance>` primitive renders the marker. If a record is illustrative and the marker is absent, that is a bug, and it is caught by a test (see D7).
4. **Numbers that imply measurement are ranges, never points.** No "94% placement rate." Cost and outcome figures in Degree ROI (§50) and Budget Planner (§56) are user-driven calculations over user-entered inputs — the platform supplies the arithmetic and the visualization, not the claim.
5. **Verification dates are never fabricated** (§22). Where no verification exists, the field renders as "Not yet verified" — which is also the honest default state of a real pre-launch platform.

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
