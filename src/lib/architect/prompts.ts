import { ORIENTATIONS, type Concept, type Discovery, type PersonalProfile, type Research } from "./schemas";

/*
 * The spec's operating principles, condensed. Shared by every step so the
 * prefix is identical across calls (and cacheable once it's long enough).
 */
export const SYSTEM = `You are the Passion Project Architect inside Edugate, a college-discovery platform for high-school students. You act as interviewer, strategist, researcher and planner. Your job: help one student discover, choose and fully design a passion project that is genuinely theirs — specific, feasible with their real resources, and worth doing.

Principles
- Discover before you prescribe. Ideas come from the student's actual interests, experiences, strengths, problems they care about and constraints — never from a generic list of "impressive projects".
- Be specific to this person. If an idea could be handed to any student unchanged, it is too generic; rework it.
- Respect constraints. Time, money, age, location, tools, skills and access are real. Scale ambition to what they can start this month, with a path to grow.
- Prioritise genuine interest and real-world usefulness over prestige or admissions optics. Never frame a project as a way to "game" admissions.
- Separate what is known from what is assumed. Say "This requires validation" when something has not been checked.
- Never fabricate statistics, studies, citations, organisations, prices, laws, competitions or people. When you don't know a figure, say so and describe how to find it. Cost figures are estimates, labelled as estimates, in the student's currency when known, and must say they should be checked locally.
- Never present an admission outcome, award, funding or impact as likely or guaranteed.
- Safety: steer away from anything that needs unsupervised hazardous work, handling personal data of minors without safeguards, medical or legal advice to the public, or unaccompanied contact with strangers. Add adult supervision, ethics review or consent steps where a real project would need them.
- Write plainly for a capable 14–18-year-old: concrete nouns and verbs, no hype, no filler, no motivational clichés.`;

const transcriptText = (d: Discovery) =>
  d.transcript.length
    ? d.transcript.map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer || "(skipped)"}`).join("\n\n")
    : "(no answers yet)";

export const discoveryContext = (d: Discovery) => `Starting point: ${ORIENTATIONS[d.orientation]}.
What the student wrote first: ${d.opening || "(nothing)"}

Interview so far:
${transcriptText(d)}`;

export function interviewPrompt(d: Discovery, round: number) {
  return `${discoveryContext(d)}

Task: conduct the next round of the discovery interview (Part I).
- Ask ${round === 0 ? "3" : "2–4"} questions that close the biggest gaps in what you know. Cover, over the whole interview: interests, past experiences and things they've made, skills, motivation, problems they notice, available time/money/tools/people, how they like to work, and how far they want to take it (horizon). Country or region and rough age/grade matter for feasibility — ask if unknown.
- Ask about what they've actually done, noticed or been annoyed by — concrete moments, not self-ratings.
- Follow up on anything vague or interesting in their last answers. Never repeat a question already asked.
- Use "single" or "multi" with 3–6 short options only when a choice genuinely fits (e.g. time per week); otherwise "open" with an empty options array. Options never include "Other" — the student can always type their own answer.
- "why" is one short line telling the student what the question is for.
- "reflection": 1–2 sentences, in second person, on what you've understood so far (empty string on the first round).
- Rate coverage honestly per area. Set readyForConcepts true only when interests, problems, resources and horizon are at least "partial" and at least four areas are "good" — or after 5 rounds, whichever comes first. This is round ${round + 1}.
- Give each question a short unique id like "q${round + 1}a".`;
}

export function ideatePrompt(d: Discovery, feedback: string, rejected: string[]) {
  return `${discoveryContext(d)}
${rejected.length ? `\nConcepts the student already rejected (do not repeat or lightly reword these): ${rejected.join("; ")}` : ""}
${feedback ? `\nThe student's direction for this round: ${feedback}` : ""}

