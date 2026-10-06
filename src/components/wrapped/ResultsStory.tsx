"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { buildMyList, saveWrappedToProfile } from "@/app/wrapped/actions";
import { RIASEC_LABEL, type Answers, type Riasec } from "@/lib/wrapped/model";
import { BUCKET, lakh, type Bucket, type UniCard, type WrappedResult } from "@/lib/wrapped/match";

/*
 * The "Wrapped" itself: one big idea per full-screen card, in story order —
 * type → interest DNA → #1 degree → where to study each degree → careers →
 * campus → money → countries → #1 university → the list → poster → next move.
 * Tap the right of the screen (or swipe, or →) to advance; tap the left to go back.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const TYPE_EMOJI: Record<Riasec, string> = { R: "🛠️", I: "🔬", A: "🎨", S: "🤝", E: "🚀", C: "📐" };
const CONFETTI = ["#f2bf2a", "#ffffff", "#45a39a", "#b3221c", "#7fcfc4", "#cf7a45"];

type Card = { key: string; bg: string; node: ReactNode; interactive?: boolean; confetti?: boolean };

export function ResultsStory({ r, answers, shareUrl, onEdit, onRestart }: { r: WrappedResult; answers: Answers; shareUrl: string; onEdit: () => void; onRestart: () => void }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const cards = buildCards(r, answers, shareUrl, onEdit, onRestart);
  const n = cards.length;
  const card = cards[Math.min(i, n - 1)];
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d))), [n]);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);
  useEffect(() => {
    document.getElementById("wr-scroll")?.scrollTo({ top: 0 });
  }, [i]);

  // Story-style navigation: tap right to advance, left to go back, swipe either way.
  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      s.moved = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onClick = (e: MouseEvent) => {
    if (swipe.current?.moved) return void (swipe.current = null);
    if (card.interactive || (e.target as HTMLElement).closest("a, button, input, form, label, [data-no-tap]")) return;
    if (window.getSelection()?.toString()) return;
    const w = (e.currentTarget as HTMLElement).getBoundingClientRect();
    go(e.clientX - w.left < w.width * 0.3 ? -1 : 1);
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-clip text-white" style={{ ["--wr-ink" as string]: "#0b1d21" }}>
      <AnimatePresence initial={false}>
        <motion.div key={card.key} aria-hidden className="absolute inset-0 -z-20" style={{ background: card.bg }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} />
      </AnimatePresence>
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-white/10 blur-3xl motion-safe:animate-[wr-float_12s_ease-in-out_infinite]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[32rem] rounded-full bg-black/20 blur-3xl motion-safe:animate-[wr-float_15s_ease-in-out_infinite_reverse]" />

      <div className="flex gap-1 px-4 pt-4 sm:px-8" aria-hidden>
        {cards.map((c, k) => (
          <span key={c.key} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <span className={`block h-full rounded-full bg-white ${k === i ? "transition-[width] duration-700" : ""}`} style={{ width: k <= i ? "100%" : "0%" }} />
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-3 sm:px-8">
        <span className="text-[0.8125rem] font-extrabold uppercase tracking-[0.2em]">Edugate · Wrapped</span>
        <span className="flex items-center gap-4">
          <span className="text-[0.8125rem] font-bold tabular-nums text-white/70" aria-live="polite">
            {i + 1}/{n}
          </span>
          <Link href="/" className="text-[0.8125rem] text-white/75 hover:text-white">
            Exit ✕
          </Link>
        </span>
      </div>

      <div id="wr-scroll" data-lenis-prevent className="relative min-h-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain px-4 pb-28 pt-6 sm:px-8" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onClick={onClick}>
        <AnimatePresence mode="wait">
          <motion.section
            key={card.key}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -24, scale: 1.02, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto flex min-h-full w-full max-w-4xl select-none flex-col justify-center"
            aria-label={`Result ${i + 1} of ${n}`}
            aria-roledescription="slide"
          >
            {card.node}
          </motion.section>
        </AnimatePresence>
        {card.confetti && <Confetti key={`c-${card.key}`} delay={card.key === "type" ? 1.35 : 0.35} />}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/35 to-transparent px-4 pb-5 pt-10 sm:px-8">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} className="pointer-events-auto h-12 rounded-full border border-white/40 px-5 text-[0.95rem] font-bold disabled:opacity-0">
          ← Back
        </button>
        {i === 0 && <span className="mb-3 text-[0.8125rem] font-semibold text-white/70 motion-safe:animate-pulse">Tap anywhere or swipe →</span>}
        {i < n - 1 && (
          <button type="button" onClick={() => go(1)} className="pointer-events-auto h-12 rounded-full bg-white px-7 text-[0.95rem] font-extrabold uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.04]">
            {i === 0 ? "Show me" : "Next"} →
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- motion bits --------------------------------- */

