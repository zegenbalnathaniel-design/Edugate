import type { Field } from "../unis/schema";

/*
 * University Wrapped (docs/10). The student answers simple, playful questions;
 * every option quietly moves a handful of scores. Nothing here is shown to the
 * student as a label — RIASEC, motivations and traits only surface as plain
 * language on the result cards.
 */

export const RIASEC = ["R", "I", "A", "S", "E", "C"] as const;
export type Riasec = (typeof RIASEC)[number];
export const RIASEC_LABEL: Record<Riasec, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};
/** Plain-language names for the result card (the formal labels are kept in brackets). */
export const RIASEC_PLAIN: Record<Riasec, string> = {
  R: "Hands-on building",
  I: "Figuring things out",
  A: "Creating & expressing",
  S: "Helping & connecting",
  E: "Leading & persuading",
  C: "Organising & optimising",
};

export const ACADEMIC = ["quantitative", "analytical", "verbal", "creative", "technical", "social", "practical"] as const;
export type Academic = (typeof ACADEMIC)[number];

export const MOTIVATION = ["income", "prestige", "leadership", "entrepreneurship", "impact", "security", "creativity", "challenge", "mobility", "balance"] as const;
export type Motivation = (typeof MOTIVATION)[number];

export const LEARNING = ["exam", "project", "research", "discussion", "practical", "independent", "collaborative"] as const;
export type Learning = (typeof LEARNING)[number];

export const TRAIT = ["risk", "ambition", "independence", "structure", "competition", "collaboration", "flexibility", "breadth"] as const;
export type Trait = (typeof TRAIT)[number];

/** What the student wants from a campus. */
export const ENV = ["bigCity", "smallTown", "campusLife", "large", "small", "competitive", "collaborative", "international", "careerFocus", "research", "entrepreneurial", "sport", "culture"] as const;
export type Env = (typeof ENV)[number];

export type Effects = {
  riasec?: Partial<Record<Riasec, number>>;
  academic?: Partial<Record<Academic, number>>;
  motivation?: Partial<Record<Motivation, number>>;
  learning?: Partial<Record<Learning, number>>;
  trait?: Partial<Record<Trait, number>>;
  env?: Partial<Record<Env, number>>;
  subjects?: Partial<Record<Field, number>>;
};

export type Option = { id: string; label: string; emoji?: string; hint?: string; fx?: Effects };

export const CHAPTERS = [
  { id: "brain", n: "01", title: "YOUR BRAIN", tagline: "Let's figure out what makes your brain tick." },
  { id: "energy", n: "02", title: "YOUR ENERGY", tagline: "What would you actually enjoy doing for three hours?" },
  { id: "future", n: "03", title: "YOUR FUTURE", tagline: "Forget job titles for a second. What do you want from work?" },
  { id: "university", n: "04", title: "YOUR UNIVERSITY", tagline: "Picture the place you'd actually want to wake up in." },
  { id: "world", n: "05", title: "YOUR WORLD", tagline: "How far are you ready to go?" },
  { id: "money", n: "06", title: "THE REAL WORLD", tagline: "Let's talk money. No judging — just realism." },
  { id: "call", n: "07", title: "YOUR CALL", tagline: "Last stretch. Where you stand, and how bold you want to be." },
] as const;
export type ChapterId = (typeof CHAPTERS)[number]["id"];

type Base = {
  id: string;
  chapter: ChapterId;
  title: string;
  sub?: string;
  /** Adaptive questions: shown only when this returns true for the answers so far. */
  when?: (ctx: AskContext) => boolean;
  /** Deep-dive module this question belongs to (see MODULES). */
  module?: ModuleId;
};
export type Question =
  | (Base & { kind: "single"; options: Option[] })
  | (Base & { kind: "multi"; options: Option[]; max?: number; min?: number })
  | (Base & { kind: "versus"; options: [Option, Option] })
  | (Base & { kind: "rank"; options: Option[]; pick: number })
  | (Base & { kind: "slider"; low: string; high: string; lowEmoji: string; highEmoji: string; fx: Effects });

export type Answer = string | string[] | number;
export type Answers = Record<string, Answer>;

export const MODULE_IDS = ["money", "tech", "health", "design", "society", "science"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export type AskContext = { answers: Answers; modules: ModuleId[] };
