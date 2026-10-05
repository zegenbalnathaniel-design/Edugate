# 10 — University Wrapped

An interactive assessment at `/wrapped`: about 40–47 playful questions → a story of results (core type, interest DNA, best-fit degrees, careers, campus, money, countries, an honest university list, next move). No account needed; answers live in the browser and in the share link (`/wrapped#r=…`) until the student chooses to save them.

**Principle:** simple questions, sophisticated analysis — and never a recommendation the data can't back.

## 1. Files

| Piece | Where |
|---|---|
| Types, chapters, dimensions | `src/lib/wrapped/model.ts` |
| Question bank (with hidden scoring) | `src/lib/wrapped/questions.ts` |
| Answers → profile; type, DNA, courses, careers, campus, money, micro-feedback | `src/lib/wrapped/profile.ts` (pure, client-safe) |
| University, country and list matching | `src/lib/wrapped/match.ts` (pure; run server-side against the catalogue) |
| Server actions: compute, build list (tracker), save to profile | `src/app/wrapped/actions.ts` |
| UI | `src/components/wrapped/` — `WrappedFlow` (quiz), `QuestionCard`, `ResultsStory`, `codec` (share link + local save), `Portal` |
| Tests | `tests/wrapped.spec.ts` |

## 2. Flow

Opening ("Your future isn't a Google search") → stats card → seven chapters, one question per full-screen card: **01 Your brain · 02 Your energy · 03 Your future · 04 Your university · 05 Your world · 06 The real world (money) · 07 Your call.** Each chapter opens with a card that reacts to the answers so far ("Interesting. You're leaning heavily toward analytical problem-solving."). Progress is shown per chapter, never "question 12 of 45". Students can go back and change any answer; the run resumes from local storage.

Interaction styles rotate: tap (single), multi-select, 1–10 slider, this-or-that (versus), rank-your-top-3.

**Adaptive deep dives.** After the base "brain" and "energy" questions, the two strongest of six clusters — money/markets, tech/building, health, design/creative, society/law, science/research — each add three questions. Destination questions appear only for students open to studying abroad.

## 3. Scoring (hidden from the student)

Every option carries small effects (1–3) on: interest type (RIASEC), academic style (quantitative, analytical, verbal, creative, technical, social, practical), motivations (income, prestige, leadership, entrepreneurship, impact, security, creativity, challenge, mobility, balance), learning preferences, traits (risk, ambition, independence, structure, competition, collaboration, flexibility, breadth), campus wants, and subject affinity on the shared FieldKey vocabulary. Multi-selects spread their signal (÷√n); ranks weight 1.5 / 1 / 0.6; sliders scale −1…+1. Scores map to 0–100 with diminishing returns (bipolar traits: 50 = neutral).

The core type ("THE ANALYST-STRATEGIST", "THE EXPLORER" for flat profiles) is labelled on screen as a memorable summary, not a diagnosis.

## 4. Matching

Weights (renormalised over the dimensions Edugate has data for — an unknown never counts for or against, and is not shown):

| Dimension | Weight | From |
|---|---|---|
| Course fit | 20 | best eligible programme's subjects vs the student's subject affinity |
| Career fit | 15 | careers that programme leads to, scored for the student |
| Academic fit | 15 | Class XII range vs published selectivity or minimum % |
| Financial fit | 15 | published tuition (+ published living cost) in ₹ vs comfortable budget, stretched by loan attitude |
| Campus fit | 10 | only facts held: city, size, international share, selectivity, research/startup/career opportunities, sport, fests |
| Admission odds | 10 | evidence band (below) |
| Location fit | 5 | distance and destination preferences |
| Flexibility | 5 | breadth of subjects offered × how unsure the student is |
| Career ROI | 5 | published median/average salary vs cost |

**Hard filters run first:** excluded countries; distance ("stay in my city / state / India"); single-gender colleges unless the student opts in; programmes whose published requirements name a subject the student's stream lacks (published subjects and eligibility text); published cost beyond budget × loan stretch (×1.1 none … ×2.5 large), with a narrow allowance where scholarships are published. A planned entrance test (NEET, JEE…) is not ineligibility — it becomes a watch-out. The results card states how many institutions were set aside and why.

**Buckets** use only published evidence (`admissionBand`, `selectivity`): Dream = highly selective on published data; Reach / Target / Safety = closing ranks, merit cut-offs or acceptance rates; colleges that publish none appear as "Strong fit, odds unpublished". Best Value = fit ≥ 75 and financial fit ≥ 85 on a published cost. A university is a "high fit" only when the course itself fits (course ≥ 55, overall ≥ 58). Lists cap two per destination for variety.

**Countries** are scored from preference, the catalogue's median published tuition vs budget, programmes in the student's best-fit subjects, and mobility motivation — and the reasons quote those figures.

## 5. Honesty rules

No admission guarantee anywhere; fit % is explained as "how well published facts match your answers"; prestige never overrides a hard constraint; careers read "strong potential fit", never "you will become"; unknown fees say so in the watch-outs; course categories that usually need Maths/Biology warn when the student's stream lacks it.
