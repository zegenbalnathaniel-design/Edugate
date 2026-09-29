"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { Kid } from "./Kid";
import { EdugateScreen, GoogleScreen, InstaScreen, RedditScreen } from "./screens";
import { TextEffect } from "@/components/motion/TextEffect";

/*
 * Scroll map (0 → 1 across the pinned section):
 *   0.00–0.07  phone rises and tilts upright (AirPods-style reveal)
 *   0.07–0.30  I   Reddit        — conflicting advice
 *   0.30–0.52  II  Instagram     — sponsored noise
 *   0.52–0.74  III Google        — 47 tabs, 2 a.m.
 *   0.74–0.83  overload          — the screen goes dark
 *   0.83–1.00  IV  Edugate       — one place, every fact sourced
 */
const CHAPTERS = [
  { at: 0, roman: "", title: "", thought: "" },
  { at: 0.07, roman: "Chapter One", title: "The Rabbit Hole", thought: "“Is it worth ₹25 lakh? Every reply says something different.”" },
  { at: 0.3, roman: "Chapter Two", title: "The Feed", thought: "“Top 10 colleges… sponsored by the colleges?”" },
  { at: 0.52, roman: "Chapter Three", title: "Forty-Seven Tabs", thought: "“It's 2 a.m. and I know less than when I started.”" },
  { at: 0.74, roman: "", title: "", thought: "" },
  { at: 0.83, roman: "Chapter Four", title: "Edugate", thought: "“Oh. It's all in one place — and it shows where every fact came from.”" },
];

const START_MINUTES = 23 * 60 + 4; // 11:04 PM

