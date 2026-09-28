import type { FieldWeights } from "@/lib/passion/fields";

/**
 * Hand-authored, reviewable adjacency between the 13 fields (src/lib/data/types.ts
 * → FieldKey) and the 13 interest signals. docs/04-passion-engine.md §7 gives
 * economics/computer_science/psychology as a worked example; the rest follow
 * the same shape — 3-5 signals per field, weights roughly 0.4-0.9.
 */
export const FIELD_WEIGHTS: FieldWeights = {
  economics: { analysis: 0.9, business: 0.8, systems: 0.6, competition: 0.5 },
  business: { business: 0.9, competition: 0.6, people: 0.5, systems: 0.5, analysis: 0.4 },
  technology: { technology: 0.9, creation: 0.8, systems: 0.8, analysis: 0.6 },
  design: { design: 0.9, creation: 0.8, storytelling: 0.5, curiosity: 0.4 },
  psychology: { people: 0.9, curiosity: 0.7, research: 0.7, analysis: 0.5 },
  engineering: { systems: 0.9, technology: 0.7, analysis: 0.7, creation: 0.6 },
  media: { storytelling: 0.9, creation: 0.7, people: 0.5, design: 0.5 },
  social_sciences: { people: 0.8, research: 0.8, curiosity: 0.6, analysis: 0.5, impact: 0.5 },
  life_sciences: { research: 0.9, curiosity: 0.8, analysis: 0.6, systems: 0.4 },
  law: { analysis: 0.8, people: 0.6, competition: 0.5, systems: 0.5, storytelling: 0.4 },
  architecture: { design: 0.9, systems: 0.6, creation: 0.6, exploration: 0.4 },
  sports: { competition: 0.9, people: 0.5, exploration: 0.4, impact: 0.4 },
  entrepreneurship: { business: 0.8, creation: 0.7, exploration: 0.6, competition: 0.5, impact: 0.4 },
};
