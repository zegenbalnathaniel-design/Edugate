import type { SavedProject } from "./schemas";

/** The final dossier (Part XXV) as a Markdown document the student keeps. */
export function toMarkdown(p: SavedProject): string {
  const { core: c, extended: x, profile, concepts, research } = p;
  const out: string[] = [];
  const h = (level: number, text: string) => out.push("", `${"#".repeat(level)} ${text}`, "");
  const para = (text: string) => text && out.push(text, "");
  const list = (items: string[]) => items.length && out.push(...items.map((i) => `- ${i}`), "");
  const kv = (pairs: [string, string][]) => pairs.forEach(([k, v]) => v && out.push(`**${k}.** ${v}`, ""));
  const table = (head: string[], rows: string[][]) => {
    if (!rows.length) return;
    const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
    out.push(`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`);
    rows.forEach((r) => out.push(`| ${r.map(cell).join(" | ")} |`));
    out.push("");
  };

  out.push(`# ${c.title}`, "", `_${c.tagline}_`, "");
  out.push(
    `> Generated with Edugate's Project Architect. Figures marked as estimates and anything under "Assumptions" or "Unknowns" must be checked before you rely on them.`,
    "",
  );
  if (concepts.length > 1) para(`Combines: ${concepts.map((k) => k.title).join(" + ")}`);

  h(2, "Executive summary");
  kv([
    ["What it is", c.executiveSummary.whatItIs],
    ["Problem", c.executiveSummary.problem],
    ["Solution", c.executiveSummary.solution],
    ["Who benefits", c.executiveSummary.whoBenefits],
    ["Why it matters", c.executiveSummary.whyItMatters],
    ["Why you", c.executiveSummary.whyYou],
    ["First version", c.executiveSummary.firstVersion],
    ["Long-term vision", c.executiveSummary.longTermVision],
    ["Success looks like", c.executiveSummary.successLooksLike],
  ]);

  h(2, "Personal profile");
  para(profile.summary);
  kv([
    ["Core interests", profile.coreInterests.join("; ")],
    ["Strengths", profile.strengths.join("; ")],
    ["Constraints", profile.constraints.join("; ")],
  ]);

  h(2, "Validation");
  h(3, "Verified (with sources)");
  if (c.validation.verifiedFacts.length) list(c.validation.verifiedFacts.map((f) => `${f.claim} — <${f.sourceUrl}>`));
  else para("Nothing has been verified against a source yet.");
  h(3, "Assumptions");
  list(c.validation.assumptions);
  h(3, "Unknowns");
  list(c.validation.unknowns);
  h(3, "Test early");
  list(c.validation.mustTest);

  h(2, "Project thesis");
  kv([
    ["Problem", c.thesis.problem],
    ["Why existing approaches fall short", c.thesis.existingApproachesFallShort],
    ["Opportunity", c.thesis.opportunity],
    ["Differentiation", c.thesis.differentiation],
    ["Thesis", c.thesis.statement],
  ]);
  h(3, "Root causes");
  list(c.thesis.rootCauses);

  h(2, "Objectives");
  kv([["Primary", c.objectives.primary]]);
  for (const [k, v] of [
    ["Secondary", c.objectives.secondary],
    ["Learning", c.objectives.learning],
    ["Impact", c.objectives.impact],
    ["Personal development", c.objectives.personal],
    ["Measurable", c.objectives.measurable],
  ] as const) {
    h(3, k);
    list([...v]);
  }

  h(2, "Research framework");
  for (const [k, v] of [
    ["Questions", c.research.questions],
    ["Hypotheses", c.research.hypotheses],
    ["Methods", c.research.methods],
    ["Data to collect", c.research.dataToCollect],
    ["Ethics & consent", c.research.ethics],
  ] as const) {
    h(3, k);
    list([...v]);
  }

  h(2, "Architecture");
  table(["Component", "Purpose"], c.architecture.components.map((k) => [k.name, k.purpose]));
  h(3, "User journey");
  list(c.architecture.userJourney.map((s, i) => `${i + 1}. ${s}`));
  h(3, "Tools");
  list(c.architecture.tools);

  h(2, "Minimum viable version");
  kv([
    ["Goal", c.mvp.goal],
    ["How it's tested", c.mvp.testPlan],
  ]);
  h(3, "In v1");
  list(c.mvp.features);
  h(3, "Deliberately not in v1");
  list(c.mvp.notInV1);
  h(3, "Build steps");
  list(c.mvp.buildSteps);
  h(3, "Success criteria");
  list(c.mvp.successCriteria);

  h(2, "Roadmap");
  for (const ph of c.roadmap) {
    h(3, ph.phase);
    kv([
      ["Objective", ph.objective],
      ["Success metric", ph.successMetric],
    ]);
    list(ph.actions);
    if (ph.deliverables.length) para(`Deliverables: ${ph.deliverables.join("; ")}`);
    if (ph.risks.length) para(`Risks: ${ph.risks.join("; ")}`);
  }

  h(2, "12-week plan");
  table(
    ["Week", "Focus", "Tasks", "Deliverable", "Checkpoint"],
    c.weeks.map((w) => [String(w.week), w.focus, w.tasks.join("; "), w.deliverable, w.checkpoint]),
  );
  h(3, "Months 4–12");
  list(c.laterMilestones);

  h(2, "Preview");
  para(c.preview.description);
  para(c.preview.firstUserExperience);
  list(c.preview.artifacts);

  h(2, "Proposal");
  h(3, x.proposal.title);
  kv([
    ["Abstract", x.proposal.abstract],
    ["Background", x.proposal.background],
    ["Methodology", x.proposal.methodology],
    ["Expected outcomes", x.proposal.expectedOutcomes],
    ["Evaluation", x.proposal.evaluation],
  ]);

  h(2, `Materials & costs (${x.costCurrency}, estimates)`);
  para(x.costNote);
  table(
    ["Item", "Purpose", "Qty", "Estimated cost", "Priority", "Cheaper alternative"],
    x.materials.map((m) => [m.item, m.purpose, m.quantity, m.estimatedCost, m.priority, m.cheaperAlternative]),
  );
  h(3, "Budget scenarios");
  table(
    ["Scenario", "Estimated total", "Covers", "Tradeoff"],
    x.budgets.map((b) => [b.scenario, b.estimatedTotal, b.covers.join("; "), b.tradeoff]),
  );

  h(2, "Team & partners");
  table(["Role", "Why", "When"], x.team.map((t) => [t.role, t.why, t.when]));
  table(["Partner", "What they add", "How to approach"], x.partnerships.map((t) => [t.kind, t.whatTheyAdd, t.howToApproach]));

  h(2, "Impact");
  h(3, "Short term");
  list(x.impact.shortTerm);
  h(3, "Long term");
  list(x.impact.longTerm);
  table(["KPI", "How measured", "Target"], x.impact.kpis.map((k) => [k.metric, k.howMeasured, k.target]));

  h(2, "Commercialization");
  para(x.commercialization.reasoning);
  if (x.commercialization.credible)
    kv([
      ["Customer", x.commercialization.customer],
      ["Value proposition", x.commercialization.valueProposition],
      ["Revenue model", x.commercialization.revenueModel],
      ["Unit economics", x.commercialization.unitEconomics],
      ["Alternatives / competitors", x.commercialization.competitors.join("; ")],
    ]);

  h(2, "Scaling path");
  list(x.scale.path.map((s) => `**${s.stage}** — ${s.description}`));
  h(3, "Constraints");
  list(x.scale.constraints);

  h(2, "Brand & presence");
  kv([
    ["Name ideas", x.brand.nameIdeas.join(", ")],
    ["Positioning", x.brand.positioning],
    ["Voice", x.brand.voice],
    ["Visual direction", x.brand.visualDirection],
    ["Channels", x.presence.channels.join(", ")],
  ]);
  list(x.presence.contentIdeas);

  h(2, "Documentation");
  list(x.documentation.system);
  h(3, "Evidence to collect");
  list(x.documentation.evidence);

  h(2, "Risk register");
  table(
    ["Risk", "Likelihood", "Impact", "Mitigation", "Contingency"],
    x.risks.map((r) => [r.risk, r.likelihood, r.impact, r.mitigation, r.contingency]),
  );

  h(2, "Making it exceptional");
  list(x.exceptional);

  h(2, "Evolution");
  kv([
    ["v1", x.evolution.v1],
    ["v2", x.evolution.v2],
    ["v3", x.evolution.v3],
  ]);

  h(2, "Next actions");
  h(3, "Next 24 hours");
  list(c.nextActions.next24Hours);
  h(3, "Next 7 days");
  list(c.nextActions.next7Days);
  h(3, "Next 30 days");
  list(c.nextActions.next30Days);

  h(2, "Quality check");
  table(["Criterion", "Pass", "Note"], x.qualityCheck.map((q) => [q.criterion, q.pass ? "Yes" : "No", q.note]));

  if (research.sources.length) {
    h(2, "Sources consulted");
    list(research.sources.map((s) => `[${s.title}](${s.url})`));
  }

  h(2, "Concept details");
  for (const k of concepts) {
    h(3, k.title);
    para(k.oneLine);
    kv([
      ["Why it fits you", k.whyItFitsYou],
      ["Unique angle", k.uniqueAngle],
      ["Difficulty", k.difficulty],
    ]);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
