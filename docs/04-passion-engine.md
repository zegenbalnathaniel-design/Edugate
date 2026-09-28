# 04 — Passion Projector Engine

The signature feature (§113). This document specifies the model, the adaptive selector, the scoring, and the honesty constraints. Everything here exists to make one sentence true:

> *"What kinds of problems naturally pull your attention?"* — answered with evidence, not with a label.

---

## 1. Two kinds of dimension

The spec's §30 list mixes two things that must not be scored the same way. Flattening them is the single most common way products like this become astrology.

### Interest signals — *unipolar, 13*

How strongly something pulls attention. More is meaningful; less just means "not observed."

`curiosity` · `creation` · `analysis` · `systems` · `people` · `competition` · `exploration` · `research` · `design` · `business` · `technology` · `storytelling` · `impact`

### Working-style axes — *bipolar, 5*

Preferences between two equally valid poles. Neither end is "more." These **never** get a star rating — a 5-star "independence" score would imply collaboration is a deficiency.

| Axis | Pole A ←→ Pole B |
|---|---|
| `structure` | thrives in structure ←→ thrives in ambiguity |
| `social` | independent ←→ collaborative |
| `risk` | steady ←→ risk-seeking |
| `scope` | depth on one thing ←→ breadth across many |
| `drive` | intrinsic ←→ recognition-driven |

Rendered as a position on a line with a confidence band, never as a score. This distinction is also what keeps §30's prohibition on MBTI-style typing structurally true rather than a matter of copywriting restraint.

---

## 2. Question bank

Target **~70 authored questions**, of which any student sees **25–40** (§28).

```ts
interface PassionQuestion {
  id: ID
  stage: "core" | "probe" | "depth"
  prompt: string
  options: PassionOption[]
  eligibility?: (s: SignalState) => boolean   // gates depth questions
  targets: SignalKey[]                        // what this question informs
}

interface PassionOption {
  id: ID
  label: string
  signals: Partial<Record<SignalKey, number>>  // e.g. { creation: 3, technology: 2 }
  axes?: Partial<Record<AxisKey, number>>      // −2…+2
}
```

**Every option carries multiple signal weights** (§100). One-answer-to-one-career mapping is explicitly forbidden — the whole point is that patterns emerge across many questions, no single one of which is diagnostic.

Worked example from §29:

> *"If you had an entire Saturday with no responsibilities, what would you naturally spend it doing?"*

| Option | Signals | Axes |
|---|---|---|
| Build something nobody asked you to build | creation +3, technology +2, impact +1 | drive −2 (intrinsic), social −1 |
| Understand how something works | curiosity +3, analysis +3, systems +2 | scope −1 (depth) |
| Meet people and hear their stories | people +3, storytelling +2, curiosity +1 | social +2 |
| Compete at something | competition +3, drive +1 | risk +1 |
| Create something others can experience | creation +3, design +2, storytelling +2 | drive +1 |
| Explore somewhere unfamiliar | exploration +3, curiosity +2 | risk +1, scope +1 |
| Organize a complicated problem | systems +3, analysis +2, structure −2 | structure −2 |
| Research something you've become curious about | curiosity +3, research +3, analysis +2 | scope −2 |

**Bank composition:**
- **Core (~12, everyone sees all):** broad coverage, each touching 4+ signals. Guarantees a comparable baseline across students.
- **Probe (~35):** selected adaptively to resolve uncertainty.
- **Depth (~23):** gated by `eligibility`, exploring specific territory (§101) — engineering/product/entrepreneurship for creation+technology+systems; psychology/media/law/marketing for people+storytelling; economics/finance/strategy for analysis+business+competition.

Questions are **scenarios, not self-assessments.** §29's examples all ask what you'd *do*, never "rate your creativity 1–5." Self-report invites performance; scenarios reveal orientation. Hold this line when authoring the bank — it is the difference between this and a BuzzFeed quiz.

---

## 3. Adaptive selection

