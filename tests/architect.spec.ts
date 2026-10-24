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
  CONCEPT_KINDS,
  Discovery,
  MATRIX_KEYS,
  normaliseEnums,
  normaliseUrl,
  PersonalProfile,
  SaveRequest,
} from "@/lib/architect/schemas";
import { toMarkdown } from "@/lib/architect/markdown";
import { blueprintPrompt, ideatePrompt, SYSTEM } from "@/lib/architect/prompts";

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

const discovery = Discovery.parse({
  orientation: "interests",
  opening: "I fix bikes and keep noticing the racks at school are broken.",
  transcript: [{ question: "How much time a week?", answer: "About three hours." }],
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

const saved = SaveRequest.parse({
  title: "Bike Repair Station", profile, concepts: [concept("c1", "Bike Station")],
  research: { notes: "", sources: [], available: false }, core: core([]), extended,
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

/*
 * Stage Three, Ten and Eleven of the Architect spec. These assert the shape
 * of what the model is asked for and what survives a round-trip, not the
 * model's wording — the prompt is the contract, so a silent edit to it is
 * exactly what should fail here.
 */
describe("Stage Three — divergent ideation", () => {
  it("asks for 12–20 concepts, not a shorter portfolio", () => {
    const p = ideatePrompt(discovery, "", []);
    expect(p).toContain("12 to 20");
    expect(p).not.toContain("8 to 12");
  });

  it("organises ideas by shape, and names all four kinds", () => {
    const p = ideatePrompt(discovery, "", []);
    for (const k of CONCEPT_KINDS) expect(p).toContain(`"${k}"`);
  });

  it("requires the idea-card fields the spec lists", () => {
    const p = ideatePrompt(discovery, "", []);
    for (const f of ["centralQuestion", "medium", "estimatedCost", "potentialOutcome", "smallestTest", "difficultyNote"]) {
      expect(p).toContain(f);
    }
  });

  it("tells the model not to flatter every idea equally", () => {
    expect(ideatePrompt(discovery, "", [])).toContain("Do NOT make every idea sound equally brilliant");
  });

  it("defaults kind so blueprints saved before the four categories still parse", () => {
    const legacy = Concept.parse({
      id: "c1", title: "t", category: "community", oneLine: "x", problem: "x", whyItMatters: "x",
      whoBenefits: "x", coreIdea: "x", whyItFitsYou: "x", uniqueAngle: "x", firstVersion: "x",
      longTermPotential: "x", skillsDeveloped: [], resourcesNeeded: [], difficulty: "Moderate",
      timeToFirstResult: "2 weeks", keyRisks: [],
    });
    expect(legacy.kind).toBe("domain-first");
    expect(legacy.smallestTest).toBe("");
  });

  it("carries the idea's own framing into the blueprint brief", () => {
    const c = Concept.parse({
      ...concept("c1"), centralQuestion: "Why do racks fail?", medium: "A field study",
      smallestTest: "Count broken racks for a week", estimatedCost: "no cost beyond time",
    });
    const p = blueprintPrompt("core", discovery, [c], profile, { notes: "", sources: [], available: false });
    expect(p).toContain("Why do racks fail?");
    expect(p).toContain("Count broken racks for a week");
  });
});

describe("Stage Ten — pre-mortem", () => {
  it("asks for failure in the past tense, not a risk list", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    expect(p).toContain("preMortem");
    expect(p).toContain("six months later");
  });

  it("round-trips, and defaults empty for blueprints saved before it existed", () => {
    expect(extended.preMortem.scenario).toBe("");
    const withIt = BlueprintExtended.parse({
      ...extended,
      preMortem: { scenario: "Nobody used it.", causes: ["Placed where no one walks"], preventNow: ["Count footfall first"] },
    });
    expect(withIt.preMortem.causes).toHaveLength(1);
    expect(toMarkdown({ ...saved, extended: withIt })).toContain("Pre-mortem");
  });
});

describe("Stage Eleven — start immediately", () => {
  it("asks for the hour-long task, the minimum to begin, and what to leave alone", () => {
    const p = blueprintPrompt("core", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    for (const f of ["firstHour", "minimumResources", "firstMilestone", "notYet"]) expect(p).toContain(f);
  });

  it("renders the additions into the dossier when present", () => {
    const c = BlueprintCore.parse({
      ...core([]),
      nextActions: {
        next24Hours: ["Sketch the stand"], next7Days: [], next30Days: [],
        firstHour: "Photograph every rack on the route.",
        minimumResources: ["A phone camera"], firstMilestone: "One rack repaired and still standing a week later.",
        notYet: ["Do not order parts — you do not know which sizes fail yet."],
      },
    });
    const md = toMarkdown({ ...saved, core: c });
    expect(md).toContain("Do this in the next hour");
    expect(md).toContain("Not yet");
    expect(md).toContain("do not know which sizes fail yet");
  });
});
