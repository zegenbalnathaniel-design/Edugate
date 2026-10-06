"use client";

import { useEffect, useState } from "react";
import { A_LEVEL_GRADES, A_LEVEL_SUBJECTS, IB_GRADES, IB_SUBJECTS, ibTotal, parseTaken } from "@/lib/wrapped/curricula";
import type { Answer, Question } from "@/lib/wrapped/model";

/*
 * One question per screen. Five interaction styles, rotated by the bank:
 * tap (single), multi-select, slider, this-or-that (versus) and rank.
 * Single and versus advance on tap; the others have a Next button. IB and
 * A-level students also get a subject picker with levels and predicted grades.
 */

const optBase =
  "group relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[1rem] font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:py-4";
const optOff = "border-white/25 bg-white/8 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/14";
const optOn = "border-white bg-white text-[var(--wr-ink)] shadow-[0_8px_30px_rgba(0,0,0,0.25)]";

export function QuestionCard({ q, value, onAnswer, onNext }: { q: Question; value: Answer | undefined; onAnswer: (v: Answer) => void; onNext: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <h2 className="text-balance text-[clamp(1.9rem,5.2vw,3.4rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em]">{q.title}</h2>
      {q.sub && <p className="mt-3 text-[1rem] text-white/75">{q.sub}</p>}
      <div className="mt-8">
        {q.kind === "single" && <Single q={q} value={value as string | undefined} onPick={(id) => { onAnswer(id); setTimeout(onNext, 260); }} />}
        {q.kind === "versus" && <Versus q={q} value={value as string | undefined} onPick={(id) => { onAnswer(id); setTimeout(onNext, 300); }} />}
        {q.kind === "multi" && <Multi q={q} value={(value as string[] | undefined) ?? []} onChange={onAnswer} onNext={onNext} />}
        {q.kind === "rank" && <Rank q={q} value={(value as string[] | undefined) ?? []} onChange={onAnswer} onNext={onNext} />}
        {q.kind === "slider" && <Slider q={q} value={typeof value === "number" ? value : undefined} onChange={onAnswer} onNext={onNext} />}
        {q.kind === "subjects" && <Subjects q={q} value={(value as string[] | undefined) ?? []} onChange={onAnswer} onNext={onNext} />}
      </div>
    </div>
  );
}

function NextButton({ disabled, onClick, label = "Next" }: { disabled?: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-[1rem] font-extrabold uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100"
    >
      {label} <span aria-hidden>→</span>
    </button>
  );
}

function Single({ q, value, onPick }: { q: Extract<Question, { kind: "single" }>; value?: string; onPick: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label={q.title} className="grid gap-3 sm:grid-cols-2">
      {q.options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onPick(o.id)} className={`${optBase} ${value === o.id ? optOn : optOff}`}>
          {o.emoji && <span aria-hidden className="text-[1.5rem]">{o.emoji}</span>}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Versus({ q, value, onPick }: { q: Extract<Question, { kind: "versus" }>; value?: string; onPick: (id: string) => void }) {
  const [a, b] = q.options;
  const card = (o: typeof a) => (
    <button
      key={o.id}
      type="button"
      role="radio"
      aria-checked={value === o.id}
      onClick={() => onPick(o.id)}
      className={`flex min-h-[11rem] flex-1 flex-col items-center justify-center gap-3 rounded-3xl border-2 p-6 text-center transition duration-200 sm:min-h-[15rem] ${value === o.id ? "scale-[1.02] border-white bg-white text-[var(--wr-ink)]" : "border-white/30 bg-white/8 hover:-translate-y-1 hover:border-white/70"}`}
    >
      <span aria-hidden className="text-[2.6rem] sm:text-[3.2rem]">{o.emoji}</span>
      <span className="text-[1.15rem] font-extrabold leading-tight sm:text-[1.35rem]">{o.label}</span>
      {o.hint && <span className={`text-[0.875rem] ${value === o.id ? "opacity-70" : "text-white/65"}`}>{o.hint}</span>}
    </button>
  );
  return (
    <div role="radiogroup" aria-label={q.title} className="relative flex flex-col gap-3 sm:flex-row sm:gap-4">
      {card(a)}
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--wr-ink)] text-[0.9rem] font-black text-white ring-4 ring-white/80">
        VS
      </span>
      {card(b)}
    </div>
  );
}

