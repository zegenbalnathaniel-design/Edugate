import type { Field } from "../unis/schema";
import type { Tag } from "./model";

/*
 * IB and A-level subjects a student can pick on the "your subjects & grades"
 * card. Names match how universities write requirements ("Mathematics:
 * Analysis and Approaches"), so the existing eligibility checks can compare
 * them. `fields` nudges subject affinity (a subject you chose to take says
 * something about you); `has` feeds subject prerequisites.
 */

export type CurriculumSubject = {
  name: string;
  short: string;
  fields: Partial<Record<Field, number>>;
  tags?: Partial<Record<Tag, number>>;
  has?: ("maths" | "physics" | "chemistry" | "biology")[];
};

const s = (name: string, short: string, fields: CurriculumSubject["fields"], has?: CurriculumSubject["has"], tags?: CurriculumSubject["tags"]): CurriculumSubject => ({ name, short, fields, has, tags });

export const IB_SUBJECTS: CurriculumSubject[] = [
  s("Mathematics: Analysis and Approaches", "Maths AA", { mathematics: 2, physics: 0.5, economics: 0.5 }, ["maths"]),
  s("Mathematics: Applications and Interpretation", "Maths AI", { mathematics: 1, statistics: 1.5, "data-science": 0.5 }, ["maths"]),
  s("Physics", "Physics", { physics: 2, engineering: 1 }, ["physics"]),
  s("Chemistry", "Chemistry", { chemistry: 2, medicine: 0.5 }, ["chemistry"]),
  s("Biology", "Biology", { biology: 2, medicine: 1 }, ["biology"]),
  s("Computer Science", "Comp Sci", { "computer-science": 2, "data-science": 0.5 }),
  s("Design Technology", "Design Tech", { design: 1.5, engineering: 1 }),
  s("Environmental Systems and Societies", "ESS", { environmental: 2, geography: 0.5 }),
  s("Sports, Exercise and Health Science", "SEHS", { "sports-management": 1.5, "allied-health": 1 }),
  s("Economics", "Economics", { economics: 2, finance: 0.5 }),
  s("Business Management", "Business", { business: 2, commerce: 0.5 }),
  s("Psychology", "Psychology", { psychology: 2 }),
  s("History", "History", { history: 2, "political-science": 0.5 }),
  s("Geography", "Geography", { geography: 2, environmental: 0.5 }),
  s("Global Politics", "Global Politics", { "political-science": 1.5, "international-relations": 1.5 }, undefined, { politics: 1, ir: 1 }),
  s("Philosophy", "Philosophy", { philosophy: 2 }),
  s("Social and Cultural Anthropology", "Anthropology", { sociology: 1.5, history: 0.5 }),
  s("Digital Society", "Digital Society", { media: 1, "computer-science": 0.5, sociology: 0.5 }),
  s("English A: Literature", "English Lit", { "languages-literature": 2 }, undefined, { literature: 1.5 }),
  s("English A: Language and Literature", "English L&L", { "languages-literature": 1.5, media: 0.5 }, undefined, { literature: 1 }),
  s("English B", "English B", { "languages-literature": 0.5 }, undefined, { languages: 1 }),
  s("Hindi", "Hindi", { "languages-literature": 0.5 }, undefined, { languages: 1 }),
  s("Tamil", "Tamil", { "languages-literature": 0.5 }, undefined, { languages: 1 }),
  s("French", "French", { "languages-literature": 0.5 }, undefined, { languages: 1 }),
  s("Spanish", "Spanish", { "languages-literature": 0.5 }, undefined, { languages: 1 }),
  s("German", "German", { "languages-literature": 0.5 }, undefined, { languages: 1 }),
  s("Visual Arts", "Visual Arts", { "visual-arts": 2, design: 0.5 }),
  s("Film", "Film", { media: 2 }, undefined, { film: 2 }),
  s("Theatre", "Theatre", { "performing-arts": 2 }, undefined, { theatre: 2 }),
  s("Music", "Music", { "performing-arts": 2 }),
];

