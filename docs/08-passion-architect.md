# 08 — Passion Project Architect

The long-form counterpart to the Passion Projector's 15-question snapshot
(docs/04). It follows the "Universal Passion Project Architect" spec: discovery
interview → personal profile → 8–12 concepts → qualitative fit matrix → student
selection → validation research → full blueprint and dossier.

Route: `/passion-projector/architect` (saved copies at `/passion-projector/architect/[id]`).

## Flow and where each spec part lives

| Spec part | Step | Code |
| --- | --- | --- |
| I Discovery interview (adaptive, batched) | `interview` | `prompts.interviewPrompt`, `InterviewTurn` |
| II Profile · III Concepts · IV Fit matrix | `ideate` | `prompts.ideatePrompt`, `Ideation` |
| User selection: select / combine ≤3 / reject all / refine / back to discovery | client | `ConceptBoard` |
| V–VI Validation research (live web search) | `research` | `claude.research` |
| VI–XV, XXVII (validation, summary, thesis, objectives, research framework, architecture, MVP, roadmap, 12 weeks, preview, next 24h/7d/30d) | `blueprint` part `core` | `BlueprintCore` |
| XI, XVI–XXVIII (proposal, materials & costs, Lean/Standard/Ambitious budgets, team, partnerships, impact & KPIs, commercialization only if credible, scaling, brand, presence, documentation, risk register, "make it exceptional", evolution v1–v3, quality check) | `blueprint` part `extended` | `BlueprintExtended` |
| XXV Final dossier | render + Markdown export | `BlueprintView`, `markdown.toMarkdown` |

The two blueprint halves are separate requests run in parallel, so each stays
well inside a serverless function's time limit and a retry only redoes the half
that failed.

## Honesty guarantees

- **Nothing is "verified" unless search returned it.** The research step
  collects the URLs from the web-search tool results and citations in the API
  response itself. `enforceVerification` demotes any "verified" claim whose
  URL is not in that set to an assumption tagged "(requires validation)" — on
  the server after generation, and again when a blueprint is saved.
- If live search is unavailable, the blueprint is told so and every premise is
  treated as unverified; the UI says so.
- Fit ratings are Low / Moderate / High / Very High only — never numbers.
- Costs are labelled estimates with a "check locally" note.
- Commercialization is shown only when the model marks it credible.

## API usage

- Model `claude-opus-5-5` via `@anthropic-ai/sdk`, streaming
  (`beta.messages.stream(...).finalMessage()`), structured outputs from the Zod
  schemas, `effort` low for interview and medium elsewhere, the system
  prompt marked for prompt caching, and `fallbacks: "default"` (beta
  `server-side-fallback-2026-07-01`) so a declined request is retried on the
  recommended fallback model server-side.
- The SDK sends enums as description hints, so `normaliseEnums` repairs
  near-misses ("very high") before the response is validated against the schema.
- `stop_reason` `refusal` / `max_tokens` are handled before reading content.

## Access and cost control

- Needs `ANTHROPIC_API_KEY`, a persistent database (`DATABASE_URL`) and a
  signed-in user. Each missing piece produces an explanation, never a fake.
- Metering: `architect_usage` records weighted units per step (interview 1,
  ideate 4, research 3, blueprint 5 per half). The default allowance is 60 units per
  rolling 24 hours (roughly two or three full blueprints), set by `ARCHITECT_DAILY_UNITS`.
  Units are reserved before the call and refunded if the call fails.
- Saved blueprints live in `architect_projects`, are scoped to their owner, and are
  included in the account data export.

## Testing without a key

`tests/architect.spec.ts` covers the guards, schemas and Markdown export. For
the full UI, point `ANTHROPIC_BASE_URL` at a local mock of the Messages
streaming API. That is how the flow was exercised end to end before it shipped.