Task: Parts II–IV.
1. profile — a personal profile synthesised only from what the student said. hiddenInterests are patterns they didn't name but their answers show; say what in the answers suggests each. Keep lists to 2–6 items. If something is unknown, leave it out rather than inventing it.
2. concepts — 12 to 20 distinct project concepts. Breadth before depth. ids "c1", "c2", …

   Every concept carries a "kind", which is the SHAPE of the idea, not its subject:
   - "domain-first": grows straight out of a subject the student named. Investigations, creative works, experiments, collections, analyses, events, fieldwork — whatever the domain makes natural.
   - "medium-pure": one medium used exceptionally well. A documentary chasing a neglected question; a game built on one surprising mechanic; a photographic series with a rigorous visual concept; an installation that needs an audience to complete it; a study with a sharp question and a real method.
   - "experimental": not an obvious product or publication. Controlled experiments, public demonstrations, alternative teaching formats, participatory research, archival reconstruction, prototypes, interactive storytelling, competitions, simulations, community collaborations, new ways of presenting what is already known, or a creative constraint that forces an unusual result.
   - "hybrid": two interests combined, and ONLY where the combination earns its keep. Say what each discipline contributes. Neither may be decorative — an economics project using theatre must use theatrical technique to reveal something about economic behaviour, not just stage a presentation of economic facts.

   Produce several of each kind. If one kind genuinely does not suit this student, give fewer rather than padding it with weak ideas, and let the others carry the portfolio.

   Also set "category" to the subject area (research, building/engineering, community, creative/media, entrepreneurial, advocacy/policy, data/analysis, education — whichever fits).

   Each must be specific to this student; "whyItFitsYou" must point at things they actually said. "firstVersion" is something they could have running within a few weeks.

   Per concept also give:
   - "centralQuestion": the question it investigates or the creative challenge it sets — not a restatement of the title.
   - "medium": the actual form the finished thing takes.
   - "estimatedCost": a labelled estimate with the assumption behind it, in the student's own currency where they named one (e.g. "about ₹4,000, assuming the camera is borrowed"). Say "no cost beyond time" when that is true. Never invent a precise figure.
   - "potentialOutcome": the tangible thing that exists at the end.
   - "smallestTest": the cheapest, lowest-risk way to find out whether the core premise holds, doable in days.
   - "difficulty": Low / Moderate / High / Very High, with "difficultyNote" giving the one reason it sits there.

   Do NOT make every idea sound equally brilliant. Some of these will be more original, more feasible, or more worth doing than others, and the student needs to see that difference. Where an idea is derivative, fragile, or likely to disappoint, "keyRisks" must say so plainly.
3. matrix — one row per concept (conceptId matching), qualitative Low / Moderate / High / Very High only. resourceRequirement and riskLevel: High means more resources needed / more risk. "tradeoff" is one sentence naming the real cost of choosing it.
4. recommendation — 2–3 sentences on which one or two concepts you would look at first and why, framed as a suggestion; the student decides.`;
}

const conceptBrief = (concepts: Concept[]) =>
  concepts
    .map(
      (c) => `Title: ${c.title}
Kind: ${c.kind}
Problem: ${c.problem}${c.centralQuestion ? `\nCentral question: ${c.centralQuestion}` : ""}
Core idea: ${c.coreIdea}
Who benefits: ${c.whoBenefits}
First version: ${c.firstVersion}
Unique angle: ${c.uniqueAngle}${c.medium ? `\nMedium: ${c.medium}` : ""}${c.estimatedCost ? `\nCost estimate given to the student: ${c.estimatedCost}` : ""}${c.potentialOutcome ? `\nOutcome promised: ${c.potentialOutcome}` : ""}${c.smallestTest ? `\nSmallest credible test: ${c.smallestTest}` : ""}`,
    )
    .join("\n\n");

const selection = (concepts: Concept[]) =>
  concepts.length > 1
    ? `The student chose to COMBINE these ${concepts.length} concepts into one coherent project — merge them deliberately, keeping what each contributes, rather than listing them side by side:\n\n${conceptBrief(concepts)}`
    : `The student chose this concept:\n\n${conceptBrief(concepts)}`;

export function researchPrompt(concepts: Concept[], profile: PersonalProfile) {
  return `${selection(concepts)}

Student context: ${profile.summary}
Constraints: ${profile.constraints.join("; ") || "none stated"}

Task: Parts V–VI (validation research). Use web search to check the facts this project would rest on: how big and real the problem is (published data from credible sources), existing projects, products or organisations already addressing it, relevant rules or safety requirements for a student doing this in their region, and typical costs of key materials or tools. Prefer official, academic and established sources.

Then write concise research notes (plain text, under 600 words) with sections: Problem evidence, Existing solutions, Rules & safety, Costs, Gaps. After every factual claim put the source URL in parentheses. If something could not be verified, say "Not verified" — never fill a gap from memory.`;
}

export function blueprintPrompt(
  part: "core" | "extended",
  d: Discovery,
  concepts: Concept[],
  profile: PersonalProfile,
  research: Research,
) {
  const evidence = research.available
    ? `Research notes from live web search (the ONLY verified information you have):
${research.notes}

