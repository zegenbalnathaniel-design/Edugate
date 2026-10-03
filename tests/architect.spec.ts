import { describe, expect, it } from "vitest";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  alignMatrix,
  BlueprintCore,
  BlueprintExtended,
  Concept,
  enforceVerification,
  Ideation,
  InterviewTurn,
  MATRIX_KEYS,
  normaliseEnums,
  normaliseUrl,
  PersonalProfile,
  SaveRequest,
} from "@/lib/architect/schemas";
import { toMarkdown } from "@/lib/architect/markdown";
import { blueprintPrompt, SYSTEM } from "@/lib/architect/prompts";

const profile = PersonalProfile.parse({
  summary: "Likes fixing bikes; notices broken bike racks at school.",
  coreInterests: ["bikes"], hiddenInterests: [], strengths: ["mechanical"], skillGaps: [], motivations: [],
  problemsTheyCareAbout: ["safe cycling"], resources: ["3 hours a week"], constraints: ["no budget"],
  workStyle: "hands-on", ambition: "school-wide", idealProject: [], avoid: [],
});

const concept = (id: string, title = `Concept ${id}`) =>
  Concept.parse({
    id, title, category: "community", oneLine: "x", problem: "x", whyItMatters: "x", whoBenefits: "x", coreIdea: "x",
    whyItFitsYou: "x", uniqueAngle: "x", firstVersion: "x", longTermPotential: "x", skillsDeveloped: [], resourcesNeeded: [],
    difficulty: "Moderate", timeToFirstResult: "2 weeks", keyRisks: [],
  });

const row = (conceptId: string) => ({ conceptId, ...Object.fromEntries(MATRIX_KEYS.map((k) => [k, "High"])), tradeoff: "t" });

const core = (facts: { claim: string; sourceUrl: string }[]) =>
  BlueprintCore.parse({
    title: "Bike Repair Station", tagline: "t",
    validation: { verifiedFacts: facts, assumptions: ["a1"], unknowns: [], mustTest: [] },
    executiveSummary: { whatItIs: "w", problem: "p", solution: "s", whoBenefits: "b", whyItMatters: "m", whyYou: "y", firstVersion: "f", longTermVision: "l", successLooksLike: "s" },
    thesis: { problem: "p", rootCauses: [], existingApproachesFallShort: "e", opportunity: "o", differentiation: "d", statement: "s" },
    objectives: { primary: "p", secondary: [], learning: [], impact: [], personal: [], measurable: [] },
    research: { questions: [], hypotheses: [], methods: [], dataToCollect: [], ethics: [] },
    architecture: { components: [{ name: "Stand", purpose: "holds | bikes" }], userJourney: [], tools: [] },
    mvp: { goal: "g", features: [], notInV1: [], buildSteps: [], testPlan: "t", successCriteria: [] },
    roadmap: [], weeks: [{ week: 1, focus: "f", tasks: ["a"], deliverable: "d", checkpoint: "c" }], laterMilestones: [],
    preview: { description: "d", artifacts: [], firstUserExperience: "f" },
    nextActions: { next24Hours: ["Sketch the stand"], next7Days: [], next30Days: [] },
  });

const extended = BlueprintExtended.parse({
  proposal: { title: "t", abstract: "a", background: "b", methodology: "m", expectedOutcomes: "e", evaluation: "v" },
  costCurrency: "INR", costNote: "Estimates.",
  materials: [{ item: "Tyre levers", purpose: "p", quantity: "2", estimatedCost: "≈ 200–400 INR", priority: "Essential", cheaperAlternative: "borrow" }],
  budgets: [{ scenario: "Lean", estimatedTotal: "≈ 1,000 INR", covers: [], tradeoff: "t" }],
  team: [], partnerships: [], impact: { shortTerm: [], longTerm: [], kpis: [] },
  commercialization: { credible: false, reasoning: "No paying customer.", customer: "Not applicable", valueProposition: "Not applicable", revenueModel: "Not applicable", unitEconomics: "Not applicable", competitors: [] },
  scale: { path: [], constraints: [] }, brand: { nameIdeas: [], positioning: "p", voice: "v", visualDirection: "v" },
  presence: { channels: [], contentIdeas: [] }, documentation: { system: [], evidence: [] },
  risks: [{ risk: "Injury", likelihood: "Low", impact: "High", mitigation: "m", contingency: "c" }],
  exceptional: [], evolution: { v1: "1", v2: "2", v3: "3" }, qualityCheck: [{ criterion: "Specific", pass: true, note: "n" }],
});

