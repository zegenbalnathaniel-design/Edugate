import type { Field, Program } from "./schema";

/*
 * Course taxonomy: one vocabulary (FieldKey) shared by student interests,
 * directory filters and course discovery. A program keeps its exact official
 * name; the taxonomy only decides which subject pages it appears on, so
 * "B.Com (Accounting & Finance)" shows up under Commerce *and* Finance, and
 * "BA (Hons) Philosophy, Politics and Economics" under Economics, Political
 * Science and Philosophy.
 */

export type Subject = {
  key: Field;
  label: string;
  /** Matched against the program's name, specialization and subfield (lower-cased). */
  patterns: RegExp[];
  /** Short description for the subject hub. Generic, not a claim about any institution. */
  blurb: string;
  group: SubjectGroup;
};

export type SubjectGroup = "Business & Economics" | "Science & Technology" | "Engineering" | "Health" | "Law & Society" | "Arts & Humanities" | "Design & Media";

export const SUBJECT_GROUPS: SubjectGroup[] = ["Business & Economics", "Science & Technology", "Engineering", "Health", "Law & Society", "Arts & Humanities", "Design & Media"];

export const SUBJECTS: Subject[] = [
  { key: "economics", label: "Economics", group: "Business & Economics", blurb: "BA/BSc Economics, Business Economics, Econometrics, PPE and joint degrees.",
    patterns: [/econom/, /\bppe\b/, /philosophy,? politics,? (and|&) economics/, /econometric/] },
  { key: "finance", label: "Finance", group: "Business & Economics", blurb: "Finance, banking, accounting & finance, insurance and actuarial programmes.",
    patterns: [/financ/, /\bbanking\b/, /insurance/, /investment/, /actuar/, /fintech/] },
  { key: "commerce", label: "Commerce", group: "Business & Economics", blurb: "B.Com and its variants — General, Corporate Secretaryship, Accounting, Honours, Professional Accounting.",
    patterns: [/\bb\.?\s?com\b/, /commerce/, /corporate secretaryship/, /accounting/, /taxation/] },
  { key: "business", label: "Business & Management", group: "Business & Economics", blurb: "BBA, BMS, management, entrepreneurship and business analytics.",
    patterns: [/business/, /management/, /\bbba\b/, /\bbms\b/, /business administration/, /entrepreneur/, /\bipm\b/] },
  { key: "sports-management", label: "Sports & Physical Education", group: "Business & Economics", blurb: "Sports management, sports science and physical education.",
    patterns: [/\bsports?\b/, /physical education/] },
  { key: "hospitality", label: "Hospitality & Tourism", group: "Business & Economics", blurb: "Hotel management, catering, hospitality and tourism.",
    patterns: [/hospitality/, /hotel/, /tourism/, /catering/] },

  { key: "computer-science", label: "Computer Science", group: "Science & Technology", blurb: "CS, IT, BCA, software, AI and cybersecurity.",
    patterns: [/computer/, /computing/, /software/, /\bbca\b/, /information technology/, /\bit\b/, /cyber/, /artificial intelligence/, /machine learning/] },
  { key: "data-science", label: "Data Science & AI", group: "Science & Technology", blurb: "Data science, analytics and AI programmes.",
    patterns: [/data science/, /analytics/, /artificial intelligence/, /\bai\b/, /machine learning/] },
  { key: "mathematics", label: "Mathematics", group: "Science & Technology", blurb: "Mathematics, applied mathematics and mathematics-with-X joint degrees.",
    patterns: [/mathemat/, /\bmaths?\b/] },
  { key: "statistics", label: "Statistics", group: "Science & Technology", blurb: "Statistics and actuarial science.", patterns: [/statistic/, /actuar/] },
  { key: "physics", label: "Physics", group: "Science & Technology", blurb: "Physics, applied physics and electronics-physics programmes.", patterns: [/physics/] },
  { key: "chemistry", label: "Chemistry", group: "Science & Technology", blurb: "Chemistry, industrial and applied chemistry.", patterns: [/chemistr/] },
  { key: "biology", label: "Life Sciences", group: "Science & Technology", blurb: "Zoology, botany/plant biology, microbiology, biochemistry and life sciences.",
    patterns: [/biolog/, /zoolog/, /botany/, /microbio/, /biochem/, /life science/, /genetic/] },
  { key: "biotechnology", label: "Biotechnology", group: "Science & Technology", blurb: "Biotechnology and bioengineering.", patterns: [/biotech/, /bioengineer/] },
  { key: "environmental", label: "Environmental Science", group: "Science & Technology", blurb: "Environmental science, sustainability and ecology.", patterns: [/environment/, /sustainab/, /ecolog/] },
  { key: "geography", label: "Geography", group: "Science & Technology", blurb: "Geography and geoinformatics.", patterns: [/geograph/, /geoinformatic/] },
  { key: "agriculture", label: "Agriculture", group: "Science & Technology", blurb: "Agriculture, horticulture and food science.", patterns: [/agricultur/, /horticultur/, /food science/, /food technology/] },

  { key: "engineering", label: "Engineering & Technology", group: "Engineering", blurb: "B.Tech and B.E. in every branch.",
    patterns: [/engineer/, /\bb\.?\s?tech\b/, /\bb\.?\s?e\.?\b/] },
  { key: "architecture", label: "Architecture", group: "Engineering", blurb: "B.Arch and planning.", patterns: [/architect/, /\bb\.?\s?arch\b/, /planning/] },

  { key: "medicine", label: "Medicine & Dentistry", group: "Health", blurb: "MBBS, BDS and other NEET-based medical degrees.",
    patterns: [/\bmbbs\b/, /medicine/, /\bbds\b/, /dental/, /surgery/] },
  { key: "pharmacy", label: "Pharmacy", group: "Health", blurb: "B.Pharm and Pharm.D.", patterns: [/pharm/] },
  { key: "nursing", label: "Nursing", group: "Health", blurb: "B.Sc Nursing.", patterns: [/nursing/] },
  { key: "allied-health", label: "Allied Health", group: "Health", blurb: "Physiotherapy, occupational therapy, optometry, radiology, nutrition and other allied health sciences.",
    patterns: [/physiotherap/, /occupational therap/, /optometr/, /allied health/, /radiolog/, /nutrition/, /dietetic/, /medical laboratory/, /audiology/] },
  { key: "psychology", label: "Psychology", group: "Health", blurb: "Psychology, applied and counselling psychology.", patterns: [/psycholog/] },

  { key: "law", label: "Law", group: "Law & Society", blurb: "LLB, five-year integrated BA/BBA/B.Com LLB.", patterns: [/\bll\.?\s?b\b/, /\blaw\b/, /legal/] },
  { key: "political-science", label: "Political Science", group: "Law & Society", blurb: "Political science, public policy and public administration.",
    patterns: [/politic/, /public policy/, /public administration/, /governance/] },
  { key: "international-relations", label: "International Relations", group: "Law & Society", blurb: "International relations and global studies.",
    patterns: [/international relations/, /international studies/, /global (affairs|studies)/, /defence and strategic/] },
  { key: "sociology", label: "Sociology", group: "Law & Society", blurb: "Sociology and anthropology.", patterns: [/sociolog/, /anthropolog/] },
  { key: "social-work", label: "Social Work", group: "Law & Society", blurb: "BSW and social work.", patterns: [/social work/, /\bbsw\b/] },
  { key: "social-sciences", label: "Social Sciences", group: "Law & Society", blurb: "Broad social-science degrees.", patterns: [/social science/] },
  { key: "education", label: "Education", group: "Law & Society", blurb: "B.Ed and education studies.", patterns: [/\bb\.?\s?ed\b/, /(?<!physical |health )\beducation\b/] },

  { key: "liberal-arts", label: "Liberal Arts", group: "Arts & Humanities", blurb: "Liberal arts and interdisciplinary degrees with flexible majors.",
    patterns: [/liberal (arts|studies|education)/, /interdisciplinary/] },
  { key: "languages-literature", label: "Languages & Literature", group: "Arts & Humanities", blurb: "English, Tamil, French, Hindi, Sanskrit and other language and literature degrees.",
    patterns: [/english/, /\btamil\b/, /french/, /hindi/, /sanskrit/, /german/, /literature/, /\blanguages?\b/, /linguistic/] },
  { key: "history", label: "History & Archaeology", group: "Arts & Humanities", blurb: "History, archaeology and museology.", patterns: [/histor/, /archaeolog/, /museolog/] },
  { key: "philosophy", label: "Philosophy", group: "Arts & Humanities", blurb: "Philosophy and religion.", patterns: [/philosoph/] },
  { key: "humanities", label: "Humanities", group: "Arts & Humanities", blurb: "Broad humanities programmes.", patterns: [/humanities/] },
  { key: "performing-arts", label: "Performing Arts", group: "Arts & Humanities", blurb: "Music, dance and theatre.", patterns: [/\bmusic\b/, /\bdance\b/, /theatre/, /bharatanatyam/] },
  { key: "visual-arts", label: "Fine & Visual Arts", group: "Arts & Humanities", blurb: "Fine arts, painting and sculpture.", patterns: [/fine arts?/, /visual arts/, /painting/, /sculpture/] },

  { key: "media", label: "Media & Journalism", group: "Design & Media", blurb: "Journalism, mass communication, visual communication, film and animation.",
    patterns: [/journalism/, /mass comm/, /\bmedia\b/, /visual communication/, /communication/, /multimedia/, /animation/, /\bfilm\b/, /\bbmm\b/] },
  { key: "design", label: "Design", group: "Design & Media", blurb: "B.Des — product, communication, fashion and interior design.",
    patterns: [/design/, /fashion/, /interior/, /\bb\.?\s?des\b/] },
];