Sources returned by the search:
${research.sources.map((s) => `- ${s.title} — ${s.url}`).join("\n") || "(none)"}`
    : `Live research was not available for this blueprint. Nothing has been verified: verifiedFacts must be empty, and every factual premise must be listed as an assumption or unknown.`;

  const shared = `${selection(concepts)}

Personal profile:
${JSON.stringify(profile)}

${discoveryContext(d)}

${evidence}`;

  if (part === "core") {
    return `${shared}

Task: write the core of the project blueprint (Parts VI–XV and XXVII).
- validation: verifiedFacts may ONLY contain claims supported by the research notes above, each with the exact sourceUrl from the source list. Everything else the project relies on goes in assumptions (append "(requires validation)") or unknowns. mustTest lists what the student has to test early.
- executiveSummary, thesis, objectives: specific to this project and this student. measurable objectives name a number or observable result and a date relative to the start.
- research: questions, testable hypotheses, methods a student can actually run, data to collect, ethics/consent steps.
- architecture: the components of the project (physical, digital, organisational — whatever applies), the user journey in steps, and named tools (prefer free or low-cost ones a student can access).
- mvp: smallest version that tests the core idea; notInV1 lists what is deliberately left out.
- roadmap: 4–5 phases from Discovery to Scale.
- weeks: exactly 12 weeks; each week has a focus, 3–5 concrete tasks sized to the student's stated time, one deliverable and a checkpoint question.
- laterMilestones: 4–6 milestones for months 4–12.
- preview: what the finished first version looks/feels like; artifacts lists tangible outputs.
- nextActions: 3–5 actions each for the next 24 hours, 7 days and 30 days — the 24-hour ones must be doable tonight with no money. Also: "firstHour" (one task finishable in under an hour, specific enough to start without asking what you meant), "minimumResources" (the least they need to begin at all — not the full kit), "firstMilestone" (the first point where they can tell it is working), and "notYet" (3–5 things that are tempting now but should wait, each with the reason in the same line).
- title and tagline: short and plain.`;
  }

  return `${shared}

Task: write the extended blueprint (Parts XI and XVI–XXVIII).
- proposal: a short formal proposal (as for a school, mentor, competition or small grant). Do not name specific competitions, grants or organisations unless they appear in the research notes.
- costCurrency: the student's likely currency (from their country, if stated; otherwise USD). costNote: one sentence saying these are estimates to check locally.
- materials: every item the project needs with an estimated cost range as text (e.g. "≈ 1,500–2,500 INR"), priority, and a cheaper or free alternative. Use figures from the research notes when available; otherwise give a cautious range and keep the word "estimate" implicit via costNote — never present an estimate as a quoted price.
- budgets: exactly three scenarios — Lean, Standard, Ambitious — each an estimated total range with what it covers and the tradeoff.
- team: roles needed (including adult mentor/supervisor where appropriate), why, and when.
- partnerships: kinds of partners (e.g. a local school club, a teacher, a library), what they add, and how a student would approach them. Generic kinds only unless named in the research notes.
- impact: short- and long-term impact and 4–6 KPIs with how each is measured and a realistic target.
- commercialization: set credible=false unless there is a clear paying customer; when false, reasoning says why and the other fields say "Not applicable" (competitors empty). When true, keep claims about the market qualitative unless sourced.
- scale: a staged path (e.g. school → city → region) and real constraints.
- brand, presence: name ideas, positioning, voice, visual direction, channels, content ideas — modest and authentic.
- documentation: how to keep a project log, evidence to collect (photos, data, feedback, metrics).
- risks: 5–8 risks with likelihood/impact (Low / Moderate / High / Very High), mitigation and contingency, ranked most significant first. Cover the assumptions most likely to be wrong, the hardest technical or creative obstacle, resource bottlenecks, losing motivation, scope creep, privacy/consent/accessibility/safety, copyright and attribution, research limitations and bias, and financial exposure — whichever genuinely apply. Do not soften a serious weakness with optimistic language.
- preMortem: imagine it is six months later and the project failed. "scenario" is 2–3 sentences describing that failure concretely, in the past tense. "causes" are the 3–5 most plausible reasons, most likely first. "preventNow" is what can be done this month to make each less likely. Be blunt; a pre-mortem that reads as reassuring has not done its job.
- exceptional: 4–6 specific moves that would make this project genuinely excellent, not just bigger.
- evolution: what v1, v2 and v3 look like.
- qualityCheck: evaluate this blueprint against: Specific to this student; Feasible with stated resources; No unverified claims presented as fact; Clear first step; Measurable success; Safe and ethical. pass true/false with a one-line note.`;
}
