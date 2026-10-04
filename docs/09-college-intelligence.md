# 09 — College Intelligence: Chennai → Tamil Nadu → India → Abroad

Extends `07-college-engine.md`. Where they disagree, this document wins for the college/course structure; fix it here first.

## 1. Audit — what the college structure was missing (Oct 2026)

| Area | Before | Gap |
|---|---|---|
| Geography | Country → region → university; 51 institutions, 10 in India, 1 in Chennai | No India-first hierarchy; no state/city drill-down; nothing for Tamil Nadu beyond IIT Madras and VIT |
| Indian structure | `control` public/private; `category` | No institution type (deemed / state / autonomous / affiliated), affiliating university, NAAC/NBA, minority status, aided vs self-financed streams, gender, locality |
| Courses | 1–2 "flagship" programmes per institution | No complete programme lists; no specialisation, department, stream, intake, mode |
| Course discovery | Filter universities by a 21-value field list | No search by course; no grouping of variants (B.Com CS / A&F / Hons); no joint-degree queries |
| Admissions | Curriculum requirements (IB/A-level/CBSE…), tests, deadlines | No admission basis (merit vs entrance vs interview), minimum %, Class XI–XII subjects, reservation, NRI route, per-course process; no Exam → Programmes view |
| Fees | Institution-wide tuition, some itemised fees | No per-course fees in ₹, whole-degree totals, cost bands, cost of a year |
| Scholarships | Name, kind, coverage | No provider (government/institution), application process, renewal conditions; no sports/women/category kinds |
| Placements | Outcomes table, recruiters | No lowest salary, sector split, per-course outcomes |
| Campus & life | Facilities list, housing | No facility categories, clubs/societies/festivals/support, contact |
| Comparison | University vs university | No course vs course |
| Filters | Country, field, curriculum, QS band, SAT, USD budget, control | No state/city, degree, ₹ bands, admission route, entrance test, selectivity, institution type |
| Matching | Per-dimension fit + preference alignment (USD) | No Indian tests (JEE/NEET/CUET/CLAT/IPMAT), ₹ budget, state preference, programme-level ranking, Reach/Target/Safety |

## 2. Hierarchy & routes

```
/explore                                  Level 1–4 cards, course search, states, abroad regions
/explore/chennai        → /explore/india/tamil-nadu/chennai
/explore/tamil-nadu     → /explore/india/tamil-nadu
/explore/india                            states → cities
/explore/india/[state]                    cities → institutions
/explore/india/[state]/[city]             institutions grouped by type; filters: type, degree, women's colleges; subject chips
/explore/abroad                           USA · UK · Canada · Australia · Singapore · Europe · UAE · Hong Kong · Other
/explore/abroad/[region]                  institutions by country
/courses                                  subject hub + free-text course search ("Economics + Finance")
/courses/[subject]                        every programme in the subject, grouped Chennai → TN → India → Abroad
/compare/programs?p=uni/prog&p=…          course vs course (≤ 5)
/universities/[slug]/{,courses,admissions,fees,scholarships,placements,campus,student-life,careers,rankings,compare}
/universities/[slug]/programs/[program]   full programme profile
```

Breadcrumbs are canonical (`src/lib/unis/paths.ts`): `Explore › India › Tamil Nadu › Chennai › Loyola College › Undergraduate › BCom › B.Com. (Corporate Secretaryship)`.

**Hub vs city.** A campus outside city limits that students search under the city (SRM at Kattankulathur, VIT Chennai at Kelambakkam) keeps its real `city`/`locality` and sets `hub: "Chennai"`. Tiers (`tierOf`) use `hub ?? city`.

## 3. Data model additions (`src/lib/unis/schema.ts`) — all defaulted, so older records stay valid

- **Institution:** `institutionType` (central/state/state-private/deemed university, INI, autonomous/affiliated/constituent college, standalone institute, foreign university), `hub`, `locality`, `gender`, `affiliation` (sourced), `accreditation[]` (NAAC grade/cycle, NBA, AICTE, UGC 2(f)/12(B)…, each sourced), `minorityStatus` (sourced), `contact`, `media` (logo/photos — only licence-cleared images, credited; empty until sourced; a monogram is shown meanwhile), `control: "government-aided"`, categories `arts-and-science`, `medical-school`, `law-school`, `design-school`, `multidisciplinary`.
- **Programme:** `specialization`, `department`, `campus`, `stream` (Aided/Shift I vs Self-financed/Shift II), `mode`, `intake` (sourced), `admission` {basis[], eligibility, minimumPercent, requiredSubjects[], entranceTests[], reservation, international, applicationFee, process[], source}, `deadlines[]`, `feeBreakdown[]`, `electives[]`, `opportunities[]` (internship/exchange/research/industry), `careers` {paths, higherStudy, source}, `outcomes[]`, `recruiters`, `scholarships[]` (names of applicable awards), `alsoFields[]`.
- **Scholarship:** kinds + `sports`, `women`, `government`, `category-based`, `first-generation`, `minority`; `provider`, `applicationProcess`, `renewalConditions`.
- **Outcomes:** `lowestSalary`, `sectors[]`. **Details:** `studentLife[]` (clubs, societies, festivals, MUN, entrepreneurship/investment clubs, service, exchange, support, career services), facility `category`.
- **Field vocabulary** extended for Indian UG courses (commerce, data science, statistics, sports, languages & literature, history, sociology, social work, biotechnology, geography, hospitality, pharmacy, nursing, allied health, agriculture, education, visual/performing arts, philosophy). One vocabulary serves profile interests, filters and course pages.