After the 12 core questions, each next question is chosen to reduce uncertainty where it matters most.

```
for each eligible unasked question q:
    score(q) = Σ_{s ∈ q.targets} uncertainty(s) × salience(s) × novelty(q)

uncertainty(s) = 1 / (1 + observations(s))        // few observations → high uncertainty
salience(s)    = 0.3 + 0.7 × normalized(s)        // emerging signals are worth resolving
novelty(q)     = 1 − maxCosineSimilarity(q, asked)  // avoid near-duplicate probes
```

Pick the argmax; tie-break deterministically by `id`.

**Why this shape.** `uncertainty` alone would chase signals the student has shown no interest in, producing an irrelevant, tedious middle section. `salience` alone would only confirm what is already obvious. The product is exploration *and* refinement: resolve the signals that are both emerging and unresolved.

**Termination** at the first satisfied condition:
- ≥25 answered **and** top-5 signals stable across the last 5 questions (no rank change), **or**
- ≥25 answered **and** mean confidence ≥ 0.7, **or**
- 40 answered (hard cap).

**Determinism matters.** Same responses → same next question, always. No randomness. This makes the experience reproducible for testing, and it makes "why did this appear?" answerable.

---

## 4. Scoring

Adaptive branching means two students answer different question sets. **Raw sums are therefore not comparable** — a student asked eight technology-touching questions will out-score one asked three, regardless of orientation. This is the subtle bug that would quietly invalidate every downstream recommendation, so normalization is against *what was actually asked*:

```
raw(s)       = Σ over responses of option.signals[s]
attainable(s)= Σ over asked questions of max(option.signals[s] across that question's options)
normalized(s)= raw(s) / attainable(s)                   ∈ [0,1]
observations(s) = count of asked questions where s ∈ targets
confidence(s)   = min(1, observations(s) / 5)
```

**Display rules:**
- `confidence(s) ≥ 0.6` → render stars, 5 bands over `normalized` (§30).
- `confidence(s) < 0.6` → render "not enough signal yet" with an invitation to answer a few more. Never a star rating derived from one or two data points.
- Axes render as position + confidence band; below 0.6 confidence, the band spans most of the line, which is itself the honest message.

Precision is never overstated: no percentages, no decimals, no "87%".

---

## 5. Archetypes — matched, not assigned

```ts
interface Archetype {
  key: string                    // "builder_strategist"
  name: string                   // "The Builder-Strategist"
  vector: Record<SignalKey, number>
  description: string
  pullsAttention: string[]; howYouWork: string[]
  whatMotivates: string[]; whatYouReturnTo: string[]
}
```

~14 archetypes. Match by cosine similarity between the student's normalized signal vector and each archetype vector.

**Two guards against fake precision:**
1. **Floor at 0.82.** Below it, `archetype = null` and the reveal leads with the student's top signals and their evidence instead. A person who doesn't match a named pattern is a normal outcome, not a system failure — and forcing a label on them is exactly what §30 forbids.
2. **Blend disclosure.** If the top two archetypes are within 0.05, both are shown: *"Your signals sit between two patterns."* True, more useful, and it teaches the reader that these are descriptions rather than categories.

Archetype names describe orientation, never prescribe identity — "The Builder-Strategist," not "The Engineer."

---

## 6. Provenance — the feature that makes the rest defensible

```ts
interface EvidenceMap {
  bySignal: Record<SignalKey, { responseId: ID; contribution: number }[]>
  byField:  Record<FieldKey,  { signalKey: SignalKey; weight: number }[]>
  byProject: Record<ID, { reason: string; signals: SignalKey[] }[]>
}
```

Every derived claim stores the responses that produced it. §32's "Why did this appear?" then renders **actual traceable reasoning**:

> **Systems Thinking — strong signal**
> This came from how you answered:
> · *Saturday with no responsibilities* → "Organize a complicated problem"
> · *The empty restaurant* → "Whether the food is actually the problem"
> · *Three hours solving* → "Why a company stopped growing"