function clock(elapsed: number) {
  const t = (START_MINUTES + Math.round(elapsed)) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.35 });

  const [chapter, setChapter] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    let idx = 0;
    CHAPTERS.forEach((c, i) => {
      if (v >= c.at) idx = i;
    });
    setChapter((prev) => (prev === idx ? prev : idx));
  });

  // Phone: tilts up out of the page, swings between apps, recoils on overload, lands.
  const rotateX = useTransform(p, [0, 0.07], [reduced ? 0 : 58, 0]);
  const rotateY = useTransform(
    p,
    [0.07, 0.29, 0.31, 0.51, 0.53, 0.73, 0.8, 0.86],
    reduced ? [0, 0, 0, 0, 0, 0, 0, 0] : [0, -7, 7, 7, -7, -9, 0, 0],
  );
  const scale = useTransform(p, [0, 0.07, 0.74, 0.8, 0.87, 1], reduced ? [1, 1, 1, 1, 1, 1] : [0.72, 1, 1, 0.88, 1.05, 1]);

  // In-phone feeds scroll as the page scrolls.
  const redditY = useTransform(p, [0.07, 0.3], ["0%", "-55%"]);
  const instaY = useTransform(p, [0.31, 0.52], ["0%", "-62%"]);
  const googleY = useTransform(p, [0.53, 0.74], ["0%", "-48%"]);
  const edugateY = useTransform(p, [0.87, 0.99], ["0%", "-8%"]);

  const redditO = useTransform(p, [0.29, 0.31], [1, 0]);
  const instaO = useTransform(p, [0.29, 0.31, 0.51, 0.53], [0, 1, 1, 0]);
  const googleO = useTransform(p, [0.51, 0.53, 0.82, 0.84], [0, 1, 1, 0]);
  const edugateO = useTransform(p, [0.83, 0.87], [0, 1]);
  const blackout = useTransform(p, [0.72, 0.77, 0.82, 0.86], [0, 0.94, 0.94, 0]);
  const redTint = useTransform(p, [0.62, 0.76], [0, 0.4]);
  const shake = useTransform(p, (v) => (reduced || v < 0.64 || v > 0.8 ? 0 : Math.sin(v * 900) * (v - 0.64) * 70));

  // Status bar: time runs on, battery drains, tabs pile up.
  const time = useTransform(p, [0.07, 0.8], [0, 223], { clamp: true });
  const timeText = useTransform(time, clock);
  const battery = useTransform(p, [0.07, 0.8], [64, 9]);
  const batteryText = useTransform(battery, (b) => `${Math.round(b)}%`);
  const batteryWidth = useTransform(battery, (b) => `${b}%`);
  const batteryColor = useTransform(p, [0.6, 0.72], ["#f3e4c4", "#b3221c"]);
  const tabs = useTransform(p, [0.53, 0.74], [3, 47]);
  const tabsText = useTransform(tabs, (t) => `${Math.round(t)}`);

  // Face-light: reddit ember → insta magenta → google steel → overload red → edugate teal.
  const glow = useTransform(
    p,
    [0, 0.29, 0.31, 0.51, 0.53, 0.66, 0.78, 0.84, 1],
    [
      "rgba(232,98,44,0.5)",
      "rgba(232,98,44,0.5)",
      "rgba(155,58,134,0.5)",
      "rgba(155,58,134,0.5)",
      "rgba(95,127,140,0.55)",
      "rgba(95,127,140,0.55)",
      "rgba(179,34,28,0.6)",
      "rgba(127,207,196,0.55)",
      "rgba(242,191,42,0.5)",
    ],
  );

  const letterbox = useTransform(p, [0, 0.06, 0.83, 0.92], ["0vh", "8vh", "8vh", "0vh"]);
  const crashText = useTransform(p, [0.74, 0.77, 0.81, 0.84], [0, 1, 1, 0]);
  const crashDim = useTransform(p, [0.74, 0.77, 0.81, 0.84], [0, 0.72, 0.72, 0]);
  const introText = useTransform(p, [0, 0.05], [1, 0]);
  const cta = useTransform(p, [0.9, 0.95], [0, 1]);
  const ctaY = useTransform(p, [0.9, 0.95], [16, 0]);
  const bar = useTransform(p, [0, 1], [0, 1]);

  const active = CHAPTERS[chapter];

  return (
    <section
      ref={ref}
      data-register="deep"
      aria-label="A student searching for the right college"
      className="grain relative"
      style={{ height: "640vh" }}
    >
      <div className="sticky top-0 flex h-svh w-full items-center overflow-hidden">
        {/* Letterbox — the story plays at scope, then opens to full frame on Edugate. */}
        <motion.div aria-hidden className="absolute inset-x-0 top-0 z-30 bg-[#06141a]" style={{ height: letterbox }} />
        <motion.div aria-hidden className="absolute inset-x-0 bottom-0 z-30 bg-[#06141a]" style={{ height: letterbox }} />

        <motion.p
          style={{ opacity: introText }}
          className="meta pointer-events-none absolute inset-x-0 top-[14vh] z-20 text-center text-electric"
        >
          Keep scrolling — this is how most students choose a college
        </motion.p>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 pt-14 md:flex-row md:gap-20 md:px-10 lg:gap-28">
          {/* Left: the kid, the chapter card, the thought */}
          <div className="order-2 flex w-full flex-col items-center text-center md:order-1 md:w-[26rem] md:items-start md:text-left">
            <div className="w-16 md:hidden">
              <Kid progress={p} glow={glow} />
            </div>
            <div className="hidden w-[210px] md:block lg:w-[250px]">
              <Kid progress={p} glow={glow} />
            </div>
            <div className="mt-2 min-h-[8.5rem] md:mt-6">
              <AnimatePresence mode="wait">
                {active.title && (
                  <motion.div
                    key={chapter}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.25 } }}
                  >
                    <p className="meta text-electric">{active.roman}</p>
                    <TextEffect as="h2" className="display-m mt-2 text-paper" delay={0.05}>
                      {active.title}
                    </TextEffect>
                    <TextEffect
                      as="p"
                      className="mt-3 max-w-sm text-[0.95rem] italic leading-relaxed text-paper/75"
                      delay={0.35}
                      per="word"
                    >
                      {active.thought}
                    </TextEffect>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div style={{ opacity: cta, y: ctaY }} className="mt-6">
                <Link
                  href="/passion-projector"
                  className="inline-flex h-11 items-center rounded-full bg-electric px-6 text-[0.9rem] font-semibold text-[var(--on-electric)]"
                >
                  Start your own search
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right: the phone */}
          <div className="order-1 flex shrink-0 justify-center [perspective:1400px] md:order-2">
            <motion.div
              style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
              className="relative h-[min(620px,44svh)] w-[calc(min(620px,44svh)*0.49)] rounded-[2.6rem] md:h-[min(620px,62svh)] md:w-[calc(min(620px,62svh)*0.49)] border border-[#f3e4c4]/15 bg-[#132a30] p-2.5 shadow-[0_60px_120px_-30px_rgba(2,10,12,0.9),0_0_0_1px_rgba(242,191,42,0.06)]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[2.1rem]">
                <motion.div style={{ opacity: redditO }} className="absolute inset-0">
                  <RedditScreen y={redditY} />
                </motion.div>
                <motion.div style={{ opacity: instaO }} className="absolute inset-0">
                  <InstaScreen y={instaY} />
                </motion.div>
                <motion.div style={{ opacity: googleO }} className="absolute inset-0">
                  <GoogleScreen y={googleY} tabs={tabsText} shake={shake} />
                  <motion.div aria-hidden style={{ opacity: redTint }} className="absolute inset-0 bg-[#b3221c] mix-blend-multiply" />
                </motion.div>
                <motion.div style={{ opacity: edugateO }} className="absolute inset-0">
                  <EdugateScreen y={edugateY} />
                </motion.div>
                <motion.div aria-hidden style={{ opacity: blackout }} className="absolute inset-0 bg-[#06141a]" />

                {/* Status bar + dynamic island, shared by every app */}
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-2.5 text-[0.48rem] font-semibold text-[#f3e4c4] md:px-5 md:text-[0.6rem]">
                  <motion.span className="tabular">{timeText}</motion.span>
                  <span className="absolute left-1/2 top-2 h-4 w-12 -translate-x-1/2 rounded-full bg-[#06141a] md:h-5 md:w-20" />
                  <span className="flex items-center gap-1 tabular">
                    <motion.span>{batteryText}</motion.span>
                    <span className="relative h-2.5 w-5 rounded-[3px] border border-[#f3e4c4]/60 p-[1px]">
                      <motion.span className="block h-full rounded-[1px]" style={{ width: batteryWidth, background: batteryColor }} />
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: crashDim }} className="pointer-events-none absolute inset-0 z-20 bg-[#06141a]" />
        <motion.p
          style={{ opacity: crashText }}
          className="display-m pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-6 text-center italic text-paper"
        >
          There has to be a better way.
        </motion.p>

        {/* Film-strip progress */}
        <div className="absolute inset-x-6 bottom-[calc(8vh+1rem)] z-40 mx-auto hidden max-w-md md:inset-x-10 md:block">
          <div className="flex justify-between pb-1.5 text-[0.55rem] tracking-[0.2em] text-paper/45">
            <span>I</span>
            <span>II</span>
            <span>III</span>
            <span>IV</span>
          </div>
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-paper/12">
            <motion.div className="h-full origin-left bg-electric" style={{ scaleX: bar }} />
          </div>
        </div>
      </div>
    </section>
  );
}