function Multi({ q, value, onChange, onNext }: { q: Extract<Question, { kind: "multi" }>; value: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const max = q.max ?? q.options.length;
  const min = q.min ?? 1;
  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else if (value.length < max) onChange([...value, id]);
  };
  return (
    <div>
      <div role="group" aria-label={q.title} className="flex flex-wrap gap-2 sm:gap-2.5">
        {q.options.map((o) => {
          const on = value.includes(o.id);
          const full = !on && value.length >= max;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={full}
              onClick={() => toggle(o.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[0.9rem] font-semibold transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[0.98rem] ${on ? "border-white bg-white text-[var(--wr-ink)]" : "border-white/30 bg-white/8 hover:border-white/70"} ${full ? "opacity-40" : ""}`}
            >
              {o.emoji && <span aria-hidden>{o.emoji}</span>}
              {o.label}
              {on && <span aria-hidden>✓</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[0.875rem] text-white/65" aria-live="polite">
        {q.max ? `${value.length}/${max} picked` : value.length ? `${value.length} picked` : "Pick as many as you like"}
        {min === 0 && value.length === 0 ? " — or skip" : ""}
      </p>
      <NextButton disabled={value.length < min} onClick={onNext} label={min === 0 && value.length === 0 ? "Skip" : "Next"} />
    </div>
  );
}

function Rank({ q, value, onChange, onNext }: { q: Extract<Question, { kind: "rank" }>; value: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const tap = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else if (value.length < q.pick) onChange([...value, id]);
  };
  return (
    <div>
      <div role="group" aria-label={q.title} className="grid gap-2.5 sm:grid-cols-2">
        {q.options.map((o) => {
          const i = value.indexOf(o.id);
          return (
            <button key={o.id} type="button" aria-pressed={i >= 0} onClick={() => tap(o.id)} className={`${optBase} ${i >= 0 ? optOn : optOff}`}>
              <span
                aria-hidden
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-black ${i >= 0 ? "bg-[var(--wr-ink)] text-white" : "border border-white/40 text-white/60"}`}
              >
                {i >= 0 ? i + 1 : o.emoji}
              </span>
              <span>{o.label}</span>
              {i >= 0 && <span className="sr-only">ranked {i + 1}</span>}
            </button>
          );
        })}
      </div>
      <NextButton disabled={value.length < q.pick} onClick={onNext} label={value.length < q.pick ? `Pick ${q.pick - value.length} more` : "Next"} />
    </div>
  );
}

function Slider({ q, value, onChange, onNext }: { q: Extract<Question, { kind: "slider" }>; value?: number; onChange: (v: number) => void; onNext: () => void }) {
  const [v, setV] = useState(value ?? 5);
  useEffect(() => setV(value ?? 5), [q.id, value]);
  const set = (n: number) => {
    setV(n);
    onChange(n);
  };
  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="flex flex-col items-start gap-1 text-[0.9rem] text-white/75">
          <span aria-hidden className="text-[2.4rem]">{q.lowEmoji}</span>
          {q.low}
        </span>
        <span className="text-[clamp(4rem,12vw,6.5rem)] font-black leading-none tabular-nums" aria-hidden>
          {v}
        </span>
        <span className="flex flex-col items-end gap-1 text-[0.9rem] text-white/75">
          <span aria-hidden className="text-[2.4rem]">{q.highEmoji}</span>
          {q.high}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        aria-label={q.title}
        aria-valuetext={`${v} out of 10`}
        className="wr-range mt-6 w-full"
      />
      <div className="mt-2 flex justify-between text-[0.75rem] text-white/50" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <NextButton
        onClick={() => {
          if (value === undefined) onChange(v);
          onNext();
        }}
      />
    </div>
  );
}

/*
 * IB / A-level subjects: tap to add, set HL/SL, tap a predicted grade.
 * Stored as "Physics|HL|6" entries plus "CORE|2" for IB core points.
 */
