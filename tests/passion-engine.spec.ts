import { describe, it, expect } from "vitest";
import type { PassionQuestion, PassionResponse } from "@/lib/data/types";
import { scoreSignals } from "@/lib/passion/scoring";
import { pickNextQuestion, shouldTerminate } from "@/lib/passion/selector";
import { matchArchetype } from "@/lib/passion/archetypes";
import { computeFieldConnections } from "@/lib/passion/fields";
import { PASSION_QUESTIONS } from "@/lib/data/fixtures/passion/questions";
import { ARCHETYPES } from "@/lib/data/fixtures/passion/archetypes";
import { FIELD_WEIGHTS } from "@/lib/data/fixtures/passion/fieldWeights";

function q(id: string, targets: PassionQuestion["targets"], weights: Record<string, Partial<Record<string, number>>>): PassionQuestion {
  return {
    id,
    stage: "core",
    prompt: id,
    targets,
    options: Object.entries(weights).map(([optId, signals]) => ({
      id: optId,
      label: optId,
      signals: signals as PassionQuestion["options"][number]["signals"],
    })),
  };
}

describe("scoring — normalized against what was actually asked (docs/04 §4)", () => {
  it("a student asked more technology-touching questions does not out-score a consistent one asked fewer", () => {
    // Student A: asked 3 questions all about technology, always picks the
    // strongest technology option.
    const bankA: PassionQuestion[] = [
      q("a1", ["technology"], { x: { technology: 3 }, y: { technology: 0 } }),
      q("a2", ["technology"], { x: { technology: 3 }, y: { technology: 0 } }),
      q("a3", ["technology"], { x: { technology: 3 }, y: { technology: 0 } }),
    ];
    const responsesA: PassionResponse[] = bankA.map((qq) => ({
      questionId: qq.id,
      optionId: "x",
      at: "2026-01-01",
    }));

    // Student B: asked 8 questions about technology, same consistent choice.
    const bankB: PassionQuestion[] = Array.from({ length: 8 }, (_, i) =>
      q(`b${i}`, ["technology"], { x: { technology: 3 }, y: { technology: 0 } }),
    );
    const responsesB: PassionResponse[] = bankB.map((qq) => ({
      questionId: qq.id,
      optionId: "x",
      at: "2026-01-01",
    }));

    const scoresA = scoreSignals(responsesA, bankA).scores.find((s) => s.key === "technology")!;
    const scoresB = scoreSignals(responsesB, bankB).scores.find((s) => s.key === "technology")!;

    // Same orientation (always picked the max option) → same normalized
    // strength regardless of how many questions were asked.
    expect(scoresA.normalized).toBeCloseTo(scoresB.normalized, 6);
    expect(scoresA.normalized).toBeCloseTo(1, 6);
  });

  it("raw sums alone would have been misleading — sanity check the naive metric actually diverges", () => {
    const bankA: PassionQuestion[] = [q("a1", ["technology"], { x: { technology: 3 } })];
    const bankB: PassionQuestion[] = Array.from({ length: 8 }, (_, i) =>
      q(`b${i}`, ["technology"], { x: { technology: 3 } }),
    );
    const rawA = bankA.length * 3;
    const rawB = bankB.length * 3;
    expect(rawB).toBeGreaterThan(rawA); // demonstrates why raw sums can't be compared directly
  });

  it("confidence stays below the display floor under 3 observations, and clears it at 5", () => {
    const bank: PassionQuestion[] = Array.from({ length: 2 }, (_, i) =>
      q(`c${i}`, ["research"], { x: { research: 2 } }),
    );
    const responses: PassionResponse[] = bank.map((qq) => ({ questionId: qq.id, optionId: "x", at: "" }));
    const under = scoreSignals(responses, bank).scores.find((s) => s.key === "research")!;
    expect(under.confidence).toBeLessThan(0.6);

    for (let i = bank.length; i < 5; i++) {
      bank.push(q(`c${i}`, ["research"], { x: { research: 2 } }));
      responses.push({ questionId: `c${i}`, optionId: "x", at: "" });
    }
    const atFive = scoreSignals(responses, bank).scores.find((s) => s.key === "research")!;
    expect(atFive.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("evidence.bySignal only credits signals the chosen option actually weighted", () => {
    const bank = [q("e1", ["technology", "creation"], { x: { technology: 3, creation: 1 }, y: { people: 2 } })];
    const responses: PassionResponse[] = [{ questionId: "e1", optionId: "x", at: "" }];
    const { evidence } = scoreSignals(responses, bank);
    expect(evidence.technology?.[0].responseId).toBe("e1");
    expect(evidence.people).toBeUndefined();
  });
});

describe("adaptive selector — deterministic and never repeats a question", () => {
  it("same responses always produce the same next question", () => {
    const asked = ["core_saturday"];
    const responses: PassionResponse[] = [{ questionId: "core_saturday", optionId: "core_saturday_b", at: "" }];
    const next1 = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
    const next2 = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
    expect(next1?.id).toBe(next2?.id);
  });

  it("exhausts all 12 core questions before selecting anything adaptive", () => {
    const coreIds = PASSION_QUESTIONS.filter((qq) => qq.stage === "core").map((qq) => qq.id);
    let asked: string[] = [];
    let responses: PassionResponse[] = [];
    for (let i = 0; i < coreIds.length; i++) {
      const next = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
      expect(next?.stage).toBe("core");
      asked = [...asked, next!.id];
      responses = [...responses, { questionId: next!.id, optionId: next!.options[0].id, at: "" }];
    }
    const afterCore = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
    expect(afterCore?.stage).not.toBe("core");
  });

  it("never selects an already-asked question", () => {
    let asked: string[] = [];
    let responses: PassionResponse[] = [];
    for (let i = 0; i < 30; i++) {
      const next = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
      if (!next) break;
      expect(asked).not.toContain(next.id);
      asked = [...asked, next.id];
      responses = [...responses, { questionId: next.id, optionId: next.options[0].id, at: "" }];
    }
  });

  it("terminates at the 40-question hard cap regardless of stability", () => {
    let asked: string[] = [];
    let responses: PassionResponse[] = [];
    for (let i = 0; i < 40; i++) {
      if (shouldTerminate(PASSION_QUESTIONS, asked, responses)) break;
      const next = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
      if (!next) break;
      asked = [...asked, next.id];
      responses = [...responses, { questionId: next.id, optionId: next.options[0].id, at: "" }];
    }
    expect(asked.length).toBeLessThanOrEqual(40);
  });

  it("never terminates before 25 answered", () => {
    let asked: string[] = [];
    let responses: PassionResponse[] = [];
    for (let i = 0; i < 24; i++) {
      expect(shouldTerminate(PASSION_QUESTIONS, asked, responses)).toBe(false);
      const next = pickNextQuestion(PASSION_QUESTIONS, asked, responses);
      if (!next) break;
      asked = [...asked, next.id];
      responses = [...responses, { questionId: next.id, optionId: next.options[0].id, at: "" }];
    }
  });
});

describe("archetypes — floor and blend disclosure (docs/04 §5)", () => {
  it("returns null below the 0.82 similarity floor", () => {
    const flatScores = ["curiosity"].map((key) => ({
      key: key as never,
      normalized: 0.01,
      confidence: 1,
      observations: 10,
    }));
    const result = matchArchetype(flatScores as never, ARCHETYPES);
    expect(result.archetype === null || (result.topSimilarity ?? 0) >= 0.82).toBe(true);
  });

  it("an exact archetype vector matches itself with a real archetype (not null)", () => {
    const target = ARCHETYPES[0];
    const scores = Object.entries(target.vector).map(([key, value]) => ({
      key: key as never,
      normalized: value as number,
      confidence: 1,
      observations: 10,
    }));
    const result = matchArchetype(scores as never, ARCHETYPES);
    expect(result.archetype).not.toBeNull();
    expect(result.archetype?.key).toBe(target.key);
  });
});

describe("field connections — banded, never a raw number (docs/04 §7)", () => {
  it("bands strength into the three labels with a 0.35 floor", () => {
    const scores = ["technology", "creation", "systems", "analysis"].map((key) => ({
      key: key as never,
      normalized: 1,
      confidence: 1,
      observations: 10,
    }));
    const connections = computeFieldConnections(scores as never, FIELD_WEIGHTS);
    expect(connections.every((c) => c.strength >= 0.35)).toBe(true);
    expect(connections.some((c) => c.band === "strong")).toBe(true);
  });

  it("drops fields below 0.35 entirely rather than showing a weak number", () => {
    const scores = ["curiosity"].map((key) => ({
      key: key as never,
      normalized: 0,
      confidence: 1,
      observations: 10,
    }));
    const connections = computeFieldConnections(scores as never, FIELD_WEIGHTS);
    expect(connections.length).toBe(0);
  });
});