Generated prose could *sound* like this. Only stored evidence *is* this. The difference is invisible in a demo and decisive in a product — it is what lets a 16-year-old disagree with the output, which is precisely what makes the output trustworthy.

---

## 7. Signals → fields → degrees → careers → projects (§33–38)

A weighted bipartite mapping, hand-authored and reviewable:

```ts
const FIELD_WEIGHTS: Record<FieldKey, Partial<Record<SignalKey, number>>> = {
  economics:        { analysis: .9, business: .8, systems: .6, competition: .5 },
  computer_science: { technology: .9, creation: .8, systems: .8, analysis: .6 },
  psychology:       { people: .9, curiosity: .7, research: .7, analysis: .5 },
  // … 13 fields per §33
}

connection(field) = Σ_s normalized(s) × FIELD_WEIGHTS[field][s] / Σ_s FIELD_WEIGHTS[field][s]
```

Banded to three labels, never numbers: **Strong connection** (≥0.70) · **Moderate connection** (0.50–0.70) · **Worth exploring** (0.35–0.50). Below 0.35 is not shown.

Fields → degrees (§34) and degrees → career pathways (§35) are authored adjacency lists, rendered as branching pathway graphs — **always plural**, always framed as *"One pathway worth exploring."*

### Projects (§36–37) — the actual differentiator

Career suggestions are commodity. Projects are not, because they convert a reading experience into something the student can do on Saturday.

```ts
interface ProjectTemplate {
  id: ID
  title: string
  requires: { signals: SignalKey[]; minNormalized: number }
  fields: FieldKey[]
  gradeRange: [number, number]
  difficulty: "starter" | "intermediate" | "ambitious"
  estimatedHours: number
  skills: string[]
  learningOutcomes: string[]
  firstStep: string                 // concrete, doable within an hour
  portfolioValue: string
}
```

~60 templates. Selection filters on signal thresholds, grade, and the student's stated available time, then diversifies: never three variations of one idea. Each rendered card answers §37's six questions, and the **first step is always small enough to start today** — "Message three people in your school who run clubs and ask what their hardest week looked like," not "Conduct user research."

Accepting a project creates a real `Project` entity (§103) that appears in `/student/projects` with status transitions, evidence uploads, and reflection. **This is the loop that makes Passion Projector a product feature rather than a quiz result**, and it is the last thing to cut if anything gets cut.

---

## 8. The WebGL metaphor (§89)

One continuous scene across the whole session, not per-screen animations:

| Phase | Visual | Driven by |
|---|---|---|
| **Chaos** (Q1–8) | ~60k particles, Brownian drift, no structure | time only |
| **Patterns** (Q9–20) | Particles drift toward emergent centroids; each answer applies a visible impulse | normalized signals |
| **Signals** (Q21–end) | Loose clusters resolve; strongest signals brightest and densest | signals × confidence |
| **Constellation** (reveal) | Clusters snap into orbits around the student; distance = inverse strength | final profile |

**Implementation:** GPGPU position/velocity in float textures, one instanced draw call, cluster targets as uniforms updated per answer. Never per-particle CPU work.

**Critical (§111):** the particles must encode the actual signal state. If the visual would look identical regardless of the answers, it communicates nothing and should be cut. Every impulse maps to a real weight from the option the student just chose — that is the entire justification for the WebGL being here at all.

Reduced-motion path: the same four phases as a layered CSS/SVG reveal. Same information, no canvas.

---

## 9. Evolution (§39–40)

Sessions are immutable and never overwritten. Retakes create new sessions; `/student/passion-projector/history` renders the delta as a timeline of top signals per date.

Framing, non-negotiable: *"This is a snapshot of your current curiosity. Your interests can change."* For a 15-year-old, the ability to look back and see their interests move is more valuable than any single result — it teaches that the question is worth revisiting, which is the honest lesson about choosing what to study.