export const SUBJECT_BY_KEY = Object.fromEntries(SUBJECTS.map((s) => [s.key, s])) as Record<Field, Subject>;

function haystack(p: Pick<Program, "name" | "subfield" | "degree"> & { specialization?: string | null }) {
  return [p.name, p.subfield, p.specialization, p.degree].filter(Boolean).join(" · ").toLowerCase();
}

/** Every subject a program belongs to: its primary field, explicit extras, and what its official name says. */
export function programSubjects(p: Pick<Program, "name" | "subfield" | "degree" | "field"> & { specialization?: string | null; alsoFields?: Field[] }): Field[] {
  const text = haystack(p);
  const found = new Set<Field>([p.field, ...(p.alsoFields ?? [])]);
  for (const s of SUBJECTS) if (s.patterns.some((re) => re.test(text))) found.add(s.key);
  return [...found];
}

/* ------------------------------ degrees ------------------------------ */

/** Canonical degree families used by the Degree filter. */
export const DEGREES = [
  "BA", "BSc", "BCom", "BBA", "BMS", "BCA", "BTech", "BE", "BArch", "BDes", "BVoc", "BSW", "BMM", "LLB", "BA LLB", "BBA LLB", "BCom LLB",
  "MBBS", "BDS", "BPharm", "BEd", "BS", "BEng", "Integrated", "Other",
] as const;
export type DegreeKey = (typeof DEGREES)[number];

