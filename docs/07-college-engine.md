# 07 — College Discovery & Fit Intelligence Engine

Architecture for the university engine. Implements the "EDUGATE — College Discovery & Fit Intelligence Engine" build spec. Numbers in brackets (§n) refer to that spec. Where this document and the code disagree, fix this document first (same rule as `00-decisions.md`).

---

## 1. Product architecture

```
USER ─► PROFILE BUILDER ─► PREFERENCE WEIGHTS
                │
                ▼
UNIVERSITY DB ─► PROGRAM DB ─► REQUIREMENT ENGINE ─► FIT ENGINE ─► DISCOVERY / COMPARE / TRACKER
     │                               ▲                    ▲
     └─ SOURCES + VERIFICATION ──────┴── COST ENGINE ─────┘
```

Five layers (§1): **Discover** (directory, country explorer, "something unexpected"), **Filter** (structured filters + keyword search), **Understand** (university/program pages with sourced facts), **Fit** (transparent per-dimension alignment — never a single admission score, §2), **Plan** (gap analysis, checklist, tracker).

Non-negotiables carried over from `00-decisions.md`: no pricing/tiers/paid placement (D3) — the spec's "premium/future" features (§76) are built as ordinary features, never paywalled; nothing fabricated (D2, §48); recommendation language per D6 ("One pathway worth exploring", never "best match").

## 2. Information architecture

| Route | Purpose (spec) |
|---|---|
| `/universities` | Directory + filter sidebar + keyword search (§33, §64) |
| `/universities/countries` · `/universities/countries/[code]` | Country → region → university explorer (§4) |
| `/universities/[slug]` | University profile (§36), trust layer (§88) |
| `/universities/[slug]/programs/[program]` | Program profile (§37), curriculum (§6), gap analysis (§41) |
| `/compare?u=a,b,c` | Side-by-side, up to 5 (§32) |
| `/scholarships` | Scholarship explorer + matching (§26–27) |
| `/discover` | Personalised discovery dashboard (§51), "why this appeared" (§19) |
| `/profile` | Student profile builder (§17) |
| `/tracker` | Application tracker + checklist (§38–39) |
| `/admin` | Data admin: edit, verify, review reports, freshness flags (§67–69) |
| `/login` · `/signup` · `/account` | Accounts, export, delete (§70) |

Old fixture routes (`/college/[slug]`, `/course/[slug]`) redirect to the new pages once the dataset lands.

## 3–4. Database schema & data model

Hybrid relational + document design (Postgres via Drizzle; `src/lib/db/schema.ts`):

- **Catalogue (read-heavy, sourced):** `universities` and `programs` store the full sourced record as validated JSONB (`data`) plus *extracted, indexed columns* used for filtering (country, region, city, control, category, QS rank/edition, fields offered, curricula accepted, SAT policy, lowest international tuition normalised to USD). The JSONB keeps every value's source/date/confidence intact (§63) without a column explosion; extracted columns keep filters fast at thousands of rows. Re-extraction happens on every write, so they can't drift.
- **User side (write-heavy, relational):** `users`, `sessions`, `student_profiles` (JSONB validated by `StudentProfileSchema`), `applications` (tracker rows + checklist), `saved_searches`, `data_reports` (user "this looks outdated" queue), `audit_log` (who changed/verified what).
- **Reference:** `fx_rates` (dated reference rates with source) for the cost filter and calculator.

The logical hierarchy (§3) Country → University → Campus → School → Program is fully represented: country/region are columns, campuses and schools live on the record (`campuses[]`, `program.school`), programs are rows. Normalising campus/school into tables is deferred until a feature needs to query them independently (V2) — a migration, not a rebuild.

Sourced-value contract (`src/lib/unis/schema.ts`): every external fact is `{ value, sourceId, confidence, asOf, notes? }`; `sourceId` must resolve to an entry in the record's `sources[]` (enforced by a Zod refinement). Confidence labels (§44): `official`, `high`, `secondary`, `estimated`, `requires-verification`.

## 5. User flows

1. **Browse:** Home → Universities → filter (country, field, curriculum, QS band, budget, SAT policy) → profile → program → compare.
2. **Personal:** Sign up → profile builder (curriculum, subjects/grades, tests, interests, budget, geography, priorities) → Discover dashboard → "why this appeared" → program gap analysis → save to tracker → checklist.
3. **Scholarships:** Scholarships → filter by kind/country/field → "you appear to meet the published criteria" (never "you will receive", §27).
4. **Trust:** any fact → source link + date + confidence → "report outdated" → admin queue.
5. **Admin:** Admin → freshness flags (expired deadlines, old rankings, stale fees) → edit record (validated) → mark verified → audit log.

