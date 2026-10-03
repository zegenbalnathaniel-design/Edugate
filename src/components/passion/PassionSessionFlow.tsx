"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type {
  PassionOption,
  PassionQuestion,
  PassionResponse,
  PassionSession,
  SignalKey,
} from "@/lib/data/types";
import { PASSION_QUESTIONS } from "@/lib/data/fixtures/passion/questions";
import { PROJECT_TEMPLATES } from "@/lib/data/fixtures/passion/projectTemplates";
import { passionRepo } from "@/lib/data/repositories/passion";
import { projectRepo } from "@/lib/data/repositories/projects";
import { getLocalStudentId, readValue, writeValue } from "@/lib/data/adapters/demo/storage";
import { scoreSignals } from "@/lib/passion/scoring";
import { pickNextQuestion, shouldTerminate } from "@/lib/passion/selector";
import { selectProjects, type ProjectIntake } from "@/lib/passion/projects";
import { withProjectEvidence } from "@/lib/passion/profile";

import { Button } from "@/components/primitives/Button";
import { QuestionCard } from "./QuestionCard";
import { SignalList } from "./SignalList";
import { AxisIndicator } from "./AxisIndicator";
import { ArchetypeCard } from "./ArchetypeCard";
import { FieldConnections } from "./FieldConnections";
import { ProjectCard } from "./ProjectCard";

type Stage = "intro" | "active" | "completing" | "reveal";

const INTAKE_KEY = "passionIntake";
/** Matches selector.ts — used only to show a sane progress estimate. */
const ESTIMATED_TOTAL = 17;

function askedQuestionsOf(session: PassionSession): PassionQuestion[] {
  return session.askedQuestionIds
    .map((id) => PASSION_QUESTIONS.find((q) => q.id === id))
    .filter((q): q is PassionQuestion => !!q);
}

