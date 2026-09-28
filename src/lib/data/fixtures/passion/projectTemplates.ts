import type { ProjectTemplate } from "@/lib/data/types";

/**
 * ~60 hand-authored project templates (docs/04-passion-engine.md §7). Selection
 * filters on signal thresholds, grade, and available time, then diversifies —
 * never three variations of one idea. `requires.signals[0]` is the primary
 * signal the selection code treats as defining; every SignalKey has multiple
 * templates listing it first. `firstStep` is always concrete and doable today.
 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "proj_curiosity_backstory",
    title: "The Backstory Project",
    rationale:
      "You're pulled toward the story hiding behind ordinary things — this turns that instinct into original, documented local history.",
    requires: { signals: ["curiosity", "research"], minNormalized: 0.35 },
    fields: ["media", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 6,
    skills: ["interviewing", "research", "writing", "archive digging"],
    learningOutcomes: [
      "Found and verified a piece of hidden local history",
      "Wrote it up for a real audience beyond a teacher",
    ],
    firstStep:
      "Pick one everyday object, building, or tradition at your school and ask the oldest staff member you know one specific question: 'Do you know how this started?'",
    portfolioValue:
      "Shows you can turn a stray question into documented original research — the instinct journalism and history programs look for.",
  },
  {
    id: "proj_curiosity_citizen_science",
    title: "Citizen Science Streak",
    rationale:
      "Your curiosity wants real, ongoing data, not a one-off worksheet — this plugs your observations into an actual scientific dataset.",
    requires: { signals: ["curiosity", "research"], minNormalized: 0.4 },
    fields: ["life_sciences", "technology"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["data collection", "observation protocols", "using a citizen-science app", "basic stats"],
    learningOutcomes: [
      "Collected data that feeds a live, public scientific dataset",
      "Can describe a real data-collection protocol from experience",
    ],
    firstStep:
      "Download iNaturalist or eBird right now and log the first three living things you can find outside your door.",
    portfolioValue:
      "Demonstrates sustained, disciplined observation and contribution to real scientific data, not a one-off assignment.",
  },
  {
    id: "proj_curiosity_myth_busting",
    title: "Myth-Busting Lab",
    rationale:
      "You want to actually check the claims everyone repeats — this gives your skepticism a real experiment to run.",
    requires: { signals: ["curiosity", "analysis"], minNormalized: 0.35 },
    fields: ["life_sciences", "media"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 5,
    skills: ["experimental design", "measurement", "writing up results", "structured skepticism"],
    learningOutcomes: [
      "Designed a fair test for a widely repeated claim",
      "Reported an honest result, even if it disproved the claim",
    ],
    firstStep:
      "Write down one 'everyone knows this' claim you've heard and one way you could test it today with stuff you already own.",
    portfolioValue:
      "Shows independent, evidence-based thinking — checking a claim instead of repeating it.",
  },
  {
    id: "proj_curiosity_deep_dive_podcast",
    title: "The Deep-Dive Podcast",
    rationale:
      "One topic can hold your attention for hours — this channels that obsession into a real, published series.",
    requires: { signals: ["curiosity", "storytelling"], minNormalized: 0.5 },
    fields: ["media", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 40,
    skills: ["audio editing", "interviewing", "scripting", "research", "publishing"],
    learningOutcomes: [
      "Produced multiple recorded, edited episodes",
      "Built and grew a small real audience",
    ],
    firstStep:
      "Record a 2-minute voice memo right now explaining, out loud, the one topic you could talk about for hours.",
    portfolioValue:
      "A running body of published audio work is a concrete, linkable portfolio piece few other applicants will have.",
  },
  {
    id: "proj_creation_short_film",
    title: "Three-Minute Film",
    rationale:
      "You'd rather build the thing than describe it — this puts your instinct for making toward a complete, finished film.",
    requires: { signals: ["creation", "storytelling"], minNormalized: 0.4 },
    fields: ["media", "design"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 20,
    skills: ["scriptwriting", "filming", "editing", "directing"],
    learningOutcomes: [
      "Wrote and shot a complete short film with a real arc",
      "Managed a small production from script to final cut",
    ],
    firstStep:
      "Write a one-paragraph logline — who wants what, and what's in the way — for a 3-minute film idea, right now.",
    portfolioValue:
      "A finished, watchable film is a direct portfolio piece for media, communications, or film programs.",
  },
  {
    id: "proj_creation_board_game",
    title: "Original Tabletop Game",
    rationale:
      "You want to build something that works as a whole system, not just a single piece — a game forces both.",
    requires: { signals: ["creation", "design"], minNormalized: 0.5 },
    fields: ["design", "business"],
    gradeRange: [9, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["game design", "prototyping", "playtesting", "rules writing", "iteration"],
    learningOutcomes: [
      "Built and playtested multiple versions of an original game",
      "Can explain exactly how playtester feedback changed the design",
    ],
    firstStep:
      "Grab index cards or scrap paper and sketch the board or card layout for your game idea in the next 30 minutes — ugly is fine.",
    portfolioValue:
      "A playtested original game shows design iteration and systems thinking that design and product programs specifically look for.",
  },
  {
    id: "proj_creation_zine_series",
    title: "Self-Published Zine",
    rationale:
      "You'd rather make a real, physical thing than talk about making one — a zine is small enough to finish this week.",
    requires: { signals: ["creation", "design"], minNormalized: 0.35 },
    fields: ["media", "design"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 6,
    skills: ["layout design", "illustration or writing", "self-publishing", "basic printing"],
    learningOutcomes: [
      "Designed and distributed a self-published print piece",
      "Built a recognizable visual style across multiple pages",
    ],
    firstStep:
      "Fold one sheet of paper into an 8-page mini zine and write a title and table of contents on it right now.",
    portfolioValue:
      "A physical, distributed publication demonstrates follow-through from idea to finished, shareable object.",
  },
  {
    id: "proj_creation_app_prototype",
    title: "Working App Prototype",
    rationale:
      "You build things instead of just imagining them — this pushes that instinct all the way to a real working prototype.",
    requires: { signals: ["creation", "technology"], minNormalized: 0.5 },
    fields: ["technology", "design"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 45,
    skills: ["UI design", "basic coding or no-code tools", "user testing", "iteration"],
    learningOutcomes: [
      "Built a clickable or functional prototype solving a real problem",
      "Tested it with real users and revised it based on what they said",
    ],
    firstStep:
      "Open a note and write down the exact daily annoyance your app would fix, in one sentence, using a real example from this week.",
    portfolioValue:
      "A working prototype used by real people is one of the strongest single artifacts for a technology or design application.",
  },
  {
    id: "proj_creation_music_ep",
    title: "Original Music EP",
    rationale:
      "You turn ideas into finished things — this is that instinct applied to a real, released body of music.",
    requires: { signals: ["creation", "storytelling"], minNormalized: 0.4 },
    fields: ["media", "design"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 25,
    skills: ["songwriting", "recording", "basic mixing", "releasing music"],
    learningOutcomes: [
      "Wrote and recorded multiple original tracks",
      "Released them somewhere real people can actually hear them",
    ],
    firstStep:
      "Hum or record a 15-second voice memo of a melody or lyric idea right now, before you lose it.",
    portfolioValue:
      "Released original music is a durable creative portfolio piece that shows finishing power, not just talent.",
  },
  {
    id: "proj_analysis_school_data",
    title: "Open Data Investigation",
    rationale:
      "You notice patterns in numbers other people skim past — this gives you a real public dataset to dig into.",
    requires: { signals: ["analysis", "systems"], minNormalized: 0.4 },
    fields: ["economics", "technology"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["spreadsheet analysis", "data cleaning", "chart-making", "drawing conclusions from data"],
    learningOutcomes: [
      "Analyzed a real public dataset from start to finish",
      "Produced a written finding backed by a supporting chart",
    ],
    firstStep:
      "Download one public dataset right now — your city's open data portal or your school's public test scores — and open it in a spreadsheet.",
    portfolioValue:
      "Shows you can turn raw public data into an actual finding — a core skill for economics, business, and CS programs.",
  },
  {
    id: "proj_analysis_stock_sim",
    title: "Tracked Investment Portfolio",
    rationale:
      "You like following a number to see if your reasoning about it holds up — this is that instinct made rigorous.",
    requires: { signals: ["analysis", "business"], minNormalized: 0.35 },
    fields: ["economics", "business"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["reading financial statements", "tracking performance", "writing an investment thesis"],
    learningOutcomes: [
      "Built and tracked a simulated portfolio over several weeks",
      "Can explain the specific reasoning behind each pick",
    ],
    firstStep:
      "Sign up for a free stock simulator right now and 'buy' your first simulated stock, writing one sentence on why you picked it.",
    portfolioValue:
      "A tracked, reasoned investment log shows financial literacy and follow-through that resonates in economics and business admissions.",
  },
  {
    id: "proj_analysis_election_forecast",
    title: "Build-Your-Own Forecast Model",
    rationale:
      "You want to predict the outcome, not just watch it happen — this builds and tests a real forecasting model.",
    requires: { signals: ["analysis", "systems"], minNormalized: 0.55 },
    fields: ["economics", "technology"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["statistics", "building a simple model", "polling or data interpretation", "visualization"],
    learningOutcomes: [
      "Built a working forecast model for a real upcoming outcome",
      "Compared its prediction to the real result and explained the error",
    ],
    firstStep:
      "Pick one upcoming local or school election and write down the three factors you think will decide it, right now.",
    portfolioValue:
      "A working prediction model with a documented result is a rare, concrete quantitative artifact for college applications.",
  },
  {
    id: "proj_analysis_budget_audit",
    title: "Real Budget Audit",
    rationale:
      "You're drawn to finding the actual number behind a decision — this applies that to real spending that matters.",
    requires: { signals: ["analysis", "business"], minNormalized: 0.35 },
    fields: ["economics", "business"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 5,
    skills: ["budgeting", "categorizing expenses", "proposing cuts", "basic spreadsheets"],
    learningOutcomes: [
      "Analyzed real spending data by category",
      "Proposed one specific, costed change based on the analysis",
    ],
    firstStep:
      "Ask a parent or your club treasurer for one month of real spending and list the categories in a spreadsheet right now.",
    portfolioValue:
      "Shows practical financial analysis applied to a real budget, not a hypothetical one.",
  },
  {
    id: "proj_analysis_ab_test",
    title: "Self-Experiment: A/B Test",
    rationale:
      "You want proof, not a guess — this turns your own routine into a small controlled experiment.",
    requires: { signals: ["analysis", "curiosity"], minNormalized: 0.4 },
    fields: ["economics", "technology"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 12,
    skills: ["experiment design", "controlling variables", "data logging", "statistical thinking"],
    learningOutcomes: [
      "Ran a controlled comparison on something real in your own life",
      "Drew a conclusion backed by logged data, not a hunch",
    ],
    firstStep:
      "Pick one thing you can split-test on yourself this week — study method, post time, practice routine — and write your two 'versions' down now.",
    portfolioValue:
      "Demonstrates rigorous, self-directed experimental thinking outside a classroom assignment.",
  },
  {
    id: "proj_systems_school_process_map",
    title: "Fix a Broken School Process",
    rationale:
      "You see the structure behind a mess before anyone else names it — this puts that instinct on a process you deal with weekly.",
    requires: { signals: ["systems", "analysis"], minNormalized: 0.4 },
    fields: ["business", "engineering"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 6,
    skills: ["process mapping", "interviewing stakeholders", "proposing improvements"],
    learningOutcomes: [
      "Diagrammed a real, multi-step process end to end",
      "Identified the actual bottleneck, not the obvious one",
    ],
    firstStep:
      "Pick one annoying school process — the lunch line, locker assignment, club sign-up — and write down every single step it takes, in order, right now.",
    portfolioValue:
      "Process mapping and improvement is a direct, transferable skill for engineering, business, and operations programs.",
  },
  {
    id: "proj_systems_supply_chain",
    title: "Trace a Supply Chain",
    rationale:
      "You want to see the whole system behind one object, not just the object — this makes an invisible chain visible.",
    requires: { signals: ["systems", "curiosity"], minNormalized: 0.4 },
    fields: ["economics", "engineering"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 14,
    skills: ["research", "diagramming", "systems mapping", "sourcing information"],
    learningOutcomes: [
      "Traced a real product's path from raw material to shelf",
      "Diagrammed the full chain with actual sourced steps",
    ],
    firstStep:
      "Pick one object within arm's reach, flip it over, and write down every material or country-of-origin clue printed on it, right now.",
    portfolioValue:
      "Shows the ability to make a complex, invisible system visible and understandable — valued in engineering and economics.",
  },
  {
    id: "proj_systems_automation_tool",
    title: "Automate a Repeated Task",
    rationale:
      "Repeated manual work bothers you until you've engineered it away — here's a real task worth automating.",
    requires: { signals: ["systems", "technology"], minNormalized: 0.4 },
    fields: ["technology", "engineering"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 16,
    skills: ["scripting or no-code automation", "workflow design", "testing"],
    learningOutcomes: [
      "Built a tool that removes a real, repeated task",
      "Measured the actual time or effort it saves",
    ],
    firstStep:
      "Time yourself doing the repetitive task once, right now, with a stopwatch, and write down exactly which steps repeat.",
    portfolioValue:
      "A working automation that real people rely on is a concrete engineering artifact beyond a class assignment.",
  },
  {
    id: "proj_systems_simulation",
    title: "Model a Real-World System",
    rationale:
      "You think in feedback loops and variables — this builds a working simulation to test that thinking against reality.",
    requires: { signals: ["systems", "analysis"], minNormalized: 0.55 },
    fields: ["engineering", "life_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 30,
    skills: ["modeling", "coding or spreadsheet simulation", "parameter testing", "interpreting results"],
    learningOutcomes: [
      "Built a working simulation of a real-world system",
      "Tested how changing one variable shifts the outcome",
    ],
    firstStep:
      "Pick one system — traffic at a light, spread of a rumor, a predator-prey pair — and write down the three variables that drive it, right now.",
    portfolioValue:
      "A working simulation model is a striking, rare artifact for engineering and quantitative science applications.",
  },
  {
    id: "proj_people_oral_history",
    title: "Recorded Oral History",
    rationale:
      "You're pulled toward people's actual stories, not the summary version — this makes space to record them properly.",
    requires: { signals: ["people", "storytelling"], minNormalized: 0.4 },
    fields: ["social_sciences", "media"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["interviewing", "active listening", "transcription", "archiving"],
    learningOutcomes: [
      "Recorded and archived real oral history interviews",
      "Produced a written or audio summary others can use",
    ],
    firstStep:
      "Message one older relative or neighbor right now and ask if you can record them telling one story from their life, 20 minutes, this week.",
    portfolioValue:
      "Original oral history is primary-source research that stands out in social science and journalism applications.",
  },
  {
    id: "proj_people_support_group",
    title: "Start a Peer Support Circle",
    rationale:
      "You notice when someone's struggling before anyone says anything — this turns that awareness into a real, recurring space.",
    requires: { signals: ["people", "impact"], minNormalized: 0.4 },
    fields: ["psychology", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 20,
    skills: ["facilitation", "active listening", "organizing recurring meetings", "confidentiality practices"],
    learningOutcomes: [
      "Launched a recurring peer group addressing a real, specific need",
      "Ran multiple real sessions, not just a one-time meeting",
    ],
    firstStep:
      "Message three classmates right now and ask if they'd show up to a first meeting about the specific issue you noticed.",
    portfolioValue:
      "Founding and sustaining a peer-support structure shows initiative and people-leadership beyond a title.",
  },
  {
    id: "proj_people_interview_series",
    title: "Career Interview Series",
    rationale:
      "You'd rather talk to the person than read about the job — this uses that instinct to build a real resource.",
    requires: { signals: ["people", "curiosity"], minNormalized: 0.35 },
    fields: ["media", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["cold outreach", "interviewing", "writing profiles", "compiling a resource"],
    learningOutcomes: [
      "Interviewed several real professionals about their work",
      "Compiled a resource other students actually used",
    ],
    firstStep:
      "Message three people in your school or family network with jobs you're curious about and ask for 15 minutes this week.",
    portfolioValue:
      "Shows comfort reaching out to strangers and turning conversations into something useful for others.",
  },
  {
    id: "proj_people_mentorship_program",
    title: "Design a Mentorship Program",
    rationale:
      "You care about other people getting better, not just doing well yourself — this builds a real structure for that.",
    requires: { signals: ["people", "systems"], minNormalized: 0.5 },
    fields: ["psychology", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["program design", "recruiting and matching participants", "running check-ins", "evaluating outcomes"],
    learningOutcomes: [
      "Designed and ran a full mentorship cycle from matching to wrap-up",
      "Collected real feedback on what worked and what didn't",
    ],
    firstStep:
      "Message two younger students right now and ask what one thing about high school they wish someone had explained to them.",
    portfolioValue:
      "Running a structured people-program end-to-end is exactly the kind of leadership colleges ask applicants to describe.",
  },
  {
    id: "proj_people_family_history",
    title: "Family History Archive",
    rationale:
      "You have the patience for slow, relationship-based research — this preserves stories that would otherwise disappear.",
    requires: { signals: ["people", "research"], minNormalized: 0.35 },
    fields: ["social_sciences", "media"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 6,
    skills: ["interviewing", "note-taking", "organizing a timeline", "light genealogy research"],
    learningOutcomes: [
      "Documented real family stories and built a timeline",
      "Preserved information that would otherwise be lost",
    ],
    firstStep:
      "Call or message the oldest relative you're comfortable reaching and ask them one specific question about their childhood, today.",
    portfolioValue:
      "Shows patience for slow, relationship-based research — a real skill in social science and history fields.",
  },
  {
    id: "proj_competition_esports_team",
    title: "Organize a Competitive Team",
    rationale:
      "A scoreboard sharpens your focus — this turns that instinct into a real team you organize and run.",
    requires: { signals: ["competition", "systems"], minNormalized: 0.4 },
    fields: ["business", "sports"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 18,
    skills: ["team organizing", "scheduling", "basic sponsorship or budget outreach", "running matches"],
    learningOutcomes: [
      "Organized a functioning competitive team or mini-league",
      "Ran real matches against other schools or teams",
    ],
    firstStep:
      "Message five classmates who play the same game right now and ask if they'd join a team that competes against other schools.",
    portfolioValue:
      "Organizing a competitive team shows leadership and operations skill wrapped in something you already love.",
  },
  {
    id: "proj_competition_hackathon",
    title: "Run a Student Hackathon",
    rationale:
      "You want other people competing too, not just yourself — this builds the whole event, not just your entry.",
    requires: { signals: ["competition", "business"], minNormalized: 0.5 },
    fields: ["business", "technology"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 40,
    skills: ["event planning", "sponsor or partner outreach", "logistics", "judging criteria design"],
    learningOutcomes: [
      "Planned and ran a real multi-team competitive event",
      "Recruited participants, mentors, or judges to show up",
    ],
    firstStep:
      "Message one teacher right now to ask if a classroom or the library would be free on a Saturday for an event.",
    portfolioValue:
      "Running an event other people compete in is a strong, visible leadership credential.",
  },
  {
    id: "proj_competition_debate_circuit",
    title: "Run the Debate Season",
    rationale:
      "You want the pressure of a real round, not a practice one — this tracks a full competitive season of it.",
    requires: { signals: ["competition", "storytelling"], minNormalized: 0.5 },
    fields: ["law", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 40,
    skills: ["argumentation", "rebuttal", "public speaking", "research under time pressure"],
    learningOutcomes: [
      "Competed across a full season and tracked round-by-round performance",
      "Can point to a specific skill that measurably improved",
    ],
    firstStep:
      "Pick one current debatable topic and write the strongest argument against your own instinctive opinion, right now, for 10 minutes.",
    portfolioValue:
      "A tracked competitive record with visible improvement is compelling evidence for law, poli-sci, and communications programs.",
  },
  {
    id: "proj_competition_personal_record",
    title: "Data-Driven Training Plan",
    rationale:
      "You want a measurable win, not a vague improvement — this builds a real, tracked plan to get one.",
    requires: { signals: ["competition", "analysis"], minNormalized: 0.35 },
    fields: ["sports", "life_sciences"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 10,
    skills: ["goal setting", "tracking performance data", "structured training design"],
    learningOutcomes: [
      "Designed a training plan grounded in real baseline data",
      "Hit or missed a specific measurable goal, and can explain why",
    ],
    firstStep:
      "Time or measure your current baseline — the exact thing you want to improve — right now and write down the number.",
    portfolioValue:
      "A data-tracked improvement shows discipline and self-directed goal achievement outside of grades.",
  },
  {
    id: "proj_exploration_microadventure_log",
    title: "Local Micro-Adventure Guide",
    rationale:
      "You'd rather go see it than read about it — this turns that instinct into a guide other people can use.",
    requires: { signals: ["exploration", "storytelling"], minNormalized: 0.35 },
    fields: ["media", "life_sciences"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 6,
    skills: ["trip planning", "writing or photography", "mapping", "publishing a guide"],
    learningOutcomes: [
      "Completed and documented several local outings",
      "Published a usable guide for others to follow",
    ],
    firstStep:
      "Pick one place within a 30-minute walk or drive you've never been and put a specific date and time on your calendar to go this week.",
    portfolioValue:
      "A published local guide shows initiative and the ability to turn ordinary curiosity into something others can use.",
  },
  {
    id: "proj_exploration_language_immersion",
    title: "Self-Directed Language Sprint",
    rationale:
      "New, unfamiliar territory pulls you in more than the familiar path — this is a real sprint into a language you've never studied.",
    requires: { signals: ["exploration", "curiosity"], minNormalized: 0.4 },
    fields: ["social_sciences", "media"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 20,
    skills: ["self-directed language learning", "conversation practice", "documenting progress"],
    learningOutcomes: [
      "Reached a real conversational milestone in a new language",
      "Documented the learning process, including what didn't work",
    ],
    firstStep:
      "Pick a language you've never studied and have a 2-minute conversation, even badly, with a language app's voice feature right now.",
    portfolioValue:
      "Self-directed language acquisition, documented over time, demonstrates independent learning ability.",
  },
  {
    id: "proj_exploration_field_survey",
    title: "Field Survey Over Time",
    rationale:
      "You want to be out in unfamiliar terrain, not reading about it secondhand — this builds a real, dated catalogue from repeat visits.",
    requires: { signals: ["exploration", "research"], minNormalized: 0.4 },
    fields: ["life_sciences", "architecture"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 18,
    skills: ["field observation", "species or site identification", "data logging", "cataloguing over time"],
    learningOutcomes: [
      "Built a dated catalogue of a local site across multiple visits",
      "Noticed and documented a real change over time",
    ],
    firstStep:
      "Walk to the nearest park, creek, or green space right now and write down the first five living things or features you notice.",
    portfolioValue:
      "A sustained field survey shows the patience and rigor real field science requires.",
  },
  {
    id: "proj_exploration_urban_map",
    title: "Under-the-Radar City Map",
    rationale:
      "You're drawn to the places nobody's documented yet — this turns that into a real, published guide.",
    requires: { signals: ["exploration", "design"], minNormalized: 0.5 },
    fields: ["media", "architecture"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 32,
    skills: ["mapping", "photography", "research into local history", "publishing"],
    learningOutcomes: [
      "Documented and mapped several under-known local spots",
      "Published a guide others actually used to explore",
    ],
    firstStep:
      "Ask one long-time local — a parent, shop owner, or librarian — right now for one place in town most people don't know about.",
    portfolioValue:
      "A published map or guide is a tangible, shareable artifact showing initiative and place-based research.",
  },
  {
    id: "proj_research_science_fair",
    title: "Original Science Fair Experiment",
    rationale:
      "You want the real answer, not the plausible one — this is a full original experiment built to find it.",
    requires: { signals: ["research", "analysis"], minNormalized: 0.5 },
    fields: ["life_sciences", "engineering"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 40,
    skills: ["hypothesis design", "controlled experimentation", "statistical analysis", "scientific writing"],
    learningOutcomes: [
      "Designed and ran an original experiment from hypothesis to conclusion",
      "Wrote it up to a competition-ready standard",
    ],
    firstStep:
      "Write down one question about something in your daily life that starts with 'I wonder if X actually causes Y' — right now.",
    portfolioValue:
      "An original, well-documented experiment is the single strongest artifact for STEM college applications.",
  },
  {
    id: "proj_research_lit_review",
    title: "Original Literature Review",
    rationale:
      "You chase a question through sources until you actually understand it — this builds that chase into a real review.",
    requires: { signals: ["research", "curiosity"], minNormalized: 0.4 },
    fields: ["life_sciences", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 20,
    skills: ["academic search", "source evaluation", "synthesis writing", "citation"],
    learningOutcomes: [
      "Synthesized findings across many sources into one coherent review",
      "Identified a genuinely open question in the field",
    ],
    firstStep:
      "Search Google Scholar for your topic right now and save the titles of the first five papers that actually look relevant.",
    portfolioValue:
      "A synthesized literature review demonstrates college-level research skill before college.",
  },
  {
    id: "proj_research_survey_study",
    title: "Original Survey Study",
    rationale:
      "You want to know what's actually true about people's behavior, not assume it — this designs a real study to find out.",
    requires: { signals: ["research", "people"], minNormalized: 0.4 },
    fields: ["psychology", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["survey design", "sampling", "basic statistics", "writing findings"],
    learningOutcomes: [
      "Designed and ran an original survey with a real sample",
      "Analyzed and reported the results honestly, including surprises",
    ],
    firstStep:
      "Write the first three questions of your survey right now and send them to two friends to check if the wording is confusing.",
    portfolioValue:
      "An original survey study shows you can design a fair instrument and let data change your mind.",
  },
  {
    id: "proj_research_archive_project",
    title: "Local Preservation Archive",
    rationale:
      "You want to check the sources, not repeat the legend — this applies that to a real building or event worth preserving.",
    requires: { signals: ["research", "curiosity"], minNormalized: 0.35 },
    fields: ["architecture", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["archival research", "interviewing", "historical documentation"],
    learningOutcomes: [
      "Documented a real local building or event with sourced evidence",
      "Produced something that could genuinely support preservation efforts",
    ],
    firstStep:
      "Pick one old building or landmark near you and take five photos of it, plus a photo of any historical plaque or sign, right now.",
    portfolioValue:
      "Original preservation-quality documentation shows serious archival research skill.",
  },
  {
    id: "proj_research_replicate_study",
    title: "Replicate a Published Study",
    rationale:
      "You want to see if the famous result actually holds up — this replicates it yourself, honestly, on a real sample.",
    requires: { signals: ["research", "analysis"], minNormalized: 0.55 },
    fields: ["psychology", "life_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["reading academic methods sections", "replicating a protocol", "statistical comparison", "honest reporting"],
    learningOutcomes: [
      "Replicated a real published study on a small sample",
      "Compared results honestly to the original, including where they diverged",
    ],
    firstStep:
      "Find one short, famous psychology study and write down its exact method in your own words, right now.",
    portfolioValue:
      "Replicating a real study shows rare methodological rigor for a high schooler.",
  },
  {
    id: "proj_design_room_renovation",
    title: "Real Space Redesign",
    rationale:
      "You notice when a space doesn't work before you can explain why — this gives you a real room and a real budget to fix it.",
    requires: { signals: ["design", "systems"], minNormalized: 0.4 },
    fields: ["architecture", "design"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 18,
    skills: ["space planning", "budgeting", "sketching or basic CAD", "incorporating stakeholder feedback"],
    learningOutcomes: [
      "Produced a real redesign plan with measurements and a budget",
      "Presented it to whoever actually owns the space",
    ],
    firstStep:
      "Measure the actual room you want to redesign with a tape measure right now and sketch its current layout on paper.",
    portfolioValue:
      "A real, budgeted space redesign is a concrete architecture and design portfolio piece grounded in an actual constraint.",
  },
  {
    id: "proj_design_product_redesign",
    title: "Redesign a Product You Hate Using",
    rationale:
      "Bad design bothers you before you can name why — this makes you name it, then fix it.",
    requires: { signals: ["design", "curiosity"], minNormalized: 0.35 },
    fields: ["design", "business"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["UX critique", "sketching alternatives", "rapid prototyping", "articulating design reasoning"],
    learningOutcomes: [
      "Identified specific usability flaws in a real product",
      "Sketched and justified a concrete redesign",
    ],
    firstStep:
      "Use the product you dislike right now, screenshot or photograph the exact moment it frustrates you, and write down why.",
    portfolioValue:
      "A critiqued and redesigned real product demonstrates design thinking grounded in an actual user problem.",
  },
  {
    id: "proj_design_fashion_capsule",
    title: "Wearable Capsule Collection",
    rationale:
      "You want to make something that works together as a whole set, not one piece — this builds a real, wearable collection.",
    requires: { signals: ["design", "creation"], minNormalized: 0.5 },
    fields: ["design", "business"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["garment construction or sourcing", "sketching", "styling", "small-batch production"],
    learningOutcomes: [
      "Designed and produced multiple wearable pieces",
      "Assembled them into one cohesive, finished collection",
    ],
    firstStep:
      "Sketch three thumbnail outfit ideas for your collection's theme on paper right now, no more than two minutes each.",
    portfolioValue:
      "A finished wearable capsule collection is a direct, physical portfolio piece for design programs.",
  },
  {
    id: "proj_design_brand_identity",
    title: "Brand Identity for a Real Client",
    rationale:
      "You want your design work used, not just admired — this ties it to an actual local business.",
    requires: { signals: ["design", "business"], minNormalized: 0.35 },
    fields: ["design", "business"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 10,
    skills: ["logo design", "color and typography systems", "brand guideline writing", "client communication"],
    learningOutcomes: [
      "Delivered a complete, usable visual identity to a real client",
      "Can describe the design reasoning behind every choice",
    ],
    firstStep:
      "Message one real local business or club owner right now and ask if they'd let you design them a free logo concept.",
    portfolioValue:
      "A brand identity used by a real client is a professional-grade design portfolio piece with a real stakeholder.",
  },
  {
    id: "proj_design_accessible_space",
    title: "Accessibility Redesign Proposal",
    rationale:
      "You care about who a space actually leaves out — this turns that noticing into a real, costed proposal.",
    requires: { signals: ["design", "impact"], minNormalized: 0.5 },
    fields: ["architecture", "design"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 30,
    skills: ["accessibility auditing", "measurement against real standards", "proposal writing", "stakeholder presentation"],
    learningOutcomes: [
      "Audited a real public space against accessibility standards",
      "Delivered a specific, costed proposal to fix it",
    ],
    firstStep:
      "Walk through one public space right now pretending you use a wheelchair, and note the first three real obstacles you'd hit.",
    portfolioValue:
      "An accessibility audit with real proposed fixes shows applied design ethics that architecture programs value.",
  },
  {
    id: "proj_business_microstore",
    title: "Run a Real Micro-Business",
    rationale:
      "You see an unmet need and want to meet it, not just describe it — this is a real business you run for a season.",
    requires: { signals: ["business", "creation"], minNormalized: 0.55 },
    fields: ["business", "entrepreneurship"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 50,
    skills: ["product sourcing or making", "pricing", "marketing", "sales tracking", "customer service"],
    learningOutcomes: [
      "Ran a real business across a full season",
      "Can show real revenue, real costs, and specific lessons learned",
    ],
    firstStep:
      "Write down the exact product or service you'd sell and text five people right now asking if they'd actually buy it.",
    portfolioValue:
      "Real revenue and a real profit-and-loss statement from a business you ran is the most concrete entrepreneurship credential available.",
  },
  {
    id: "proj_business_pop_up",
    title: "One-Day Pop-Up Shop",
    rationale:
      "You want a fast test of a real idea, not a hypothetical one — this is a single real sales event with a real result.",
    requires: { signals: ["business", "competition"], minNormalized: 0.35 },
    fields: ["business", "entrepreneurship"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 10,
    skills: ["pricing", "basic inventory", "sales", "simple profit-and-loss tracking"],
    learningOutcomes: [
      "Ran one real sales event start to finish",
      "Produced an honest profit-and-loss report afterward",
    ],
    firstStep:
      "Pick one product you could make or source cheaply, and text one place — school, church, market — right now asking to reserve a table on a date.",
    portfolioValue:
      "A one-day event with a real profit-and-loss statement is a small but genuine business credential.",
  },
  {
    id: "proj_business_market_research",
    title: "Test a Business Idea on Real Customers",
    rationale:
      "You want to know if people would actually pay before you build anything — this tests that directly.",
    requires: { signals: ["business", "analysis"], minNormalized: 0.4 },
    fields: ["business", "entrepreneurship"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 16,
    skills: ["customer interviews", "competitive analysis", "basic business plan writing"],
    learningOutcomes: [
      "Validated or invalidated a business idea against real potential customers",
      "Wrote a one-page plan grounded in what they actually said",
    ],
    firstStep:
      "Message three people in your target customer group right now and ask what they currently do to solve the problem your idea addresses.",
    portfolioValue:
      "Evidence of testing a business idea against real customers before building it shows entrepreneurial judgment.",
  },
  {
    id: "proj_business_freelance_gig",
    title: "Land Your First Paid Gig",
    rationale:
      "You want proof someone will pay for your skill, not just praise it — this gets you a real, paid client.",
    requires: { signals: ["business", "creation"], minNormalized: 0.35 },
    fields: ["business", "entrepreneurship"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["pitching", "pricing your work", "client communication", "invoicing basics"],
    learningOutcomes: [
      "Completed and got paid for one real freelance job",
      "Can describe the client relationship end to end",
    ],
    firstStep:
      "Message one person or small business right now offering a specific skill — design, tutoring, social posts — for a set price.",
    portfolioValue:
      "A real paid gig, however small, is verifiable proof of a marketable skill.",
  },
  {
    id: "proj_business_nonprofit_fundraiser",
    title: "Run a Fundraiser with a Real Goal",
    rationale:
      "You want the outcome to be measurable, not just well-intentioned — this ties a real cause to a real dollar target.",
    requires: { signals: ["business", "impact"], minNormalized: 0.5 },
    fields: ["business", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["campaign planning", "donor outreach", "budgeting", "impact reporting"],
    learningOutcomes: [
      "Ran a real fundraiser against a specific dollar goal",
      "Produced a report on funds raised and exactly how they were used",
    ],
    firstStep:
      "Pick one specific cause and one specific dollar goal, and message the organization right now asking if they'd accept a student-run drive.",
    portfolioValue:
      "A fundraiser with a real dollar total and impact report shows both initiative and accountability.",
  },
  {
    id: "proj_technology_personal_website",
    title: "Ship a Live Personal Website",
    rationale:
      "You'd rather have something deployed than something planned — this gets a real site live today.",
    requires: { signals: ["technology", "creation"], minNormalized: 0.35 },
    fields: ["technology", "design"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["HTML/CSS or a site builder", "basic hosting", "content writing", "iterating on feedback"],
    learningOutcomes: [
      "Built and deployed a live, working personal website",
      "Got real feedback on it and revised based on that feedback",
    ],
    firstStep:
      "Register a free hosting option — GitHub Pages, Netlify, or similar — right now and publish a page with just your name on it.",
    portfolioValue:
      "A live, working personal site is table-stakes proof of technical follow-through for technology applications.",
  },
  {
    id: "proj_technology_chatbot",
    title: "Build a Tool That Solves a Real Annoyance",
    rationale:
      "You automate the tedious thing instead of tolerating it — here's a real annoyance worth building a fix for.",
    requires: { signals: ["technology", "systems"], minNormalized: 0.4 },
    fields: ["technology", "engineering"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["basic scripting or APIs", "prompt or logic design", "testing", "iteration"],
    learningOutcomes: [
      "Built a functioning bot or tool that solves a real annoyance",
      "Tested it with real users and fixed real bugs they hit",
    ],
    firstStep:
      "Write down the exact question or task you're tired of answering or doing repeatedly for yourself or others, right now.",
    portfolioValue:
      "A working, used tool demonstrates applied technical skill beyond a coursework exercise.",
  },
  {
    id: "proj_technology_hardware_gadget",
    title: "Build a Working Hardware Gadget",
    rationale:
      "You want to build something physical, not just on-screen — this gets you into real circuits and components.",
    requires: { signals: ["technology", "creation"], minNormalized: 0.5 },
    fields: ["technology", "engineering"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 35,
    skills: ["circuit basics", "microcontroller programming", "soldering or assembly", "debugging hardware"],
    learningOutcomes: [
      "Built a working physical device from real components",
      "Debugged real hardware failures, not just code errors",
    ],
    firstStep:
      "Look up one beginner Arduino or Raspberry Pi starter project online right now and write down the parts list.",
    portfolioValue:
      "A working hardware build is a rare, tangible engineering artifact most applicants don't have.",
  },
  {
    id: "proj_technology_game_dev",
    title: "Build a Playable Game",
    rationale:
      "You want the thing you built to actually work when someone else touches it — a playable game proves that directly.",
    requires: { signals: ["technology", "design"], minNormalized: 0.4 },
    fields: ["technology", "design"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 25,
    skills: ["game engine basics", "level or mechanic design", "playtesting", "iteration"],
    learningOutcomes: [
      "Built a complete, playable small game",
      "Incorporated real playtester feedback into a revision",
    ],
    firstStep:
      "Open a free engine — Scratch, Godot, or similar — right now and make one object move across the screen with the arrow keys.",
    portfolioValue:
      "A finished playable game shows you can carry a technical project from concept to something others can actually use.",
  },
  {
    id: "proj_technology_open_source",
    title: "First Open-Source Contribution",
    rationale:
      "You want your code judged against a real standard, not just a grade — this puts it in front of real reviewers.",
    requires: { signals: ["technology", "systems"], minNormalized: 0.35 },
    fields: ["technology", "engineering"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 6,
    skills: ["reading unfamiliar code", "using git and GitHub", "writing a clear pull request", "taking code review feedback"],
    learningOutcomes: [
      "Made a real contribution to an existing codebase that got merged",
      "Responded to real reviewer feedback on the change",
    ],
    firstStep:
      "Browse GitHub's 'good first issue' label right now and read one issue on a project you actually use, start to finish.",
    portfolioValue:
      "A merged open-source contribution is externally verifiable proof of real-world coding ability.",
  },
  {
    id: "proj_storytelling_school_newspaper",
    title: "Report for a Real Publication",
    rationale:
      "You want your writing to reach an actual audience on an actual deadline — this puts it in a real, published outlet.",
    requires: { signals: ["storytelling", "people"], minNormalized: 0.4 },
    fields: ["media", "social_sciences"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 20,
    skills: ["reporting", "editing", "interviewing", "layout", "meeting a publishing deadline"],
    learningOutcomes: [
      "Reported and published real stories against a real deadline",
      "Ran or contributed to an ongoing publication, not a one-off piece",
    ],
    firstStep:
      "Pick one thing happening at your school right now that nobody's written about, and message one person involved for a quote.",
    portfolioValue:
      "Bylined, published journalism under real deadlines is direct evidence for media and communications programs.",
  },
  {
    id: "proj_storytelling_short_story_collection",
    title: "Published Short Story Collection",
    rationale:
      "You want the whole body of work finished, not just one good piece — this builds and ships a full collection.",
    requires: { signals: ["storytelling", "creation"], minNormalized: 0.5 },
    fields: ["media", "design"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 30,
    skills: ["fiction or poetry craft", "editing and revision", "sequencing a collection", "self-publishing"],
    learningOutcomes: [
      "Wrote and revised multiple complete pieces",
      "Assembled and published them as one finished collection",
    ],
    firstStep:
      "Write the first 200 words of one story or poem right now, without stopping to edit.",
    portfolioValue:
      "A finished, published creative collection shows both craft and the discipline to complete a large body of work.",
  },
  {
    id: "proj_storytelling_documentary_short",
    title: "Short Documentary on a Real Issue",
    rationale:
      "You want the camera pointed at something that actually matters, not a staged scene — this is a real issue, real interviews.",
    requires: { signals: ["storytelling", "impact"], minNormalized: 0.5 },
    fields: ["media", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 32,
    skills: ["interviewing", "filming", "editing", "structuring narrative around a real issue"],
    learningOutcomes: [
      "Produced a finished short documentary on a real local issue",
      "Conducted real on-camera interviews with people affected by it",
    ],
    firstStep:
      "Message one person directly affected by the local issue you want to cover and ask for 20 minutes on camera this week.",
    portfolioValue:
      "A finished documentary tackling a real issue combines storytelling craft with real-world reporting skill.",
  },
  {
    id: "proj_storytelling_comic",
    title: "Write and Draw an Original Comic",
    rationale:
      "You think in scenes and panels as much as sentences — this finishes a real comic instead of a sketchbook of starts.",
    requires: { signals: ["storytelling", "design"], minNormalized: 0.35 },
    fields: ["media", "design"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 10,
    skills: ["scripting", "sequential art or illustration", "pacing", "self-publishing"],
    learningOutcomes: [
      "Wrote and illustrated a complete short comic",
      "Distributed it to real readers, not just close friends",
    ],
    firstStep:
      "Sketch a 4-panel comic of one small true thing that happened to you today, right now.",
    portfolioValue:
      "A finished, distributed comic shows narrative and visual storytelling working together.",
  },
  {
    id: "proj_storytelling_social_campaign",
    title: "Narrative Campaign for a Cause",
    rationale:
      "You know how to make a story land with an audience — this builds a real, tracked campaign around something you care about.",
    requires: { signals: ["storytelling", "business"], minNormalized: 0.35 },
    fields: ["media", "business"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["content planning", "copywriting", "basic analytics reading", "consistency over time"],
    learningOutcomes: [
      "Ran a real multi-post campaign around a cause",
      "Tracked engagement and drew conclusions from what actually worked",
    ],
    firstStep:
      "Pick one cause you care about and draft the caption for post #1 right now, in your notes app.",
    portfolioValue:
      "A tracked campaign with real engagement numbers shows measurable communications skill.",
  },
  {
    id: "proj_impact_community_garden",
    title: "Start a Community Garden",
    rationale:
      "You don't stay at 'someone should fix this' — this turns a local gap into a real, sustained project.",
    requires: { signals: ["impact", "systems"], minNormalized: 0.5 },
    fields: ["life_sciences", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 40,
    skills: ["project planning", "recruiting volunteers", "basic horticulture", "sustaining a project over a season"],
    learningOutcomes: [
      "Launched and sustained a real garden serving a community over a full season",
      "Recruited volunteers who kept showing up after the first week",
    ],
    firstStep:
      "Message the person who manages the space you want to use — school facilities, a neighbor, a community center — right now to ask about an unused plot.",
    portfolioValue:
      "A sustained community project with real participants shows long-horizon commitment, not a one-off gesture.",
  },
  {
    id: "proj_impact_accessibility_audit",
    title: "School Accessibility Audit",
    rationale:
      "You notice who a system leaves out — this turns that noticing into findings that reach someone with real authority.",
    requires: { signals: ["impact", "design"], minNormalized: 0.4 },
    fields: ["social_sciences", "architecture"],
    gradeRange: [9, 12],
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["accessibility standards research", "site auditing", "report writing", "presenting to decision-makers"],
    learningOutcomes: [
      "Audited a real building against accessibility standards",
      "Presented specific findings to someone with authority to act on them",
    ],
    firstStep:
      "Walk one route through your school with a stopwatch, timing how long it would take someone using a wheelchair or crutches, right now.",
    portfolioValue:
      "An audit that reaches a real decision-maker shows the ability to turn observation into institutional change.",
  },
  {
    id: "proj_impact_donation_drive",
    title: "Run a Measured Donation Drive",
    rationale:
      "You want the help to be real, not symbolic — this ties a drive to a specific, verified local need.",
    requires: { signals: ["impact", "business"], minNormalized: 0.35 },
    fields: ["social_sciences", "business"],
    gradeRange: [9, 12],
    difficulty: "starter",
    estimatedHours: 8,
    skills: ["organizing logistics", "outreach", "tracking donations", "measuring real outcomes"],
    learningOutcomes: [
      "Ran a real drive addressing a specific, verified need",
      "Reported the measurable outcome — items or funds actually delivered",
    ],
    firstStep:
      "Call one local shelter or food bank right now and ask exactly what item they need most this month.",
    portfolioValue:
      "A drive with a measured, delivered outcome is concrete proof of organizing ability tied to real need.",
  },
  {
    id: "proj_impact_policy_brief",
    title: "Policy Brief for a Real Decision-Maker",
    rationale:
      "You want the fix to actually reach someone who can make it happen — this writes and delivers a real brief.",
    requires: { signals: ["impact", "research"], minNormalized: 0.5 },
    fields: ["law", "social_sciences"],
    gradeRange: [10, 12],
    difficulty: "ambitious",
    estimatedHours: 30,
    skills: ["policy research", "persuasive writing", "data-backed argumentation", "presenting to officials"],
    learningOutcomes: [
      "Wrote a real policy brief grounded in evidence",
      "Delivered it to an actual decision-maker, not just a teacher",
    ],
    firstStep:
      "Pick one specific local problem you could argue a policy change would fix, and write its title as a one-sentence recommendation, right now.",
    portfolioValue:
      "A brief delivered to a real official is direct evidence of civic engagement and persuasive, evidence-based writing.",
  },
];
