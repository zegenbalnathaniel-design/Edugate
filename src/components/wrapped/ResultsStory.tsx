"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { buildMyList, saveWrappedToProfile } from "@/app/wrapped/actions";
import { RIASEC_LABEL, type Answers } from "@/lib/wrapped/model";
import { BUCKET, lakh, type Bucket, type UniCard, type WrappedResult } from "@/lib/wrapped/match";

/*
 * The "Wrapped" itself: one big idea per full-screen card, in story order —
 * type → interest DNA → courses → careers → campus → money → countries →
 * university list → next move. Tap Next / arrow keys to advance.
 */

const GRADIENTS = [
  "linear-gradient(135deg,#0f262b 0%,#45a39a 100%)",
  "linear-gradient(150deg,#b0532b 0%,#f2bf2a 100%)",
  "linear-gradient(140deg,#163239 0%,#7fcfc4 100%)",
  "linear-gradient(135deg,#2b1310 0%,#b3221c 100%)",
  "linear-gradient(160deg,#1f434b 0%,#dcb574 100%)",
  "linear-gradient(135deg,#b3221c 0%,#cf7a45 100%)",
  "linear-gradient(145deg,#0b1d21 0%,#2c5760 100%)",
  "linear-gradient(140deg,#45a39a 0%,#f2bf2a 100%)",
  "linear-gradient(135deg,#0f262b 0%,#5f7f8c 100%)",
  "linear-gradient(150deg,#2b1310 0%,#f2bf2a 100%)",
];

