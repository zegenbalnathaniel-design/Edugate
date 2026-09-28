# 05 — Design System

One system across marketing and product (§108). The public site and the dashboards share tokens, type, motion, and components — the only thing that changes is density.

---

## Color

Blue is structural, not decorative (§08) — it carries depth and data, never "brand wash."

```css
/* Depth — dark immersive surfaces */
--void:        #05070D;   /* WebGL backdrop, deepest layer */
--navy-900:    #0A1020;   /* dark section ground */
--navy-800:    #101A31;   /* raised surface on dark */
--navy-700:    #1A2744;   /* border / divider on dark */

/* Academic — structure, chrome, data */
--academic:    #1B3A6B;
--academic-lt: #2E5590;

/* Action — used sparingly; scarcity is what makes it read as action */
--electric:    #2F6BFF;
--electric-dim:#1F4FCC;

/* Data accent — charts, signal strength, live states */
--cyan:        #37D4E6;
--cyan-deep:   #1BA3B8;

/* Light editorial surfaces */
--paper:       #F7F8FA;
--paper-warm:  #EDEFF3;
--ink:         #0A0F1A;

/* Neutrals */
--grey-100…900

/* Semantic — verification, deadlines, moderation */
--verified:    #2FA36B;
--pending:     #C9902E;
--attention:   #C4543C;   /* not pure red; this product rarely has true errors */
```

**Section rhythm (§08):** the page alternates dark-immersive → light-editorial → data → product-UI. Never two consecutive sections of the same register. The transition between registers is where scroll-driven motion belongs.

**Contrast:** all body text ≥ 4.5:1, large display ≥ 3:1, non-text UI ≥ 3:1. `--electric` on `--void` passes; `--electric` on `--academic` does not — it is prohibited as a text pairing and documented as such.

---

## Typography

| Role | Face | Notes |
|---|---|---|
| Display | **Geist** (or Inter Tight) | −0.03em tracking at display sizes, `font-variation-settings` for weight |
| Body | **Inter** | 1.55 line-height, max 68ch |
| Data | **Geist Mono** | `font-variant-numeric: tabular-nums` — mandatory in every table and chart axis |
| Meta | Inter, uppercase, 0.12em tracking, 11–12px | Section labels, `01 PROFILE`, provenance markers |

Both are open-source and self-hosted via `next/font` — no external requests, no layout shift.

```css
--text-display-xl: clamp(3.5rem, 11vw, 9rem);    /* "EDUCATION IS TOO IMPORTANT TO GUESS" */
--text-display-l:  clamp(2.5rem, 6vw, 5rem);
--text-display-m:  clamp(2rem, 4vw, 3.25rem);
--text-body-l:     clamp(1.0625rem, 1.3vw, 1.25rem);
--text-body:       1rem;
--text-meta:       0.6875rem;
```

Hero display type sets at `--text-display-xl`, weight 500–600, line-height 0.92, and breaks across lines deliberately (§08). It is the loudest element on the site; nothing else competes with it.

---

## Space, radius, elevation

8px base scale: `4 8 12 16 24 32 48 64 96 128 192`.

Radius is small and consistent — **`--r-sm: 4px` / `--r-md: 8px` / `--r-lg: 12px`, and nothing above 12px except pills.** §06 forbids the excessive-rounded-card look; large radii are the fastest route to generic-SaaS.

Elevation is **border + background shift first, shadow second.** On dark surfaces, shadows are nearly invisible and produce muddy edges; a 1px `--navy-700` border reads cleanly. Shadows appear only on genuinely floating elements (command palette, dropdowns, toasts).

No glassmorphism. One exception: the scrolled nav bar gets a `backdrop-filter: blur(12px)` over a 0.72-alpha ground (§10), because it must remain legible over both registers.

---

## Motion

```css
--dur-instant: 120ms;  /* state feedback: hover, focus, press */
--dur-quick:   240ms;  /* local transitions */
--dur-base:    480ms;  /* component enter/exit */
--dur-slow:    900ms;  /* section and route transitions */

--ease-out:  cubic-bezier(0.16, 1, 0.3, 1);      /* default — decisive arrival */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* magnetic buttons only */
```

**Rules.** Motion communicates state change or spatial relationship — nothing else (§111). Never animate more than two properties at once. Never animate anything that isn't `transform`/`opacity`/`filter`. Nothing decorative loops forever except the WebGL ambient layer.

