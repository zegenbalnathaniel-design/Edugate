"use client";

import { motion, type MotionValue } from "motion/react";
import { INSTITUTIONS } from "@/lib/data/fixtures/education/institutions";

/*
 * Stylised stand-ins for the apps a student actually searches through.
 * Every post, handle and domain below is invented (domains use the
 * reserved .example TLD) — the point is the noise, not any real account.
 */

const REDDIT_POSTS = [
  {
    sub: "r/CollegeAdviceIndia",
    age: "4h",
    title: "Is a ₹25L private engineering degree actually worth it? Be brutally honest.",
    votes: "1.2k",
    comments: "843",
    replies: ["Don't. Placement numbers are marketing.", "Best decision of my life, ignore the haters.", "Depends. On literally everything."],
  },
  {
    sub: "r/EngineeringAspirants",
    age: "7h",
    title: "My cousin says it's a scam, my teacher says it's top 10. Who do I believe??",
    votes: "642",
    comments: "391",
    replies: ["both lol", "Check the ranking. Wait — which ranking? Which year?"],
  },
  {
    sub: "r/CollegeAdviceIndia",
    age: "1d",
    title: "Unpopular opinion: every ranking list is paid for",
    votes: "3.4k",
    comments: "1.1k",
    replies: ["Source?", "trust me bro"],
  },
  {
    sub: "r/AskAStudent",
    age: "2d",
    title: "Does anyone actually know what 'average package' means?",
    votes: "211",
    comments: "97",
    replies: ["Nobody does.", "The median is what matters. Nobody publishes the median."],
  },
  {
    sub: "r/EngineeringAspirants",
    age: "3d",
    title: "CS or ECE? I have 11 days to decide",
    votes: "88",
    comments: "54",
    replies: ["Follow your passion", "Follow the money", "Follow nothing, take a gap year"],
  },
];

const INSTA_POSTS = [
  { handle: "collegeguru.official", tag: "Sponsored", art: "TOP 10 COLLEGES 2026", sub: "#7 will shock you", likes: "48.2k", caption: "Link in bio for FREE counselling* (*₹4,999)", tone: "from-[#f2bf2a] to-[#b3221c]" },
  { handle: "rhea.studies", tag: "Paid partnership", art: "HOW I GOT IN IN 30 DAYS", sub: "the course that changed my life", likes: "112k", caption: "Use code RHEA10 for 10% off", tone: "from-[#1f434b] to-[#7fcfc4]" },
  { handle: "admissions.hub", tag: "Sponsored", art: "100% PLACEMENT", sub: "*conditions apply", likes: "9.8k", caption: "DM 'SEAT' before it's gone", tone: "from-[#b3221c] to-[#c98446]" },
  { handle: "campus.diaries", tag: "", art: "A DAY IN MY LIFE", sub: "(on the one good day)", likes: "301k", caption: "not sponsored (it's sponsored)", tone: "from-[#5f7f8c] to-[#dcb574]" },
];

const GOOGLE_RESULTS = [
  { ad: true, url: "guaranteed-admission.example", title: "Guaranteed Admission in Top Colleges — Apply Now", desc: "Limited seats. Direct admission, no entrance. Call now." },
  { ad: true, url: "rank-my-college.example", title: "#1 Ranked College in India (Official 2026 List)", desc: "Rated #1 by our independent* panel. *Not independent." },
  { ad: false, url: "toptencolleges.example", title: "Top 10 Engineering Colleges 2026 (Updated!)", desc: "Last updated 2019. Ranked by our proprietary methodology." },
  { ad: false, url: "forum.aspirants.example", title: "Placement stats are fake?? — thread", desc: "Page 1 of 43 · 2,114 replies · latest: 'any update??'" },
  { ad: false, url: "edu-daily.example", title: "Four 'Top 10' lists, four different number ones", desc: "Why every list disagrees, and none will say how they rank." },
  { ad: true, url: "loans-fast.example", title: "Education Loan in 10 Minutes", desc: "Pre-approved! No questions asked." },
];