## 4. Course taxonomy (`src/lib/unis/taxonomy.ts`)

Programmes keep their exact official name. Subjects are inferred from name + specialisation + subfield with tested patterns (`tests/taxonomy.spec.ts`), plus the primary `field` and explicit `alsoFields`. Degrees normalise to families (B.Com (Hons.) → BCom; B.A., LL.B. (Hons.) → BA LLB). Entrance tests normalise (CUET, JEE Main/Advanced, NEET, CLAT, IPMAT, SAT, ACT, BITSAT, VITEEE, SRMJEEE, NATA, UCEED, NID DAT, TNEA, institution's own test). Free-text queries split on `+`, `&`, `and`, `,`: every named subject must match (joint degrees); leftover text is a name search.

## 5. Indexing

Extracted columns (migration `0002_college_explorer`): universities `hub, institution_type, degrees[], admission_bases[], tests[], cost_inr_min, selectivity, data_hash`; programs `subjects[] (GIN), degree_norm, cost_inr, admission_bases[], tests[]`. `fields[]` now holds the union of programme subjects. Seeding rewrites a row whenever its content hash (incl. `EXTRACT_VERSION`) changes; admin edits are marked `admin:vN` and never overwritten by an equal-or-older file, but their columns are re-extracted when the logic changes.

## 6. Filters

URL state, OR within a filter, AND across: tier (Chennai / Tamil Nadu / Rest of India / Abroad), state, city, country, subject, degree, yearly fee in ₹ (<1L, 1–3L, 3–5L, 5–10L, 10–25L, 25L+; converted at dated reference rates abroad), admission route, entrance test, selectivity, institution type, control, QS band, SAT policy, curriculum.

## 7. Matching

`src/lib/unis/match.ts`. Two separate answers, never blended:

1. **Match %** — `preferenceAlignment` over per-dimension fit (course subjects, board/subject requirements, tests incl. JEE/NEET/CUET/CLAT/IPMAT, ₹ budget vs the programme's yearly tuition, preferred states/countries, documented research/entrepreneurship/internships), weighted by the student's own weights. Unknowns excluded and reported.
2. **Admission band** — evidence only: (a) JEE Advanced rank vs last published closing rank for that course (≤ 0.7× Safety, ≤ 1× Target, else Reach); (b) Class XII % vs a published merit cut-off (≥ +3 Safety, ≥ −1 Target, else Reach); (c) institution acceptance rate (selectivity band). Missing a published requirement → *Not yet eligible*. Ranks and cut-offs older than `MAX_CUTOFF_AGE` (3 years) are ignored and the reason is shown. No evidence → *Unclassified*.

Selectivity (`selectivity.ts`): acceptance rate < 15% highly selective, 15–35 selective, 35–65 moderate, > 65 accessible; JEE Advanced OPEN closing rank ≤ 5,000 for the most competitive listed course → highly selective. Shown on the Methodology page.

## 8. Data quality rules (unchanged, restated for Indian data)

Source priority: official institution site/prospectus → admission portal → syllabus/handbook → government (UGC, AICTE, state DoTE/DCE, TNEA) → NIRF → NAAC → institutional reports (AQAR/SSR, NIRF data submissions) → reputable secondary (labelled *secondary*). Every value names a source, a date and a confidence. Fees, deadlines, requirements, tests, rankings and placement figures carry `asOf`; freshness flags compute at read time. Absent data reads "Not verified yet" or "Data not publicly available" — never an estimate. Placement packages are only shown from the institution's own report or its NIRF submission.

## 9. Coverage roadmap

Phase 1 Chennai (deep: every UG programme per institution) → Phase 2 Tamil Nadu → Phase 3 India by state → Phase 4 abroad deepening. The current count per tier is shown live on `/explore`; the coverage gap is stated, not hidden.