function useCount(to: number, ms = 1100, delay = 0) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduced) return void setV(to);
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / ms));
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, delay, reduced]);
  return v;
}

function Count({ to, ms, delay, suffix = "" }: { to: number; ms?: number; delay?: number; suffix?: string }) {
  const v = useCount(to, ms, delay);
  return (
    <>
      <span aria-hidden>
        {v}
        {suffix}
      </span>
      <span className="sr-only">
        {to}
        {suffix}
      </span>
    </>
  );
}

/** Deterministic pseudo-random in [0,1) so the burst looks the same on every render. */
const rnd = (k: number, s: number) => {
  const x = Math.sin(k * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Confetti({ delay = 0, n = 70 }: { delay?: number; n?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {Array.from({ length: n }, (_, k) => {
        const a = rnd(k, 1) * Math.PI * 2;
        const d = 160 + rnd(k, 2) * 380;
        return (
          <motion.span
            key={k}
            className="absolute left-1/2 top-[42%] block"
            style={{ width: 6 + rnd(k, 3) * 8, height: 9 + rnd(k, 4) * 12, background: CONFETTI[k % CONFETTI.length], borderRadius: rnd(k, 5) > 0.6 ? 999 : 2 }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{ x: Math.cos(a) * d, y: [0, Math.sin(a) * d * 0.7 - 140, Math.sin(a) * d * 0.7 + 620], rotate: rnd(k, 6) * 900 - 450, opacity: [1, 1, 0] }}
            transition={{ duration: 2.4 + rnd(k, 7) * 1.2, delay, ease: "easeOut", times: [0, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

const rise = (delay = 0) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease: EASE } });

/* --------------------------------- pieces ---------------------------------- */

const Kicker = ({ children }: { children: ReactNode }) => <p className="text-[0.8125rem] font-extrabold uppercase tracking-[0.22em] text-white/80">{children}</p>;
const Big = ({ children }: { children: ReactNode }) => <h2 className="mt-3 text-balance text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]">{children}</h2>;
const Line = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <motion.p {...rise(delay)} className="mt-5 max-w-2xl text-[clamp(1.05rem,2.2vw,1.35rem)] font-medium leading-snug text-white/90">
    {children}
  </motion.p>
);
const Fine = ({ children }: { children: ReactNode }) => <p className="mt-5 max-w-2xl text-[0.8125rem] text-white/65">{children}</p>;

function Bar({ label, pct, delay = 0, sub }: { label: string; pct: number; delay?: number; sub?: string }) {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[1.02rem] font-bold">
          {label} {sub && <span className="text-[0.8rem] font-medium text-white/60">{sub}</span>}
        </span>
        <span className="text-[1.25rem] font-black tabular-nums">
          <Count to={pct} delay={delay} suffix="%" />
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: reduced ? `${pct}%` : 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: EASE }}
        />
      </div>
    </div>
  );
}

/** Six-axis interest radar; the shape grows out of the centre. */
function Radar({ dna }: { dna: WrappedResult["dna"] }) {
  const reduced = useReducedMotion();
  const axes = (["R", "I", "A", "S", "E", "C"] as Riasec[]).map((k) => dna.find((d) => d.key === k)!).filter(Boolean);
  const C = 150;
  const R = 108;
  const pt = (k: number, v: number) => {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / axes.length;
    return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v] as const;
  };
  const ring = (v: number) => axes.map((_, k) => pt(k, v).join(",")).join(" ");
  const shape = axes.map((d, k) => pt(k, Math.max(0.08, d.pct / 100)).join(",")).join(" ");
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[22rem]" role="img" aria-label={`Interest profile: ${dna.map((d) => `${d.label} ${d.pct}%`).join(", ")}`}>
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      ))}
      {axes.map((_, k) => {
        const [x, y] = pt(k, 1);
        return <line key={k} x1={C} y1={C} x2={x} y2={y} stroke="rgba(255,255,255,0.18)" />;
      })}
      <motion.g style={{ originX: "150px", originY: "150px" }} initial={{ scale: reduced ? 1 : 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.2, ease: EASE }}>
        <polygon points={shape} fill="rgba(255,255,255,0.32)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
        {axes.map((d, k) => {
          const [x, y] = pt(k, Math.max(0.08, d.pct / 100));
          return <circle key={d.key} cx={x} cy={y} r="4" fill="#fff" />;
        })}
      </motion.g>
      {axes.map((d, k) => {
        const [x, y] = pt(k, 1.2);
        return (
          <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="20">
            {TYPE_EMOJI[d.key]}
          </text>
        );
      })}
    </svg>
  );
}

