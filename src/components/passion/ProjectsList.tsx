"use client";

import { useEffect, useState } from "react";
import type { Project, ProjectStatus } from "@/lib/data/types";
import { getLocalStudentId } from "@/lib/data/adapters/demo/storage";
import { projectRepo } from "@/lib/data/repositories/projects";
import { ProjectEntry } from "./ProjectCard";

/**
 * /student/projects — real `Project` entities with real status transitions,
 * surviving reload (docs/01-architecture.md, docs/04 §7).
 */
export function ProjectsList() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    projectRepo.list(getLocalStudentId()).then(setProjects);
  }, []);

  const advance = async (id: string, next: ProjectStatus) => {
    const updated = await projectRepo.updateStatus(id, next);
    setProjects((prev) => (prev ? prev.map((p) => (p.id === id ? updated : p)) : prev));
  };

  if (projects === null) {
    return <p className="meta text-current/40">Loading…</p>;
  }

  if (projects.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <p className="mb-4 text-[0.9375rem] text-current/70">
          Nothing here yet — projects come from Passion Projector.
        </p>
        <a href="/passion-projector" className="link-underline text-cyan-deep">
          Start Passion Projector
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {projects.map((p) => (
        <ProjectEntry key={p.id} project={p} onAdvance={(next) => advance(p.id, next)} />
      ))}
    </div>
  );
}
