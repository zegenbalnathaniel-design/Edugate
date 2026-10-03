import type { ReactNode } from "react";
import type { SavedProject } from "@/lib/architect/schemas";
import { LevelPill } from "./LevelPill";

/*
 * The final dossier (spec Part XXV). Renders on the server (saved projects)
 * and inside the client flow, so it holds no state of its own.
 */

const SECTIONS = [
  ["summary", "Summary"],
  ["validation", "Validation"],
  ["thesis", "Thesis"],
  ["objectives", "Objectives"],
  ["research", "Research"],
  ["build", "Architecture & MVP"],
  ["roadmap", "Roadmap"],
  ["weeks", "12 weeks"],
  ["proposal", "Proposal"],
  ["costs", "Costs"],
  ["people", "Team & partners"],
  ["impact", "Impact"],
  ["business", "Business"],
  ["brand", "Brand"],
  ["risks", "Risks"],
  ["next", "Next actions"],
  ["quality", "Quality check"],
] as const;

function Block({ id, title, children, note }: { id: string; title: string; children: ReactNode; note?: string }) {
  return (
    <section id={`bp-${id}`} className="scroll-mt-28 border-t border-paper/10 pt-8">
      <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.01em]">{title}</h2>
      {note && <p className="mt-1 text-[0.8125rem] text-paper/50">{note}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <p className="meta mb-1 text-paper/45">{label}</p>
      <div className="text-[0.9375rem] leading-relaxed text-paper/85">{children}</div>
    </div>
  );
}