/** "B.Com (Hons.)" → "BCom"; "B.A., LL.B. (Hons.)" → "BA LLB"; "BSc (Hons)" → "BSc". */
export function normalizeDegree(degree: string, level?: string): DegreeKey {
  const d = degree.toUpperCase().replace(/\(.*?\)/g, "").replace(/HONS?\.?/g, "").replace(/[.\s,]/g, "");
  if (/^BALLB/.test(d)) return "BA LLB";
  if (/^BBALLB/.test(d)) return "BBA LLB";
  if (/^BCOMLLB/.test(d)) return "BCom LLB";
  if (/LLB/.test(d)) return "LLB";
  const map: [RegExp, DegreeKey][] = [
    [/^BTECH|^BTEC/, "BTech"], [/^BENG/, "BEng"], [/^BE$|^BE\//, "BE"], [/^BARCH/, "BArch"], [/^BDES/, "BDes"], [/^BVOC/, "BVoc"],
    [/^BSW/, "BSW"], [/^BMM/, "BMM"], [/^BCOM/, "BCom"], [/^BBA/, "BBA"], [/^BMS/, "BMS"], [/^BCA/, "BCA"], [/^MBBS/, "MBBS"],
    [/^BDS/, "BDS"], [/^BPHARM/, "BPharm"], [/^BED$/, "BEd"], [/^BSC|^BSCS$/, "BSc"], [/^BS$|^BS\//, "BS"], [/^BA$|^BA\//, "BA"],
  ];
  for (const [re, k] of map) if (re.test(d)) return k;
  if (level === "integrated") return "Integrated";
  return "Other";
}

/* --------------------------- entrance tests --------------------------- */

/** Canonical test names for the Admissions filter, matched loosely against what institutions write. */
export const TESTS: { key: string; label: string; re: RegExp }[] = [
  { key: "CUET", label: "CUET (UG)", re: /\bcuet\b/i },
  { key: "JEE-MAIN", label: "JEE Main", re: /jee\W*main/i },
  { key: "JEE-ADV", label: "JEE Advanced", re: /jee\W*adv/i },
  { key: "NEET", label: "NEET (UG)", re: /\bneet\b/i },
  { key: "CLAT", label: "CLAT", re: /\bclat\b/i },
  { key: "IPMAT", label: "IPMAT", re: /\bipmat\b/i },
  { key: "SAT", label: "SAT", re: /^sat\b|\bsat\b(?!.*\bsubject\b)/i },
  { key: "ACT", label: "ACT", re: /^act$|\bact\b/i },
  { key: "BITSAT", label: "BITSAT", re: /bitsat/i },
  { key: "VITEEE", label: "VITEEE", re: /viteee/i },
  { key: "SRMJEEE", label: "SRMJEEE", re: /srmjee/i },
  { key: "NATA", label: "NATA / JEE Paper 2", re: /\bnata\b|paper\s*2/i },
  { key: "UCEED", label: "UCEED", re: /uceed/i },
  { key: "NID-DAT", label: "NID DAT", re: /\bdat\b/i },
  { key: "TNEA", label: "TNEA counselling", re: /\btnea\b/i },
  { key: "INSTITUTION", label: "Institution's own test", re: /entrance (test|exam)|aptitude test|admission test|\bset\b|own test/i },
];

export function normalizeTests(names: string[]): string[] {
  const out = new Set<string>();
  for (const n of names) {
    const hit = TESTS.find((t) => t.re.test(n));
    if (hit) out.add(hit.key);
  }
  return [...out];
}

export const TEST_LABEL = Object.fromEntries(TESTS.map((t) => [t.key, t.label]));
