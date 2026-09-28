import type {
  ID,
  PassionSession,
  PassionResponse,
  PassionQuestion,
} from "@/lib/data/types";
import { readCollection, writeCollection } from "@/lib/data/adapters/demo/storage";
import { makeId, nowISO } from "@/lib/data/id";
import { PASSION_QUESTIONS } from "@/lib/data/fixtures/passion/questions";
import { ARCHETYPES } from "@/lib/data/fixtures/passion/archetypes";
import { FIELD_WEIGHTS } from "@/lib/data/fixtures/passion/fieldWeights";
import { buildProfile } from "@/lib/passion/profile";

const COLLECTION = "passionSessions";

/**
 * Async from day one (docs/01-architecture.md): every consumer already
 * handles pending/error states, so a real backend later changes no call
 * sites. Writes persist to localStorage via the demo adapter.
 */
export interface PassionRepo {
  createSession(studentId: ID): Promise<PassionSession>;
  getSession(id: ID): Promise<PassionSession | null>;
  getActiveSession(studentId: ID): Promise<PassionSession | null>;
  listSessions(studentId: ID): Promise<PassionSession[]>;
  recordResponse(sessionId: ID, response: PassionResponse): Promise<PassionSession>;
  completeSession(sessionId: ID): Promise<PassionSession>;
  abandonSession(sessionId: ID): Promise<PassionSession>;
  updateSession(session: PassionSession): Promise<PassionSession>;
}

function all(): PassionSession[] {
  return readCollection<PassionSession>(COLLECTION);
}
function persist(sessions: PassionSession[]) {
  writeCollection(COLLECTION, sessions);
}

function questionById(id: ID): PassionQuestion | undefined {
  return PASSION_QUESTIONS.find((q) => q.id === id);
}

export const passionRepo: PassionRepo = {
  async createSession(studentId) {
    const session: PassionSession = {
      id: makeId("psn"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      // A student's own generated session is real, not fabricated demo
      // content and not third-party-supplied — "verified" here means
      // "authentic", the honest value closest to "this is really theirs".
      provenance: "verified",
      studentId,
      status: "in_progress",
      responses: [],
      askedQuestionIds: [],
      profile: null,
      completedAt: null,
    };
    persist([...all(), session]);
    return session;
  },

  async getSession(id) {
    return all().find((s) => s.id === id) ?? null;
  },

  async getActiveSession(studentId) {
    const sessions = all().filter(
      (s) => s.studentId === studentId && s.status === "in_progress",
    );
    return sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  },

  async listSessions(studentId) {
    return all()
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async recordResponse(sessionId, response) {
    const sessions = all();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Unknown passion session: ${sessionId}`);
    const session = sessions[idx];

    const askedQuestionIds = session.askedQuestionIds.includes(response.questionId)
      ? session.askedQuestionIds
      : [...session.askedQuestionIds, response.questionId];

    const updated: PassionSession = {
      ...session,
      responses: [...session.responses, response],
      askedQuestionIds,
      updatedAt: nowISO(),
    };
    sessions[idx] = updated;
    persist(sessions);
    return updated;
  },

  async completeSession(sessionId) {
    const sessions = all();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Unknown passion session: ${sessionId}`);
    const session = sessions[idx];

    const askedQuestions = session.askedQuestionIds
      .map(questionById)
      .filter((q): q is PassionQuestion => !!q);

    const profile = buildProfile(
      session.responses,
      askedQuestions,
      ARCHETYPES,
      FIELD_WEIGHTS,
    );

    const updated: PassionSession = {
      ...session,
      status: "complete",
      profile,
      completedAt: nowISO(),
      updatedAt: nowISO(),
    };
    sessions[idx] = updated;
    persist(sessions);
    return updated;
  },

  async abandonSession(sessionId) {
    const sessions = all();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Unknown passion session: ${sessionId}`);
    const updated: PassionSession = {
      ...sessions[idx],
      status: "abandoned",
      updatedAt: nowISO(),
    };
    sessions[idx] = updated;
    persist(sessions);
    return updated;
  },

  async updateSession(session) {
    const sessions = all();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx === -1) throw new Error(`Unknown passion session: ${session.id}`);
    sessions[idx] = { ...session, updatedAt: nowISO() };
    persist(sessions);
    return sessions[idx];
  },
};