/** Semicircle gauge, 0–10. */
function Gauge({ label, v, delay = 0 }: { label: string; v: number; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <div className="rounded-3xl bg-white/12 p-4 text-center backdrop-blur-sm">
      <svg viewBox="0 0 120 70" className="mx-auto w-full max-w-[11rem]" aria-hidden>
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d="M10 62 A50 50 0 0 1 110 62"
          fill="none"
          stroke="#fff"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: reduced ? v / 10 : 0 }}
          animate={{ pathLength: Math.max(0.02, v / 10) }}
          transition={{ duration: reduced ? 0 : 1.1, delay, ease: EASE }}
        />
      </svg>
      <p className="-mt-6 text-[2.4rem] font-black leading-none tabular-nums">
        <Count to={v} delay={delay} />
        <span className="text-[1rem] text-white/60">/10</span>
      </p>
      <p className="mt-2 text-[0.8125rem] font-bold uppercase tracking-wide text-white/80">{label}</p>
    </div>
  );
}

/** Careers circling the student's type. Falls back to a grid on small screens. */
function Orbit({ careers, center }: { careers: WrappedResult["careers"]; center: string }) {
  const reduced = useReducedMotion();
  const spin = reduced ? {} : { animate: { rotate: 360 }, transition: { duration: 70, repeat: Infinity, ease: "linear" as const } };
  const counter = reduced ? {} : { animate: { rotate: -360 }, transition: { duration: 70, repeat: Infinity, ease: "linear" as const } };
  return (
    <>
      <div aria-hidden className="relative mx-auto mt-6 hidden aspect-square w-full max-w-[34rem] sm:block">
        <div className="absolute inset-[18%] rounded-full border border-dashed border-white/30" />
        <div className="absolute inset-[36%] flex items-center justify-center rounded-full bg-white text-center text-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.35)]">{center}</div>
        <motion.div className="absolute inset-0" {...spin}>
          {careers.map((c, k) => {
            const a = (k / careers.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <div key={c.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + Math.cos(a) * 40}%`, top: `${50 + Math.sin(a) * 40}%` }}>
                <motion.div {...counter}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 + k * 0.12 }}
                    className={`whitespace-nowrap rounded-full px-4 py-2 font-extrabold shadow-lg ${k === 0 ? "bg-[#f2bf2a] text-[var(--wr-ink)] text-[1.05rem]" : "bg-white/90 text-[var(--wr-ink)] text-[0.92rem]"}`}
                  >
                    <span className="mr-1.5">{c.emoji}</span>
                    {c.label}
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
      <ul className="mt-6 grid gap-2.5 sm:sr-only">
        {careers.map((c, k) => (
          <motion.li key={c.key} {...rise(0.1 + k * 0.08)} className="flex items-center justify-between gap-3 rounded-2xl bg-white/12 px-4 py-3">
            <span className="text-[1.08rem] font-extrabold">
              <span aria-hidden className="mr-2 text-[1.3rem]">{c.emoji}</span>
              {c.label}
            </span>
            <span className="text-[0.72rem] font-extrabold uppercase tracking-wide text-white/75">{c.pct >= 70 ? "Strong fit" : "Worth exploring"}</span>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

function Podium({ countries }: { countries: WrappedResult["countries"] }) {
  const reduced = useReducedMotion();
  const top = countries.slice(0, 3);
  const order = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  const height = (c: (typeof top)[number]) => (c === top[0] ? 100 : c === top[1] ? 72 : 52);
  return (
    <div className="mx-auto mt-8 flex max-w-xl items-end justify-center gap-3 sm:gap-5" aria-hidden>
      {order.map((c, k) => (
        <div key={c.slug} className="flex flex-1 flex-col items-center">
          <motion.span initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + k * 0.15, type: "spring", stiffness: 220, damping: 14 }} className="text-[clamp(2.4rem,7vw,3.6rem)]">
            {c.flag}
          </motion.span>
          <p className="mt-1 text-center text-[0.95rem] font-extrabold leading-tight">{c.label}</p>
          <motion.div
            className="mt-2 flex w-full items-start justify-center rounded-t-2xl bg-white pt-3 text-[var(--wr-ink)]"
            style={{ height: `${height(c) * 1.6}px`, originY: 1 }}
            initial={{ scaleY: reduced ? 1 : 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.15 + k * 0.12, ease: EASE }}
          >
            <span className="text-[1.5rem] font-black tabular-nums">{c === top[0] ? "1" : c === top[1] ? "2" : "3"}</span>
          </motion.div>
        </div>
      ))}
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
          <p className="mt-1.5 inline-block rounded-full bg-[var(--wr-ink)]/8 px-2.5 py-0.5 text-[0.72rem] font-extrabold uppercase tracking-wide">Your degree: {c.degree.label}</p>
          {c.knownFor && (
            <p className="mt-1 text-[0.8rem] font-semibold">
              <span className="opacity-60">Known for:</span> {c.knownFor} <span className="opacity-50">· Edugate editors&apos; list</span>
            </p>
          )}
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

/* ------------------------------ the type reveal ------------------------------ */

function TypeReveal({ r }: { r: WrappedResult }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), reduced ? 0 : 1300);
    return () => clearTimeout(t);
  }, [reduced]);
  const [a, b] = r.type.top;
  return (
    <div className="text-center">
      <Kicker>Your core type</Kicker>
      <p className="mt-6 text-[1.5rem] font-bold">You&apos;re…</p>
      <div className="relative mt-4 flex min-h-[9rem] items-center justify-center">
        {!shown ? (
          <div className="flex gap-3" aria-hidden>
            {[0, 1, 2].map((k) => (
              <motion.span key={k} className="size-4 rounded-full bg-white" animate={{ y: [0, -14, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.6, repeat: Infinity, delay: k * 0.15 }} />
            ))}
          </div>
        ) : (
          <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.35, filter: "blur(14px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ type: "spring", stiffness: 180, damping: 14 }}>
            <div className="mb-3 flex justify-center gap-2 text-[3rem]" aria-hidden>
              <motion.span initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                {TYPE_EMOJI[a]}
              </motion.span>
              {b && (
                <motion.span initial={{ rotate: 30, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.32, type: "spring" }}>
                  {TYPE_EMOJI[b]}
                </motion.span>
              )}
            </div>
            <h2 className="text-balance text-[clamp(2.6rem,9vw,6rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">{r.type.name.replace(/^THE /, "")}</h2>
          </motion.div>
        )}
      </div>
      {shown && (
        <>
          <motion.p {...rise(0.4)} className="mx-auto mt-5 max-w-2xl text-[clamp(1.05rem,2.2vw,1.35rem)] font-medium leading-snug text-white/90">
            {r.type.blurb}
          </motion.p>
          <p className="mx-auto mt-6 max-w-xl text-[0.875rem] text-white/70">A memorable summary of today&apos;s answers — not a diagnosis. People change; so will this.</p>
        </>
      )}
    </div>
  );
}

/* ------------------------------ the poster (PNG) ------------------------------ */

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 3) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (const w of words) {
    const t = line ? (line.endsWith("-") ? `${line}${w}` : `${line} ${w}`) : w;
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = w;
      if (++lines >= maxLines - 1) break;
    } else line = t;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

function drawPoster(r: WrappedResult, top: UniCard | undefined): HTMLCanvasElement {
  const W = 1080;
  const H = 1920;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0f262b");
  g.addColorStop(0.55, "#45a39a");
  g.addColorStop(1, "#f2bf2a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(W - 80, 260, 360, 0, Math.PI * 2);
  ctx.fill();

  const P = 90;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  ctx.font = `800 34px ${font}`;
  ctx.fillText(`EDUGATE · UNIVERSITY WRAPPED ${new Date().getFullYear()}`, P, 110);
  ctx.font = `600 40px ${font}`;
  ctx.fillText("I'm", P, 230);
  // Break "ANALYST-STRATEGIST" after the hyphen, and shrink until the longest word fits.
  const title = r.type.name.replace(/^THE /, "").replace(/-/g, "- ");
  let size = 112;
  ctx.font = `900 ${size}px ${font}`;
  while (size > 56 && Math.max(...title.split(" ").map((w) => ctx.measureText(w).width)) > W - P * 2) {
    size -= 6;
    ctx.font = `900 ${size}px ${font}`;
  }
  let y = wrapText(ctx, title, P, 290, W - P * 2, size, 3);
  ctx.font = `500 36px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  y = wrapText(ctx, r.type.blurb, P, y + 20, W - P * 2, 48, 3) + 30;

  const section = (title: string, rows: string[]) => {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `800 30px ${font}`;
    ctx.fillText(title, P, y);
    y += 52;
    ctx.fillStyle = "#fff";
    ctx.font = `800 46px ${font}`;
    for (const row of rows) {
      y = wrapText(ctx, row, P, y, W - P * 2, 58, 3) + 4;
    }
    y += 36;
  };
  section("TOP DEGREES", r.courses.slice(0, 3).map((c, k) => `${k + 1}. ${c.label}  ${c.pct}%`));
  section("CAREER UNIVERSE", [r.careers.slice(0, 3).map((c) => c.label).join(" · ")]);
  if (r.countries[0]) section("TOP DESTINATION", [`${r.countries[0].label}  ${r.countries[0].pct}%`]);
  if (top) section("#1 MATCH", [`${top.name}`, `${top.program.name} · ${top.fit}% fit`]);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `600 30px ${font}`;
  ctx.fillText("Find yours on Edugate", P, H - 130);
  return cv;
}

function Poster({ r, top, shareUrl }: { r: WrappedResult; top: UniCard | undefined; shareUrl: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const download = () => {
    const cv = drawPoster(r, top);
    const a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "my-university-wrapped.png";
    a.click();
    setMsg("Saved — post it wherever you like.");
  };
  const share = async () => {
    try {
      const blob: Blob | null = await new Promise((res) => drawPoster(r, top).toBlob(res, "image/png"));
      const file = blob ? new File([blob], "my-university-wrapped.png", { type: "image/png" }) : null;
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "My University Wrapped", url: shareUrl });
      else if (navigator.share) await navigator.share({ title: "My University Wrapped", text: `I'm ${r.type.name.toLowerCase()} — here's my University Wrapped.`, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        setMsg("Link copied — anyone with it sees your Wrapped. Nothing is stored on our side.");
      }
    } catch {
      /* share sheet dismissed */
    }
  };
  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,20rem)_1fr]">
      <motion.div
        initial={{ rotate: -6, y: 40, opacity: 0 }}
        animate={{ rotate: -2, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="mx-auto aspect-[9/16] w-full max-w-[15rem] overflow-hidden sm:max-w-[20rem] rounded-[1.75rem] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/30"
        style={{ background: "linear-gradient(160deg,#0f262b 0%,#45a39a 55%,#f2bf2a 100%)" }}
      >
        <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-white/80">Edugate · University Wrapped</p>
        <p className="mt-5 text-[0.85rem] font-semibold">I&apos;m</p>
        <p className="text-[1.65rem] font-black uppercase leading-[0.95]">{r.type.name.replace(/^THE /, "")}</p>
        <p className="mt-4 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-white/70">Top degrees</p>
        <ol className="mt-1 space-y-0.5 text-[0.85rem] font-extrabold">
          {r.courses.slice(0, 3).map((c, k) => (
            <li key={c.key}>
              {k + 1}. {c.label} <span className="tabular-nums text-white/75">{c.pct}%</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-white/70">Career universe</p>
        <p className="text-[0.8rem] font-bold leading-snug">{r.careers.slice(0, 3).map((c) => c.label).join(" · ")}</p>
        {r.countries[0] && (
          <>
            <p className="mt-3 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-white/70">Top destination</p>
            <p className="text-[0.9rem] font-extrabold">
              {r.countries[0].flag} {r.countries[0].label}
            </p>
          </>
        )}
        {top && (
          <>
            <p className="mt-3 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-white/70">#1 match</p>
            <p className="text-[0.85rem] font-extrabold leading-tight">{top.name}</p>
            <p className="text-[0.7rem] font-semibold text-white/80">
              {top.program.name} · {top.fit}%
            </p>
          </>
        )}
      </motion.div>
      <div>
        <Kicker>Your Wrapped, in one picture</Kicker>
        <Big>Post it.</Big>
        <Line>Save the poster for your story, or send the link — it opens your full Wrapped, and nothing is stored on our side.</Line>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={download} className="h-14 rounded-full bg-white px-7 text-[1rem] font-black uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.03]">
            ⬇ Download image
          </button>
          <button type="button" onClick={share} className="h-14 rounded-full border-2 border-white px-7 text-[1rem] font-extrabold uppercase tracking-wide hover:bg-white/10">
            Share
          </button>
        </div>
        {msg && (
          <p className="mt-3 text-[0.9rem] font-semibold" role="status">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- cards ----------------------------------- */

const ORDER: (Bucket | "value")[] = ["dream", "reach", "target", "safety", "value", "open"];

function picksFor(r: WrappedResult) {
  const L = r.lists;
  const order = [...L.dream.slice(0, 2), ...L.reach.slice(0, 1), ...L.target.slice(0, 4), ...L.safety.slice(0, 2), ...L.value.slice(0, 2), ...L.open.slice(0, 4)];
  const seen = new Set<string>();
  return order.filter((c) => !seen.has(c.slug) && seen.add(c.slug)).slice(0, 15).map((c) => ({ university: c.slug, program: c.program.slug }));
}

/** The single best match the student could realistically act on (reach/dream only when nothing else fits). */
function topMatch(r: WrappedResult): UniCard | undefined {
  const L = r.lists;
  const realistic = [...L.target, ...L.safety, ...L.open, ...L.value].sort((a, b) => b.fit - a.fit);
  return realistic[0] ?? [...L.reach, ...L.dream].sort((a, b) => b.fit - a.fit)[0];
}

/** The best match on the other side of the India / abroad line, and the next best overall. */
function runnersUp(r: WrappedResult, top: UniCard | undefined): UniCard[] {
  if (!top) return [];
  const all = [...new Map(Object.values(r.lists).flat().map((c) => [c.slug, c])).values()].filter((c) => c.slug !== top.slug).sort((a, b) => b.fit - a.fit);
  const india = (c: UniCard) => c.flag === "🇮🇳";
  const other = all.find((c) => india(c) !== india(top));
  const next = all.find((c) => c !== other);
  return [other, next].filter((c) => c !== undefined) as UniCard[];
}

function buildCards(r: WrappedResult, answers: Answers, shareUrl: string, onEdit: () => void, onRestart: () => void): Card[] {
  const year = new Date().getFullYear();
  const total = Object.values(r.lists).reduce((a, l) => a + l.length, 0);
  const setAside = r.filtered.budget + r.filtered.location + r.filtered.eligibility + r.filtered.gender;
  const L = r.lists;
  const picks = picksFor(r);
  const back = shareUrl.replace(/^https?:\/\/[^/]+/, "");
  const top = topMatch(r);
  const [first, ...rest] = r.courses;
  const centre = TYPE_EMOJI[r.type.top[0]];

  const cards: (Card | null | undefined | false)[] = [
    {
      key: "intro",
      bg: "linear-gradient(135deg,#0f262b 0%,#45a39a 100%)",
      node: (
        <div>
          <Kicker>Your {year}</Kicker>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }}>
            <Big>University Wrapped</Big>
          </motion.div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
            {[
              [r.answered, "answers"],
              [r.considered, "institutions weighed"],
            ].map(([v, l], k) => (
              <motion.div key={String(l)} {...rise(0.3 + k * 0.15)} className="rounded-3xl bg-white/12 p-5 backdrop-blur-sm">
                <p className="text-[clamp(2.6rem,8vw,4rem)] font-black leading-none tabular-nums">
                  <Count to={Number(v)} delay={0.4 + k * 0.15} />
                </p>
                <p className="mt-1 text-[0.95rem] font-bold text-white/80">{l}</p>
              </motion.div>
            ))}
          </div>
          <Line delay={0.8}>Here&apos;s what we discovered.</Line>
        </div>
      ),
    },
    { key: "type", bg: "linear-gradient(150deg,#b0532b 0%,#f2bf2a 100%)", confetti: true, node: <TypeReveal r={r} /> },
    {
      key: "dna",
      bg: "linear-gradient(140deg,#163239 0%,#7fcfc4 100%)",
      node: (
        <div>
          <Kicker>Your interest DNA</Kicker>
          <div className="mt-4 grid items-center gap-6 md:grid-cols-2">
            <Radar dna={r.dna} />
            <div className="space-y-3.5">
              {r.dna.slice(0, 4).map((d, k) => (
                <Bar key={d.key} label={`${TYPE_EMOJI[d.key]} ${d.label}`} sub={RIASEC_LABEL[d.key]} pct={d.pct} delay={0.3 + k * 0.12} />
              ))}
            </div>
          </div>
          <Line delay={0.8}>{r.dnaLine}</Line>
        </div>
      ),
    },
    first && {
      key: "courses",
      bg: "linear-gradient(135deg,#2b1310 0%,#b3221c 100%)",
      node: (
        <div>
          <Kicker>Your #1 degree</Kicker>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }} className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <span aria-hidden className="text-[clamp(4rem,12vw,7rem)] leading-none">
              {first.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[clamp(4rem,14vw,8rem)] font-black leading-[0.85] tabular-nums">
                <Count to={first.pct} ms={1400} delay={0.2} suffix="%" />
              </p>
            </div>
          </motion.div>
          <h2 className="mt-3 text-balance text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.02em]">{first.label}</h2>
          <Line delay={0.5}>{first.reason}</Line>
          {first.note && <p className="mt-2 text-[0.9rem] font-semibold text-[#ffe08a]">⚠ {first.note}</p>}
          <motion.p {...rise(0.9)} className="mt-8 text-[0.8125rem] font-extrabold uppercase tracking-[0.2em] text-white/70">
            Also in your top {r.courses.length}
          </motion.p>
          <div className="mt-3 max-w-2xl space-y-3">
            {rest.map((c, k) => (
              <motion.div key={c.key} {...rise(1 + k * 0.1)}>
                <Bar label={`${c.emoji} ${c.label}`} pct={c.pct} delay={1.05 + k * 0.1} />
              </motion.div>
            ))}
          </div>
          <Fine>Match % ranks fields against each other on your answers.</Fine>
        </div>
      ),
    },
    r.courses.length > 0 && {
      key: "where",
      bg: "linear-gradient(160deg,#1f434b 0%,#2c5760 60%,#dcb574 100%)",
      interactive: true,
      node: (
        <div className="py-2">
          <Kicker>Degree by degree</Kicker>
          <Big>Where to study each one</Big>
          <p className="mt-3 max-w-2xl text-[1rem] text-white/85">Only programmes that are actually that degree — by their official name and main subject — in places you said you&apos;d go.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {r.courses.map((c, k) => (
              <motion.div key={c.key} {...rise(0.1 + k * 0.08)} className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                <p className="flex items-baseline justify-between gap-3 text-[1.15rem] font-black">
                  <span>
                    <span aria-hidden className="mr-1.5">{c.emoji}</span>
                    {c.label}
                  </span>
                  <span className="tabular-nums text-white/80">{c.pct}%</span>
                </p>
                {c.where.length ? (
                  <ul className="mt-2.5 space-y-1.5">
                    {c.where.map((w) => (
                      <li key={w.slug}>
                        <Link href={`/universities/${w.slug}/programs/${w.program.slug}`} className="group flex items-start gap-2 rounded-xl bg-white/90 px-3 py-2 text-[var(--wr-ink)] transition hover:bg-white">
                          <span aria-hidden>{w.flag}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.92rem] font-extrabold leading-tight">{w.name}</span>
                            <span className="block text-[0.8rem] font-semibold opacity-70">{w.program.name}</span>
                          </span>
                          <span className="text-[0.85rem] font-black tabular-nums">{w.fit}%</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[0.9rem] text-white/75">No programme on Edugate yet that fits your places, budget and subjects — worth searching more widely.</p>
                )}
              </motion.div>
            ))}
          </div>
          {r.abroadGaps.length > 0 && (
            <Fine>
              Edugate doesn&apos;t list a {r.abroadGaps.join(", ").toLowerCase()} programme outside India yet, so those degrees only show Indian options for now.
            </Fine>
          )}
        </div>
      ),
    },
    r.careers.length > 0 && {
      key: "careers",
      bg: "linear-gradient(135deg,#b3221c 0%,#cf7a45 100%)",
      node: (
        <div>
          <Kicker>Your career universe</Kicker>
          <Line>{r.careerLine}</Line>
          <Orbit careers={r.careers} center={centre} />
          <Fine>Potential, not prophecy — careers are built, not assigned.</Fine>
        </div>
      ),
    },
    {
      key: "campus",
      bg: "linear-gradient(145deg,#0b1d21 0%,#2c5760 100%)",
      node: (
        <div>
          <Kicker>Your university DNA</Kicker>
          <Big>Your ideal campus</Big>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {r.campus.chips.map((c, k) => (
              <motion.li
                key={c.label}
                initial={{ scale: 0, rotate: k % 2 ? 8 : -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 + k * 0.09 }}
                className="rounded-full bg-white px-4 py-2 text-[1.05rem] font-extrabold text-[var(--wr-ink)]"
              >
                <span aria-hidden>{c.emoji}</span> {c.label}
              </motion.li>
            ))}
          </ul>
          <Line delay={0.6}>{r.campus.avoid}</Line>
        </div>
      ),
    },
    {
      key: "money",
      bg: "linear-gradient(140deg,#45a39a 0%,#f2bf2a 100%)",
      node: (
        <div>
          <Kicker>Your money profile</Kicker>
          <Big>Best-value strategy</Big>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Scholarship importance", r.money.scholarshipImportance],
                ["Cost sensitivity", r.money.costSensitivity],
                ["Debt tolerance", r.money.debtTolerance],
              ] as const
            ).map(([l, v], k) => (v == null ? null : <Gauge key={l} label={l} v={v} delay={0.2 + k * 0.15} />))}
          </div>
          {r.money.budget && (
            <p className="mt-5 text-[1rem] text-white/90">
              Comfortable yearly budget: <strong className="font-black">{r.money.budget}</strong>
            </p>
          )}
          <Line delay={0.6}>{r.money.line}</Line>
        </div>
      ),
    },
    r.countries.length > 0 && {
      key: "countries",
      bg: "linear-gradient(135deg,#0f262b 0%,#5f7f8c 100%)",
      node: (
        <div>
          <Kicker>Your top destinations</Kicker>
          <Podium countries={r.countries} />
          <ol className="mx-auto mt-6 max-w-2xl space-y-2.5">
            {r.countries.map((c, k) => (
              <motion.li key={c.slug} {...rise(0.9 + k * 0.1)} className="rounded-2xl bg-white/12 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[1.2rem] font-black">
                    <span className="mr-2 tabular-nums text-white/60">{k + 1}</span>
                    <span aria-hidden className="mr-1.5">{c.flag}</span>
                    {c.label}
                  </span>
                  <span className="text-[1.3rem] font-black tabular-nums">{c.pct}%</span>
                </div>
                {k === 0 && (
                  <ul className="mt-1 text-[0.92rem] text-white/85">
                    {c.reasons.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      ),
    },
    top && {
      key: "top",
      bg: "linear-gradient(150deg,#2b1310 0%,#f2bf2a 100%)",
      confetti: true,
      node: (
        <div className="text-center">
          <Kicker>Your #1 match</Kicker>
          <motion.p initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 170, damping: 13 }} className="mt-5 text-[clamp(5rem,18vw,10rem)] font-black leading-[0.85] tabular-nums">
            <Count to={top.fit} ms={1500} suffix="%" />
          </motion.p>
          <p className="text-[0.85rem] font-extrabold uppercase tracking-[0.2em] text-white/75">fit</p>
          <motion.h2 {...rise(0.5)} className="mt-6 text-balance text-[clamp(2rem,6vw,3.8rem)] font-black uppercase leading-[0.95] tracking-[-0.02em]">
            {top.name}
          </motion.h2>
          <motion.p {...rise(0.65)} className="mt-2 text-[1.15rem] font-bold text-white/90">
            {top.flag} {top.program.name} · {top.city}
          </motion.p>
          <motion.ul {...rise(0.85)} className="mx-auto mt-5 max-w-xl space-y-1 text-[1rem] text-white/90">
            {top.why.slice(0, 2).map((w) => (
              <li key={w}>✓ {w}</li>
            ))}
          </motion.ul>
          <motion.div {...rise(1)} className="mt-6">
            <Link href={`/universities/${top.slug}/programs/${top.program.slug}`} className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[0.9rem] font-extrabold uppercase tracking-wide text-[var(--wr-ink)] transition hover:scale-[1.03]">
              See the course →
            </Link>
          </motion.div>
          <p className="mt-4 text-[0.8125rem] text-white/70">{BUCKET[top.bucket].line}</p>
          {runnersUp(r, top).length > 0 && (
            <motion.div {...rise(1.2)} className="mx-auto mt-7 grid max-w-2xl gap-2.5 sm:grid-cols-2">
              {runnersUp(r, top).map((c) => (
                <Link key={c.slug} href={`/universities/${c.slug}/programs/${c.program.slug}`} className="rounded-2xl bg-white/14 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-white/22">
                  <span className="block text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-white/70">
                    {c.flag === "🇮🇳" ? "Top in India" : `Top abroad · ${c.country}`}
                  </span>
                  <span className="mt-0.5 block text-[1rem] font-black leading-tight">{c.name}</span>
                  <span className="block text-[0.82rem] font-semibold text-white/80">
                    {c.program.name} · {c.fit}%
                  </span>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      ),
    },
    {
      key: "list",
      bg: "linear-gradient(135deg,#0f262b 0%,#45a39a 100%)",
      interactive: true,
      node: (
        <div className="py-4">
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
            <Link href="/methodology" className="underline">
              How this works
            </Link>
          </p>
        </div>
      ),
    },
    { key: "poster", bg: "linear-gradient(150deg,#163239 0%,#b0532b 100%)", interactive: true, confetti: true, node: <Poster r={r} top={top} shareUrl={shareUrl} /> },
    {
      key: "next",
      bg: "linear-gradient(135deg,#0f262b 0%,#5f7f8c 100%)",
      interactive: true,
      node: (
        <div>
          <Kicker>Your next move</Kicker>
          <Big>You don&apos;t need 50 applications.</Big>
          <Line>You need the right 8–15.</Line>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              ["🚀", "2–3", "Dreams"],
              ["🎯", "4–5", "Targets"],
              ["🛡️", "2–3", "Safeties"],
              ["💰", "2", "Value options"],
            ].map(([e, n, l], k) => (
              <motion.div key={l} {...rise(0.2 + k * 0.1)} className="rounded-2xl bg-white/14 p-4">
                <p className="text-[1.6rem]" aria-hidden>
                  {e}
                </p>
                <p className="text-[2rem] font-black leading-none">{n}</p>
                <p className="text-[0.95rem] font-bold text-white/85">{l}</p>
              </motion.div>
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
        </div>
      ),
    },
  ];
  return cards.filter((c): c is Card => !!c);
}
