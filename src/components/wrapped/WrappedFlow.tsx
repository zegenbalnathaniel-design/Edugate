"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { runWrapped } from "@/app/wrapped/actions";
import { CHAPTERS, type Answer, type Answers, type ChapterId, type Question } from "@/lib/wrapped/model";
import type { WrappedResult } from "@/lib/wrapped/match";
import { activeQuestions, buildProfile, nudge } from "@/lib/wrapped/profile";
import { clearSaved, decodeAnswers, encodeAnswers, loadSaved, save } from "./codec";
import { Portal } from "./Portal";
import { QuestionCard } from "./QuestionCard";
import { ResultsStory } from "./ResultsStory";

/*
 * University Wrapped (docs/10): opening → seven chapters of one-question
 * cards (with chapter cards that react to the answers so far) → a short
 * "crunching" moment → the results story. Answers live in this browser
 * (and in the share link) until the student chooses to save them.
 */

const CHAPTER_BG: Record<ChapterId | "intro", string> = {
  intro: "radial-gradient(120% 90% at 10% 10%,#45a39a 0%,transparent 55%),radial-gradient(100% 80% at 90% 90%,#b0532b 0%,transparent 55%),#0b1d21",
  brain: "linear-gradient(135deg,#0f262b 0%,#1f434b 45%,#45a39a 100%)",
  energy: "linear-gradient(150deg,#7a2f17 0%,#b0532b 50%,#f2bf2a 100%)",
  future: "linear-gradient(140deg,#2b1310 0%,#7d1a16 50%,#cf7a45 100%)",
  university: "linear-gradient(145deg,#163239 0%,#2c5760 50%,#7fcfc4 100%)",
  world: "linear-gradient(135deg,#0f262b 0%,#45a39a 55%,#dcb574 100%)",
  money: "linear-gradient(150deg,#3b2a12 0%,#c98446 55%,#f2bf2a 100%)",
  call: "linear-gradient(140deg,#2b1310 0%,#b3221c 55%,#f2bf2a 100%)",
};

type Step = { kind: "chapter"; chapter: ChapterId; key: string } | { kind: "q"; q: Question; key: string };

function stepsFor(answers: Answers): Step[] {
  const out: Step[] = [];
  let prev: ChapterId | null = null;
  for (const q of activeQuestions(answers)) {
    if (q.chapter !== prev) out.push({ kind: "chapter", chapter: q.chapter, key: `ch:${q.chapter}` });
    out.push({ kind: "q", q, key: q.id });
    prev = q.chapter;
  }
  return out;
}

type Stage = "intro" | "intro2" | "quiz" | "crunch" | "results";

