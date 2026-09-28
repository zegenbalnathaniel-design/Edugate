import type { Archetype } from "@/lib/data/types";

/**
 * ~14 archetypes matched by cosine similarity against a student's normalized
 * signal vector (docs/04-passion-engine.md §5). Names describe orientation,
 * never prescribe identity — never job-title-shaped. Vectors are kept
 * distinct from one another so the match is meaningful rather than arbitrary.
 */
export const ARCHETYPES: Archetype[] = [
  {
    key: "builder_strategist",
    name: "The Builder-Strategist",
    vector: { creation: 0.9, systems: 0.8, technology: 0.6, business: 0.5 },
    description:
      "You don't just want to make something — you want to make it well, on purpose, with a plan behind it. Half your attention is on the thing itself, half on how the pieces fit together.",
    pullsAttention: [
      "how a product actually works under the hood",
      "half-finished builds you can improve",
      "the gap between a good idea and a working version",
      "tools that let you move faster",
    ],
    howYouWork: [
      "sketches a plan before touching anything",
      "prototypes fast, then tightens the loose parts",
      "keeps a running list of what's broken",
      "prefers shipping something small over polishing something imaginary",
    ],
    whatMotivates: [
      "seeing something exist that didn't before",
      "solving the actual constraint, not a fake version of it",
      "making a system that doesn't need babysitting",
    ],
    whatYouReturnTo: [
      "side projects that outgrow their original scope",
      "taking things apart to see the architecture",
      "asking 'what would this look like at 10x scale'",
    ],
  },
  {
    key: "systems_analyst",
    name: "The Systems-Analyst",
    vector: { systems: 0.9, analysis: 0.85, research: 0.5, curiosity: 0.4 },
    description:
      "You notice the structure behind things — the process, the incentive, the feedback loop — before you notice the surface details everyone else is looking at.",
    pullsAttention: [
      "why a process keeps producing the same failure",
      "the rule hiding underneath a pattern of exceptions",
      "diagrams, flowcharts, anything that maps a system",
      "second-order effects nobody mentioned",
    ],
    howYouWork: [
      "maps the whole thing before proposing a fix",
      "asks 'what's actually causing this' before 'how do we solve this'",
      "comfortable holding several moving parts at once",
      "distrusts explanations that are too neat",
    ],
    whatMotivates: [
      "a system finally making sense",
      "finding the one lever that changes everything else",
      "being right about a prediction because the model was right",
    ],
    whatYouReturnTo: [
      "reorganizing something that technically already worked",
      "questions that start with 'why does it keep happening'",
      "spreadsheets and diagrams nobody asked you to build",
    ],
  },
  {
    key: "connector_advocate",
    name: "The Connector-Advocate",
    vector: { people: 0.9, impact: 0.7, storytelling: 0.5, curiosity: 0.4 },
    description:
      "People's actual situations pull you in more than abstractions do. You remember details about individuals that other people forget, and you notice when someone's been left out of a room.",
    pullsAttention: [
      "what someone is actually going through, underneath what they say",
      "who's missing from a conversation",
      "small moments of unfairness other people scroll past",
      "the story behind a statistic",
    ],
    howYouWork: [
      "listens longer than feels necessary, on purpose",
      "builds trust before asking for anything",
      "translates between people who aren't hearing each other",
      "remembers names, context, and what mattered last time",
    ],
    whatMotivates: [
      "someone feeling genuinely heard",
      "closing the distance between a policy and the person it affects",
      "being trusted with something real",
    ],
    whatYouReturnTo: [
      "conversations that go longer than planned",
      "volunteering for the unglamorous, people-facing task",
      "noticing when a group dynamic is off",
    ],
  },
  {
    key: "field_researcher",
    name: "The Field-Researcher",
    vector: { research: 0.9, curiosity: 0.85, analysis: 0.6, exploration: 0.4 },
    description:
      "An unanswered question bothers you until you've chased it down. You'd rather spend three hours finding the real answer than five minutes accepting a plausible one.",
    pullsAttention: [
      "claims nobody has actually checked",
      "footnotes, sources, the fine print",
      "a weird result that doesn't fit the pattern",
      "questions with no easy answer yet",
    ],
    howYouWork: [
      "checks the primary source before repeating a claim",
      "keeps notes longer and messier than the task requires",
      "comfortable being wrong if the evidence says so",
      "would rather ask a sharper question than give a faster answer",
    ],
    whatMotivates: [
      "actually knowing, instead of assuming",
      "the moment a confusing result starts to make sense",
      "contributing one real, checkable fact to a bigger picture",
    ],
    whatYouReturnTo: [
      "rabbit holes that started from one small question",
      "collecting data before anyone asked you to",
      "double-checking things everyone else takes for granted",
    ],
  },
  {
    key: "storyteller_producer",
    name: "The Storyteller-Producer",
    vector: { storytelling: 0.9, creation: 0.7, design: 0.5, people: 0.4 },
    description:
      "You think in scenes, headlines, and hooks. Whatever the subject, your instinct is to ask how it would actually land with an audience — and then to go make that version.",
    pullsAttention: [
      "the detail that would make a story worth telling",
      "why one version of the same idea lands and another doesn't",
      "footage, formats, and framing",
      "an audience's real reaction, not the intended one",
    ],
    howYouWork: [
      "drafts fast, then cuts ruthlessly",
      "thinks about the ending before the opening",
      "borrows techniques from things outside the original medium",
      "tests a draft on a real person before calling it done",
    ],
    whatMotivates: [
      "a story changing how someone sees something",
      "finding the true detail that makes the whole thing click",
      "an audience reaction that wasn't faked",
    ],
    whatYouReturnTo: [
      "editing something down to its sharpest version",
      "noticing structure in shows, ads, speeches, everything",
      "capturing a moment before it's gone",
    ],
  },
  {
    key: "competitor_operator",
    name: "The Competitor-Operator",
    vector: { competition: 0.9, business: 0.6, systems: 0.5, analysis: 0.4 },
    description:
      "A scoreboard, a deadline, or a rival sharpens you rather than stressing you out. You want to know exactly where you stand and exactly what it would take to move up.",
    pullsAttention: [
      "rankings, brackets, leaderboards",
      "what the best in a field are actually doing differently",
      "a close game or a tight deadline",
      "any process with a clear win condition",
    ],
    howYouWork: [
      "trains the unglamorous fundamentals other people skip",
      "studies the competition before the event",
      "treats losses as data, not verdicts",
      "wants the scorecard, not just the vibe",
    ],
    whatMotivates: [
      "measurable proof of getting better",
      "winning something that was actually hard",
      "being the person people want on their team",
    ],
    whatYouReturnTo: [
      "keeping track of personal bests",
      "picking fights with problems everyone says are too hard",
      "practicing the boring part nobody sees",
    ],
  },
  {
    key: "explorer_generalist",
    name: "The Explorer-Generalist",
    vector: { exploration: 0.9, curiosity: 0.8, creation: 0.4, technology: 0.3 },
    description:
      "New terrain — a subject, a place, a skill — is more interesting to you than mastering one lane forever. You collect experiences the way other people collect expertise.",
    pullsAttention: [
      "anything you've never tried before",
      "a place, language, or subculture you know nothing about",
      "the unfamiliar option on the menu, literally or figuratively",
      "people who've lived a completely different life than you",
    ],
    howYouWork: [
      "says yes to the detour",
      "picks up new skills fast and shallow before going deep",
      "gets restless doing the exact same thing too long",
      "learns by being dropped into it, not by studying it first",
    ],
    whatMotivates: [
      "the feeling of a first time",
      "proof the world is bigger than your current picture of it",
      "collecting a genuinely wide range of experience",
    ],
    whatYouReturnTo: [
      "maps, itineraries, and 'what if we just went'",
      "trying the hobby everyone else gave up on",
      "conversations with strangers who know something you don't",
    ],
  },
  {
    key: "craft_designer",
    name: "The Craft-Designer",
    vector: { design: 0.9, creation: 0.75, curiosity: 0.4, storytelling: 0.3 },
    description:
      "How something looks, feels, and works together matters to you as much as whether it works at all. You notice bad spacing, bad flow, and bad proportions before you can explain why.",
    pullsAttention: [
      "why one version of a layout feels right and another doesn't",
      "materials, textures, and how things are actually made",
      "the small detail everyone else would skip",
      "objects and spaces that are quietly well-designed",
    ],
    howYouWork: [
      "iterates on the same piece many small times",
      "cares about the version nobody else will notice",
      "sketches before deciding",
      "borrows constraints on purpose, then works inside them",
    ],
    whatMotivates: [
      "something finally feeling right, not just correct",
      "making something that's a pleasure to use, not just usable",
      "a compliment about the detail you agonized over",
    ],
    whatYouReturnTo: [
      "rearranging a space until it works",
      "redoing something you already finished because it could be better",
      "collecting references and inspiration nobody assigned",
    ],
  },
  {
    key: "impact_organizer",
    name: "The Impact-Organizer",
    vector: { impact: 0.9, people: 0.6, systems: 0.5, business: 0.3 },
    description:
      "A problem you see in your community doesn't stay abstract for long — you start thinking about who's affected, what's actually broken, and what a first real step would look like.",
    pullsAttention: [
      "a local problem nobody's fixing",
      "the gap between how things should work and how they do",
      "who has the least power in a given situation",
      "small actions that could scale into bigger change",
    ],
    howYouWork: [
      "starts with the people closest to the problem",
      "turns frustration into a plan, fast",
      "organizes others around a shared, concrete goal",
      "measures progress by what actually changed, not by effort",
    ],
    whatMotivates: [
      "proof that something got measurably better",
      "being part of a fix instead of just naming a problem",
      "other people joining in because it mattered to them too",
    ],
    whatYouReturnTo: [
      "starting petitions, clubs, or drives without being asked",
      "noticing systems that quietly fail certain people",
      "asking 'who is this actually for'",
    ],
  },
  {
    key: "analytical_strategist",
    name: "The Analytical Strategist",
    vector: { analysis: 0.9, business: 0.7, competition: 0.5, systems: 0.5 },
    description:
      "Numbers, trends, and tradeoffs are where you feel most confident. You'd rather build the model that predicts the outcome than guess at it.",
    pullsAttention: [
      "a dataset that might contain a pattern nobody's found yet",
      "the tradeoff hiding behind a simple-sounding decision",
      "markets, odds, and incentives",
      "a forecast that turns out right or wrong",
    ],
    howYouWork: [
      "builds a model before trusting a gut call",
      "stress-tests an idea by arguing against it first",
      "comfortable with uncertainty as long as it's quantified",
      "prefers a defensible estimate over a confident guess",
    ],
    whatMotivates: [
      "a prediction that turns out to be right",
      "finding the variable that actually explains the outcome",
      "making a decision that holds up under scrutiny",
    ],
    whatYouReturnTo: [
      "spreadsheets that started as curiosity, not homework",
      "reading about markets, sports analytics, or elections",
      "arguing both sides of a decision before picking one",
    ],
  },
  {
    key: "technologist_maker",
    name: "The Technologist-Maker",
    vector: { technology: 0.9, creation: 0.7, systems: 0.5, analysis: 0.4 },
    description:
      "Code, circuits, and tools are your default way of turning an idea into something real. You'd rather build the small working version than describe the big imagined one.",
    pullsAttention: [
      "a new tool that could replace a clunky workaround",
      "how software or hardware actually does what it does",
      "a bug that resists an obvious fix",
      "something manual that's clearly automatable",
    ],
    howYouWork: [
      "learns by breaking something and fixing it",
      "reads documentation before asking for help",
      "prototypes in the smallest possible version first",
      "keeps a graveyard of half-finished builds and doesn't mind",
    ],
    whatMotivates: [
      "the exact moment something finally runs",
      "automating away a tedious, repeated task",
      "building a tool other people actually use",
    ],
    whatYouReturnTo: [
      "tinkering with something that already works, to make it better",
      "forums and communities built around a tool or platform",
      "a personal project that's never really 'done'",
    ],
  },
  {
    key: "entrepreneurial_connector",
    name: "The Entrepreneurial Connector",
    vector: { business: 0.85, people: 0.6, creation: 0.5, competition: 0.4 },
    description:
      "You see an unmet need and a way to meet it in the same glance, and you're comfortable asking other people to take a chance on the idea with you.",
    pullsAttention: [
      "a service or product that's obviously missing",
      "how other people make decisions about money and time",
      "a pitch that either lands or doesn't",
      "what it would take to get ten strangers to say yes",
    ],
    howYouWork: [
      "tests an idea on real people before building the whole thing",
      "comfortable asking for the sale, the favor, or the yes",
      "moves from idea to first version quickly",
      "treats rejection as information, not a verdict",
    ],
    whatMotivates: [
      "proof that people will actually pay or show up for it",
      "building something that runs without you standing over it",
      "turning an idea into something that exists in the world",
    ],
    whatYouReturnTo: [
      "side hustles, even small or short-lived ones",
      "noticing a gap in a market or a routine",
      "convincing people to try something new",
    ],
  },
  {
    key: "coach_mentor",
    name: "The Coach-Mentor",
    vector: { people: 0.8, impact: 0.5, competition: 0.4, systems: 0.4 },
    description:
      "You get real satisfaction from someone else getting better at something because of you — a teammate, a younger student, a group you're leading.",
    pullsAttention: [
      "the specific thing holding someone back from improving",
      "how a team or group actually functions under pressure",
      "small wins that build someone's confidence",
      "the difference between telling someone and showing them",
    ],
    howYouWork: [
      "breaks a big skill into a next, achievable step",
      "adjusts explanations to the person, not a script",
      "notices effort as much as outcome",
      "stays calm when someone else is frustrated",
    ],
    whatMotivates: [
      "watching someone succeed at something they couldn't do before",
      "being trusted to lead a group toward a shared goal",
      "a team performing better than its individual parts",
    ],
    whatYouReturnTo: [
      "informally tutoring or coaching without being asked",
      "captaining, organizing, or running practice",
      "checking in on how someone's actually doing",
    ],
  },
  {
    key: "inquisitive_systematizer",
    name: "The Inquisitive Systematizer",
    vector: { curiosity: 0.8, systems: 0.6, research: 0.6, analysis: 0.5 },
    description:
      "You're drawn to big, open questions, but you're not satisfied with a vague answer — you want to see how the pieces of the explanation actually connect.",
    pullsAttention: [
      "a question that sits at the edge of what's currently known",
      "how a seemingly unrelated field connects to another",
      "an explanation that's suspiciously tidy",
      "the difference between correlation and cause",
    ],
    howYouWork: [
      "follows a question wherever it leads, even off-topic",
      "builds a mental model before accepting a conclusion",
      "comfortable holding an unresolved question for a long time",
      "connects ideas across subjects other people keep separate",
    ],
    whatMotivates: [
      "an explanation that finally clicks into place",
      "discovering a connection nobody pointed out to you",
      "being the person who actually understands the mechanism",
    ],
    whatYouReturnTo: [
      "long reading detours that started from one Wikipedia page",
      "asking 'but why' past the point other people stop",
      "building frameworks to organize what you've learned",
    ],
  },
];
