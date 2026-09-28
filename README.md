# Edugate

**Discover. Discern. Decide.**

An education decision intelligence platform. Not a college directory (§112) — a journey from *"I don't know what to choose"* to *"I have a plan."*

**Status:** architecture plan. No implementation yet — by design, see `docs/06-build-plan.md`.

---

## Read in this order

| Doc | What it settles |
|---|---|
| [`docs/00-decisions.md`](docs/00-decisions.md) | Resolved spec contradictions, hard invariants, **5 open questions for you** |
| [`docs/01-architecture.md`](docs/01-architecture.md) | Stack, data layer, rendering strategy, motion integration, perf budget |
| [`docs/02-routes.md`](docs/02-routes.md) | All 92 routes, tiered by depth |
| [`docs/03-data-model.md`](docs/03-data-model.md) | Entities, relationships, the permission and verification models |
| [`docs/04-passion-engine.md`](docs/04-passion-engine.md) | The signature feature — signals, adaptive selection, scoring, evidence |
| [`docs/05-design-system.md`](docs/05-design-system.md) | Tokens, type, motion, components, WebGL budget, accessibility |
| [`docs/06-build-plan.md`](docs/06-build-plan.md) | 9 stages, re-sequenced from §110, with scoping honesty |

---

## The four constraints that shape everything

1. **Everything is free.** Not a marketing beat — an absence enforced in the data model. No pricing route, no `tier` field, no `sponsored` flag, nothing that could make ranking a function of payment.
2. **Nothing is fabricated.** Every entity carries mandatory `provenance`. Demo data is a closed fictional universe, marked at every surface, tested for.
3. **Nothing is prescribed.** Every recommendation renders a real evidence trail from stored provenance — never generated prose that resembles one.
4. **WebGL must communicate.** Five signature scenes, zero on dashboards. If a scene would look the same regardless of the underlying state, it gets cut.

## Not in this product

No pricing, plans, premium tiers, paywalls, or paid visibility. No mock tests, exam prep, or practice tests — Passion Projector occupies that slot entirely.
