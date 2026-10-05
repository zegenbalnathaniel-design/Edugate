import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { UniversitySchema, type University } from "@/lib/unis/schema";
import { selectivity } from "@/lib/unis/selectivity";
import type { Answers } from "@/lib/wrapped/model";
import { computeWrapped, destinationOf } from "@/lib/wrapped/match";
import { activeQuestions, buildProfile, BUDGET_MAX_INR, LOAN_STRETCH } from "@/lib/wrapped/profile";

const DIR = join(__dirname, "..", "data", "universities");
const UNIS: University[] = readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => UniversitySchema.parse(JSON.parse(readFileSync(join(DIR, f), "utf8"))));
const TODAY = new Date("2026-10-05");

/** Answers every remaining active question with its first option (or 7 on sliders). */
function complete(a: Answers): Answers {
  const out = { ...a };
  for (let pass = 0; pass < 3; pass++)
    for (const q of activeQuestions(out))
      if (out[q.id] === undefined) out[q.id] = q.kind === "slider" ? 7 : q.kind === "single" || q.kind === "versus" ? q.options[0].id : q.kind === "rank" ? q.options.slice(0, q.pick).map((o) => o.id) : [q.options[0].id];
  return out;
}

const FINANCE = complete({
  talk: ["economics", "maths", "business"], math: 9, saturday: ["invest", "business"], startup: 8, projects: ["stocks", "fundraiser", "app"],
  careers: ["finance", "consult"], home: "chennai", distance: "india-abroad", regions: ["uk", "singapore"], exclude: ["usa"], gendered: "coed",
  budget: "6-12", loan: "small", board: "CBSE", stream: "commerce-maths", marks: "90", exams: ["CUET"],
});
const MEDIC = complete({
  talk: ["biology", "psychology"], math: 3, help: 10, careers: ["doctor"], projects: ["disease", "fundraiser", "story"], home: "tn", distance: "state", gendered: "coed",
  budget: "1-3", loan: "none", board: "STATE_BOARD", stream: "pcb", marks: "90", exams: ["NEET"],
});

const cards = (r: ReturnType<typeof computeWrapped>) => Object.values(r.lists).flat();

describe("the questionnaire", () => {
  it("asks roughly 40–47 questions, adapting the deep dives to the student", () => {
    for (const a of [FINANCE, MEDIC]) {
      const n = activeQuestions(a).length;
      expect(n).toBeGreaterThanOrEqual(40);
      expect(n).toBeLessThanOrEqual(47);
    }
    expect(buildProfile(FINANCE).modules).toContain("money");
    expect(buildProfile(MEDIC).modules).toContain("health");
  });

  it("only asks about destinations abroad when the student is open to going abroad", () => {
    expect(activeQuestions(FINANCE).some((q) => q.id === "regions")).toBe(true);
    expect(activeQuestions(MEDIC).some((q) => q.id === "regions")).toBe(false);
  });

  it("turns answers into a profile without exposing labels as questions", () => {
    const p = buildProfile(FINANCE);
    expect(p.subjects.slice(0, 4).map((s) => s.key)).toEqual(expect.arrayContaining(["economics", "finance"]));
    expect(p.riasec.E).toBeGreaterThan(p.riasec.R);
    for (const v of Object.values(p.riasec)) expect(v).toBeGreaterThanOrEqual(0);
  });
});

describe("university matching", () => {
  const fin = computeWrapped(FINANCE, UNIS, TODAY);
  const med = computeWrapped(MEDIC, UNIS, TODAY);

  it("never lists a university the student can't realistically afford", () => {
    const max = BUDGET_MAX_INR["1-3"]!;
    for (const c of cards(med)) if (c.costInr != null) expect(c.costInr).toBeLessThanOrEqual(max * LOAN_STRETCH.none * 1.6);
  });

  it("respects excluded countries, distance and single-gender choices", () => {
    expect(cards(fin).some((c) => destinationOf(UNIS.find((u) => u.slug === c.slug)!.countryCode)?.slug === "usa")).toBe(false);
    for (const c of cards(med)) expect(UNIS.find((u) => u.slug === c.slug)!.region).toBe("Tamil Nadu");
    for (const c of [...cards(fin), ...cards(med)]) expect(UNIS.find((u) => u.slug === c.slug)!.gender ?? "co-ed").not.toBe("women");
  });

  it("finds medicine for a PCB student without treating a planned NEET as ineligibility", () => {
    expect(cards(med).some((c) => /MBBS/.test(c.program.name))).toBe(true);
  });

  it("puts only evidence-backed highly selective institutions in Dream", () => {
    for (const c of fin.lists.dream) expect(selectivity(UNIS.find((u) => u.slug === c.slug)!)?.band).toBe("highly-selective");
  });

  it("calls something a high fit only when the course itself fits, and never shows a dimension it has no data for", () => {
    for (const c of [...cards(fin), ...cards(med)]) {
      expect(c.dims.find((d) => d.key === "course")!.pct).toBeGreaterThanOrEqual(55);
      for (const d of c.dims) expect(Number.isFinite(d.pct)).toBe(true);
      expect(c.dims.some((d) => d.key === "financial")).toBe(c.costInr != null);
    }
  });

  it("explains every recommendation", () => {
    for (const c of cards(fin)) expect(c.why.length + c.watch.length).toBeGreaterThan(0);
  });
});