## 6. Filtering architecture (§33, §65)

Filter state lives in the URL (`?country=GB,US&field=economics&curriculum=IB&qs=1-100&sat=not-required&maxUsd=50000`) so searches are shareable and savable (§66). Semantics: values within one filter are **OR**; different filters are **AND**; `NOT` is expressed through explicit negative values (e.g. `sat=not-required` matches `optional | test-blind | not-considered | not-applicable`). SQL is built from the indexed columns; array containment (`&&`, `@>`) for fields/curricula. Keyword search matches name/city/program names (ILIKE now; full-text/semantic search is V2).

## 7. University profile architecture (§36)

Header (name, country/city, control/category, latest QS rank **with edition year**) → Quick facts (sourced stats) → Programs → Admissions (platform, fee, tests, English) → Deadlines (dated; past ones shown as past) → Costs (tuition by residency, living estimate, calculator) → Scholarships → Opportunities (research / entrepreneurship / internships / international) → Understand this university → Compare / Save / Track → **Trust layer**: "Data verified: {date} · Sources: {n}" with an expandable source list (§88).

## 8. Program profile architecture (§37)

Degree, duration, school → curriculum by year (official course names only, else "not yet verified") → requirements per curriculum (IB/A-level/CBSE/AP…, subject + level + grade + status) → tests → English → fees → related opportunities → **gap analysis against the signed-in student's profile** (§41).

## 9. Student profile architecture (§17)

`StudentProfile` (JSONB): citizenship, residence; curriculum + subjects `{name, level, grade}` + predicted/actual total; tests `{SAT, ACT, IELTS, TOEFL, …}`; intended fields; career interests; preferred countries; budget (amount + currency, per year); priorities (user weights, §53); extracurriculars `{activity, role, years, hoursPerWeek, impact, relevance}` (V2 matching). Only what the student chooses to enter; nothing required beyond an email to have an account (§70 data minimisation).

## 10. Matching methodology (§2, §18–19)

Per-dimension **alignment**, never an admission probability:

| Dimension | Computation | States |
|---|---|---|
| Program fit | university offers a program in the student's intended field(s) | aligned / not offered |
| Curriculum compatibility | a requirement row exists for the student's curriculum with `accepted: true` | accepted / not published / not accepted |
| Subject compatibility | each `required` subject in the row is present in the student's subjects at the required level | meets / missing {list} / unclear |
| Testing compatibility | test policies vs tests the student has | no test needed / has required test / missing {test} |
| English | student's score vs published minimum | meets / below / not provided |
| Financial fit | lowest published tuition (USD-normalised, dated FX) vs budget | within / above by ~x / unknown |
| Geographic fit | country in preferred list | yes / no / no preference |

Each dimension returns `{ state, reasons[] , sourceIds[] }` — the reasons are the "why this appeared" copy (§19). The optional **preference alignment** composite (§53) is a weighted share of aligned dimensions using the student's own weights, labelled "Preference alignment (your weights) — not an admission chance", with the formula shown inline. Unknown data never counts as aligned or misaligned; it is shown as unknown.

## 11. Scholarship architecture (§26–27)

Scholarships live on the university record (institutional aid) and in a separate external-scholarship list (government/foundation awards, e.g. Chevening, Fulbright-Nehru, DAAD, INSPIRE). Matching compares published eligibility tags (kind, citizenship/country, field, level) with the profile and outputs "appears to meet the published criteria" / "does not appear eligible" / "eligibility unclear — read the source".

## 12. Opportunity architecture (§20–23)

`opportunities[]` on each record, categorised research / entrepreneurship / networking / internships / careers / international / student-life, each with a source. Filters: "has undergraduate research programme", "has incubator/accelerator", etc. Faculty matching (§21) is V2 — it needs per-department faculty data we don't have sourced yet.

## 13. Source & verification architecture (§44–48, §63)

- Source hierarchy (§46) is recorded as `source.type` and shown to the user.
- Freshness rules (§85), computed at read time, never stored as stale truth:
  - ranking edition older than the latest known edition → "older ranking edition"
  - deadline date < today → shown as past, excluded from "upcoming"
  - `asOf` academic year earlier than the current cycle for fees/requirements → "may be outdated"
  - `sourceId` missing on a non-null value → blocked by validation
- Conflicts (§47): a `notes` field on the value records "Sources differ: A says X, B says Y"; the UI renders such notes prominently. No silent choice.

## 14. Admin architecture (§67–69)

Role-gated (`users.role = 'admin'`). Views: freshness queue, user reports queue, record editor (JSON editor validated with the same Zod schema before save; invalid saves rejected with field-level errors), mark verified (bumps `lastVerified`, writes `audit_log` with admin id). User reports never overwrite data; an admin accepts or dismisses them.

