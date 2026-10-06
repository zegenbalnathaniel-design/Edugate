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
      if (out[q.id] === undefined && q.kind !== "subjects")
        out[q.id] = q.kind === "slider" ? 7 : q.kind === "single" || q.kind === "versus" ? q.options[0].id : q.kind === "rank" ? q.options.slice(0, q.pick).map((o) => o.id) : [q.options[0].id];
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

describe("degree → college mapping", () => {
  const ECON = complete({
    talk: ["economics", "maths", "business"], math: 8, careers: ["finance", "consult"], projects: ["stocks", "fundraiser", "app"], saturday: ["invest", "business"],
    home: "chennai", distance: "india-abroad", regions: ["uk", "singapore"], gendered: "coed", budget: "25-50", loan: "worth", board: "CBSE", stream: "commerce-maths", marks: "90", exams: ["CUET", "IPMAT"],
  });
  const FILM = complete({
    talk: ["film", "literature", "theatre"], math: 2, essay: 8, careers: ["film", "writer", "media"], projects: ["story", "brand", "fundraiser"], saturday: ["films", "write"],
    home: "chennai", distance: "india-abroad", regions: ["uk", "usa"], gendered: "coed", budget: "25-50", loan: "worth", board: "CBSE", stream: "humanities", marks: "80",
  });
  const IB = complete({
    talk: ["politics", "world", "history"], math: 4, essay: 9, careers: ["diplomat", "policy", "law"], projects: ["policy", "fundraiser", "story"], saturday: ["debate", "read"],
    home: "chennai", distance: "india-abroad", regions: ["uk", "usa", "singapore"], gendered: "coed", budget: "50+", loan: "worth", board: "IB",
    ibsubjects: ["Global Politics|HL|7", "History|HL|6", "English A: Literature|HL|6", "Economics|SL|6", "Mathematics: Applications and Interpretation|SL|5", "French|SL|6", "CORE|2"],
  });

  it("sends an economics student to economics programmes, never to an engineering institute", () => {
    const r = computeWrapped(ECON, UNIS, TODAY);
    expect(r.courses[0].key).toBe("econ-finance");
    for (const c of cards(r)) {
      expect(c.slug).not.toBe("iit-madras");
      expect(c.program.name).toMatch(/econom|financ|commerce|B\.?\s?Com|business|management|analytics/i);
    }
    for (const w of r.courses[0].where) expect(w.program.name).toMatch(/econom/i);
  });

  it("lists only programmes that ARE each degree under 'where to study it'", () => {
    for (const a of [ECON, FILM, IB]) {
      const r = computeWrapped(a, UNIS, TODAY);
      const byKey: Record<string, RegExp> = { history: /histor/i, literature: /literature|english|creative writing/i, politics: /politic|policy|governance|strategic/i, film: /film|cinema|screen|animation|multimedia/i, law: /LL\.?B|law/i };
      for (const c of r.courses) if (byKey[c.key]) for (const w of c.where) expect(w.program.name).toMatch(byKey[c.key]);
      // Every university card's degree is one the student was shown.
      for (const card of cards(r)) expect(r.courses.map((c) => c.key)).toContain(card.degree.key);
    }
  });

  it("doesn't count the language a course is taught in as a literature degree", () => {
    const r = computeWrapped(FILM, UNIS, TODAY);
    const lit = r.courses.find((c) => c.key === "literature" || c.key === "languages");
    for (const w of lit?.where ?? []) expect(w.program.name).not.toMatch(/^B\.A\. History$/);
  });

  it("uses IB subjects and grades: predicted total, prerequisites and humanities depth", () => {
    const p = buildProfile(IB);
    expect(p.facts.ibTotal).toBe(38);
    expect(p.facts.has?.maths).toBe(true);
    expect(p.facts.has?.physics).toBe(false);
    expect(activeQuestions(IB).some((q) => q.id === "stream" || q.id === "marks")).toBe(false);
    const r = computeWrapped(IB, UNIS, TODAY);
    expect(r.courses.slice(0, 3).map((c) => c.key)).toEqual(expect.arrayContaining(["politics"]));
  });

  it("lets students pick as many likes as they want", () => {
    for (const id of ["talk", "saturday", "careers", "regions"]) {
      const q = activeQuestions(ECON).find((x) => x.id === id);
      expect(q && q.kind === "multi" && q.max).toBeFalsy();
    }
  });
});
