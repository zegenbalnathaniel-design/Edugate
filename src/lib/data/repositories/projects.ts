import type { ID, Project, ProjectStatus, ProjectTemplate } from "@/lib/data/types";
import { readCollection, writeCollection } from "@/lib/data/adapters/demo/storage";
import { makeId, nowISO } from "@/lib/data/id";

const COLLECTION = "projects";

/**
 * Accepting a project creates a real `Project` entity — the loop that makes
 * Passion Projector a product rather than a quiz result (docs/04 §7).
 */
export interface ProjectRepo {
  list(studentId: ID): Promise<Project[]>;
  get(id: ID): Promise<Project | null>;
  createFromTemplate(args: {
    studentId: ID;
    sourceSessionId: ID | null;
    template: ProjectTemplate;
    rationale: string;
  }): Promise<Project>;
  updateStatus(id: ID, status: ProjectStatus): Promise<Project>;
  addReflection(id: ID, reflection: string): Promise<Project>;
}

function all(): Project[] {
  return readCollection<Project>(COLLECTION);
}
function persist(projects: Project[]) {
  writeCollection(COLLECTION, projects);
}

export const projectRepo: ProjectRepo = {
  async list(studentId) {
    return all()
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async get(id) {
    return all().find((p) => p.id === id) ?? null;
  },

  async createFromTemplate({ studentId, sourceSessionId, template, rationale }) {
    const now = nowISO();
    const project: Project = {
      id: makeId("prj"),
      createdAt: now,
      updatedAt: now,
      provenance: "verified",
      studentId,
      sourceSessionId,
      templateId: template.id,
      title: template.title,
      rationale,
      skills: template.skills,
      difficulty: template.difficulty,
      estimatedHours: template.estimatedHours,
      firstStep: template.firstStep,
      implementationPlan: template.implementationPlan,
      deliverables: template.deliverables,
      status: "idea",
      evidence: [],
      reflection: null,
      statusHistory: [{ status: "idea", at: now }],
    };
    persist([...all(), project]);
    return project;
  },

  async updateStatus(id, status) {
    const projects = all();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Unknown project: ${id}`);
    const now = nowISO();
    const updated: Project = {
      ...projects[idx],
      status,
      updatedAt: now,
      statusHistory: [...projects[idx].statusHistory, { status, at: now }],
    };
    projects[idx] = updated;
    persist(projects);
    return updated;
  },

  async addReflection(id, reflection) {
    const projects = all();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Unknown project: ${id}`);
    const updated: Project = { ...projects[idx], reflection, updatedAt: nowISO() };
    projects[idx] = updated;
    persist(projects);
    return updated;
  },
};
