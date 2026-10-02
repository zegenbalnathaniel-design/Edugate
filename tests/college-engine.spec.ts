import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { UniversitySchema, type University } from "@/lib/unis/schema";
import { extractColumns, rankLowerBound } from "@/lib/unis/extract";
import { fitDimensions, gapAnalysis, gradeMeets, preferenceAlignment, subjectMatches } from "@/lib/unis/fit";
import { StudentProfileSchema } from "@/lib/profile/schema";

const DATA = join(__dirname, "..", "data", "universities");
const files = readdirSync(DATA).filter((f) => f.endsWith(".json"));
const load = (f: string) => UniversitySchema.parse(JSON.parse(readFileSync(join(DATA, f), "utf8")));

describe("dataset integrity (spec §44–48)", () => {
  it("every university file validates, including sourceId resolution", () => {
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const r = UniversitySchema.safeParse(JSON.parse(readFileSync(join(DATA, f), "utf8")));
      expect(r.success, `${f}: ${r.success ? "" : JSON.stringify(r.error.issues.slice(0, 3))}`).toBe(true);
    }
  });

  it("file name matches slug, and slugs are unique", () => {
    const slugs = files.map((f) => load(f).slug);
    files.forEach((f, i) => expect(f).toBe(`${slugs[i]}.json`));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("a non-null sourced value always names its source (§48 no fabrication)", () => {
    for (const f of files) {
      const walk = (n: unknown, path: string) => {
        if (Array.isArray(n)) n.forEach((x, i) => walk(x, `${path}[${i}]`));
        else if (n && typeof n === "object") {
          const o = n as Record<string, unknown>;
          if ("value" in o && "confidence" in o && o.value !== null && o.confidence !== "requires-verification") {
            expect(o.sourceId, `${f} ${path} has a value but no source`).toBeTruthy();
          }
          Object.entries(o).forEach(([k, v]) => walk(v, `${path}.${k}`));
        }
      };
      walk(JSON.parse(readFileSync(join(DATA, f), "utf8")), "");
    }
  });

  it("every ranking states its organisation, edition and source", () => {
    for (const f of files) for (const r of load(f).rankings) {
      expect(r.edition).toBeGreaterThan(2000);
      expect(r.sourceId, `${f} ${r.org} ${r.edition}`).toBeTruthy();
    }
  });
});

describe("column extraction", () => {
  it("parses ranks with ties and bands", () => {
    expect(rankLowerBound("=2")).toBe(2);
    expect(rankLowerBound("101-150")).toBe(101);
    expect(rankLowerBound("1001+")).toBe(1001);
  });

  it("extracts filter columns for every record", () => {
    for (const f of files) {
      const c = extractColumns(load(f));
      expect(c.fields.length).toBeGreaterThan(0);
      if (c.intlTuitionUsdMin != null) expect(c.intlTuitionUsdMin).toBeGreaterThan(0);
    }
  });
});

describe("subject and grade matching", () => {
  it("distinguishes IB Math AA from AI", () => {
    expect(subjectMatches("Mathematics: Analysis and Approaches", "Math AA")).toBe(true);
    expect(subjectMatches("Mathematics: Analysis and Approaches", "Mathematics: Applications and Interpretation")).toBe(false);
    expect(subjectMatches("Mathematics (AA or AI)", "Math AI")).toBe(true);
    expect(subjectMatches("Physics", "Physics")).toBe(true);
    expect(subjectMatches("Chemistry", "Physics")).toBe(false);
  });

  it("compares numeric and A-level grades, and returns null across scales", () => {
    expect(gradeMeets("6", "7")).toBe(true);
    expect(gradeMeets("6", "5")).toBe(false);
    expect(gradeMeets("A", "A*")).toBe(true);
    expect(gradeMeets("A*", "B")).toBe(false);
    expect(gradeMeets("A", "7")).toBeNull();
    expect(gradeMeets("6", null)).toBeNull();
  });
});

const uni = (overrides: Partial<University> = {}): University =>
  UniversitySchema.parse({
    slug: "test-u", name: "Test U", officialName: "Test U", country: "United Kingdom", countryCode: "GB", region: "England", city: "London",
    campuses: [], control: "public", category: "research-university", founded: 1900, setting: "urban", languages: ["English"],
    website: "https://example.ac.uk/", admissionsUrl: null, financialAidUrl: null, internationalUrl: null, summary: "Test.",
    stats: {
      totalStudents: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
      undergraduates: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
      internationalShare: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
      studentFacultyRatio: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
    },
    rankings: [], applicationPlatform: { value: "UCAS", sourceId: "s1", confidence: "official", asOf: "2026-27" },
    applicationFee: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
    testing: [], english: [{ test: "IELTS", minOverall: "7.0", minSection: "6.5", waiver: null, sourceId: "s1", confidence: "official" }],
    costs: {
      currency: "GBP",
      internationalTuition: { value: { min: 30000, max: 30000, period: "year" }, sourceId: "s1", confidence: "official", asOf: "2026-27" },
      domesticTuition: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
      livingEstimate: { value: null, sourceId: null, confidence: "requires-verification", asOf: null },
    },
    scholarships: [], deadlines: [], opportunities: [],
    programs: [{
      slug: "econ", name: "BSc Economics", degree: "BSc", level: "bachelors", field: "economics", subfield: null, school: null, durationYears: 3,
      url: null, summary: "Econ.", curriculum: [], curriculumSourceId: null,
      requirements: [{ curriculum: "IB", accepted: true, minimum: "38 points", typical: null, sourceId: "s1", confidence: "official", asOf: "2026-27",
        subjects: [{ subject: "Mathematics: Analysis and Approaches", level: "HL", minGrade: "6", status: "required" }] }],
      tests: [], english: [], fees: null,
    }],
    sources: [{ id: "s1", label: "Official", url: "https://example.ac.uk/", type: "university", retrievedAt: "2026-10-02" }],
    lastVerified: "2026-10-02",
    ...overrides,
  });

describe("gap analysis (spec §41)", () => {
  it("marks met, missing and unclear requirements", () => {
    const u = uni();
    const strong = StudentProfileSchema.parse({ curriculum: "IB", predictedTotal: "40", subjects: [{ name: "Math AA", level: "HL", grade: "7" }], tests: { IELTS: 8 } });
    const rows = gapAnalysis(u, u.programs[0], strong);
    expect(rows.find((r) => r.requirement.includes("Analysis"))?.status).toBe("meets");
    expect(rows.find((r) => r.requirement === "Overall minimum")?.status).toBe("meets");
    expect(rows.find((r) => r.requirement.startsWith("English"))?.status).toBe("exceeds");

    const wrongMath = StudentProfileSchema.parse({ curriculum: "IB", subjects: [{ name: "Math AI", level: "HL", grade: "7" }] });
    expect(gapAnalysis(u, u.programs[0], wrongMath).find((r) => r.requirement.includes("Analysis"))?.status).toBe("missing");

    const slOnly = StudentProfileSchema.parse({ curriculum: "IB", subjects: [{ name: "Math AA", level: "SL", grade: "7" }] });
    expect(gapAnalysis(u, u.programs[0], slOnly).find((r) => r.requirement.includes("Analysis"))?.status).toBe("missing");

    const otherBoard = StudentProfileSchema.parse({ curriculum: "CBSE" });
    expect(gapAnalysis(u, u.programs[0], otherBoard)[0].status).toBe("unclear");
  });
});

describe("fit dimensions are not admission predictions (spec §2)", () => {
  it("an empty profile is all-unknown and produces no alignment percentage", () => {
    const dims = fitDimensions(uni(), StudentProfileSchema.parse({}));
    const core = dims.filter((d) => ["program", "curriculum", "cost", "location"].includes(d.key));
    expect(core.every((d) => d.state === "unknown")).toBe(true);
  });

  it("budget compares tuition only and flags over-budget", () => {
    const p = StudentProfileSchema.parse({ budgetUsdPerYear: 20000, fields: ["economics"], countries: ["GB"] });
    const cost = fitDimensions(uni(), p).find((d) => d.key === "cost")!;
    expect(cost.state).toBe("misaligned");
    expect(cost.reasons[0]).toMatch(/before aid/);
  });

  it("preference alignment ignores unknowns and reports their share", () => {
    const dims = fitDimensions(uni(), StudentProfileSchema.parse({ fields: ["economics"], countries: ["GB"] }));
    const a = preferenceAlignment(dims, StudentProfileSchema.parse({}).weights);
    expect(a.percent).not.toBeNull();
    expect(a.unknownShare).toBeGreaterThan(0);
  });
});
