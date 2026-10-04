import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { UniversitySchema } from "@/lib/unis/schema";
import { StudentProfileSchema } from "@/lib/profile/schema";
import { admissionBand, matchProgram } from "@/lib/unis/match";

const load = (slug: string) => UniversitySchema.parse(JSON.parse(readFileSync(join(__dirname, "..", "data", "universities", `${slug}.json`), "utf8")));

describe("admission bands use published evidence only", () => {
  const iitb = load("indian-institute-of-technology-bombay");
  const cse = iitb.programs.find((p) => p.slug === "computer-science-and-engineering-btech")!;

  it("compares a JEE Advanced rank with the last published closing rank", () => {
    const band = (rank: number) => admissionBand(iitb, cse, StudentProfileSchema.parse({ tests: { JEE_ADV: rank } })).band;
    expect(band(20)).toBe("safety");
    expect(band(60)).toBe("target");
    expect(band(5000)).toBe("reach");
  });

  it("says Not yet eligible when a published minimum isn't met", () => {
    const p = { ...cse, admission: { basis: ["merit" as const], eligibility: null, minimumPercent: "75% in Class XII", requiredSubjects: [], entranceTests: [], reservation: null, international: null, applicationFee: null, process: [], sourceId: null, confidence: "official" as const, asOf: null } };
    const r = admissionBand(iitb, p, StudentProfileSchema.parse({ curriculum: "CBSE", predictedTotal: "70%" }));
    expect(r.band).toBe("not-eligible");
  });

  it("stays Unclassified without a cut-off or acceptance rate", () => {
    const u = { ...iitb, details: { ...iitb.details, cutoffs: [], admissionStats: [] } };
    expect(admissionBand(u, cse, StudentProfileSchema.parse({})).band).toBe("unclassified");
  });

  it("match % is separate from the band and always carries reasons", () => {
    const m = matchProgram(iitb, cse, StudentProfileSchema.parse({ fields: ["computer-science"], budgetInrPerYear: 300000, preferredStates: ["Maharashtra"] }));
    expect(m.percent).not.toBeNull();
    expect(m.why.length).toBeGreaterThan(0);
  });
});