function List({ items, label, ordered }: { items: string[]; label?: string; ordered?: boolean }) {
  if (!items.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <div>
      {label && <p className="meta mb-1.5 text-paper/45">{label}</p>}
      <Tag className={`space-y-1.5 pl-5 text-[0.9375rem] leading-relaxed text-paper/85 ${ordered ? "list-decimal" : "list-disc"} marker:text-paper/35`}>
        {items.map((i, n) => (
          <li key={n}>{i}</li>
        ))}
      </Tag>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-paper/10">
      <table className="w-full min-w-[560px] border-collapse text-left text-[0.875rem]">
        <thead className="bg-paper/5">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="meta px-3 py-2.5 font-normal text-paper/55">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-paper/10">
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2.5 text-paper/85">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const grid = "grid gap-5 md:grid-cols-2";

export function BlueprintView({ project }: { project: SavedProject }) {
  const { core: c, extended: x, concepts, research, profile } = project;
  return (
    <article className="space-y-10">
      <header>
        <p className="meta text-cyan">Project blueprint{concepts.length > 1 ? ` · combines ${concepts.length} concepts` : ""}</p>
        <h1 className="display-m mt-2">{c.title}</h1>
        <p className="mt-3 max-w-2xl text-body-l text-paper/70">{c.tagline}</p>
        <p className="mt-5 max-w-2xl rounded-[var(--radius-md)] border border-pending/40 bg-pending/10 px-4 py-3 text-[0.8125rem] text-paper/80">
          Written by AI from your answers. Only items under <strong>Verified</strong> are backed by a source; costs are estimates; everything else is a plan to test, not a fact.
        </p>
        <nav aria-label="Blueprint sections" className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#bp-${id}`} className="rounded-full border border-paper/15 px-3 py-1 text-[0.75rem] text-paper/65 hover:border-cyan hover:text-paper">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Block id="summary" title="Executive summary">
        <div className={grid}>
          <Field label="What it is">{c.executiveSummary.whatItIs}</Field>
          <Field label="Problem">{c.executiveSummary.problem}</Field>
          <Field label="Solution">{c.executiveSummary.solution}</Field>
          <Field label="Who benefits">{c.executiveSummary.whoBenefits}</Field>
          <Field label="Why it matters">{c.executiveSummary.whyItMatters}</Field>
          <Field label="Why you">{c.executiveSummary.whyYou}</Field>
          <Field label="First version">{c.executiveSummary.firstVersion}</Field>
          <Field label="Long-term vision">{c.executiveSummary.longTermVision}</Field>
        </div>
        <Field label="Success looks like">{c.executiveSummary.successLooksLike}</Field>
        <details className="rounded-[var(--radius-md)] border border-paper/10 px-4 py-3">
          <summary className="cursor-pointer text-[0.875rem] text-paper/70">Your profile, as the Architect understood it</summary>
          <div className="mt-4 space-y-4">
            <p className="text-[0.9375rem] text-paper/80">{profile.summary}</p>
            <div className={grid}>
              <List label="Core interests" items={profile.coreInterests} />
              <List label="Patterns you didn't name" items={profile.hiddenInterests} />
              <List label="Strengths" items={profile.strengths} />
              <List label="Constraints" items={profile.constraints} />
            </div>
          </div>
        </details>
      </Block>

      <Block id="validation" title="Validation" note="What is known, what is assumed, and what you still have to find out.">
        <div>
          <p className="meta mb-2 text-verified">Verified — with sources</p>
          {c.validation.verifiedFacts.length ? (
            <ul className="space-y-2 text-[0.9375rem]">
              {c.validation.verifiedFacts.map((f, i) => (
                <li key={i} className="border-l-2 border-verified/60 pl-3 text-paper/85">
                  {f.claim}{" "}
                  <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-all text-[0.8125rem] text-cyan underline-offset-2 hover:underline">
                    source ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.875rem] text-paper/60">
              {research.available ? "No claim could be tied to a source the research returned." : "Live research wasn't available, so nothing has been verified yet."}
            </p>
          )}
        </div>
        <div className={grid}>
          <List label="Assumptions — require validation" items={c.validation.assumptions} />
          <List label="Unknowns" items={c.validation.unknowns} />
        </div>
        <List label="Test these first" items={c.validation.mustTest} />
      </Block>

      <Block id="thesis" title="Project thesis">
        <p className="font-display text-[1.25rem] leading-snug text-paper">{c.thesis.statement}</p>
        <div className={grid}>
          <Field label="Problem">{c.thesis.problem}</Field>
          <List label="Root causes" items={c.thesis.rootCauses} />
          <Field label="Why existing approaches fall short">{c.thesis.existingApproachesFallShort}</Field>
          <Field label="Opportunity">{c.thesis.opportunity}</Field>
        </div>
        <Field label="Differentiation">{c.thesis.differentiation}</Field>
      </Block>

      <Block id="objectives" title="Objectives">
        <Field label="Primary objective">{c.objectives.primary}</Field>
        <div className={grid}>
          <List label="Measurable" items={c.objectives.measurable} />
          <List label="Secondary" items={c.objectives.secondary} />
          <List label="What you'll learn" items={c.objectives.learning} />
          <List label="Impact" items={c.objectives.impact} />
          <List label="Personal development" items={c.objectives.personal} />
        </div>
      </Block>

      <Block id="research" title="Research framework">
        <div className={grid}>
          <List label="Questions" items={c.research.questions} />
          <List label="Hypotheses" items={c.research.hypotheses} />
          <List label="Methods" items={c.research.methods} />
          <List label="Data to collect" items={c.research.dataToCollect} />
        </div>
        <List label="Ethics & consent" items={c.research.ethics} />
      </Block>

      <Block id="build" title="Architecture & minimum viable version">
        <Table head={["Component", "Purpose"]} rows={c.architecture.components.map((k) => [<strong key="n">{k.name}</strong>, k.purpose])} />
        <div className={grid}>
          <List label="User journey" items={c.architecture.userJourney} ordered />
          <List label="Tools" items={c.architecture.tools} />
        </div>
        <Field label="MVP goal">{c.mvp.goal}</Field>
        <div className={grid}>
          <List label="In v1" items={c.mvp.features} />
          <List label="Deliberately not in v1" items={c.mvp.notInV1} />
          <List label="Build steps" items={c.mvp.buildSteps} ordered />
          <List label="Success criteria" items={c.mvp.successCriteria} />
        </div>
        <Field label="How you'll test it">{c.mvp.testPlan}</Field>
        <Field label="Preview">{c.preview.description}</Field>
        <Field label="First user experience">{c.preview.firstUserExperience}</Field>
        <List label="Tangible outputs" items={c.preview.artifacts} />
      </Block>

      <Block id="roadmap" title="Roadmap">
        <ol className="space-y-4">
          {c.roadmap.map((p, i) => (
            <li key={i} className="glass p-4 sm:p-5">
              <p className="meta text-cyan">Phase {i + 1}</p>
              <h3 className="mt-1 font-display text-[1.125rem]">{p.phase}</h3>
              <p className="mt-1 text-[0.9375rem] text-paper/75">{p.objective}</p>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <List label="Actions" items={p.actions} />
                <List label="Deliverables" items={p.deliverables} />
                <List label="Risks" items={p.risks} />
              </div>
              <p className="mt-3 text-[0.8125rem] text-paper/60">Success metric: {p.successMetric}</p>
            </li>
          ))}
        </ol>
        <List label="Months 4–12" items={c.laterMilestones} />
      </Block>

      <Block id="weeks" title="12-week execution plan">
        <Table
          head={["Week", "Focus", "Tasks", "Deliverable", "Checkpoint"]}
          rows={c.weeks.map((w) => [w.week, w.focus, <List key="t" items={w.tasks} />, w.deliverable, w.checkpoint])}
        />
      </Block>

      <Block id="proposal" title="Proposal" note="A short formal version for a teacher, mentor, school or small grant.">
        <h3 className="font-display text-[1.125rem]">{x.proposal.title}</h3>
        <Field label="Abstract">{x.proposal.abstract}</Field>
        <div className={grid}>
          <Field label="Background">{x.proposal.background}</Field>
          <Field label="Methodology">{x.proposal.methodology}</Field>
          <Field label="Expected outcomes">{x.proposal.expectedOutcomes}</Field>
          <Field label="Evaluation">{x.proposal.evaluation}</Field>
        </div>
      </Block>

      <Block id="costs" title={`Materials & costs · ${x.costCurrency}`} note={`Estimates, not quotes. ${x.costNote}`}>
        <Table
          head={["Item", "Purpose", "Qty", "Estimate", "Priority", "Cheaper option"]}
          rows={x.materials.map((m) => [<strong key="i">{m.item}</strong>, m.purpose, m.quantity, m.estimatedCost, m.priority, m.cheaperAlternative])}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {x.budgets.map((b) => (
            <div key={b.scenario} className="glass p-4">
              <p className="meta text-paper/50">{b.scenario}</p>
              <p className="mt-1 font-display text-[1.25rem]">{b.estimatedTotal}</p>
              <List items={b.covers} />
              <p className="mt-2 text-[0.8125rem] text-paper/60">{b.tradeoff}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block id="people" title="Team & partnerships">
        <Table head={["Role", "Why", "When"]} rows={x.team.map((t) => [<strong key="r">{t.role}</strong>, t.why, t.when])} />
        <Table head={["Partner", "What they add", "How to approach"]} rows={x.partnerships.map((t) => [<strong key="k">{t.kind}</strong>, t.whatTheyAdd, t.howToApproach])} />
      </Block>

      <Block id="impact" title="Impact">
        <div className={grid}>
          <List label="Short term" items={x.impact.shortTerm} />
          <List label="Long term" items={x.impact.longTerm} />
        </div>
        <Table head={["KPI", "How measured", "Target"]} rows={x.impact.kpis.map((k) => [k.metric, k.howMeasured, k.target])} />
      </Block>

      <Block id="business" title="Commercialization & scale">
        {x.commercialization.credible ? (
          <div className={grid}>
            <Field label="Why it could sustain itself">{x.commercialization.reasoning}</Field>
            <Field label="Customer">{x.commercialization.customer}</Field>
            <Field label="Value proposition">{x.commercialization.valueProposition}</Field>
            <Field label="Revenue model">{x.commercialization.revenueModel}</Field>
            <Field label="Unit economics">{x.commercialization.unitEconomics}</Field>
            <List label="Alternatives people use today" items={x.commercialization.competitors} />
          </div>
        ) : (
          <Field label="Not a business — and that's fine">{x.commercialization.reasoning}</Field>
        )}
        <List label="Scaling path" items={x.scale.path.map((s) => `${s.stage}: ${s.description}`)} ordered />
        <List label="Constraints on scale" items={x.scale.constraints} />
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="v1">{x.evolution.v1}</Field>
          <Field label="v2">{x.evolution.v2}</Field>
          <Field label="v3">{x.evolution.v3}</Field>
        </div>
      </Block>

      <Block id="brand" title="Brand, presence & documentation">
        <div className={grid}>
          <List label="Name ideas" items={x.brand.nameIdeas} />
          <Field label="Positioning">{x.brand.positioning}</Field>
          <Field label="Voice">{x.brand.voice}</Field>
          <Field label="Visual direction">{x.brand.visualDirection}</Field>
          <List label="Channels" items={x.presence.channels} />
          <List label="Content ideas" items={x.presence.contentIdeas} />
          <List label="Documentation system" items={x.documentation.system} />
          <List label="Evidence to collect" items={x.documentation.evidence} />
        </div>
      </Block>

      <Block id="risks" title="Risk register">
        <Table
          head={["Risk", "Likelihood", "Impact", "Mitigation", "Contingency"]}
          rows={x.risks.map((r) => [r.risk, <LevelPill key="l" level={r.likelihood} inverted />, <LevelPill key="i" level={r.impact} inverted />, r.mitigation, r.contingency])}
        />
        <List label="What would make it exceptional" items={x.exceptional} />
      </Block>

      <Block id="next" title="Next actions">
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["Next 24 hours", c.nextActions.next24Hours],
              ["Next 7 days", c.nextActions.next7Days],
              ["Next 30 days", c.nextActions.next30Days],
            ] as const
          ).map(([label, items]) => (
            <div key={label} className="glass p-4">
              <List label={label} items={[...items]} />
            </div>
          ))}
        </div>
      </Block>

      <Block id="quality" title="Quality check" note="The Architect's own review of this blueprint.">
        <ul className="space-y-2">
          {x.qualityCheck.map((q, i) => (
            <li key={i} className="flex gap-3 text-[0.9375rem]">
              <span className={q.pass ? "text-verified" : "text-attention"} aria-label={q.pass ? "Pass" : "Needs work"}>
                {q.pass ? "✓" : "⚠"}
              </span>
              <span>
                <strong className="font-semibold">{q.criterion}</strong> <span className="text-paper/65">— {q.note}</span>
              </span>
            </li>
          ))}
        </ul>
        {research.sources.length > 0 && (
          <details className="rounded-[var(--radius-md)] border border-paper/10 px-4 py-3">
            <summary className="cursor-pointer text-[0.875rem] text-paper/70">Sources the research step consulted ({research.sources.length})</summary>
            <ul className="mt-3 space-y-1 text-[0.8125rem]">
              {research.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-cyan hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Block>
    </article>
  );
}