export function PassionSessionFlow() {
  const [stage, setStage] = useState<Stage>("intro");
  const [session, setSession] = useState<PassionSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PassionQuestion | null>(null);
  const [intake, setIntake] = useState<ProjectIntake>(
    () => readValue<ProjectIntake>(INTAKE_KEY) ?? { grade: 10, weeklyHoursBudget: 3 },
  );
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  const signalScores = useMemo(() => {
    if (!session) return [];
    return scoreSignals(session.responses, askedQuestionsOf(session)).scores;
  }, [session]);

  const loadNext = useCallback(async (current: PassionSession) => {
    if (shouldTerminate(PASSION_QUESTIONS, current.askedQuestionIds, current.responses)) {
      setStage("completing");
      const completed = await passionRepo.completeSession(current.id);
      setSession(completed);
      setCurrentQuestion(null);
      setStage("reveal");
      return;
    }
    const next = pickNextQuestion(PASSION_QUESTIONS, current.askedQuestionIds, current.responses);
    if (!next) {
      setStage("completing");
      const completed = await passionRepo.completeSession(current.id);
      setSession(completed);
      setCurrentQuestion(null);
      setStage("reveal");
      return;
    }
    setCurrentQuestion(next);
  }, []);

  const begin = useCallback(async () => {
    writeValue(INTAKE_KEY, intake);
    const studentId = getLocalStudentId();
    let active = await passionRepo.getActiveSession(studentId);
    if (!active) active = await passionRepo.createSession(studentId);
    setSession(active);
    setStage("active");
    await loadNext(active);
  }, [intake, loadNext]);

  const handleAnswer = useCallback(
    async (option: PassionOption) => {
      if (!session || !currentQuestion) return;
      const response: PassionResponse = {
        questionId: currentQuestion.id,
        optionId: option.id,
        at: new Date().toISOString(),
      };
      const updated = await passionRepo.recordResponse(session.id, response);
      setSession(updated);
      await loadNext(updated);
    },
    [session, currentQuestion, loadNext],
  );

  const acceptProject = useCallback(
    async (templateId: string, reason: string, signals: SignalKey[]) => {
      if (!session) return;
      const template = PROJECT_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      const project = await projectRepo.createFromTemplate({
        studentId: session.studentId,
        sourceSessionId: session.id,
        template,
        rationale: reason,
      });
      if (session.profile) {
        const updatedProfile = withProjectEvidence(session.profile, project.id, reason, signals);
        const updatedSession = { ...session, profile: updatedProfile };
        await passionRepo.updateSession(updatedSession);
        setSession(updatedSession);
      }
      setAcceptedIds((prev) => new Set(prev).add(templateId));
    },
    [session],
  );

  const askedCount = session?.askedQuestionIds.length ?? 0;
  const progressPct = Math.min(100, Math.round((askedCount / ESTIMATED_TOTAL) * 100));

  const recommendedProjects = useMemo(() => {
    if (!session?.profile) return [];
    return selectProjects(session.profile.signals, PROJECT_TEMPLATES, intake, 6);
  }, [session, intake]);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-32">
        {stage === "intro" && (
          <div className="glass w-full max-w-lg p-8 text-center sm:p-10">
            <p className="meta mb-4 text-current/50">Passion Projector</p>
            <h1 className="display-l mb-6">What kinds of problems naturally pull your attention?</h1>
            <p className="measure mx-auto mb-10 text-body-l text-current/70">
              Around 15–20 quick scenario questions, no right answers. You&apos;ll leave with
              real signals, evidence for each one, and a project you could start tonight.
            </p>

            <div className="mb-10 grid grid-cols-2 gap-4 text-left">
              <label className="text-[0.8125rem]">
                <span className="meta mb-2 block text-current/50">Grade</span>
                <select
                  value={intake.grade}
                  onChange={(e) =>
                    setIntake((prev) => ({ ...prev, grade: Number(e.target.value) as ProjectIntake["grade"] }))
                  }
                  className="w-full rounded-sm border border-current/20 bg-transparent px-3 py-2.5 text-[0.9375rem]"
                >
                  {[9, 10, 11, 12].map((g) => (
                    <option key={g} value={g} className="bg-navy-900">
                      Grade {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[0.8125rem]">
                <span className="meta mb-2 block text-current/50">Hours per week, roughly</span>
                <select
                  value={intake.weeklyHoursBudget}
                  onChange={(e) =>
                    setIntake((prev) => ({ ...prev, weeklyHoursBudget: Number(e.target.value) }))
                  }
                  className="w-full rounded-sm border border-current/20 bg-transparent px-3 py-2.5 text-[0.9375rem]"
                >
                  <option value={1} className="bg-navy-900">A few hours</option>
                  <option value={3} className="bg-navy-900">Several hours</option>
                  <option value={8} className="bg-navy-900">As much as it takes</option>
                </select>
              </label>
            </div>

            <div className="moving-border inline-block">
              <Button size="lg" onClick={begin} magnetic={false}>
                Begin
              </Button>
            </div>

            <p className="mt-8 border-t border-current/10 pt-6 text-[0.875rem] text-current/65">
              Want a full plan instead of a snapshot?{" "}
              <Link href="/passion-projector/architect" className="text-cyan underline-offset-2 hover:underline">
                Project Architect →
              </Link>
              <span className="mt-1 block text-[0.8125rem] text-current/45">
                An adaptive interview, 8–12 concepts built from your answers, and a blueprint with budget, risks and a 12-week plan.
              </span>
            </p>
          </div>
        )}

        {stage === "active" && currentQuestion && (
          <div className="glass flex w-full flex-col items-center p-8 sm:p-10">
            <div className="mb-8 w-full max-w-2xl">
              <div className="flex items-baseline justify-between">
                <p className="meta text-current/40">Question {askedCount + 1}</p>
                <p className="meta text-current/30">~{Math.max(1, ESTIMATED_TOTAL - askedCount)} to go</p>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-current/10">
                <div
                  className="h-full rounded-full bg-cyan transition-[width] duration-500 [transition-timing-function:var(--ease-out-edu)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
          </div>
        )}

        {stage === "completing" && (
          <p className="meta text-current/50">Resolving your signals…</p>
        )}

        {stage === "reveal" && session?.profile && (
          <div className="w-full space-y-16 py-12">
            <div className="text-center">
              <p className="meta mb-3 text-current/50">Your snapshot</p>
              <p className="measure mx-auto text-[0.9375rem] text-current/60">
                This is a snapshot of your current curiosity. Your interests can change.
              </p>
            </div>

            {session.profile.archetype ? (
              <div className="glass p-8 sm:p-10">
                <ArchetypeCard
                  archetype={session.profile.archetype}
                  blend={session.profile.archetypeBlend}
                />
              </div>
            ) : (
              <div className="glass p-8 sm:p-10">
                <p className="meta mb-2 text-current/50">No single pattern dominated</p>
                <p className="measure text-[0.9375rem] text-current/70">
                  Your signals didn&apos;t settle into one named pattern — that&apos;s a normal,
                  honest outcome. Here&apos;s what stood out instead.
                </p>
              </div>
            )}

            <section className="glass p-8 sm:p-10">
              <h3 className="meta mb-4 text-current/50">Interest signals</h3>
              <SignalList session={session} />
            </section>

            <section className="glass p-8 sm:p-10">
              <h3 className="meta mb-4 text-current/50">Working style</h3>
              <div className="space-y-1">
                {session.profile.axes.map((axis) => (
                  <AxisIndicator key={axis.key} score={axis} />
                ))}
              </div>
            </section>

            <section className="glass p-8 sm:p-10">
              <h3 className="meta mb-4 text-current/50">Fields worth exploring</h3>
              <FieldConnections connections={session.profile.fieldConnections} />
            </section>

            <section>
              <h3 className="meta mb-6 text-current/50">Projects that fit what showed up</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {recommendedProjects.map(({ template, reason, signals }) => (
                  <ProjectCard
                    key={template.id}
                    template={template}
                    reason={reason}
                    onAccept={() => acceptProject(template.id, reason, signals)}
                  />
                ))}
              </div>
              {acceptedIds.size > 0 && (
                <p className="mt-6 text-[0.875rem] text-current/60">
                  <a href="/student/projects" className="link-underline text-cyan-deep">
                    See your projects
                  </a>
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