export function ResultsStory({ r, answers, shareUrl, onEdit, onRestart }: { r: WrappedResult; answers: Answers; shareUrl: string; onEdit: () => void; onRestart: () => void }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const cards = buildCards(r, answers, shareUrl, onEdit, onRestart);
  const n = cards.length;
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d))), [n]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);
  useEffect(() => {
    document.getElementById("wr-scroll")?.scrollTo({ top: 0 });
  }, [i]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col text-white transition-[background] duration-700" style={{ background: GRADIENTS[i % GRADIENTS.length], ["--wr-ink" as string]: "#0b1d21" }}>
      <div className="flex gap-1.5 px-4 pt-4 sm:px-8" aria-hidden>
        {cards.map((_, k) => (
          <span key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <span className="block h-full rounded-full bg-white transition-[width] duration-500" style={{ width: k <= i ? "100%" : "0%" }} />
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-3 sm:px-8">
        <span className="text-[0.8125rem] font-extrabold uppercase tracking-[0.2em]">Edugate · Wrapped</span>
        <Link href="/" className="text-[0.8125rem] text-white/75 hover:text-white">
          Exit ✕
        </Link>
      </div>
      <div id="wr-scroll" className="relative flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-8" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.section
            key={i}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center"
            aria-label={`Result ${i + 1} of ${n}`}
          >
            {cards[i]}
          </motion.section>
        </AnimatePresence>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-between gap-3 bg-gradient-to-t from-black/35 to-transparent px-4 pb-5 pt-10 sm:px-8">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} className="pointer-events-auto h-12 rounded-full border border-white/40 px-5 text-[0.95rem] font-bold disabled:opacity-0">
          ← Back
        </button>
        {i < n - 1 && (
          <button type="button" onClick={() => go(1)} className="pointer-events-auto h-12 rounded-full bg-white px-7 text-[0.95rem] font-extrabold uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.04]">
            {i === 0 ? "Show me" : "Next"} →
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- pieces ---------------------------------- */

const Kicker = ({ children }: { children: ReactNode }) => <p className="text-[0.8125rem] font-extrabold uppercase tracking-[0.22em] text-white/80">{children}</p>;
const Big = ({ children }: { children: ReactNode }) => <h2 className="mt-3 text-balance text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]">{children}</h2>;
const Line = ({ children }: { children: ReactNode }) => <p className="mt-5 max-w-2xl text-[clamp(1.05rem,2.2vw,1.35rem)] font-medium leading-snug text-white/90">{children}</p>;

function Bar({ label, pct, delay = 0, sub }: { label: string; pct: number; delay?: number; sub?: string }) {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[1.05rem] font-bold">
          {label} {sub && <span className="text-[0.8rem] font-medium text-white/60">{sub}</span>}
        </span>
        <span className="text-[1.4rem] font-black tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: reduced ? `${pct}%` : 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function UniversityCard({ c }: { c: UniCard }) {
  const b = BUCKET[c.bucket];
  return (
    <article className="rounded-3xl bg-white p-5 text-[var(--wr-ink)] shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.18em] opacity-60">
            {c.flag} {c.city}, {c.country}
          </p>
          <h4 className="mt-1 text-[1.35rem] font-black leading-tight">{c.name}</h4>
          <p className="mt-0.5 text-[0.95rem] font-semibold opacity-75">{c.program.name}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[2.2rem] font-black leading-none tabular-nums">{c.fit}%</p>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] opacity-60">fit</p>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1.5 text-[0.875rem] sm:grid-cols-3">
        {c.dims
          .filter((d) => d.key !== "admissions")
          .map((d) => (
            <li key={d.key} className="flex justify-between gap-2 border-b border-black/8 py-1">
              <span className="opacity-70">{d.label}</span>
              <strong className="tabular-nums">{d.pct}%</strong>
            </li>
          ))}
        <li className="flex justify-between gap-2 border-b border-black/8 py-1">
          <span className="opacity-70">Admission</span>
          <strong>
            {b.emoji} {c.bucket === "open" ? "Odds unpublished" : b.label}
          </strong>
        </li>
      </ul>
      {c.costInr != null && (
        <p className="mt-3 text-[0.875rem]">
          <span className="opacity-70">About</span> <strong>{lakh(c.costInr)}</strong> <span className="opacity-70">a year{c.costIncludesLiving ? " incl. published living costs" : " in tuition"}</span>
        </p>
      )}
      {c.why.length > 0 && (
        <div className="mt-3">
          <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.16em] text-[#2fa36b]">Why you match</p>
          <ul className="mt-1 space-y-0.5 text-[0.9rem]">
            {c.why.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
      {c.watch.length > 0 && (
        <div className="mt-3">
          <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.16em] text-[#b3221c]">Watch out</p>
          <ul className="mt-1 space-y-0.5 text-[0.9rem]">
            {c.watch.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2 text-[0.8125rem] font-extrabold uppercase tracking-wide">
        <Link href={`/universities/${c.slug}`} className="rounded-full bg-[var(--wr-ink)] px-4 py-2 text-white hover:opacity-90">
          View university →
        </Link>
        <Link href={`/universities/${c.slug}/programs/${c.program.slug}`} className="rounded-full border border-black/25 px-4 py-2 hover:border-black/60">
          See course →
        </Link>
        <Link href={`/compare/programs?p=${c.slug}/${c.program.slug}`} className="rounded-full border border-black/25 px-4 py-2 hover:border-black/60">
          Compare →
        </Link>
      </div>
    </article>
  );
}

/* --------------------------------- cards ----------------------------------- */

const MEDALS = ["🥇", "🥈", "🥉", "4.", "5."];
const ORDER: (Bucket | "value")[] = ["dream", "reach", "target", "safety", "value", "open"];

function picksFor(r: WrappedResult) {
  const L = r.lists;
  const order = [...L.dream.slice(0, 2), ...L.reach.slice(0, 1), ...L.target.slice(0, 4), ...L.safety.slice(0, 2), ...L.value.slice(0, 2), ...L.open.slice(0, 4)];
  const seen = new Set<string>();
  return order.filter((c) => !seen.has(c.slug) && seen.add(c.slug)).slice(0, 15).map((c) => ({ university: c.slug, program: c.program.slug }));
}

function buildCards(r: WrappedResult, answers: Answers, shareUrl: string, onEdit: () => void, onRestart: () => void): ReactNode[] {
  const year = new Date().getFullYear();
  const total = Object.values(r.lists).reduce((a, l) => a + l.length, 0);
  const setAside = r.filtered.budget + r.filtered.location + r.filtered.eligibility + r.filtered.gender;
  const L = r.lists;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "My University Wrapped", text: `I'm ${r.type.name.toLowerCase()} — here's my University Wrapped on Edugate.`, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied — anyone with it sees your Wrapped. Nothing is stored on our side.");
      }
    } catch {
      /* share sheet dismissed */
    }
  };
  const picks = picksFor(r);
  const back = shareUrl.replace(/^https?:\/\/[^/]+/, "");

  return [
    <div key="intro">
      <Kicker>Your {year}</Kicker>
      <Big>University Wrapped</Big>
      <Line>
        You answered <strong className="font-black">{r.answered} questions</strong>. We weighed them against <strong className="font-black">{r.considered} institutions</strong> on Edugate.
      </Line>
      <Line>Here&apos;s what we discovered.</Line>
    </div>,

    <div key="type">
      <Kicker>Your core type</Kicker>
      <p className="mt-6 text-[1.4rem] font-bold">You&apos;re</p>
      <Big>{r.type.name.replace(/^THE /, "")}</Big>
      <Line>{r.type.blurb}</Line>
      <p className="mt-6 max-w-xl text-[0.875rem] text-white/70">A memorable summary of today&apos;s answers — not a diagnosis. People change; so will this.</p>
    </div>,

    <div key="dna">
      <Kicker>Your interest DNA</Kicker>
      <div className="mt-6 space-y-4">
        {r.dna.map((d, k) => (
          <Bar key={d.key} label={d.label} sub={RIASEC_LABEL[d.key]} pct={d.pct} delay={k * 0.12} />
        ))}
      </div>
      <Line>{r.dnaLine}</Line>
    </div>,

    <div key="courses">
      <Kicker>Your course match</Kicker>
      <Big>Best-fit degrees</Big>
      <ol className="mt-6 space-y-3">
        {r.courses.map((c, k) => (
          <li key={c.key} className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[clamp(1.15rem,2.6vw,1.5rem)] font-black">
                <span aria-hidden className="mr-2">{MEDALS[k]}</span>
                {c.emoji} {c.label}
              </span>
              <span className="text-[1.5rem] font-black tabular-nums">{c.pct}%</span>
            </div>
            <p className="mt-1 text-[0.95rem] text-white/85">{c.reason}</p>
            {c.note && <p className="mt-1 text-[0.85rem] font-semibold text-[#ffe08a]">⚠ {c.note}</p>}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[0.8125rem] text-white/65">Match % ranks fields against each other on your answers.</p>
    </div>,

    <div key="careers">
      <Kicker>Your career universe</Kicker>
      <Line>{r.careerLine}</Line>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {r.careers.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-3 rounded-2xl bg-white/12 px-4 py-3">
            <span className="text-[1.15rem] font-extrabold">
              <span aria-hidden className="mr-2 text-[1.4rem]">{c.emoji}</span>
              {c.label}
            </span>
            <span className="text-[0.75rem] font-extrabold uppercase tracking-wide text-white/75">{c.pct >= 70 ? "Strong potential fit" : "Worth exploring"}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.8125rem] text-white/65">Potential, not prophecy — careers are built, not assigned.</p>
    </div>,

    <div key="campus">
      <Kicker>Your university DNA</Kicker>
      <Big>Your ideal campus</Big>
      <ul className="mt-6 flex flex-wrap gap-2.5">
        {r.campus.chips.map((c) => (
          <li key={c.label} className="rounded-full bg-white px-4 py-2 text-[1.05rem] font-extrabold text-[var(--wr-ink)]">
            <span aria-hidden>{c.emoji}</span> {c.label}
          </li>
        ))}
      </ul>
      <Line>{r.campus.avoid}</Line>
    </div>,

    <div key="money">
      <Kicker>Your money profile</Kicker>
      <Big>Best-value strategy</Big>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Scholarship importance", r.money.scholarshipImportance],
          ["Cost sensitivity", r.money.costSensitivity],
          ["Debt tolerance", r.money.debtTolerance],
        ].map(([l, v]) =>
          v == null ? null : (
            <div key={String(l)} className="rounded-2xl bg-white/12 p-4">
              <p className="text-[0.8125rem] font-bold uppercase tracking-wide text-white/75">{l}</p>
              <p className="mt-1 text-[2.6rem] font-black leading-none tabular-nums">
                {v}
                <span className="text-[1.2rem] text-white/60">/10</span>
              </p>
            </div>
          ),
        )}
      </div>
      {r.money.budget && (
        <p className="mt-4 text-[1rem] text-white/85">
          Comfortable yearly budget: <strong className="font-black">{r.money.budget}</strong>
        </p>
      )}
      <Line>{r.money.line}</Line>
    </div>,

    <div key="countries">
      <Kicker>Your top destinations</Kicker>
      <ol className="mt-6 space-y-3">
        {r.countries.map((c) => (
          <li key={c.slug} className="rounded-2xl bg-white/12 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[clamp(1.3rem,3vw,1.8rem)] font-black">
                <span aria-hidden className="mr-2">{c.flag}</span>
                {c.label}
              </span>
              <span className="text-[1.6rem] font-black tabular-nums">{c.pct}%</span>
            </div>
            <ul className="mt-1 text-[0.92rem] text-white/85">
              {c.reasons.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>,

    <div key="list" className="py-4">
      <Kicker>Your university list</Kicker>
      <Big>{total ? "Here they are." : "Let's widen the net."}</Big>
      {setAside > 0 && (
        <p className="mt-4 max-w-2xl text-[0.95rem] text-white/85">
          We set aside {setAside} institution{setAside === 1 ? "" : "s"} first —{" "}
          {[
            r.filtered.budget && `${r.filtered.budget} beyond what your budget can stretch to`,
            r.filtered.location && `${r.filtered.location} outside the places you'd go`,
            r.filtered.eligibility && `${r.filtered.eligibility} where a required subject is missing`,
            r.filtered.gender && `${r.filtered.gender} single-gender`,
          ]
            .filter(Boolean)
            .join(", ")}
          . Prestige never overrides a hard constraint.
        </p>
      )}
      {ORDER.map((b) => {
        const list = L[b];
        if (!list.length) return null;
        const m = BUCKET[b];
        return (
          <section key={b} className="mt-10" aria-labelledby={`b-${b}`}>
            <h3 id={`b-${b}`} className="text-[1.5rem] font-black uppercase tracking-tight">
              {m.emoji} {m.label}
            </h3>
            <p className="text-[0.95rem] text-white/80">{m.line}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {list.map((c) => (
                <UniversityCard key={`${b}-${c.slug}`} c={c} />
              ))}
            </div>
          </section>
        );
      })}
      {!total && <Line>No strong match passed your constraints yet. Try widening where you&apos;d go or your budget range — or edit your answers.</Line>}
      <p className="mt-8 max-w-2xl text-[0.8125rem] text-white/70">
        Fit % is how well published facts match your answers; dimensions Edugate has no data for are left out, never guessed. Admission groups use only published acceptance rates and cut-offs — nothing here guarantees admission.{" "}
        <Link href="/methodology" className="underline">How this works</Link>
      </p>
    </div>,

    <div key="next">
      <Kicker>Your next move</Kicker>
      <Big>You don&apos;t need 50 applications.</Big>
      <Line>You need the right 8–15.</Line>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["🚀", "2–3", "Dreams"],
          ["🎯", "4–5", "Targets"],
          ["🛡️", "2–3", "Safeties"],
          ["💰", "2", "Value options"],
        ].map(([e, n, l]) => (
          <div key={l} className="rounded-2xl bg-white/14 p-4">
            <p className="text-[1.6rem]" aria-hidden>{e}</p>
            <p className="text-[2rem] font-black leading-none">{n}</p>
            <p className="text-[0.95rem] font-bold text-white/85">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <form action={buildMyList}>
          <input type="hidden" name="picks" value={JSON.stringify(picks)} />
          <input type="hidden" name="back" value={back} />
          <button className="h-14 rounded-full bg-white px-8 text-[1rem] font-black uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.03]" disabled={!picks.length}>
            Build my university list →
          </button>
        </form>
        <button type="button" onClick={share} className="h-14 rounded-full border-2 border-white px-7 text-[1rem] font-extrabold uppercase tracking-wide hover:bg-white/10">
          Share my Wrapped
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] font-bold">
        <form action={saveWrappedToProfile}>
          <input type="hidden" name="answers" value={JSON.stringify(answers)} />
          <input type="hidden" name="back" value={back} />
          <button className="underline underline-offset-4 hover:text-white/80">Save to my profile</button>
        </form>
        <button type="button" onClick={onEdit} className="underline underline-offset-4 hover:text-white/80">
          Change my answers
        </button>
        <button type="button" onClick={onRestart} className="underline underline-offset-4 hover:text-white/80">
          Start over
        </button>
      </div>
      <p className="mt-6 max-w-xl text-[0.8125rem] text-white/70">Building a list or saving to your profile needs an account. Your answers stay in this browser until you choose to save them.</p>
    </div>,
  ];
}
