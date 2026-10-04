import { describe, expect, it } from "vitest";
import { normalizeDegree, normalizeTests, programSubjects } from "@/lib/unis/taxonomy";
import { bandForRate, parseRate } from "@/lib/unis/selectivity";
import type { Field } from "@/lib/unis/schema";

const subj = (name: string, degree: string, field: Field, extra: Partial<{ subfield: string; specialization: string }> = {}) =>
  programSubjects({ name, degree, field, subfield: extra.subfield ?? null, specialization: extra.specialization ?? null }).sort();

describe("course taxonomy", () => {
  it("files joint and variant programmes under every subject their official name names", () => {
    expect(subj("B.Com. (Accounting & Finance)", "B.Com", "commerce")).toEqual(["commerce", "finance"]);
    expect(subj("BA (Hons) Philosophy, Politics and Economics", "BA", "economics")).toEqual(["economics", "philosophy", "political-science"]);
    expect(subj("B.Sc. Economics and Data Science", "BSc", "economics")).toEqual(["data-science", "economics"]);
    expect(subj("B.Com. Corporate Secretaryship", "B.Com", "commerce")).toEqual(["commerce"]);
  });

  it("does not misfile look-alike words", () => {
    expect(subj("B.A. Public Administration", "BA", "political-science")).not.toContain("business");
    expect(subj("B.Sc. Physical Education, Health Education and Sports", "B.Sc", "sports-management")).not.toContain("education");
    expect(subj("B.Sc. Medical Laboratory Technology", "B.Sc", "allied-health")).not.toContain("medicine");
    expect(subj("B.Com. General", "B.Com", "commerce")).not.toContain("media");
  });

  it("normalises degree spellings into filter families", () => {
    expect(normalizeDegree("B.Com (Hons.)")).toBe("BCom");
    expect(normalizeDegree("B.A., LL.B. (Hons.)")).toBe("BA LLB");
    expect(normalizeDegree("B.Sc.")).toBe("BSc");
    expect(normalizeDegree("B.Tech")).toBe("BTech");
    expect(normalizeDegree("B.E.")).toBe("BE");
    expect(normalizeDegree("BSc (Hons)")).toBe("BSc");
    expect(normalizeDegree("Bachelor's")).toBe("Other");
  });

  it("recognises entrance tests however institutions write them", () => {
    expect(normalizeTests(["CUET (UG) 2026", "JEE Main Paper 1", "SAT", "TNEA counselling (Class XII marks)"]).sort()).toEqual(["CUET", "JEE-MAIN", "SAT", "TNEA"]);
    expect(normalizeTests(["Loyola entrance test"])).toEqual(["INSTITUTION"]);
  });
});

describe("selectivity bands (evidence-based only)", () => {
  it("reads published rates and computes from counts", () => {
    expect(parseRate("3.6%")).toBe(3.6);
    expect(parseRate(null, 50, 1000)).toBe(5);
    expect(parseRate(null)).toBeNull();
  });
  it("bands by the documented thresholds", () => {
    expect(bandForRate(4)).toBe("highly-selective");
    expect(bandForRate(20)).toBe("selective");
    expect(bandForRate(50)).toBe("moderate");
    expect(bandForRate(80)).toBe("accessible");
  });
});
