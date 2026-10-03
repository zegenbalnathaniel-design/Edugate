"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { saveArchitectProject } from "@/lib/architect/actions";
import {
  COVERAGE_KEYS,
  COVERAGE_LABELS,
  ORIENTATIONS,
  type BlueprintCore,
  type BlueprintExtended,
  type Concept,
  type Ideation,
  type InterviewTurn,
  type Orientation,
  type Research,
  type SavedProject,
  type TranscriptEntry,
} from "@/lib/architect/schemas";
import { inputCls, primaryBtnCls, secondaryBtnCls } from "@/components/forms/styles";
import { BlueprintView } from "./BlueprintView";
import { ConceptBoard } from "./ConceptBoard";
import { DownloadMarkdown } from "./DownloadMarkdown";

/*
 * Client side of the Architect: orientation → adaptive interview → concepts
 * & fit matrix → research → blueprint. Every expensive result is kept in
 * localStorage so a reload or a dropped connection never throws work away.
 */

type Stage = "orient" | "interview" | "ideas" | "building" | "done";

type State = {
  stage: Stage;
  orientation: Orientation;
  opening: string;
  transcript: TranscriptEntry[];
  turn: InterviewTurn | null;
  ideation: Ideation | null;
  rejected: string[];
  selected: string[];
  research: Research | null;
  core: BlueprintCore | null;
  extended: BlueprintExtended | null;
  savedId: string | null;
};

const INITIAL: State = {
  stage: "orient",
  orientation: "interests",
  opening: "",
  transcript: [],
  turn: null,
  ideation: null,
  rejected: [],
  selected: [],
  research: null,
  core: null,
  extended: null,
  savedId: null,
};

const DRAFT_KEY = "edugate.architect.v1";

async function post<T>(step: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/architect/${step}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong. Please try again.");
  return data as T;
}

