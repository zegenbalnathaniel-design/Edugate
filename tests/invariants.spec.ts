import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { render } from "@testing-library/react";
import { Provenance } from "@/components/primitives/Provenance";
import { passionRepo } from "@/lib/data/repositories/passion";
import { projectRepo } from "@/lib/data/repositories/projects";
import { PASSION_QUESTIONS } from "@/lib/data/fixtures/passion/questions";
import { ARCHETYPES } from "@/lib/data/fixtures/passion/archetypes";
import { PROJECT_TEMPLATES } from "@/lib/data/fixtures/passion/projectTemplates";
import {
  PassionQuestionSchema,
  ArchetypeSchema,
  ProjectTemplateSchema,
  ProvenanceSchema,
} from "@/lib/data/schema";

/**
 * D7: "Invariants are tested, not trusted." Walks the route manifest and the
 * fixture set for D3 (business model), D4 (no mock tests / exam prep) and
 * D2.3 (illustrative data always shows the provenance marker).
 */

const APP_DIR = join(__dirname, "..", "src", "app");
const DATA_DIR = join(__dirname, "..", "src", "lib", "data");

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function routeSegments(dir: string, segments: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      segments.push(entry);
      routeSegments(full, segments);
    }
  }
  return segments;
}

describe("D3 — business model is a hard absence, not a memory", () => {
  const FORBIDDEN_ROUTES = ["pricing", "plans", "upgrade", "billing", "checkout"];

  it("has no route segment matching a forbidden path", () => {
    const segments = routeSegments(APP_DIR).map((s) => s.toLowerCase());
    for (const forbidden of FORBIDDEN_ROUTES) {
      expect(segments, `found forbidden route segment "${forbidden}"`).not.toContain(forbidden);
    }
  });

  it("has no forbidden field in the data model", () => {
    const FORBIDDEN_FIELDS = [
      "tier",
      "plan",
      "subscription",
      "premium",
      "isPaid",
      "sponsored",
      "promoted",
      "entitlement",
      "boost",
    ];
    const files = walkFiles(DATA_DIR).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    for (const file of files) {
      const text = readFileSync(file, "utf-8");
      for (const field of FORBIDDEN_FIELDS) {
        // Matches a field/property declaration shape: `fieldName:` or `fieldName?:`
        const re = new RegExp(`\\b${field}\\s*\\??\\s*:`, "g");
        const hit = re.test(text);
        expect(hit, `${relative(process.cwd(), file)} declares forbidden field "${field}"`).toBe(false);
      }
    }
  });

  it("the word 'free' appears in at most a couple of places sitewide (not repeated as marketing)", () => {
    const files = walkFiles(APP_DIR).filter((f) => f.endsWith(".tsx"));
    let count = 0;
    for (const file of files) {
      const text = readFileSync(file, "utf-8");
      const matches = text.match(/\bfree\b/gi);
      count += matches?.length ?? 0;
    }
    expect(count, "the word 'free' is repeated as a marketing beat somewhere it shouldn't be").toBeLessThanOrEqual(2);
  });
});

describe("D4 — no mock tests / exam prep, anywhere", () => {
  it("has no route segment for test-prep features", () => {
    const segments = routeSegments(APP_DIR).map((s) => s.toLowerCase());
    const forbidden = ["mock-test", "mock-tests", "exam-prep", "test-prep", "practice-test"];
    for (const f of forbidden) {
      expect(segments).not.toContain(f);
    }
  });
});

describe("D2.3 — illustrative data always renders its provenance marker", () => {
  it("<Provenance> renders a visible label for every provenance kind", () => {
    const LABEL: Record<string, string> = {
      illustrative: "Illustrative demo data",
      "institution-supplied": "Institution-supplied",
      verified: "Verified",
    };
    for (const kind of ["illustrative", "institution-supplied", "verified"] as const) {
      const { container, unmount } = render(Provenance({ kind }));
      expect(container.textContent).toContain(LABEL[kind]);
      unmount();
    }
  });

  it("PassionSession and Project entities always carry a valid, non-optional provenance", async () => {
    const session = await passionRepo.createSession("std_test");
    expect(ProvenanceSchema.safeParse(session.provenance).success).toBe(true);

    const project = await projectRepo.createFromTemplate({
      studentId: "std_test",
      sourceSessionId: session.id,
      template: PROJECT_TEMPLATES[0],
      rationale: "test",
    });
    expect(ProvenanceSchema.safeParse(project.provenance).success).toBe(true);
  });
});

describe("D7 — fixture integrity, structurally validated rather than eyeballed", () => {
  it("every passion question matches its schema", () => {
    for (const q of PASSION_QUESTIONS) {
      const result = PassionQuestionSchema.safeParse(q);
      expect(result.success, `question ${q.id} failed schema: ${result.success ? "" : JSON.stringify(result.error.issues)}`).toBe(true);
    }
  });

  it("every archetype matches its schema", () => {
    for (const a of ARCHETYPES) {
      const result = ArchetypeSchema.safeParse(a);
      expect(result.success, `archetype ${a.key} failed schema`).toBe(true);
    }
  });

  it("every project template matches its schema, and firstStep is concrete", () => {
    const VAGUE_OPENERS = /^(research|plan|explore|brainstorm|think about)\b/i;
    for (const t of PROJECT_TEMPLATES) {
      const result = ProjectTemplateSchema.safeParse(t);
      expect(result.success, `template ${t.id} failed schema`).toBe(true);
      expect(
        VAGUE_OPENERS.test(t.firstStep.trim()),
        `template ${t.id}'s firstStep opens with a vague verb: "${t.firstStep}"`,
      ).toBe(false);
    }
  });

  it("question ids are unique across the bank", () => {
    const ids = PASSION_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("core questions have no eligibility gate and are asked to everyone", () => {
    for (const q of PASSION_QUESTIONS.filter((q) => q.stage === "core")) {
      expect(q.eligibility, `core question ${q.id} should not be gated`).toBeUndefined();
    }
  });
});