export function WrappedFlow() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswersState] = useState<Answers>({});
  const [at, setAtState] = useState<string | null>(null);
  // Refs mirror state so delayed callbacks (auto-advance after a tap) always see the latest answers.
  const answersRef = useRef<Answers>({});
  const atRef = useRef<string | null>(null);
  const setAnswers = useCallback((a: Answers) => {
    answersRef.current = a;
    setAnswersState(a);
  }, []);
  const setAt = useCallback((k: string | null) => {
    atRef.current = k;
    setAtState(k);
  }, []);
  const [resume, setResume] = useState<{ answers: Answers; at: string | null } | null>(null);
  const [result, setResult] = useState<WrappedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const steps = useMemo(() => stepsFor(answers), [answers]);
  const idx = Math.max(0, at ? steps.findIndex((s) => s.key === at) : 0);
  const step = steps[idx];
  const questionsTotal = steps.filter((s) => s.kind === "q").length;
  const answeredCount = steps.filter((s) => s.kind === "q" && answers[s.q.id] !== undefined).length;

  const finish = useCallback((a: Answers) => {
    setStage("crunch");
    setError(null);
    const started = Date.now();
    startTransition(async () => {
      const r = await runWrapped(a);
      // Let the anticipation land, even when the server is quick.
      await new Promise((res) => setTimeout(res, Math.max(0, 2400 - (Date.now() - started))));
      if ("error" in r) {
        setError(r.error);
        setStage("quiz");
        return;
      }
      setResult(r);
      setStage("results");
      try {
        history.replaceState(null, "", `/wrapped#r=${encodeAnswers(a)}`);
      } catch {
        /* ignore */
      }
    });
  }, []);

  // Shared link (#r=…) opens straight to results; otherwise offer to resume a saved run.
  useEffect(() => {
    const m = location.hash.match(/#r=([\w-]+)/);
    const shared = m ? decodeAnswers(m[1]) : null;
    if (shared) {
      setAnswers(shared);
      finish(shared);
      return;
    }
    const saved = loadSaved();
    if (saved && Object.keys(saved.answers).length) setResume(saved);
  }, [finish, setAnswers]);

  // The experience is a full-screen overlay; stop the page behind it from scrolling.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (stage === "quiz") save(answers, at);
  }, [answers, at, stage]);

  const goTo = (i: number) => {
    const s = steps[Math.max(0, Math.min(steps.length - 1, i))];
    setAt(s.key);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const next = useCallback(() => {
    const cur = answersRef.current;
    const s2 = stepsFor(cur);
    const i = Math.max(0, s2.findIndex((s) => s.key === (atRef.current ?? s2[0].key)));
    if (i >= s2.length - 1) finish(cur);
    else setAt(s2[i + 1].key);
    window.scrollTo({ top: 0 });
  }, [finish, setAt]);

  const answer = (id: string, v: Answer) => setAnswers({ ...answersRef.current, [id]: v });

  useEffect(() => {
    if (stage !== "quiz" || step?.kind !== "chapter") return;
    const k = (e: KeyboardEvent) => e.key === "Enter" && next();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [stage, step, next]);

  if (stage === "results" && result) {
    const shareUrl = typeof window !== "undefined" ? `${location.origin}/wrapped#r=${encodeAnswers(answers)}` : "";
    return (
      <Portal>
      <ResultsStory
        r={result}
        answers={answers}
        shareUrl={shareUrl}
        onEdit={() => {
          setStage("quiz");
          setAt(steps.find((s) => s.kind === "q")?.key ?? null);
          history.replaceState(null, "", "/wrapped");
        }}
        onRestart={() => {
          clearSaved();
          setAnswers({});
          setAt(null);
          setResult(null);
          setStage("intro");
          history.replaceState(null, "", "/wrapped");
        }}
      />
      </Portal>
    );
  }

  const chapter = stage === "quiz" && step ? (step.kind === "chapter" ? step.chapter : step.q.chapter) : null;
  const bg = CHAPTER_BG[chapter ?? "intro"];
  const chapterIndex = chapter ? CHAPTERS.findIndex((c) => c.id === chapter) : -1;
  const motionProps = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  return (
    <Portal>
    <div className="fixed inset-0 z-[80] flex flex-col overflow-clip text-white" style={{ ["--wr-ink" as string]: "#0b1d21" }}>
      <div className="absolute inset-0 -z-10 transition-[background] duration-700" style={{ background: bg }} aria-hidden />
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-white/10 blur-3xl motion-safe:animate-[wr-float_12s_ease-in-out_infinite]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[32rem] rounded-full bg-black/20 blur-3xl motion-safe:animate-[wr-float_15s_ease-in-out_infinite_reverse]" />

      <header className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-8">
        <Link href="/" className="text-[0.8125rem] font-extrabold uppercase tracking-[0.22em]">
          Edugate
        </Link>
        {stage === "quiz" && chapterIndex >= 0 && (
          <div className="flex flex-1 items-center gap-1.5 sm:max-w-md" aria-label={`Chapter ${chapterIndex + 1} of ${CHAPTERS.length}`}>
            {CHAPTERS.map((c, k) => {
              const qs = steps.filter((s) => s.kind === "q" && s.q.chapter === c.id);
              const done = qs.filter((s) => s.kind === "q" && answers[s.q.id] !== undefined).length;
              const fill = k < chapterIndex ? 1 : k > chapterIndex ? 0 : qs.length ? done / qs.length : 0;
              return (
                <span key={c.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${Math.round(fill * 100)}%` }} />
                </span>
              );
            })}
          </div>
        )}
        <Link href="/" className="text-[0.8125rem] text-white/75 hover:text-white">
          Exit ✕
        </Link>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div key="intro" {...motionProps} transition={{ duration: 0.4 }} className="mx-auto my-auto w-full max-w-4xl">
              <p className="text-[0.8125rem] font-extrabold uppercase tracking-[0.22em] text-white/80">University Wrapped</p>
              <h1 className="mt-4 text-balance text-[clamp(2.8rem,9vw,6.5rem)] font-black uppercase leading-[0.9] tracking-[-0.035em]">Your future isn&apos;t a Google search.</h1>
              <p className="mt-6 max-w-2xl text-[clamp(1.05rem,2.4vw,1.4rem)] font-medium text-white/90">
                It&apos;s a combination of what you&apos;re good at, what you enjoy, what you value, and where you want to go. Let&apos;s find yours.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => setStage("intro2")} className="h-16 rounded-full bg-white px-9 text-[1.05rem] font-black uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.04]">
                  Start my University Wrapped →
                </button>
                {resume && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnswers(resume.answers);
                      setAt(resume.at);
                      setStage("quiz");
                    }}
                    className="h-16 rounded-full border-2 border-white/70 px-7 text-[1rem] font-extrabold uppercase tracking-wide hover:bg-white/10"
                  >
                    Continue where I left off
                  </button>
                )}
              </div>
              <p className="mt-6 text-[0.875rem] text-white/70">No account needed. Your answers stay in this browser.</p>
            </motion.div>
          )}

          {stage === "intro2" && (
            <motion.div key="intro2" {...motionProps} transition={{ duration: 0.4 }} className="mx-auto my-auto w-full max-w-4xl">
              <ul className="grid gap-4 sm:grid-cols-2">
                {[
                  ["~8", "minutes"],
                  ["40-ish", "questions"],
                  ["0", "right answers"],
                  ["100%", "personalised"],
                ].map(([big, small], k) => (
                  <motion.li
                    key={small}
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : 0.1 + k * 0.12 }}
                    className="rounded-3xl bg-white/12 p-6 backdrop-blur-sm"
                  >
                    <p className="text-[clamp(3rem,9vw,5rem)] font-black leading-none">{big}</p>
                    <p className="mt-1 text-[1.2rem] font-extrabold uppercase tracking-wide">{small}</p>
                  </motion.li>
                ))}
              </ul>
              <p className="mt-6 max-w-2xl text-[1.05rem] text-white/85">Tap, slide, pick a side. Go with your gut — you can change any answer later.</p>
              <button
                type="button"
                onClick={() => {
                  setStage("quiz");
                  setAt(steps[0]?.key ?? null);
                }}
                className="mt-8 h-16 rounded-full bg-white px-9 text-[1.05rem] font-black uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.04]"
              >
                Let&apos;s go →
              </button>
            </motion.div>
          )}

          {stage === "quiz" && step?.kind === "chapter" && (
            <motion.div key={step.key} {...motionProps} transition={{ duration: 0.45 }} className="mx-auto my-auto w-full max-w-4xl">
              <ChapterCard chapter={step.chapter} answers={answers} index={chapterIndex} />
              <button type="button" onClick={next} className="mt-10 h-16 rounded-full bg-white px-9 text-[1.05rem] font-black uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.04]" autoFocus>
                {chapterIndex === 0 ? "Let's start" : "Keep going"} →
              </button>
            </motion.div>
          )}

          {stage === "quiz" && step?.kind === "q" && (
            <motion.div key={step.key} {...motionProps} transition={{ duration: 0.35 }} className="my-auto w-full">
              <QuestionCard q={step.q} value={answers[step.q.id]} onAnswer={(v) => answer(step.q.id, v)} onNext={next} />
              {error && <p className="mx-auto mt-4 max-w-3xl rounded-xl bg-black/30 px-4 py-2 text-[0.95rem]">{error}</p>}
            </motion.div>
          )}

          {stage === "crunch" && <Crunch key="crunch" answers={answers} />}
        </AnimatePresence>
      </main>

      {stage === "quiz" && (
        <footer className="flex items-center justify-between gap-3 px-4 pb-5 sm:px-8">
          <button type="button" onClick={() => goTo(idx - 1)} disabled={idx === 0} className="h-11 rounded-full border border-white/40 px-5 text-[0.9rem] font-bold disabled:opacity-0">
            ← Back
          </button>
          <span className="text-[0.8125rem] font-semibold text-white/75" aria-live="polite">
            {answeredCount >= questionsTotal - 3 ? "Almost there…" : chapterIndex >= 0 ? `Chapter ${CHAPTERS[chapterIndex].n} · ${CHAPTERS[chapterIndex].title.toLowerCase()}` : ""}
          </span>
        </footer>
      )}
    </div>
    </Portal>
  );
}

function ChapterCard({ chapter, answers, index }: { chapter: ChapterId; answers: Answers; index: number }) {
  const c = CHAPTERS[index];
  const p = index > 0 ? buildProfile(answers) : null;
  return (
    <div>
      {p && <p className="mb-8 max-w-2xl rounded-2xl bg-black/20 px-5 py-4 text-[clamp(1.05rem,2.4vw,1.35rem)] font-bold backdrop-blur-sm">{nudge(p, index - 1)}</p>}
      <p className="text-[0.875rem] font-extrabold uppercase tracking-[0.24em] text-white/80">Chapter {c.n}</p>
      <h2 className="mt-2 text-[clamp(3rem,11vw,7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em]" data-chapter={chapter}>
        {c.title}
      </h2>
      <p className="mt-5 max-w-2xl text-[clamp(1.15rem,2.6vw,1.6rem)] font-semibold text-white/90">{c.tagline}</p>
    </div>
  );
}

function Crunch({ answers }: { answers: Answers }) {
  const reduced = useReducedMotion();
  const p = buildProfile(answers);
  const lines = [
    `Reading ${p.answered} answers…`,
    "Mapping your interest DNA…",
    "Scoring every course and campus on Edugate…",
    "Checking budgets, subjects and published cut-offs…",
    "Building your Wrapped…",
  ];
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setK((x) => Math.min(lines.length - 1, x + 1)), 520);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <motion.div key="crunch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto my-auto w-full max-w-3xl text-center" role="status">
      <motion.div
        aria-hidden
        className="mx-auto size-24 rounded-full border-[6px] border-white/25 border-t-white"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <p className="mt-8 text-[clamp(1.5rem,4vw,2.4rem)] font-black uppercase leading-tight">{lines[k]}</p>
    </motion.div>
  );
}
