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
  SCALE_STAGES,
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

describe("Stage Eight — audience, distribution and reach", () => {
  it("requires cost and expected benefit per channel, not a list of platform names", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    for (const f of ["distribution", "expectedBenefit", "reachMatters"]) expect(p).toContain(f);
    expect(p).toContain("different jobs");
  });

  it("forbids the manipulative channels the spec rules out", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    expect(p).toContain("Never suggest spam");
  });

  it("says plainly when reach is not the point, instead of inventing a marketing plan", () => {
    const quiet = BlueprintExtended.parse({
      ...extended,
      presence: { channels: [], contentIdeas: [], reachMatters: false, reachReasoning: "They want this for themselves.", distribution: [] },
    });
    const md = toMarkdown({ ...saved, extended: quiet });
    expect(md).toContain("Reach is not the point here");
    expect(md).toContain("They want this for themselves.");
  });

  it("renders the channel table when reach does matter", () => {
    const loud = BlueprintExtended.parse({
      ...extended,
      presence: {
        channels: [], contentIdeas: [], reachMatters: true, reachReasoning: "",
        distribution: [{ channel: "School noticeboard", purpose: "Reach cyclists", effort: "Low", cost: "Free", expectedBenefit: "A handful of users, not a crowd." }],
      },
    });
    const md = toMarkdown({ ...saved, extended: loud });
    expect(md).toContain("School noticeboard");
    expect(md).toContain("not a crowd");
  });
});

describe("Stage Nine — monetization and the scaling framework", () => {
  it("asks for the parts that separate a projection from a wish", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    for (const f of ["acquisition", "operatingCosts", "pricingAssumptions", "scenarios", "breakEven", "ethicalConstraints", "evidenceNeeded"]) {
      expect(p).toContain(f);
    }
    expect(p).toContain("revenue, not profit");
  });

  it("names the five maturity stages and rejects a reach ladder", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    for (const stage of SCALE_STAGES) expect(p).toContain(stage);
    expect(p).toContain("do not substitute a reach ladder");
  });

  it("keeps growth optional — a project may be told to stop early", () => {
    const capped = BlueprintExtended.parse({
      ...extended,
      scale: {
        path: [{ stage: "Prototype", description: "One rack", framework: "Personal prototype", whatProvesIt: "It survives a term." }],
        constraints: [], stopAt: "Stage two. It is a school project, not an organisation.",
      },
    });
    const md = toMarkdown({ ...saved, extended: capped });
    expect(md).toContain("should probably stop");
    expect(md).toContain("not an organisation");
  });

  it("defaults the framework stage so older saves still parse", () => {
    expect(extended.scale.path[0]?.framework ?? "Personal prototype").toBe("Personal prototype");
    expect(extended.commercialization.scenarios).toEqual([]);
    expect(extended.presence.reachMatters).toBe(true);
  });
});

describe("Stage Seven — the proposal's missing elements", () => {
  it("asks for prior work, limitations and a conclusion", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    for (const f of ["priorWork", "limitations", "conclusion"]) expect(p).toContain(f);
  });

  it("will not let an empty literature search imply novelty", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    expect(p).toContain("rather than implying novelty");
  });

  it("renders them into the dossier, and omits them when absent", () => {
    expect(toMarkdown({ ...saved })).not.toContain("What this does not do");
    const withIt = BlueprintExtended.parse({
      ...extended,
      proposal: { ...extended.proposal, priorWork: "Two schools run repair clubs.", limitations: "It will not prove cycling went up.", conclusion: "Worth a term." },
    });
    const md = toMarkdown({ ...saved, extended: withIt });
    expect(md).toContain("Two schools run repair clubs.");
    expect(md).toContain("It will not prove cycling went up.");
  });
});

describe("Stage Twelve — iterative review", () => {
  it("asks for a review protocol the student keeps after the tool", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    expect(p).toContain("reviewProtocol");
    for (const d of ["continueIf", "pivotIf", "expandIf", "concludeIf"]) expect(p).toContain(d);
  });

  it("treats concluding on purpose as a legitimate outcome, not a failure", () => {
    const p = blueprintPrompt("extended", discovery, [concept("c1")], profile, { notes: "", sources: [], available: false });
    expect(p).toContain("not a failure");
    expect(p).toContain("Do not tell the student to stay loyal to the original idea");
  });

  it("keeps the four states apart, and round-trips", () => {
    const reviewed = BlueprintExtended.parse({
      ...extended,
      reviewProtocol: {
        cadence: "At each 12-week checkpoint.",
        atEachReview: ["Did the rack survive?"],
        decide: { continueIf: "It held.", pivotIf: "Nobody used it.", expandIf: "Two more schools asked.", concludeIf: "The question is answered." },
        recordKeeping: ["Original concept", "Changes since", "Current status", "Open decisions"],
      },
    });
    const md = toMarkdown({ ...saved, extended: reviewed });
    expect(md).toContain("Reviewing it later");
    expect(md).toContain("Keep these four apart in writing");
    expect(md).toContain("The question is answered.");
  });

  it("defaults empty so blueprints saved before it still parse and render", () => {
    expect(extended.reviewProtocol.cadence).toBe("");
    expect(toMarkdown({ ...saved })).not.toContain("Reviewing it later");
  });
});

describe("the promise on the page matches the engine", () => {
  /*
   * The page copy quotes a concept count. When the prompt changed from
   * 8–12 to 12–20 the copy kept promising 8–12, which is the kind of
   * drift nobody notices until a student counts the cards.
   */
  const COPY = [
    "src/app/passion-projector/architect/page.tsx",
    "src/components/passion/PassionSessionFlow.tsx",
  ];

  it("quotes the same range the ideation prompt asks for", async () => {
    const { readFile } = await import("node:fs/promises");
    const prompt = ideatePrompt(discovery, "", []);
    const range = prompt.match(/(\d+) to (\d+) distinct project concepts/);
    expect(range).not.toBeNull();
    const [, lo, hi] = range!;
    for (const file of COPY) {
      const src = await readFile(file, "utf8");
      const quoted = src.match(/(\d+)[–-](\d+) (?:project )?concepts/);
      expect(quoted, `${file} should quote a concept count`).not.toBeNull();
      expect([quoted![1], quoted![2]], `${file} is out of step with the prompt`).toEqual([lo, hi]);
    }
  });
});
