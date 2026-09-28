import type {
  PassionQuestion,
  PassionResponse,
  PassionProfile,
  EvidenceMap,
  Archetype,
  SignalKey,
} from "@/lib/data/types";
import { scoreSignals, scoreAxes } from "./scoring";
import { matchArchetype } from "./archetypes";
import { computeFieldConnections, type FieldWeights } from "./fields";

/**
 * Composes the full derived profile from raw responses. This is the single
 * place that assembles scoring + archetype matching + field connections +
 * evidence into the shape stored on `PassionSession.profile`.
 */
export function buildProfile(
  responses: PassionResponse[],
  askedQuestions: PassionQuestion[],
  archetypes: Archetype[],
  fieldWeights: FieldWeights,
): PassionProfile {
  const { scores: signals, evidence: bySignal } = scoreSignals(
    responses,
    askedQuestions,
  );
  const axes = scoreAxes(responses, askedQuestions);
  const { archetype, archetypeBlend } = matchArchetype(signals, archetypes);
  const fieldConnections = computeFieldConnections(signals, fieldWeights);

  const byField: EvidenceMap["byField"] = {};
  for (const fc of fieldConnections) {
    byField[fc.field] = fc.contributions.map((c) => ({
      signalKey: c.signal,
      weight: c.weight,
    }));
  }

  const evidence: EvidenceMap = { bySignal, byField, byProject: {} };

  return { signals, axes, archetype, archetypeBlend, fieldConnections, evidence };
}

/**
 * Recorded once a project is actually accepted — the durable claim worth
 * persisting ("why did this project appear") rather than every recommendation
 * the student merely saw.
 */
export function withProjectEvidence(
  profile: PassionProfile,
  projectId: string,
  reason: string,
  signals: SignalKey[],
): PassionProfile {
  return {
    ...profile,
    evidence: {
      ...profile.evidence,
      byProject: {
        ...profile.evidence.byProject,
        [projectId]: [...(profile.evidence.byProject[projectId] ?? []), { reason, signals }],
      },
    },
  };
}