function Subjects({ q, value, onChange, onNext }: { q: Extract<Question, { kind: "subjects" }>; value: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const ib = q.scheme === "IB";
  const catalogue = ib ? IB_SUBJECTS : A_LEVEL_SUBJECTS;
  const grades: readonly string[] = ib ? IB_GRADES : A_LEVEL_GRADES;
  const { subjects, core } = parseTaken(value);
  const [custom, setCustom] = useState("");
  const write = (next: typeof subjects, c: number | null) =>
    onChange([...next.map((x) => [x.name, x.level ?? "", x.grade ?? ""].join("|")), ...(ib && c != null ? [`CORE|${c}`] : [])]);
  const add = (name: string) => {
    const n = name.replace(/\|/g, " ").trim().slice(0, 80);
    if (!n || subjects.some((x) => x.name.toLowerCase() === n.toLowerCase())) return;
    const hl = subjects.filter((x) => x.level === "HL").length;
    write([...subjects, { name: n, level: ib ? (hl < 3 ? "HL" : "SL") : null, grade: null }], core);
  };
  const patch = (i: number, p: Partial<(typeof subjects)[number]>) => write(subjects.map((x, j) => (j === i ? { ...x, ...p } : x)), core);
  const remove = (i: number) => write(subjects.filter((_, j) => j !== i), core);
  const picked = new Set(subjects.map((x) => x.name));
  const total = ib ? ibTotal(subjects, core) : null;
  const graded = subjects.filter((x) => x.grade).length;
  const target = ib ? 6 : 3;
  const ready = subjects.length >= 3 && graded === subjects.length;
  const short = (name: string) => catalogue.find((x) => x.name === name)?.short ?? name;

  return (
    <div>
      {subjects.length > 0 && (
        <ul className="mb-6 grid gap-2.5" aria-label="Your subjects">
          {subjects.map((x, i) => (
            <li key={x.name} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/25 bg-white/8 px-3.5 py-3 sm:px-4">
              <span className="min-w-0 flex-1 basis-40 font-bold leading-tight" title={x.name}>
                {short(x.name)}
              </span>
              {ib && (
                <span role="radiogroup" aria-label={`${x.name} level`} className="flex overflow-hidden rounded-full border border-white/35 text-[0.8rem] font-extrabold">
                  {(["HL", "SL"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      role="radio"
                      aria-checked={x.level === l}
                      onClick={() => patch(i, { level: l })}
                      className={`px-3 py-1.5 transition ${x.level === l ? "bg-white text-[var(--wr-ink)]" : "text-white/75 hover:bg-white/10"}`}
                    >
                      {l}
                    </button>
                  ))}
                </span>
              )}
              <span role="radiogroup" aria-label={`${x.name} predicted grade`} className="flex flex-wrap gap-1">
                {grades.map((g) => (
                  <button
                    key={g}
                    type="button"
                    role="radio"
                    aria-checked={x.grade === g}
                    onClick={() => patch(i, { grade: g })}
                    className={`flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-[0.85rem] font-extrabold tabular-nums transition ${x.grade === g ? "bg-white text-[var(--wr-ink)] scale-110" : "border border-white/30 text-white/80 hover:border-white/70"}`}
                  >
                    {g}
                  </button>
                ))}
              </span>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${x.name}`} className="flex size-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {ib && subjects.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[0.9rem] font-semibold text-white/80">TOK + EE core points</span>
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={core === n}
              onClick={() => write(subjects, n)}
              className={`flex size-8 items-center justify-center rounded-full text-[0.85rem] font-extrabold transition ${core === n ? "bg-white text-[var(--wr-ink)]" : "border border-white/30 text-white/80 hover:border-white/70"}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2.5 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-white/60">{subjects.length ? "Add another" : "Tap your subjects"}</p>
      <div role="group" aria-label="Subjects" className="flex flex-wrap gap-2">
        {catalogue
          .filter((c) => !picked.has(c.name))
          .map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => add(c.name)}
              title={c.name}
              className="rounded-full border border-white/30 bg-white/8 px-3 py-1.5 text-[0.88rem] font-semibold transition hover:border-white/70 hover:bg-white/14"
            >
              + {c.short}
            </button>
          ))}
      </div>
      <form
        className="mt-3 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add(custom);
          setCustom("");
        }}
      >
        <label className="sr-only" htmlFor={`${q.id}-other`}>
          Another subject
        </label>
        <input
          id={`${q.id}-other`}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={80}
          placeholder="Not listed? Type it"
          className="h-10 min-w-0 flex-1 rounded-full border border-white/30 bg-white/8 px-4 text-[0.95rem] text-white placeholder:text-white/45 focus:border-white focus:outline-none"
        />
        <button type="submit" disabled={!custom.trim()} className="h-10 rounded-full border border-white/50 px-4 text-[0.9rem] font-bold transition hover:bg-white/15 disabled:opacity-40">
          Add
        </button>
      </form>

      <p className="mt-5 text-[0.9rem] text-white/75" aria-live="polite">
        {subjects.length < 3
          ? `Add at least ${3 - subjects.length} more subject${3 - subjects.length === 1 ? "" : "s"}.`
          : graded < subjects.length
            ? `Give each subject a predicted grade (${subjects.length - graded} to go).`
            : ib && total != null
              ? <>Predicted total: <strong className="text-[1.15rem] text-white tabular-nums">{total}/45</strong></>
              : subjects.length < target
                ? `${subjects.length} subjects — most IB students take ${target}.`
                : `${subjects.length} subjects, all graded.`}
      </p>
      <NextButton disabled={!ready} onClick={onNext} />
    </div>
  );
}