## 15. MVP (§78) — this build

Sourced dataset (target ~50 universities across 9 regions; **17 shipped so far** — research stopped when the build environment's web-search allowance ran out and most university sites are blocked by its network policy; the rest are added the same way, one validated file per university), country organisation, directory with core filters + keyword search, university & program profiles with trust layer, QS rankings with edition, curriculum requirements, tests, English, tuition, scholarships, key opportunities, compare (≤5), accounts, student profile, per-dimension fit with explanations, gap analysis, application tracker + checklist, report-outdated, admin dashboard.

## 16. Version 2

Natural-language search (Claude: query → filter JSON, shown back to the user for confirmation, §34–35), extracurricular matching (§16), faculty/research matching, full cost calculator with aid scenarios, scholarship alerts, saved-search notifications, CSV/PDF export, full-text/semantic search.

## 17. Version 3

AI counsellor that cites the underlying records (§71–72), automated ingestion + verification workflows (§84–85), mentor/alumni features, planning tools where methodologically justified.

## 18. UI/UX system

Existing Edugate design system (`05-design-system.md`, film-grade palette): calm, dense-where-useful information hierarchy; progressive disclosure (§81) — a first-time visitor sees "What are you looking for?" and three core filters; advanced filters expand. Status never by colour alone (§60): every state has a text label and an icon glyph (✓ ◐ ○ ⚠).

## 19. Technical architecture (§83)

- Next.js App Router server components read through a **data access layer** (`src/lib/unis/repo.ts`, `src/lib/auth/dal.ts`) — pages never touch SQL directly.
- DB: Postgres. `DATABASE_URL` set → Neon serverless driver. Unset → embedded PGlite (on-disk in development; in-memory preview mode in production, seeded from `data/universities/*.json` on cold start, with a visible "preview data — saved items may reset" notice).
- Data ingestion: research JSON files in `data/universities/` → `scripts/validate-universities.ts` → seed/upsert (repo record wins only when its `lastVerified` is newer than the DB's, so admin edits aren't clobbered by deploys).
- Auth: email + password (scrypt), random 256-bit session tokens stored hashed in `sessions`, httpOnly/secure/sameSite cookie — the pattern in the Next.js authentication guide; no auth secret to provision.
- AI layer (V2): Claude API, server-side only.

## 20–26. Worked examples

The examples below describe what the built product renders; the live versions are the pages themselves once the dataset is loaded.

**20. Example journey.** A CBSE Class XII student in Pune, interested in economics, budget ≈ USD 30k/yr, open to India/UK/Singapore → signs up → profile: CBSE, Mathematics 92, Economics 95, English 94; IELTS 7.5 → Discover shows programs grouped by "Strong academic alignment" / "Financially relevant" / "Something unexpected" → opens LSE BSc Economics → gap analysis shows which published requirements are met and which are unclear → saves to tracker → checklist lists UCAS deadline, personal statement, reference, English test.

**21. Example university profile.** Header: "London School of Economics — London, UK · Public · QS World University Rankings {edition}: {rank}". Trust bar: "Data verified 29 Sep 2026 · 9 sources". Every figure has an inline ⓘ that expands to source name, URL, date, confidence.

**22. Example student profile.** `{ curriculum: "CBSE", subjects: [{name:"Mathematics", grade:"92"}], tests: {IELTS: "7.5"}, fields: ["economics"], countries: ["IN","GB","SG"], budget: {amount: 30000, currency: "USD", period: "year"}, weights: {cost: 30, academics: 30, research: 20, location: 20} }`

**23. Example matching output.** For a program: Program fit ✓ "Offers Economics". Curriculum ◐ "CBSE accepted; the university publishes a Class XII percentage expectation — your 94% best-of-four meets it". Testing ✓ "No SAT required". English ✓ "IELTS 7.5 ≥ 7.0 overall". Financial ⚠ "Published international tuition ≈ USD 35–36k exceeds your USD 30k budget". Preference alignment (your weights): 70% — "not an admission chance".

**24. Example comparison page.** Columns per university (≤5); rows: QS (edition), country/city, program, duration, curriculum requirement for *your* curriculum, SAT, English minimum, tuition (native currency + USD approx. with FX date), scholarships count, research/entrepreneurship highlights, next deadline. Unknown cells read "Not currently verified".

**25. Example scholarship analysis.** "Chevening — appears to meet the published criteria: Indian citizen ✓, two years' work experience — not in your profile, check the source." Never "you will receive".

**26. Example academic gap analysis.** Table: Requirement · University · You · Status (✓ meets / ✗ missing / ◐ unclear / ↑ exceeds), each row linking to its source.