describe("verification guard (spec Part VI — no unsourced 'facts')", () => {
  const research = { notes: "n", available: true, sources: [{ url: "https://www.example.org/report?utm_source=x", title: "Report" }] };

  it("keeps facts whose source the research step actually returned", () => {
    const out = enforceVerification(core([{ claim: "Real", sourceUrl: "https://example.org/report/" }]), research);
    expect(out.validation.verifiedFacts).toHaveLength(1);
  });

  it("demotes facts citing a URL search never returned", () => {
    const out = enforceVerification(core([{ claim: "Invented stat", sourceUrl: "https://made-up.example/stat" }]), research);
    expect(out.validation.verifiedFacts).toHaveLength(0);
    expect(out.validation.assumptions).toContain("Invented stat (requires validation)");
    expect(out.validation.assumptions).toContain("a1");
  });

  it("verifies nothing when live research was unavailable", () => {
    const out = enforceVerification(core([{ claim: "Real", sourceUrl: "https://example.org/report" }]), { ...research, available: false });
    expect(out.validation.verifiedFacts).toHaveLength(0);
  });

  it("normalises URLs for comparison", () => {
    expect(normaliseUrl("https://www.Example.org/a/?utm_medium=x#top")).toBe(normaliseUrl("https://example.org/a"));
    expect(normaliseUrl("https://example.org/a?id=1")).not.toBe(normaliseUrl("https://example.org/a?id=2"));
  });
});

describe("fit matrix alignment", () => {
  it("drops rows for unknown or duplicate concepts", () => {
    const ideation = Ideation.parse({ profile, concepts: [concept("c1"), concept("c2")], matrix: [row("c1"), row("c1"), row("c9"), row("c2")], recommendation: "r" });
    expect(alignMatrix(ideation).matrix.map((r) => r.conceptId)).toEqual(["c1", "c2"]);
  });
});

describe("enum normalisation", () => {
  it("snaps near-miss enum values for enum keys only", () => {
    const out = normaliseEnums({ difficulty: "very-high", riskLevel: "low", title: "low", coverage: { skills: "Good" } }) as Record<string, unknown>;
    expect(out).toEqual({ difficulty: "Very High", riskLevel: "Low", title: "low", coverage: { skills: "good" } });
  });

  it("leaves nested objects under enum-named keys intact", () => {
    const out = normaliseEnums({ impact: { shortTerm: ["high"] } });
    expect(out).toEqual({ impact: { shortTerm: ["high"] } });
  });
});

describe("structured-output schemas", () => {
  it("convert to strict JSON schemas without throwing", () => {
    for (const s of [InterviewTurn, Ideation, BlueprintCore, BlueprintExtended]) {
      const f = zodOutputFormat(s) as unknown as { schema: Record<string, unknown> };
      const json = JSON.stringify(f.schema);
      expect(json).toContain('"additionalProperties":false');
      expect(json).not.toMatch(/"(minLength|maxLength|minimum|maximum)"/);
    }
  });
});

describe("prompts", () => {
  it("carry the no-fabrication rule", () => {
    expect(SYSTEM).toMatch(/Never fabricate/);
    expect(SYSTEM).toMatch(/This requires validation/);
  });

  it("forbid verified facts when research was unavailable", () => {
    const p = blueprintPrompt("core", { orientation: "open", opening: "", transcript: [] }, [concept("c1")], profile, { notes: "", sources: [], available: false });
    expect(p).toMatch(/verifiedFacts must be empty/);
  });
});

describe("markdown dossier", () => {
  const project = SaveRequest.parse({
    title: "Bike Repair Station", profile, concepts: [concept("c1", "Bike Station"), concept("c2", "Safety Map")],
    research: { notes: "", sources: [], available: false }, core: core([]), extended,
  });
  const md = toMarkdown(project);

  it("includes the key parts and the estimate disclaimer", () => {
    for (const h of ["# Bike Repair Station", "## Validation", "## 12-week plan", "## Risk register", "## Next actions", "Combines: Bike Station + Safety Map"])
      expect(md).toContain(h);
    expect(md).toContain("Nothing has been verified against a source yet.");
    expect(md).toMatch(/Materials & costs \(INR, estimates\)/);
  });

  it("escapes pipes inside table cells", () => {
    expect(md).toContain("holds \\| bikes");
  });

  it("omits commercial detail when not credible", () => {
    expect(md).toContain("No paying customer.");
    expect(md).not.toContain("**Revenue model.**");
  });
});