export function ArchitectFlow({ allowance }: { allowance: { used: number; total: number } }) {
  const [s, setS] = useState<State>(INITIAL);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Restore a draft once, after mount (localStorage isn't available on the server).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setS({ ...INITIAL, ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* private mode or corrupt draft — start fresh */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(s));
    } catch {
      /* storage full or blocked — the flow still works, it just won't survive a reload */
    }
  }, [s, restored]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [s.stage]);

  const update = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));

  const discovery = (st: State = s) => ({ orientation: st.orientation, opening: st.opening, transcript: st.transcript });

  async function step<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    setBusy(label);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function nextQuestions(st: State) {
    const turn = await step("Thinking about what to ask next…", () => post<InterviewTurn>("interview", discovery(st)));
    if (turn) setS({ ...st, stage: "interview", turn });
  }

  async function ideate(st: State, feedback = "") {
    const ideation = await step("Building your profile and project concepts — this takes a minute or two…", () =>
      post<Ideation>("ideate", { ...discovery(st), feedback, rejectedTitles: st.rejected }),
    );
    if (ideation) setS({ ...st, stage: "ideas", ideation, selected: [], research: null, core: null, extended: null, savedId: null });
  }

  async function build(st: State) {
    const ideation = st.ideation!;
    const concepts = ideation.concepts.filter((c) => st.selected.includes(c.id));
    let cur: State = { ...st, stage: "building" };
    setS(cur);
    setBusy("Researching");
    setError(null);
    try {
      const research = cur.research ?? (await post<Research>("research", { concepts, profile: ideation.profile }));
      cur = { ...cur, research };
      setS(cur);
      const base = { ...discovery(cur), concepts, profile: ideation.profile, research };
      // The two halves are independent, so they're written in parallel; each
      // result is kept as it lands, so a retry only redoes what failed.
      const [core, extended] = await Promise.allSettled([
        cur.core ? Promise.resolve(cur.core) : post<BlueprintCore>("blueprint", { ...base, part: "core" }).then((v) => (setS((p) => ({ ...p, core: v })), v)),
        cur.extended
          ? Promise.resolve(cur.extended)
          : post<BlueprintExtended>("blueprint", { ...base, part: "extended" }).then((v) => (setS((p) => ({ ...p, extended: v })), v)),
      ]);
      const failed = [core, extended].find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      if (failed) throw failed.reason;
      setS((p) => ({ ...p, stage: "done" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const project: SavedProject | null = useMemo(() => {
    if (!s.ideation || !s.research || !s.core || !s.extended) return null;
    return {
      title: s.core.title,
      profile: s.ideation.profile,
      concepts: s.ideation.concepts.filter((c) => s.selected.includes(c.id)),
      research: s.research,
      core: s.core,
      extended: s.extended,
    };
  }, [s]);

  async function save() {
    if (!project) return;
    const res = await step("Saving…", () => saveArchitectProject(project));
    if (res?.error) setError(res.error);
    else if (res?.id) update({ savedId: res.id });
  }

  function restart() {
    if (s.stage !== "orient" && !confirm("Start over? Your current answers and results will be cleared.")) return;
    setS(INITIAL);
    setError(null);
  }

  if (!restored) return <div className="h-64" aria-hidden />;

  return (
    <div ref={topRef} className="scroll-mt-28">
      <Stepper stage={s.stage} />

      {error && (
        <div role="alert" className="mb-6 rounded-[var(--radius-md)] border border-attention/50 bg-attention/10 px-4 py-3 text-[0.9375rem]">
          {error}
          {s.stage === "building" && !busy && (
            <button onClick={() => build(s)} className="ml-3 underline underline-offset-2">
              Retry
            </button>
          )}
        </div>
      )}

      {busy && s.stage !== "building" && <Busy label={busy} />}

      {s.stage === "orient" && !busy && (
        <Orient
          state={s}
          onChange={update}
          onStart={() => nextQuestions({ ...s, transcript: [] })}
          allowance={allowance}
        />
      )}

      {s.stage === "interview" && s.turn && !busy && (
        <Interview
          key={s.transcript.length}
          turn={s.turn}
          answered={s.transcript.length}
          onSubmit={(answers, finish) => {
            const st = { ...s, transcript: [...s.transcript, ...answers] };
            setS(st);
            if (finish || st.transcript.length >= 18) ideate(st);
            else nextQuestions(st);
          }}
          onFinish={() => ideate(s)}
        />
      )}

      {s.stage === "ideas" && s.ideation && !busy && (
        <ConceptBoard
          ideation={s.ideation}
          selected={s.selected}
          onSelect={(selected) => update({ selected })}
          onBuild={() => build(s)}
          onNewRound={(feedback, rejectAll) => {
            const st = rejectAll ? { ...s, rejected: [...s.rejected, ...s.ideation!.concepts.map((c) => c.title)] } : s;
            ideate(st, feedback);
          }}
          onMoreDiscovery={() => nextQuestions(s)}
        />
      )}

      {s.stage === "building" && (
        <Building
          concepts={s.ideation?.concepts.filter((c) => s.selected.includes(c.id)) ?? []}
          research={s.research}
          core={Boolean(s.core)}
          extended={Boolean(s.extended)}
          running={Boolean(busy)}
          onBack={() => update({ stage: "ideas" })}
        />
      )}

      {s.stage === "done" && project && (
        <div className="space-y-8">
          <div className="glass flex flex-wrap items-center gap-3 p-4">
            {s.savedId ? (
              <Link href={`/passion-projector/architect/${s.savedId}`} className={secondaryBtnCls}>
                ✓ Saved — open saved copy
              </Link>
            ) : (
              <button onClick={save} disabled={Boolean(busy)} className={primaryBtnCls}>
                Save to my account
              </button>
            )}
            <DownloadMarkdown project={project} />
            <button onClick={() => update({ stage: "ideas", research: null, core: null, extended: null, savedId: null })} className={secondaryBtnCls}>
              Back to concepts
            </button>
            <button onClick={restart} className="ml-auto text-[0.875rem] text-paper/55 hover:text-paper">
              Start over
            </button>
          </div>
          <BlueprintView project={project} />
        </div>
      )}

      {s.stage !== "orient" && s.stage !== "done" && !busy && (
        <p className="mt-10 text-center">
          <button onClick={restart} className="text-[0.8125rem] text-paper/45 hover:text-paper">
            Start over
          </button>
        </p>
      )}
    </div>
  );
}

/* ------------------------------ stages ------------------------------ */

const STAGES: [Stage, string][] = [
  ["orient", "Start"],
  ["interview", "Discovery"],
  ["ideas", "Concepts"],
  ["building", "Research & blueprint"],
  ["done", "Your blueprint"],
];

function Stepper({ stage }: { stage: Stage }) {
  const at = STAGES.findIndex(([k]) => k === stage);
  return (
    <ol className="mb-8 flex flex-wrap gap-x-5 gap-y-2" aria-label="Progress">
      {STAGES.map(([k, label], i) => (
        <li key={k} aria-current={i === at ? "step" : undefined} className={`meta ${i === at ? "text-electric" : i < at ? "text-paper/70" : "text-paper/35"}`}>
          {i < at ? "✓ " : `${i + 1}. `}
          {label}
        </li>
      ))}
    </ol>
  );
}

function Busy({ label }: { label: string }) {
  return (
    <div className="glass flex items-center gap-4 p-6" role="status" aria-live="polite">
      <span className="size-3 animate-pulse rounded-full bg-electric" aria-hidden />
      <p className="text-[0.9375rem] text-paper/80">{label}</p>
    </div>
  );
}

function Orient({
  state,
  onChange,
  onStart,
  allowance,
}: {
  state: State;
  onChange: (p: Partial<State>) => void;
  onStart: () => void;
  allowance: { used: number; total: number };
}) {
  const prompt: Record<Orientation, string> = {
    idea: "Describe the idea in a few sentences — what it is and why you want to do it.",
    interests: "What are you into? Subjects, hobbies, things you read or watch, problems you keep noticing.",
    open: "Anything at all — what you enjoy, what annoys you, what you're good at. A sentence is fine.",
    improve: "What's the project, how far have you got, and what isn't working?",
  };
  return (
    <div className="glass p-6 sm:p-8">
      <h2 className="font-display text-[1.5rem]">Where are you starting from?</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Starting point">
        {(Object.keys(ORIENTATIONS) as Orientation[]).map((k) => (
          <button
            key={k}
            role="radio"
            aria-checked={state.orientation === k}
            onClick={() => onChange({ orientation: k })}
            className={`rounded-[var(--radius-lg)] border px-4 py-3.5 text-left text-[0.9375rem] transition-colors ${
              state.orientation === k ? "border-electric bg-electric/25 text-paper ring-1 ring-electric" : "border-paper/15 bg-navy-800 text-paper/85 hover:border-paper/40"
            }`}
          >
            {state.orientation === k && <span aria-hidden>✓ </span>}
            {ORIENTATIONS[k]}
          </button>
        ))}
      </div>
      <label className="mt-6 block">
        <span className="meta mb-1.5 block text-paper/60">{prompt[state.orientation]}</span>
        <textarea
          value={state.opening}
          onChange={(e) => onChange({ opening: e.target.value.slice(0, 2000) })}
          rows={4}
          className={inputCls}
        />
      </label>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button onClick={onStart} disabled={state.orientation !== "open" && state.opening.trim().length < 3} className={primaryBtnCls}>
          Begin the interview
        </button>
        <p className="text-[0.8125rem] text-paper/50">
          Usually 3–5 short rounds. Today&apos;s allowance: {Math.max(0, allowance.total - allowance.used)} of {allowance.total} units left (a full blueprint uses about 20–25).
        </p>
      </div>
    </div>
  );
}

function Interview({
  turn,
  answered,
  onSubmit,
  onFinish,
}: {
  turn: InterviewTurn;
  answered: number;
  onSubmit: (answers: TranscriptEntry[], finish: boolean) => void;
  onFinish: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const toggle = (id: string, option: string) => {
    const cur = (answers[id] ?? "").split(" · ").filter(Boolean);
    const next = cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option];
    setAnswers({ ...answers, [id]: next.join(" · ") });
  };
  // Open questions keep their text under the question id; choice questions
  // keep picked options there and any typed detail under "<id>:note".
  const noteKey = (q: InterviewTurn["questions"][number]) => (q.kind === "open" ? q.id : `${q.id}:note`);
  const answerFor = (q: InterviewTurn["questions"][number]) =>
    [answers[q.id], q.kind === "open" ? "" : answers[`${q.id}:note`]]
      .map((v) => (v ?? "").trim())
      .filter(Boolean)
      .join(" — ")
      .slice(0, 2000);
  const anyAnswered = turn.questions.some((q) => answerFor(q));

  return (
    <div className="space-y-6">
      {turn.reflection && <p className="border-l-2 border-cyan/60 pl-4 text-[0.9375rem] italic text-paper/75">{turn.reflection}</p>}

      <div className="flex flex-wrap gap-2" aria-label="What the Architect knows so far">
        {COVERAGE_KEYS.map((k) => (
          <span
            key={k}
            className={`rounded-full border px-2.5 py-1 text-[0.75rem] ${
              turn.coverage[k] === "good" ? "border-verified/50 text-verified" : turn.coverage[k] === "partial" ? "border-pending/45 text-pending" : "border-paper/15 text-paper/40"
            }`}
          >
            {turn.coverage[k] === "good" ? "●" : turn.coverage[k] === "partial" ? "◐" : "○"} {COVERAGE_LABELS[k]}
          </span>
        ))}
      </div>

      {turn.questions.map((q, i) => (
        <fieldset key={q.id} className="glass p-5 sm:p-6">
          <legend className="sr-only">Question {answered + i + 1}</legend>
          <p className="meta text-paper/40">Question {answered + i + 1}</p>
          <p className="mt-2 font-display text-[1.25rem] leading-snug">{q.text}</p>
          <p className="mt-1 text-[0.8125rem] text-paper/50">{q.why}</p>
          {q.kind !== "open" && q.options.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {q.options.map((o) => {
                const on = q.kind === "single" ? answers[q.id] === o : (answers[q.id] ?? "").split(" · ").includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => (q.kind === "single" ? setAnswers({ ...answers, [q.id]: o }) : toggle(q.id, o))}
                    className={`rounded-[var(--radius-lg)] border px-4 py-2.5 text-left text-[0.9375rem] transition-colors ${
                      on ? "border-electric bg-electric/25 text-paper ring-1 ring-electric" : "border-paper/15 bg-navy-800 text-paper hover:border-electric/70 hover:bg-navy-700"
                    }`}
                  >
                    {on && <span aria-hidden>✓ </span>}
                    {o}
                  </button>
                );
              })}
            </div>
          )}
          <textarea
            aria-label={q.kind === "open" ? "Your answer" : "Add detail or write your own answer"}
            placeholder={q.kind === "open" ? "Your answer" : "Or write your own / add detail"}
            value={answers[noteKey(q)] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [noteKey(q)]: e.target.value })}
            rows={q.kind === "open" ? 3 : 2}
            className={`${inputCls} mt-4`}
          />
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onSubmit(turn.questions.map((q) => ({ question: q.text.slice(0, 600), answer: answerFor(q) })), turn.readyForConcepts)}
          disabled={!anyAnswered}
          className={primaryBtnCls}
        >
          {turn.readyForConcepts ? "Answer & see project concepts" : "Next questions"}
        </button>
        {answered > 0 && !turn.readyForConcepts && (
          <button onClick={onFinish} className={secondaryBtnCls}>
            Skip ahead to concepts
          </button>
        )}
        <p className="text-[0.8125rem] text-paper/45">Skip any question you don&apos;t want to answer.</p>
      </div>
    </div>
  );
}

function Building({
  concepts,
  research,
  core,
  extended,
  running,
  onBack,
}: {
  concepts: Concept[];
  research: Research | null;
  core: boolean;
  extended: boolean;
  running: boolean;
  onBack: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const rows: [string, boolean, string][] = [
    ["Checking facts with live web search", Boolean(research), research && !research.available ? "Search unavailable — nothing will be marked verified" : ""],
    ["Writing thesis, plan, roadmap and 12-week schedule", core, ""],
    ["Writing proposal, costs, team, impact and risks", extended, ""],
  ];
  return (
    <div className="glass p-6 sm:p-8" role="status" aria-live="polite">
      <p className="meta text-cyan">{concepts.length > 1 ? "Combining" : "Building"}</p>
      <h2 className="mt-1 font-display text-[1.5rem]">{concepts.map((c) => c.title).join(" + ")}</h2>
      <ul className="mt-6 space-y-3">
        {rows.map(([label, done, note]) => (
          <li key={label} className="flex items-start gap-3 text-[0.9375rem]">
            <span className={done ? "text-verified" : running ? "animate-pulse text-electric" : "text-paper/40"} aria-hidden>
              {done ? "✓" : "●"}
            </span>
            <span>
              {label}
              {note && <span className="block text-[0.8125rem] text-pending">{note}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[0.8125rem] text-paper/50">
        {running ? `Working · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} — a full blueprint usually takes 2–4 minutes. You can leave this tab open.` : ""}
      </p>
      {!running && (
        <button onClick={onBack} className={`${secondaryBtnCls} mt-4`}>
          Back to concepts
        </button>
      )}
    </div>
  );
}