`prefers-reduced-motion: reduce` → durations to `--dur-instant`, scroll-triggered reveals become immediate, WebGL falls to its static tier, Lenis is disabled and native scroll restored (§87 — never break native navigation).

**Micro-interactions (§92):** magnetic buttons (≤6px translate, desktop pointer only), animated link underlines (`scaleX` from origin side), card depth on hover (border lightens + 2px lift, *not* scale — scaling text causes reflow shimmer), data-point hover expansion with tooltip.

---

## Cursor (§91)

Desktop, fine-pointer only. A 6px dot with a lagging 28px ring. States: `default` · `explore` (WebGL regions) · `view` (media) · `drag` (constellation, comparison) · `click`. Hidden entirely on touch and under reduced-motion. Never replaces the system cursor over text inputs.

---

## Components

**Primitives:** `Button` (primary/secondary/ghost/danger) · `Field` · `Select` · `Combobox` · `Checkbox` · `Radio` · `Toggle` · `Slider` · `Tabs` · `Table` · `Card` · `Badge` · `Provenance` · `Avatar` · `Tooltip` · `Dialog` · `Sheet` · `Toast` · `Progress` · `Skeleton` · `EmptyState` · `Pagination` · `CommandPalette`.

**Domain:** `InstitutionCard` · `CourseCard` · `ScholarshipCard` · `CareerCard` · `ProjectCard` · `SignalMeter` · `AxisIndicator` · `EvidenceTrail` · `VerificationBadge` · `DeadlinePill` · `StageTracker` · `CompletenessRing` · `PathwayGraph` · `ComparisonMatrix` · `WhyThisAppears`.

**Data-viz:** `Scatter` (cost↔outcome, §57) · `RadialCompare` · `Funnel` (§69) · `GeoIntensity` (§69) · `TimeSeries` · `Matrix` · `Distribution` · `Sparkline`.

Two that carry disproportionate weight:

- **`<Provenance>`** — renders the illustrative-data marker. D2.3 makes its absence a test failure. Visual: `--text-meta`, `--grey-500`, a 4px dot, sitting adjacent to the data it qualifies — present but never shouting.
- **`<WhyThisAppears>`** — renders an evidence trail from real stored provenance (§16, §102, `04-passion-engine.md` §6). Every recommendation surface in the product composes it. It is the component that makes D6 structural.

**`EmptyState` is mandatory** wherever a list can be empty, and always carries an action. This is the mechanism by which §109 is satisfied — an empty saved-items list shows "Nothing saved yet → Explore colleges," never a blank rectangle.

---

## WebGL budget (§88)

| Surface | WebGL | Data-viz | Product UI | Editorial |
|---|---|---|---|---|
| `/` landing | 55% | 10% | 5% | 30% |
| `/passion-projector` | 60% | 15% | 20% | 5% |
| `/discover` | 35% | 20% | 35% | 10% |
| `/decision-engine` | 25% | 40% | 30% | 5% |
| `/institution/campus` | 45% | 5% | 35% | 15% |
| All dashboards | **0%** | 45% | 50% | 5% |
| All Tier C routes | **0%** | 25% | 55% | 20% |

Sitewide this lands near §88's 30/25/20/15/10. Dashboards ship **zero** three.js — a bundle check enforces it, because this is where scope creep would otherwise cost the most performance for the least communicative value.

---

## Demo provenance (D2)

Fictional institutions use invented compound names that are recognizably not real on inspection — e.g. *Meridian Institute of Technology*, *Calder School of Design*, *Northfield University*. Cross-check every name against real institutions before committing it to fixtures; an accidental collision with a real college is a factual claim about a real organization.

Every surface rendering illustrative data shows the marker. Every fixture carries `provenance: "illustrative"`. No exceptions, and a test asserts it.

---

## Accessibility (§95)

Semantic HTML first — the WebGL layer is `aria-hidden` and always has a complete DOM counterpart (`01-architecture.md` → Rendering strategy). Full keyboard navigation including the command palette and the constellation (arrow keys traverse nodes; the focused node announces name and signal strength). Focus rings are a visible 2px `--cyan` at 2px offset, never removed. All live regions announce state changes. Target 44×44px minimum on touch.

**The test:** turn off the canvas and the product must still be complete, navigable, and comprehensible. If it isn't, the WebGL has stopped being an enhancement.
