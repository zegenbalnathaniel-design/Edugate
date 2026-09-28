"use client";

import { useState } from "react";
import type { Project, ProjectStatus, ProjectTemplate } from "@/lib/data/types";
import { Button } from "@/components/primitives/Button";

const DIFFICULTY_LABEL: Record<ProjectTemplate["difficulty"], string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  ambitious: "Ambitious",
};

/**
 * A recommended project template. Accepting it is what turns this into a
 * real `Project` entity (the loop, not the quiz result) — the plan and
 * deliverables below are the actual build, not just a first step.
 */
export function ProjectCard({
  template,
  reason,
  onAccept,
}: {
  template: ProjectTemplate;
  reason: string;
  onAccept: () => Promise<void>;
}) {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="glass flex flex-col gap-4 p-6">
      <div>
        <p className="meta text-cyan-deep">{reason}</p>
        <h4 className="display-s mt-1.5">{template.title}</h4>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-current/75">
          {template.rationale}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-[0.8125rem] text-current/60 sm:grid-cols-4">
        <div>
          <dt className="meta text-current/40">Difficulty</dt>
          <dd className="tabular mt-0.5">{DIFFICULTY_LABEL[template.difficulty]}</dd>
        </div>
        <div>
          <dt className="meta text-current/40">Time</dt>
          <dd className="tabular mt-0.5">~{template.estimatedHours}h</dd>
        </div>
        <div className="col-span-2 sm:col-span-2">
          <dt className="meta text-current/40">Skills</dt>
          <dd className="mt-0.5">{template.skills.slice(0, 3).join(", ")}</dd>
        </div>
      </dl>

      <div className="border-t border-current/10 pt-4">
        <p className="meta mb-1 text-current/40">First step, today</p>
        <p className="text-[0.9375rem] text-current/85">{template.firstStep}</p>
      </div>

      <details className="group">
        <summary className="meta cursor-pointer list-none text-cyan-deep [&::-webkit-details-marker]:hidden">
          Full plan — {template.implementationPlan.length} phases ↓
        </summary>
        <div className="mt-4 space-y-4 border-t border-current/10 pt-4">
          {template.implementationPlan.map((phase, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[0.875rem] font-medium text-current/90">{phase.title}</p>
                <p className="meta shrink-0 text-current/40">{phase.durationDescriptor}</p>
              </div>
              <p className="mt-1 text-[0.8125rem] text-current/60">{phase.goal}</p>
              <ul className="mt-2 space-y-1">
                {phase.tasks.map((task, j) => (
                  <li key={j} className="flex gap-2 text-[0.8125rem] text-current/70">
                    <span aria-hidden className="text-cyan-deep">·</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-t border-current/10 pt-3">
            <p className="meta mb-1.5 text-current/40">Deliverables</p>
            <ul className="space-y-1">
              {template.deliverables.map((d, i) => (
                <li key={i} className="text-[0.8125rem] text-current/70">{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <p className="text-[0.8125rem] italic text-current/50">{template.portfolioValue}</p>

      <div className={accepted ? "" : "moving-border"}>
        <Button
          variant={accepted ? "secondary" : "primary"}
          size="sm"
          magnetic={false}
          className="w-full"
          onClick={async () => {
            if (accepted || accepting) return;
            setAccepting(true);
            await onAccept();
            setAccepting(false);
            setAccepted(true);
          }}
        >
          {accepted ? "Added to your projects" : accepting ? "Starting…" : "Start this project"}
        </Button>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  started: "Started",
  in_progress: "In progress",
  completed: "Completed",
};

const NEXT_STATUS: Record<ProjectStatus, ProjectStatus | null> = {
  idea: "started",
  started: "in_progress",
  in_progress: "completed",
  completed: null,
};

/** How far into the plan this status roughly puts the student — a visual cue only. */
function activePhaseIndex(status: ProjectStatus, phaseCount: number): number {
  if (status === "idea") return -1;
  if (status === "started") return 0;
  if (status === "completed") return phaseCount - 1;
  return Math.min(phaseCount - 1, Math.floor(phaseCount / 2));
}

/** An owned `Project` entity with real status transitions — /student/projects. */
export function ProjectEntry({
  project,
  onAdvance,
}: {
  project: Project;
  onAdvance: (next: ProjectStatus) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const next = NEXT_STATUS[project.status];
  const activePhase = activePhaseIndex(project.status, project.implementationPlan.length);

  return (
    <div className="glass flex flex-col gap-3 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[1.0625rem] font-medium text-current">{project.title}</h4>
          <p className="mt-1 text-[0.8125rem] text-current/55">{project.rationale}</p>
        </div>
        <span className="meta shrink-0 rounded-full border border-current/20 px-2.5 py-1 text-cyan-deep">
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      {project.implementationPlan.length > 0 && (
        <div className="flex gap-1.5" role="img" aria-label={`Phase ${activePhase + 1} of ${project.implementationPlan.length}`}>
          {project.implementationPlan.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-1.5 flex-1 rounded-full ${i <= activePhase ? "bg-cyan" : "bg-current/12"}`}
            />
          ))}
        </div>
      )}

      {project.status !== "completed" && (
        <div className="border-t border-current/10 pt-3">
          <p className="meta mb-1 text-current/40">
            {project.status === "idea" ? "First step" : `Now — ${project.implementationPlan[Math.max(0, activePhase)]?.title ?? "Next step"}`}
          </p>
          <p className="text-[0.875rem] text-current/80">
            {project.status === "idea"
              ? project.firstStep
              : (project.implementationPlan[Math.max(0, activePhase)]?.tasks[0] ?? project.firstStep)}
          </p>
        </div>
      )}

      {project.implementationPlan.length > 0 && (
        <details>
          <summary className="meta cursor-pointer list-none text-cyan-deep [&::-webkit-details-marker]:hidden">
            View full plan ↓
          </summary>
          <div className="mt-3 space-y-3 border-t border-current/10 pt-3">
            {project.implementationPlan.map((phase, i) => (
              <div key={i} className={i === activePhase ? "opacity-100" : "opacity-60"}>
                <p className="text-[0.8125rem] font-medium text-current/90">{phase.title}</p>
                <ul className="mt-1 space-y-0.5">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="text-[0.8125rem] text-current/65">· {task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}

      {next && (
        <Button
          variant="secondary"
          size="sm"
          magnetic={false}
          onClick={async () => {
            setBusy(true);
            await onAdvance(next);
            setBusy(false);
          }}
        >
          {busy ? "Updating…" : `Mark as ${STATUS_LABEL[next].toLowerCase()}`}
        </Button>
      )}
    </div>
  );
}