export function RedditScreen({ y }: { y: MotionValue<string> }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#101a1c] text-[#e9dcc0]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 pb-2 pt-9">
        <span className="grid size-6 place-items-center rounded-full bg-[#e8622c] text-[0.6rem] font-bold text-[#101a1c]">r/</span>
        <span className="text-[0.8rem] font-bold tracking-tight">reddit</span>
        <span className="ml-auto truncate rounded-full bg-white/8 px-2.5 py-1 text-[0.6rem] text-[#e9dcc0]/60">search: is it worth it</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <motion.div style={{ y }} className="space-y-2 px-2.5 pt-2.5">
          {[...REDDIT_POSTS, ...REDDIT_POSTS].map((p, i) => (
            <article key={i} className="rounded-lg bg-white/[0.04] p-2.5">
              <p className="text-[0.55rem] text-[#e9dcc0]/45">
                {p.sub} · {p.age}
              </p>
              <p className="mt-1 text-[0.72rem] font-semibold leading-snug">{p.title}</p>
              <p className="mt-1.5 text-[0.55rem] text-[#e9dcc0]/45">
                ▲ {p.votes} · {p.comments} comments
              </p>
              <div className="mt-1.5 space-y-1 border-l border-[#e8622c]/40 pl-2">
                {p.replies.map((r) => (
                  <p key={r} className="text-[0.6rem] leading-snug text-[#e9dcc0]/70">
                    {r}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function InstaScreen({ y }: { y: MotionValue<string> }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#14171a] text-[#efe2c6]">
      <div className="flex items-center border-b border-white/10 px-3 pb-2 pt-9">
        <span className="font-display text-[0.95rem] italic">Instagram</span>
      </div>
      <div className="flex gap-2 overflow-hidden px-2.5 py-2">
        {["you", "guru", "rhea", "hub", "diaries", "tips"].map((s) => (
          <div key={s} className="flex shrink-0 flex-col items-center gap-0.5">
            <span className="size-9 rounded-full bg-gradient-to-tr from-[#f2bf2a] via-[#b3221c] to-[#9b3a86] p-[2px]">
              <span className="block size-full rounded-full border-2 border-[#14171a] bg-[#2c5760]" />
            </span>
            <span className="text-[0.45rem] text-[#efe2c6]/55">{s}</span>
          </div>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <motion.div style={{ y }} className="space-y-3">
          {[...INSTA_POSTS, ...INSTA_POSTS].map((p, i) => (
            <article key={i}>
              <div className="flex items-center gap-2 px-2.5 py-1.5">
                <span className="size-5 rounded-full bg-[#2c5760]" />
                <div className="leading-tight">
                  <p className="text-[0.6rem] font-semibold">{p.handle}</p>
                  {p.tag && <p className="text-[0.48rem] text-[#efe2c6]/50">{p.tag}</p>}
                </div>
              </div>
              <div className={`flex aspect-square flex-col items-center justify-center bg-gradient-to-br ${p.tone} px-4 text-center`}>
                <p className="font-display text-[1.15rem] font-bold leading-tight text-[#1a0f0c]">{p.art}</p>
                <p className="mt-1 text-[0.6rem] font-semibold text-[#1a0f0c]/70">{p.sub}</p>
              </div>
              <p className="px-2.5 pt-1.5 text-[0.58rem] font-semibold">{p.likes} likes</p>
              <p className="px-2.5 text-[0.56rem] text-[#efe2c6]/70">
                <span className="font-semibold text-[#efe2c6]">{p.handle}</span> {p.caption}
              </p>
            </article>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function GoogleScreen({
  y,
  tabs,
  shake,
}: {
  y: MotionValue<string>;
  tabs: MotionValue<string>;
  shake: MotionValue<number>;
}) {
  return (
    <motion.div style={{ x: shake }} className="absolute inset-0 flex flex-col bg-[#172226] text-[#e7dcc4]">
      <div className="flex items-center gap-1 overflow-hidden px-2 pt-9">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-4 w-8 shrink-0 rounded-t-md bg-white/[0.07]" />
        ))}
        <span className="ml-auto shrink-0 rounded border border-[#e7dcc4]/40 px-1.5 text-[0.55rem] font-semibold tabular">
          <motion.span>{tabs}</motion.span> tabs
        </span>
      </div>
      <div className="border-b border-white/10 px-3 py-2">
        <p className="text-[0.95rem] font-semibold tracking-tight">
          <span className="text-[#7fcfc4]">G</span>
          <span className="text-[#b3221c]">o</span>
          <span className="text-[#f2bf2a]">o</span>
          <span className="text-[#7fcfc4]">g</span>
          <span className="text-[#c98446]">l</span>
          <span className="text-[#b3221c]">e</span>
        </p>
        <p className="mt-1.5 truncate rounded-full bg-white/[0.07] px-3 py-1.5 text-[0.6rem]">best engineering college india placements fees</p>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <motion.div style={{ y }} className="space-y-3 px-3 pt-2.5">
          {[...GOOGLE_RESULTS, ...GOOGLE_RESULTS].map((r, i) => (
            <article key={i}>
              <p className="text-[0.52rem] text-[#e7dcc4]/50">
                {r.ad && <span className="mr-1 font-bold text-[#e7dcc4]">Sponsored ·</span>}
                {r.url}
              </p>
              <p className="text-[0.72rem] leading-snug text-[#8fc9e8]">{r.title}</p>
              <p className="text-[0.58rem] leading-snug text-[#e7dcc4]/65">{r.desc}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

const SHORTLIST = ["col_iit_bombay", "col_bits_pilani", "col_ashoka_university"]
  .map((id) => INSTITUTIONS.find((i) => i.id === id))
  .filter((i): i is (typeof INSTITUTIONS)[number] => Boolean(i));

function lakh(n: number) {
  const l = n / 1e5;
  return l >= 10 ? String(Math.round(l * 10) / 10) : l.toFixed(1);
}

export function EdugateScreen({ y }: { y: MotionValue<string> }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0f262b] text-[#f3e4c4]">
      <div className="flex items-center border-b border-[#f3e4c4]/10 px-3 pb-2 pt-9">
        <span className="font-display text-[0.95rem] font-semibold">EDUGATE</span>
        <span className="ml-auto rounded-full bg-[#f2bf2a] px-2 py-0.5 text-[0.5rem] font-bold text-[#2b1310]">3 matches</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <motion.div style={{ y }} className="space-y-2 px-2.5 pt-2.5">
          <p className="meta px-0.5 !text-[0.48rem] text-[#7fcfc4]">Why these appear</p>
          <p className="px-0.5 text-[0.62rem] leading-snug text-[#f3e4c4]/75">
            Strong signal: Systems, Technology. One pathway worth exploring — not the only one.
          </p>
          {SHORTLIST.map((inst) => (
            <article key={inst.id} className="rounded-lg border border-[#f3e4c4]/12 bg-[#f3e4c4]/[0.05] p-2.5">
              <p className="text-[0.5rem] uppercase tracking-wider text-[#f3e4c4]/50">
                {inst.location.city} · Est. {inst.founded}
              </p>
              <p className="mt-0.5 font-display text-[0.8rem] font-semibold leading-tight">{inst.name}</p>
              <p className="mt-1 text-[0.58rem] text-[#f3e4c4]/70 tabular">
                ₹{lakh(inst.tuition.min)}–{lakh(inst.tuition.max)}L / {inst.tuition.period === "year" ? "yr" : inst.tuition.period}
              </p>
              <p className="mt-1 text-[0.52rem] text-[#7fcfc4]">
                ● Verified · {inst.sources.length} sources
              </p>
            </article>
          ))}
          <p className="rounded-lg bg-[#f2bf2a] py-2 text-center text-[0.62rem] font-bold text-[#2b1310]">Compare side by side →</p>
        </motion.div>
      </div>
    </div>
  );
}