export const A_LEVEL_SUBJECTS: CurriculumSubject[] = [
  s("Mathematics", "Maths", { mathematics: 2, economics: 0.5 }, ["maths"]),
  s("Further Mathematics", "Further Maths", { mathematics: 2, physics: 0.5 }, ["maths"]),
  s("Physics", "Physics", { physics: 2, engineering: 1 }, ["physics"]),
  s("Chemistry", "Chemistry", { chemistry: 2, medicine: 0.5 }, ["chemistry"]),
  s("Biology", "Biology", { biology: 2, medicine: 1 }, ["biology"]),
  s("Computer Science", "Comp Sci", { "computer-science": 2 }),
  s("Economics", "Economics", { economics: 2, finance: 0.5 }),
  s("Business", "Business", { business: 2 }),
  s("Accounting", "Accounting", { commerce: 1.5, finance: 1 }),
  s("Psychology", "Psychology", { psychology: 2 }),
  s("Sociology", "Sociology", { sociology: 2 }),
  s("History", "History", { history: 2 }),
  s("Geography", "Geography", { geography: 2 }),
  s("Politics", "Politics", { "political-science": 2 }, undefined, { politics: 1 }),
  s("Law", "Law", { law: 2 }),
  s("Philosophy", "Philosophy", { philosophy: 2 }),
  s("Religious Studies", "RS", { philosophy: 1, history: 0.5 }),
  s("Classical Civilisation", "Classics", { history: 1.5, "languages-literature": 0.5 }, undefined, { archaeology: 1 }),
  s("English Literature", "English Lit", { "languages-literature": 2 }, undefined, { literature: 1.5 }),
  s("English Language", "English Lang", { "languages-literature": 1.5 }, undefined, { languages: 1 }),
  s("Modern Foreign Language", "MFL", { "languages-literature": 1 }, undefined, { languages: 1.5 }),
  s("Art and Design", "Art & Design", { "visual-arts": 2, design: 1 }),
  s("Media Studies", "Media", { media: 2 }, undefined, { journalism: 1 }),
  s("Film Studies", "Film", { media: 2 }, undefined, { film: 2 }),
  s("Drama and Theatre", "Drama", { "performing-arts": 2 }, undefined, { theatre: 2 }),
  s("Music", "Music", { "performing-arts": 2 }),
  s("Environmental Science", "Env Sci", { environmental: 2 }),
];

export const IB_GRADES = ["7", "6", "5", "4", "3", "2", "1"] as const;
export const A_LEVEL_GRADES = ["A*", "A", "B", "C", "D", "E"] as const;
const A_POINTS: Record<string, number> = { "A*": 6, A: 5, B: 4, C: 3, D: 2, E: 1 };

export type TakenSubject = { name: string; level: string | null; grade: string | null };

/** "Physics|HL|6" entries → subjects; "CORE|2" → IB core points. */
export function parseTaken(entries: string[]): { subjects: TakenSubject[]; core: number | null } {
  const subjects: TakenSubject[] = [];
  let core: number | null = null;
  for (const e of entries) {
    const [name, level, grade] = e.split("|");
    if (name === "CORE") core = Number(level) || 0;
    else if (name) subjects.push({ name, level: level || null, grade: grade || null });
  }
  return { subjects, core };
}

export const findSubject = (scheme: "IB" | "A_LEVELS", name: string) => (scheme === "IB" ? IB_SUBJECTS : A_LEVEL_SUBJECTS).find((x) => x.name === name);

/** IB predicted total out of 45 (six subjects + up to 3 core points). */
export function ibTotal(subjects: TakenSubject[], core: number | null): number | null {
  const g = subjects.map((x) => Number(x.grade)).filter((n) => n >= 1 && n <= 7);
  if (g.length < 6) return null;
  return g.slice(0, 6).reduce((a, b) => a + b, 0) + Math.max(0, Math.min(3, core ?? 0));
}

/** A rough Class XII-style percentage, only to compare against selectivity bands (never shown as a conversion). */
export function equivalentPercent(scheme: "IB" | "A_LEVELS", subjects: TakenSubject[], core: number | null): number | null {
  if (scheme === "IB") {
    const t = ibTotal(subjects, core);
    if (t == null) return null;
    return t >= 42 ? 97 : t >= 39 ? 93 : t >= 36 ? 88 : t >= 33 ? 82 : t >= 30 ? 75 : t >= 27 ? 68 : 60;
  }
  const pts = subjects.map((x) => A_POINTS[x.grade ?? ""]).filter((n): n is number => !!n);
  if (!pts.length) return null;
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
  return avg >= 5.6 ? 97 : avg >= 5 ? 93 : avg >= 4.5 ? 88 : avg >= 4 ? 82 : avg >= 3 ? 72 : 62;
}
