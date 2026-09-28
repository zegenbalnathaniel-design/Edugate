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
    implementationPlan: [
      {
        title: "Phase 1 — Chase the first thread",
        goal: "You have a documented lead worth writing about, not just one quote.",
        tasks: [
          "Write up the first answer word-for-word while it's fresh, including every name, date, or place mentioned",
          "Ask that person who else might remember more and get one more name",
          "Search the school archive, old yearbooks, or a local newspaper site for one piece of physical or printed evidence",
          "List the 2-3 open questions the first interview didn't answer",
        ],
        durationDescriptor: "1-2 evenings",
      },
      {
        title: "Phase 2 — Corroborate or correct it",
        goal: "The story is backed by a second independent source, not just one person's memory.",
        tasks: [
          "Interview the second person and record or take detailed notes",
          "Note exactly where the two accounts agree and where they conflict",
          "Photograph any plaque, document, or object that supports the story",
          "Decide which version of a disputed detail you can actually stand behind",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 3 — Write and publish",
        goal: "The piece exists somewhere a stranger could read it, not just in your notes.",
        tasks: [
          "Draft an 800-1200 word writeup with both sources named",
          "Send the draft back to one interviewee to check you got their part right",
          "Pick a publishing home — school paper, a blog, the local historical society's newsletter — and format it for that venue",
          "Publish it and send the link to everyone you interviewed",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "An 800-1200 word published piece citing at least two corroborating sources",
      "A small evidence file of photos, scans, or notes backing the story",
      "A fact-checked draft with one interviewee's sign-off on their quotes",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Lock in a protocol",
        goal: "You have a repeatable observation routine, not just a one-off log.",
        tasks: [
          "Pick one specific site (a backyard, a park route, a window ledge) you can return to at least twice a week",
          "Read the app's data-quality guidelines and note what makes an observation 'research grade'",
          "Set a fixed day/time recurring reminder for logging sessions",
          "Log your first full week and check how many entries got confirmed by other users",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Build a real streak",
        goal: "You have several weeks of consistent, high-quality logged data.",
        tasks: [
          "Keep logging on your fixed schedule for at least 6 more weeks",
          "Photograph or note field marks for anything the app can't auto-identify, and follow up until it's confirmed",
          "Track a simple running count: species seen, observations logged, entries confirmed",
          "Flag one pattern you're starting to notice (a species disappearing, a new one showing up, timing shifts)",
        ],
        durationDescriptor: "6-8 weeks, a few minutes several times a week",
      },
      {
        title: "Phase 3 — Turn the streak into a finding",
        goal: "You can point to a specific, data-backed observation, not just a tally.",
        tasks: [
          "Export or screenshot your logged data and build one simple chart (observations per week, or species over time)",
          "Write a one-page summary of what your data actually shows, including anything surprising",
          "Share your profile link and summary with your science teacher or a relevant local naturalist group",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A public citizen-science profile with 8+ weeks of logged, research-grade observations",
      "A one-page written summary with a chart of what the data shows",
      "A screenshot record of the observation streak and any confirmed identifications",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Design a fair test",
        goal: "You have a test that could actually disprove the claim, not just confirm it.",
        tasks: [
          "Turn the claim into a testable prediction ('if true, then X should happen')",
          "Decide exactly what you'll measure and how many trials count as enough",
          "List every variable that could fake the result and how you'll control for it",
          "Gather the materials and do one dry-run trial to catch problems in the method",
        ],
        durationDescriptor: "1-2 evenings",
      },
      {
        title: "Phase 2 — Run the real trials",
        goal: "You have a full set of logged, unedited results.",
        tasks: [
          "Run the number of trials your plan called for, logging every result even ones that don't fit your hunch",
          "Photograph or record the setup for at least one trial as evidence",
          "Re-check one weird outlier result to make sure it wasn't a measurement error",
        ],
        durationDescriptor: "1-2 evenings",
      },
      {
        title: "Phase 3 — Report the honest result",
        goal: "A written verdict exists that someone else could check.",
        tasks: [
          "Tabulate the results and calculate the plain average or pattern",
          "Write up the method and result in under 500 words, stating clearly whether the claim held up",
          "Share it somewhere people who repeat the claim will actually see it (a class group chat, a post, a school forum)",
        ],
        durationDescriptor: "1 evening",
      },
    ],
    deliverables: [
      "A logged results table from every trial, including outliers",
      "A under-500-word writeup with a clear verdict on the claim",
      "Photo or video evidence of at least one trial",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Define the show and get equipped",
        goal: "You have a real show concept, a name, and gear that works.",
        tasks: [
          "Turn the voice memo into a one-paragraph show pitch: what it covers, who it's for, why episode 1",
          "Pick a name and sketch simple cover art",
          "Test-record 60 seconds on your phone or a borrowed mic and check the audio is actually listenable",
          "Outline your first 4 episode topics so you're not starting from zero each week",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Produce a real episode start to finish",
        goal: "One fully edited episode exists that you'd be comfortable sharing.",
        tasks: [
          "Write a script or detailed outline for episode 1, including intro and sign-off",
          "Record the episode, redoing any section that doesn't work",
          "Edit out dead air and mistakes using free software (Audacity or similar)",
          "Get one honest listen-through from a friend before calling it done",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Publish and build a rhythm",
        goal: "The show is live somewhere real and a second episode is already in motion.",
        tasks: [
          "Publish episode 1 on a free host (Spotify for Podcasters, Anchor, or similar) and get a shareable link",
          "Set a realistic recurring schedule (weekly or biweekly) and stick to it for episodes 2-4",
          "Line up and record at least one interview guest instead of only solo episodes",
        ],
        durationDescriptor: "3-4 weeks",
      },
      {
        title: "Phase 4 — Grow and document the audience",
        goal: "You have evidence real people are listening, plus a body of work to point to.",
        tasks: [
          "Share each new episode in at least two places (social, school groups, relevant online communities)",
          "Track listens/downloads per episode and note which topics did best",
          "Record 1-2 more episodes to reach a real multi-episode run",
          "Write a short reflection on what changed between episode 1 and the latest one",
        ],
        durationDescriptor: "3-4 weeks",
      },
    ],
    deliverables: [
      "A published, multi-episode podcast (6+ episodes) live on a real platform with a shareable feed link",
      "A tracked listen/download count across episodes with a short written analysis of what worked",
      "At least one recorded interview episode with a guest outside your immediate friend group",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Script and plan the shoot",
        goal: "You have a shootable script and know exactly where and when you're filming.",
        tasks: [
          "Expand the logline into a full script or shot-by-shot outline for the 3 minutes",
          "Scout and confirm 1-2 real locations, checking lighting at the time you'll actually shoot",
          "Cast your actors (friends are fine) and lock a shoot date with everyone",
          "Make a simple shot list so the shoot day doesn't stall on decisions",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Shoot it",
        goal: "You have all the raw footage the edit needs, including safety takes.",
        tasks: [
          "Film every shot on your list, plus one extra take of anything risky",
          "Record clean audio separately if your camera mic is weak",
          "Check playback after each scene before moving locations",
          "Back up all footage to a second location the same day",
        ],
        durationDescriptor: "1-2 shoot days",
      },
      {
        title: "Phase 3 — Edit to a finished cut",
        goal: "A complete, watchable film exists with sound and titles.",
        tasks: [
          "Assemble a rough cut in free editing software (CapCut, DaVinci Resolve, iMovie)",
          "Add music, sound effects, and basic color correction",
          "Get one outside viewer's reaction and fix anything confusing",
          "Export a final cut with opening and closing titles",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Screen and submit it",
        goal: "The film has been seen by a real audience beyond your group chat.",
        tasks: [
          "Host or arrange a small screening, or post it somewhere it'll get real views",
          "Submit it to one student or local youth film festival if eligible",
          "Collect and write down at least three pieces of specific audience feedback",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A finished, edited 3-minute film with titles, sound, and a public or shareable link",
      "A written shot list and script showing the planning behind the shoot",
      "A short log of audience feedback from a real screening or posting",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build a rough playable prototype",
        goal: "A version exists that a group can actually sit down and play, even if it's ugly.",
        tasks: [
          "Write the core rules in plain language: setup, turn structure, and win condition",
          "Build a paper prototype (index cards, dice, hand-drawn board) good enough to test",
          "Play a full round solo, tracking every rule you had to make up on the spot",
          "Fix the rules gaps you just found before showing anyone else",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Playtest with real people, round one",
        goal: "You have specific, written feedback from people who aren't you.",
        tasks: [
          "Run the game with at least two different groups of friends or family",
          "Take notes during play on where people got confused or bored, not just what they say afterward",
          "Ask each group one direct question: 'what part dragged?'",
          "Log every rule change you're considering, with the reason for each",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Revise and produce a real version",
        goal: "A properly made second version exists, not just the paper prototype.",
        tasks: [
          "Rewrite the rulebook clearly enough a stranger could learn the game from it alone",
          "Redesign the components — printed cards, a real board, custom pieces — using print-at-home or a print service",
          "Design the box or packaging, even simply",
          "Playtest the finished version once yourself to catch production errors",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 4 — Final playtest and share it",
        goal: "The game has been played to completion by people outside your household, unassisted by you.",
        tasks: [
          "Hand the rulebook and game to a new group and watch without explaining anything",
          "Fix any remaining rules confusion this final test reveals",
          "Write a short design log covering what changed from prototype to final and why",
          "Share the game (rules + files, or the physical copy) with a local game club, a Discord community, or classmates",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A finished, produced game (physical or print-and-play files) with a clear rulebook",
      "A design log documenting at least two rounds of playtest feedback and the changes each caused",
      "Photos or video of the game being played by people outside your immediate circle",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Lock the content and style",
        goal: "You know exactly what's on all 8 pages before you draw or write a final word.",
        tasks: [
          "Turn the table of contents into a page-by-page outline of what goes on each spread",
          "Pick one consistent visual style (hand-drawn, collage, typewriter text) for the whole issue",
          "Draft the roughest version of every page in pencil or a doc, even if it's just placeholder text",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Finish and print issue one",
        goal: "A printed, foldable copy exists that you'd hand to a stranger.",
        tasks: [
          "Finalize the art or writing on every page",
          "Print a test copy, fold it, and check nothing's upside down or out of order",
          "Fix layout mistakes and print a small run (10-20 copies)",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 3 — Distribute it",
        goal: "Copies are in real people's hands, not just a stack on your desk.",
        tasks: [
          "Leave copies at 2-3 real locations (a local cafe, library, school club table) with permission",
          "Hand copies directly to at least 10 people and ask what they thought",
          "Post photos of the finished zine somewhere people can request a copy",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A finished, printed 8-page zine distributed to at least 20 people",
      "A photo record of the distribution (locations, people holding copies)",
      "A short list of reader reactions collected after handing it out",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Define the core flow",
        goal: "You know the one thing the app must do, and can sketch every screen it takes to do it.",
        tasks: [
          "Interview 3 people who have the same annoyance and write down how they currently cope without your app",
          "Sketch the 3-5 screens of the single core flow on paper, nothing else",
          "Pick your build tool (Figma for clickable, or a no-code/low-code builder for functional) and set up the project",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Build the first working version",
        goal: "A version exists that a stranger could open and complete the core flow without your help.",
        tasks: [
          "Build the core flow end to end, even if everything else is a placeholder",
          "Test it yourself 10 times, fixing anything that breaks or confuses",
          "Write 3-5 lines of onboarding text so a first-time user knows what to do",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Test it on real users",
        goal: "You have specific, observed evidence of where real users get stuck.",
        tasks: [
          "Hand the prototype to 5 people outside your household and watch them use it without helping",
          "Write down the exact moment each person hesitated or did something you didn't expect",
          "Ask each tester one question: what would make them actually use this again",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Revise based on what you saw",
        goal: "A visibly improved second version exists, addressing the real friction points.",
        tasks: [
          "Fix the top 3 friction points your testers hit",
          "Re-test with at least 2 of the same people to confirm the fix actually worked",
          "Polish the visuals and copy so it looks finished, not like a sketch",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 5 — Package and share it",
        goal: "The prototype is documented and shareable to anyone, not stuck on your machine.",
        tasks: [
          "Record a 60-90 second demo video walking through the core flow",
          "Write a one-page summary: the problem, the solution, what testing changed",
          "Publish or share a working link (or the file plus demo video) somewhere it can be tried",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "A working or clickable prototype with a shareable link or file, covering one complete user flow",
      "A demo video (60-90 seconds) walking through the app",
      "Written notes from at least 5 real user tests, with the specific changes each round of feedback caused",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Write the songs",
        goal: "You have 4-5 finished songs (structure, lyrics, melody) ready to record, not just fragments.",
        tasks: [
          "Turn the voice memo idea into one complete song: verse, chorus, and an ending",
          "Write 3-4 more songs, reusing whatever writing habit worked for the first one",
          "Play or sing each one all the way through for one honest listener before moving to recording",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Record",
        goal: "Raw recordings of every track exist, even if rough.",
        tasks: [
          "Set up a basic home recording space (phone, laptop mic, or a cheap USB mic) and test levels",
          "Record each song in layers if needed: rhythm, melody, vocals",
          "Re-record any take with an obvious mistake rather than settling",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Mix and finish",
        goal: "Every track sounds intentional, not like a rough demo.",
        tasks: [
          "Do a basic mix pass in free software (GarageBand, Audacity, Cakewalk) on each track: levels, EQ, reverb",
          "Get one outside listen and fix anything that sounds obviously off",
          "Sequence the tracks into a final EP order and pick a title and cover art",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Release it",
        goal: "The EP is live somewhere real people can stream or download it.",
        tasks: [
          "Distribute the EP through a free/low-cost service (DistroKid, SoundCloud, Bandcamp) to get a real listening link",
          "Share it in at least three places where people will actually hear it",
          "Track plays or listens over the first two weeks and note what got the most response",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A released EP (3-5 tracks) live on a streaming or download platform with a shareable link",
      "Raw and mixed audio files for each track",
      "A short log of release-week listens and where the audience came from",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Clean the data and ask a real question",
        goal: "You have a clean dataset and one specific, answerable question about it.",
        tasks: [
          "Remove or flag blank rows, duplicate entries, and obvious errors in the raw file",
          "Write down what each column actually means, in plain language",
          "Pick one specific question the data could answer (not 'what does this show' but 'did X change between Y and Z')",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Analyze and chart it",
        goal: "You have a chart and numbers that actually answer your question.",
        tasks: [
          "Build pivot tables or summary formulas to answer your specific question",
          "Make at least two chart types (e.g. a trend line and a comparison bar chart) and pick the clearer one",
          "Sanity-check one surprising number by tracing it back to the raw rows",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Write up the finding",
        goal: "A short written finding exists that someone outside your class could read cold and understand.",
        tasks: [
          "Write a 400-600 word summary stating your question, method, and honest answer, including any limits of the data",
          "Have one other person read it and flag anything confusing",
          "Publish or share it somewhere beyond a class submission (a blog, a local subreddit, a school newsletter)",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A cleaned dataset file with your analysis formulas or pivot tables intact",
      "At least two charts visualizing your finding",
      "A 400-600 word written report stating the question, method, and result, published somewhere public",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build the portfolio and thesis",
        goal: "You hold 5+ simulated positions, each with a written reason.",
        tasks: [
          "Research and 'buy' 4 more stocks across at least two different sectors",
          "Write a 2-3 sentence investment thesis for each pick: why you expect it to move",
          "Set a start-of-tracking baseline value for the whole portfolio",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Track it for real",
        goal: "You have a running weekly record of performance, not just a start and end number.",
        tasks: [
          "Check and log the portfolio value once a week at a fixed time for at least 5 weeks",
          "Note one real news event each week that plausibly moved a holding, and whether your thesis held",
          "Make at least one deliberate trade (buy or sell) mid-tracking and write down why",
        ],
        durationDescriptor: "5-6 weeks",
      },
      {
        title: "Phase 3 — Close it out and report",
        goal: "A written verdict exists on which theses worked and which didn't.",
        tasks: [
          "Calculate final portfolio performance against your baseline",
          "Write a report reviewing each pick: right, wrong, or unclear, and why in hindsight",
          "State the single biggest lesson you'd apply to a real future investment",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A weekly-logged portfolio tracking sheet across 5+ weeks",
      "A written investment thesis for each of the 5+ holdings",
      "A final report reviewing each pick's outcome against its original thesis",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Gather data and pick a method",
        goal: "You have real, sourced inputs and a defined (even if simple) modeling approach.",
        tasks: [
          "Collect whatever real data exists: past results, polling, turnout history, demographic breakdowns",
          "Decide on a simple weighting or scoring method for combining your three factors into a prediction",
          "Build a spreadsheet skeleton that takes your inputs and produces one output number or probability",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Build and stress-test the model",
        goal: "The model produces a stable prediction you can defend, and you know its weak points.",
        tasks: [
          "Plug in real historical data from a past comparable election and see if the model would've predicted it correctly",
          "Adjust the weighting based on where the backtest was wrong",
          "Write down the model's explicit assumptions and what could break them",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Publish the prediction before the result is known",
        goal: "A dated, public prediction exists that can be honestly checked later.",
        tasks: [
          "Run the model on current data for your chosen election and record the output with a timestamp",
          "Build one visualization showing the prediction and its confidence range",
          "Publish the prediction publicly (post, blog, school paper) before election results are announced",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 4 — Score yourself against the real result",
        goal: "You have an honest, documented comparison between prediction and reality.",
        tasks: [
          "Record the actual result once it's announced",
          "Calculate exactly how far off the model was and why, tracing the error to a specific factor or assumption",
          "Write a final report on what you'd change about the model next time",
        ],
        durationDescriptor: "2-3 evenings",
      },
    ],
    deliverables: [
      "A working forecast model (spreadsheet or code) with documented inputs and method",
      "A dated, publicly posted prediction made before the real result was known",
      "A final report comparing the prediction to the actual outcome and explaining the gap",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Get the full picture",
        goal: "You have a complete, categorized record of spending, not just one month.",
        tasks: [
          "Collect 2-3 more months of real spending records or receipts from the same source",
          "Standardize categories across all months so they're comparable",
          "Total spending per category and flag the two biggest line items",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Find the actual leak",
        goal: "You can point to one specific, costed change worth making.",
        tasks: [
          "Compare category totals against what the budget (if any) assumed",
          "Research realistic cheaper alternatives for the biggest expense category",
          "Calculate the actual dollar savings your proposed change would produce over a year",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 3 — Present the proposal",
        goal: "The person who controls the budget has seen and responded to your proposal.",
        tasks: [
          "Build a one-page summary with the current spending breakdown and your proposed change",
          "Present it directly to the parent, treasurer, or club officer who owns the budget",
          "Record their response — accepted, rejected, or modified — and why",
        ],
        durationDescriptor: "1 evening",
      },
    ],
    deliverables: [
      "A multi-month categorized spending spreadsheet",
      "A one-page proposal with a specific, costed recommended change",
      "A written record of the budget owner's response to the proposal",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Design the controlled comparison",
        goal: "You have a test design where 'A' and 'B' differ in only one variable.",
        tasks: [
          "Define exactly what you'll measure and how (a score, a time, a count) so results are comparable",
          "Decide how many trials of each version you need before you'll trust the result",
          "List every other variable that could contaminate the comparison and how you'll hold it steady",
          "Build a simple log sheet (spreadsheet or notebook) before starting a single trial",
        ],
        durationDescriptor: "1-2 evenings",
      },
      {
        title: "Phase 2 — Run the experiment",
        goal: "You have a complete, honestly logged dataset for both versions.",
        tasks: [
          "Alternate or randomize between version A and B across enough trials to hit your target count",
          "Log every result immediately, including ones that don't support your hunch",
          "Note any day you had to break protocol (sick, interrupted) so you can flag that data point",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Analyze and report",
        goal: "A written conclusion exists, backed by the actual numbers, not a vibe.",
        tasks: [
          "Calculate the average result for each version and the size of the difference",
          "Make one chart comparing A vs. B across all trials",
          "Write a short report stating whether the data actually supports switching, including how confident you are",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A complete trial-by-trial data log for both tested versions",
      "A comparison chart of version A vs. version B results",
      "A written conclusion stating whether the evidence supports a real change, with its limits stated honestly",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Map it completely",
        goal: "You have a full, verified step-by-step diagram of the real process, not the official version.",
        tasks: [
          "Turn your step list into a simple flowchart, including decision points and who's involved at each step",
          "Time how long each step actually takes by observing or walking through it yourself",
          "Interview 2 people who run or experience the process to catch steps you missed",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Find the real bottleneck",
        goal: "You can point to the one step actually causing the delay or frustration, with evidence.",
        tasks: [
          "Mark on your diagram where time or complaints pile up most",
          "Ask 5 people who go through the process what specifically frustrates them, and check it against your diagram",
          "Rule out at least one 'obvious' cause by checking it against your timing data",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 3 — Propose and pitch a fix",
        goal: "A specific improvement has been presented to someone who could actually implement it.",
        tasks: [
          "Sketch a revised process diagram showing your proposed fix",
          "Estimate the time or effort the fix would save, using your original timing data",
          "Present the before/after diagrams to the staff member or student leader who owns the process",
        ],
        durationDescriptor: "1 evening",
      },
    ],
    deliverables: [
      "A before-and-after process flowchart for the target process",
      "Timing data and interview notes identifying the actual bottleneck",
      "A written proposal presented to the process owner, with their recorded response",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Trace the raw materials",
        goal: "You know, with sources, what the object is made of and roughly where each material likely originates.",
        tasks: [
          "Research what the object's main materials actually are (check the manufacturer's site, teardown videos, or material databases)",
          "For each material, find and cite one source on where it's typically mined, grown, or produced",
          "Note which claims you can actually source versus which are your best guess",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Trace manufacturing and distribution",
        goal: "You can describe the chain from raw material to the shelf, with a source for each link.",
        tasks: [
          "Research where the object (or its brand's typical products) is manufactured or assembled",
          "Trace how it likely gets from factory to your country (shipping, ports, distribution centers)",
          "Identify one point in the chain that surprised you and dig one level deeper on it",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Diagram and publish",
        goal: "A finished, sourced diagram exists that makes the invisible chain visible to someone else.",
        tasks: [
          "Build a full diagram of the chain from raw material to shelf, labeling each stage with its source",
          "Write a short explainer (400-600 words) walking through the chain and what stood out",
          "Share the diagram and writeup somewhere people beyond your class will see it",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A sourced, end-to-end supply chain diagram for the chosen object",
      "A research log listing every source used at each stage",
      "A 400-600 word explainer published somewhere public",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Map the task and pick your tool",
        goal: "You know exactly which steps to automate and which tool can actually do it.",
        tasks: [
          "Break the task into its individual repeated steps, noting which are pure copy/pattern work",
          "Research 2-3 tools that could automate it (a script, Zapier/Make, a spreadsheet macro, a browser extension) and pick one",
          "Build the smallest possible test: automate just the first step and confirm it works",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Build the full automation",
        goal: "The tool runs the entire repeated task end to end without you doing the manual steps.",
        tasks: [
          "Extend the automation to cover every step you mapped",
          "Run it on 3-5 real cases and fix anything that breaks or produces wrong output",
          "Add basic error handling for the most likely thing to go wrong",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Prove the time saved and hand it off",
        goal: "You have measured evidence the tool works and at least one other person using it.",
        tasks: [
          "Time the task with the automation running and compare directly to your original baseline",
          "Get one other person to use the tool without your help and fix whatever confuses them",
          "Write a short usage guide so someone else could run it after you're gone",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "A working automation tool or script, with source files or setup shared",
      "Before/after timing data proving the actual time saved",
      "A short usage guide and evidence of at least one other person successfully using it",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Define the model's rules",
        goal: "You have explicit mathematical or logical rules for how your three variables interact.",
        tasks: [
          "Research how similar systems are typically modeled (search for the basic equations or logic used in real examples)",
          "Write out, in plain language then in formulas or pseudocode, how each variable affects the others each time step",
          "Decide what a single 'run' of the simulation looks like and what output it should produce",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Build a working first version",
        goal: "The simulation runs end to end and produces output, even if it's not yet validated.",
        tasks: [
          "Build the simulation in a spreadsheet or a simple script (Python is fine for a beginner)",
          "Run it once with reasonable starting values and check the output looks plausible, not broken",
          "Fix any logic errors that produce impossible results (negative populations, runaway values)",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Test how variables change the outcome",
        goal: "You have a documented set of experiments showing how changing one variable shifts the result.",
        tasks: [
          "Run the simulation multiple times, changing only one variable each time",
          "Chart how the outcome shifts across at least 5 different values of that variable",
          "Compare one of your simulation's patterns against a real-world reference case if one exists",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Write it up",
        goal: "A finished report exists explaining the model, its assumptions, and what it revealed.",
        tasks: [
          "Write a report covering the model's rules, its limitations, and your key finding from the variable tests",
          "Build a clean final chart or visualization of the main result",
          "Share the model and writeup with a teacher or relevant online community for a sanity check",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "A working simulation model (spreadsheet or code file) with documented rules and assumptions",
      "Charted results from at least 5 variable-change experiments",
      "A written report explaining the model and its key finding, including stated limitations",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Run and archive the first interview",
        goal: "You have one fully recorded, properly saved interview and know what worked in your questions.",
        tasks: [
          "Prepare 8-10 open-ended questions before the interview, leaving room to follow up",
          "Record the interview with permission, backing up the audio file immediately after",
          "Write a short log noting the moments where the best material came out",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Expand to a real collection",
        goal: "You have 3-4 more interviews forming a genuine small archive, not one isolated recording.",
        tasks: [
          "Identify and reach out to 3 more people with relevant stories (different generations or perspectives if possible)",
          "Record and back up each interview the same way as the first",
          "Transcribe or detailed-summarize each recording so the content is searchable, not just sitting in audio files",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Package and share the archive",
        goal: "The collection is organized and usable by someone who wasn't there for the interviews.",
        tasks: [
          "Organize all recordings and transcripts with consistent file names and a short index describing each one",
          "Write a 500-800 word summary pulling out the strongest common thread across interviews",
          "Share the archive (or the summary and excerpts) with the interviewees and one relevant institution (local library, historical society, school)",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "An organized archive of 4+ recorded interviews with transcripts or detailed summaries",
      "An index describing each interview's subject and key content",
      "A 500-800 word written summary highlighting the collection's strongest thread",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Set the ground rules and find a home",
        goal: "You have a real meeting time, place, and a clear, written set of group norms.",
        tasks: [
          "Write a short confidentiality and respect agreement the group will follow",
          "Find a consistent, private-enough meeting space (a classroom, library room, someone's living room) and lock a recurring day/time",
          "Check in with a trusted adult (counselor, teacher) about what to do if a session raises something beyond peer support",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Run the first sessions",
        goal: "The group has met multiple times and has a working rhythm, not just one meeting.",
        tasks: [
          "Run the first session with a light structure: a check-in round, the topic, a closing round",
          "Ask for one piece of honest feedback after each session on what to change",
          "Run 3 more sessions, adjusting format based on what participants actually need",
        ],
        durationDescriptor: "3-4 weeks",
      },
      {
        title: "Phase 3 — Stabilize and hand off knowledge",
        goal: "The group can keep running even if you're not the only one holding it together.",
        tasks: [
          "Recruit and train one co-facilitator so the group isn't dependent on just you",
          "Write a simple facilitator guide covering the norms, format, and what to do in a hard moment",
          "Collect anonymous feedback from members on whether the group is meeting the need it was built for",
        ],
        durationDescriptor: "2-3 weeks",
      },
    ],
    deliverables: [
      "A running peer support group with a documented multi-session history",
      "A written facilitator guide covering norms, format, and escalation steps",
      "Anonymous participant feedback showing the group's real impact",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Run the first interviews",
        goal: "You have 3 completed interviews and a question set that's proven to get real answers.",
        tasks: [
          "Prepare 6-8 questions covering the daily reality of the job, not just 'what do you do'",
          "Run all 3 scheduled interviews, recording or taking detailed notes",
          "Note which questions got the most interesting answers and which fell flat",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Expand to strangers",
        goal: "You have several more interviews with people outside your existing network.",
        tasks: [
          "Cold-message 5 more professionals in fields you haven't covered yet",
          "Run at least 3 of those interviews, refining your question set based on phase 1",
          "Write up each interview as a short profile (300-400 words) while it's fresh",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Compile and distribute the resource",
        goal: "A usable resource exists that other students actually consult.",
        tasks: [
          "Compile all profiles into one organized document or simple website, sorted by field",
          "Share it with your school's career counselor or club and ask for feedback",
          "Distribute it directly to at least 10 students and track whether they actually use it",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A compiled resource of 6+ written career interview profiles, organized by field",
      "Interview notes or recordings for each profile",
      "Evidence the resource reached and was used by other students (distribution log, counselor feedback)",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Design the program structure",
        goal: "You have a written program design: who it's for, how matching works, and what a session covers.",
        tasks: [
          "Turn what you heard from the younger students into 3-4 concrete needs the program will address",
          "Design the matching process (how mentors and mentees are paired) and a simple session structure",
          "Write a one-page program overview you can use to recruit both mentors and mentees",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Recruit and match",
        goal: "You have real pairs matched and a first session scheduled for each.",
        tasks: [
          "Recruit at least 6 mentors and 6 mentees using your one-page overview",
          "Match pairs based on stated interests or needs, and introduce each pair directly",
          "Schedule each pair's first check-in with a specific date and time",
        ],
        durationDescriptor: "2 weeks",
      },
      {
        title: "Phase 3 — Run a full cycle of check-ins",
        goal: "Every pair has met multiple times across a real stretch of weeks.",
        tasks: [
          "Send a simple check-in prompt to all pairs every 2 weeks to keep momentum",
          "Collect a short mid-point feedback form from both mentors and mentees",
          "Troubleshoot at least one pair that's struggling to meet or connect",
        ],
        durationDescriptor: "6-8 weeks",
      },
      {
        title: "Phase 4 — Evaluate and hand off",
        goal: "You have real evidence of what worked, and a plan for the program to continue.",
        tasks: [
          "Collect final feedback from every pair on what they got out of it",
          "Write a report on outcomes: what worked, what didn't, and specific numbers (pairs matched, sessions held)",
          "Recruit or brief someone to keep running the program after you, or document it clearly enough to hand off",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A documented mentorship program design with matching process and session structure",
      "A record of matched pairs and session attendance across a full cycle",
      "A final outcomes report with collected feedback from mentors and mentees",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build the family tree skeleton",
        goal: "You have a basic timeline and family tree covering at least three generations.",
        tasks: [
          "Interview the relative from your first step further, getting names, dates, and places wherever they remember them",
          "Sketch a family tree going back as far as living relatives can confirm",
          "Note the specific gaps (unknown names, unclear dates) you still need to fill",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Gather more accounts and documents",
        goal: "You have multiple family members' accounts plus at least one piece of physical documentation.",
        tasks: [
          "Interview 2 more relatives, asking about the same events to compare memories",
          "Track down physical evidence — old photos, letters, certificates — and photograph or scan them",
          "Update the timeline and tree with anything new, noting where accounts disagree",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Build the archive",
        goal: "A finished, organized archive exists that other family members could actually use.",
        tasks: [
          "Compile the timeline, tree, and scanned documents into one organized document or simple website",
          "Write short captions or context notes for each photo or document included",
          "Share the finished archive with the family members who contributed",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A family tree spanning at least three generations",
      "An organized archive of scanned photos/documents with context notes",
      "A written timeline compiled from multiple family members' accounts",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Form and structure the team",
        goal: "You have a confirmed roster, a practice schedule, and clarity on roles.",
        tasks: [
          "Confirm your 5 players (or recruit more if needed for the roster size your game requires)",
          "Set a recurring practice schedule everyone actually commits to",
          "Assign roles (captain, comms, scheduling) so it's not all on you",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Find real competition",
        goal: "You have at least one scheduled match against an outside opponent.",
        tasks: [
          "Research leagues, ladders, or other schools' teams you could realistically play against",
          "Message 3+ potential opponents or league organizers to set up a match",
          "Run 2-3 internal scrimmages to test team coordination before the real match",
        ],
        durationDescriptor: "2 weeks",
      },
      {
        title: "Phase 3 — Compete and track results",
        goal: "You've played multiple real matches with a documented record.",
        tasks: [
          "Play the scheduled match(es) and record the result and key moments",
          "Hold a short post-match review each time to identify what to fix",
          "Schedule and play at least 2 more matches to build a real season record",
        ],
        durationDescriptor: "3-4 weeks",
      },
      {
        title: "Phase 4 — Wrap the season and document it",
        goal: "A clear record of the team's run exists, plus a plan for it to continue.",
        tasks: [
          "Compile the full match record (wins, losses, key stats) into a simple season summary",
          "Get a short reflection from each teammate on what they got out of it",
          "Decide who takes over organizing if the team continues past this season",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A documented season record of matches played against outside opponents (wins, losses, key stats)",
      "A confirmed roster with defined team roles",
      "A season summary with teammate reflections",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Lock logistics and format",
        goal: "You have a confirmed venue, date, and a defined competition format.",
        tasks: [
          "Confirm the venue and date, including backup plans for capacity or access",
          "Define the format: team size, time limit, tracks or themes, and judging criteria",
          "Draft a budget covering food, prizes, and any supplies, and identify how you'll cover it",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Recruit participants, mentors, and judges",
        goal: "You have enough confirmed participants and judges to actually run the event.",
        tasks: [
          "Build a simple registration form and promote it across your school and beyond",
          "Reach out to 5+ potential judges or mentors (teachers, local professionals, older students) and confirm at least 2-3",
          "Track registrations against your capacity and follow up if numbers are low",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Finalize logistics",
        goal: "Every detail needed for event day is confirmed and written down.",
        tasks: [
          "Confirm final headcount, food/supply orders, and volunteer roles for event day",
          "Write a run-of-show schedule covering every hour of the event",
          "Send participants and judges a final logistics email with everything they need to know",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Run the event and document it",
        goal: "The hackathon actually happened, with a documented result.",
        tasks: [
          "Run the event following your schedule, adjusting live as needed",
          "Judge and announce results using your defined criteria",
          "Collect feedback from participants and judges, and write a short post-event report with turnout numbers",
        ],
        durationDescriptor: "1 event day + follow-up evening",
      },
    ],
    deliverables: [
      "A run event with a documented turnout count and judged results",
      "A written run-of-show and budget used to organize it",
      "A post-event report with participant/judge feedback and turnout numbers",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build your case files",
        goal: "You have researched, evidence-backed cases ready on both sides of your main topics.",
        tasks: [
          "Turn your 10-minute counter-argument into a full case with 3+ pieces of cited evidence",
          "Build the matching case for the side you originally believed, with equal rigor",
          "Practice delivering both cases out loud to a friend or into your phone and time them",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Compete in early rounds",
        goal: "You've competed in real rounds and have specific ballot feedback to work from.",
        tasks: [
          "Register for and attend the first tournament or scrimmage round of the season",
          "After each round, write down the judge's feedback verbatim, not just the win/loss",
          "Drill the one weakest skill the feedback identified (rebuttal speed, evidence use, delivery) for the next week",
        ],
        durationDescriptor: "3-4 weeks",
      },
      {
        title: "Phase 3 — Compete through the mid-season",
        goal: "You have a growing round-by-round record showing real change, not just more rounds.",
        tasks: [
          "Compete in 2-3 more tournaments or rounds",
          "Keep a running log of each round's result and judge feedback",
          "Compare your case notes from round 1 to round 5 and mark what's visibly improved",
        ],
        durationDescriptor: "4-6 weeks",
      },
      {
        title: "Phase 4 — Finish the season and reflect",
        goal: "You have a complete season record and can name the specific skill that measurably improved.",
        tasks: [
          "Compete in the final tournaments of your season",
          "Compile the full round-by-round record into one tracked summary",
          "Write a reflection naming the specific skill that improved most, backed by evidence from your logs",
        ],
        durationDescriptor: "3-4 weeks",
      },
    ],
    deliverables: [
      "A round-by-round competitive record across a full season with judge feedback logged",
      "Researched case files for your main topics, cited with real sources",
      "A written reflection identifying a specific, evidenced skill improvement",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Set the target and design the plan",
        goal: "You have a specific numeric goal and a written training plan to reach it.",
        tasks: [
          "Set a specific, measurable target and a realistic deadline based on your baseline",
          "Research a structured training approach for your specific goal (not generic advice — a real plan with progression)",
          "Build a simple log template to track each session's numbers",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Train and log consistently",
        goal: "You have several weeks of consistently logged training data.",
        tasks: [
          "Follow the training plan, logging every session's actual numbers, not estimates",
          "Re-test your baseline measurement at least once mid-way through to check progress",
          "Adjust the plan if the data shows you're plateauing or overreaching",
        ],
        durationDescriptor: "3-5 weeks",
      },
      {
        title: "Phase 3 — Final test and report",
        goal: "You have a final, honest result against your original goal and can explain the data behind it.",
        tasks: [
          "Run the final measurement under the same conditions as your original baseline",
          "Chart your progress across the full training period",
          "Write a short report on whether you hit the goal and what the data shows about why",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A full training log tracking numbers across every session",
      "A progress chart from baseline to final result",
      "A written report on the outcome against the original goal, including what the data explains",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Do the first outing and set the format",
        goal: "You've completed and documented one outing, and know what the guide entries will look like.",
        tasks: [
          "Go on the scheduled outing and take photos plus written notes on what makes it worth visiting",
          "Draft the first guide entry: what to expect, how to get there, best time to go",
          "Decide your format for the whole guide (map-based, list, themed by activity)",
        ],
        durationDescriptor: "1 weekend",
      },
      {
        title: "Phase 2 — Complete several more outings",
        goal: "You have 5-6 documented spots covering a real range, not near-duplicates.",
        tasks: [
          "Pick and visit 4-5 more spots, aiming for variety (different neighborhoods, activity types, or times of day)",
          "Write a guide entry for each immediately after visiting, while details are fresh",
          "Ask one local you meet along the way for a recommendation you wouldn't have found yourself",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Assemble and publish the guide",
        goal: "A finished, usable guide exists that someone could follow without you.",
        tasks: [
          "Compile all entries into one document or simple map/website with consistent formatting",
          "Add a simple map or directions for each spot",
          "Publish it and share the link with at least 10 people who might actually use it",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A published guide covering 6+ documented local spots with directions",
      "Original photos from each outing",
      "Evidence the guide reached real users (shares, views, or direct feedback)",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Set a real milestone and a daily routine",
        goal: "You have a specific, testable conversational target and a daily practice habit running.",
        tasks: [
          "Define exactly what 'conversational milestone' means (e.g. order food, introduce yourself and hold a 5-minute chat)",
          "Pick your core tools: an app, a textbook, or a tutor site, and set a daily practice length you can actually sustain",
          "Log your very first structured session, noting what felt impossible",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Practice daily and find a real speaking partner",
        goal: "You're speaking with a real person regularly, not just doing app drills alone.",
        tasks: [
          "Keep the daily practice habit going, logging each session's focus and a quick self-rating",
          "Find a conversation partner (language exchange app, a native-speaking classmate, an online tutor) and set a recurring call",
          "Note weekly which specific things you can now say that you couldn't at the start",
        ],
        durationDescriptor: "3-4 weeks",
      },
      {
        title: "Phase 3 — Hit the milestone and document the process",
        goal: "You've demonstrably reached (or clearly measured your distance from) the milestone, honestly.",
        tasks: [
          "Attempt the milestone conversation with your partner or tutor and record it if they're comfortable",
          "Write up a learning log covering what worked, what didn't, and how far you actually got",
          "Share the recording or a written reflection publicly as evidence of the sprint",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A recorded or transcribed conversation demonstrating your progress toward the milestone",
      "A daily practice log spanning the full sprint",
      "A written reflection documenting what worked and what didn't, including any shortfall from the goal",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Set the protocol",
        goal: "You have a fixed site, fixed route, and a consistent way of recording each visit.",
        tasks: [
          "Define exact site boundaries and a fixed route so every visit covers the same ground",
          "Build a simple recording sheet (species/features, count, condition, weather, date)",
          "Do your first full, careful catalogue visit using the sheet",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Return and build the time series",
        goal: "You have multiple dated visits showing the site at different points in time.",
        tasks: [
          "Revisit the same site on a set schedule (weekly or biweekly) for at least 5 visits",
          "Photograph the same reference points each visit for a visual comparison",
          "Flag anything that changed between visits as soon as you notice it",
        ],
        durationDescriptor: "5-6 weeks",
      },
      {
        title: "Phase 3 — Analyze and report the change",
        goal: "You can point to one specific, documented change over the survey period.",
        tasks: [
          "Compile all visit sheets into one master catalogue",
          "Compare early and late visits to identify a specific change (species gone/arrived, growth, damage, seasonal shift)",
          "Write a short report with photos showing the before/after comparison",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A dated catalogue covering 5+ site visits with consistent recording",
      "Photo documentation from the same reference points across visits",
      "A written report identifying and evidencing a specific change over time",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build a lead list and visit the first spots",
        goal: "You have a shortlist of 8-10 candidate spots and have visited the first 2-3.",
        tasks: [
          "Ask 4-5 more locals (different ages/backgrounds) for their under-known spot and compile a shortlist",
          "Visit the first 2-3 spots, taking photos and noting what makes each worth including",
          "Research a bit of local history or context for each spot visited",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Visit and document the rest",
        goal: "You've visited and documented all 8-10 spots with consistent detail.",
        tasks: [
          "Visit the remaining spots on your shortlist, photographing and note-taking each",
          "Interview one person connected to at least 2 of the spots for a richer story",
          "Cut anything that turns out to not actually be interesting or accessible",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Design the map and guide",
        goal: "A finished, navigable map/guide exists in a real format, not a folder of notes.",
        tasks: [
          "Build the map using a mapping tool (Google My Maps or similar) or a hand-designed illustrated map",
          "Write a short entry for each spot with directions, context, and a photo",
          "Design a simple cover or landing page for the finished guide",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 4 — Publish and get it used",
        goal: "Real people have used the guide to actually go somewhere.",
        tasks: [
          "Publish the guide (website, PDF, or printed booklet) and share it widely",
          "Ask at least 5 people to try following it to one spot and report back",
          "Note any corrections needed and update the guide",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A published map/guide covering 8+ under-known local spots with directions and context",
      "Original photos and research notes for each spot",
      "Feedback from at least 5 people who used the guide to visit a spot",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Turn the question into a testable hypothesis",
        goal: "You have a specific hypothesis and a controlled experimental design on paper.",
        tasks: [
          "Rewrite your question as a formal hypothesis with an independent and dependent variable",
          "Research what's already known about this topic and cite 2-3 relevant sources",
          "Design a controlled experiment: control group, treatment group, and what you'll measure",
          "List every confounding variable and how your design controls for it",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Run a pilot, then the real trials",
        goal: "You have a complete, correctly logged dataset from enough trials to be meaningful.",
        tasks: [
          "Run a small pilot trial to catch flaws in your method before committing to the full run",
          "Fix any issues the pilot revealed",
          "Run the full set of trials, logging every result including anything unexpected",
          "Photograph or document your setup as evidence of the method",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Analyze the data",
        goal: "You have a statistically grounded conclusion, not just an eyeballed pattern.",
        tasks: [
          "Run appropriate statistical analysis on your results (even a basic t-test or chi-square, done correctly)",
          "Build clear charts showing the key comparison",
          "State honestly whether the data supports or rejects your hypothesis",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Write it up to competition standard",
        goal: "A complete, submission-ready paper or board exists.",
        tasks: [
          "Write the full report: hypothesis, method, results, discussion, and limitations",
          "Build a presentation board or slide deck summarizing the experiment visually",
          "Get one science teacher's review and revise based on their feedback",
          "Submit it to your school or a regional science fair if a deadline is open",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A complete scientific paper covering hypothesis, method, results, and discussion",
      "A raw data log from all experimental trials",
      "A presentation board or slide deck summarizing the experiment, ready for a science fair or equivalent",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Expand the source base",
        goal: "You have 12-15 relevant sources and have skimmed each for relevance.",
        tasks: [
          "Search for 7-10 more sources using different keywords and by checking the citations of your first five",
          "Skim each new source's abstract and conclusion, discarding ones that aren't actually relevant",
          "Note each source's key finding in one sentence as you go",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Read deeply and find the throughline",
        goal: "You understand how the sources agree, disagree, and where the gaps are.",
        tasks: [
          "Read your 10-12 strongest sources in full, taking structured notes (finding, method, limitation)",
          "Group sources by theme or finding using a simple table or mind map",
          "Identify one genuinely open question the existing research hasn't answered",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Write the synthesis",
        goal: "A complete literature review exists that reads as one coherent argument, not a list of summaries.",
        tasks: [
          "Draft the review organized by theme, not by source, showing how findings relate to each other",
          "Write a conclusion section naming the open question your research surfaced",
          "Add full citations in a consistent format and get one outside read for clarity",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A complete literature review (2000+ words) synthesizing 10+ sources by theme",
      "A full, consistently formatted citation list",
      "A stated open question identified from the gaps in existing research",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Finish and pilot the instrument",
        goal: "You have a complete survey that's been tested for clarity and bias.",
        tasks: [
          "Write the remaining questions, mixing scale, multiple-choice, and one open-ended question",
          "Pilot the full survey with 5 people and revise any question they interpreted differently than you intended",
          "Decide your sampling plan: who you'll survey and how you'll reach a real, non-trivial sample size",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Collect the data",
        goal: "You have enough completed responses to say something real about the group you sampled.",
        tasks: [
          "Distribute the survey through multiple channels to reach your target sample size (aim for 50+ if feasible)",
          "Track response count against your target and follow up if it's lagging",
          "Watch for and flag any clearly low-effort or joke responses",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Analyze and report honestly",
        goal: "A written report exists stating what the data actually showed, including surprises.",
        tasks: [
          "Clean the response data and calculate basic statistics for each question",
          "Build charts for your 2-3 most important findings",
          "Write a report stating your original hypothesis and whether the data supported it, flagging anything surprising",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A completed survey dataset with 50+ real responses",
      "Charts summarizing the key findings",
      "A written report stating the hypothesis, results, and honest interpretation, including surprises",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Dig into records",
        goal: "You have sourced facts about the site's history, not just what's on the plaque.",
        tasks: [
          "Search local archives, historical society records, or newspaper archives for the site's history",
          "Note the source and date for every fact you collect",
          "List the gaps in the written record that an interview might fill",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Interview and cross-check",
        goal: "You have first-hand accounts that corroborate or complicate the written record.",
        tasks: [
          "Interview 1-2 people connected to the site (a longtime neighbor, a historical society member, a former occupant)",
          "Cross-check what they say against your archival research and note discrepancies",
          "Take additional photos documenting current condition, especially anything at risk (deterioration, planned demolition)",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Compile the documentation packet",
        goal: "A complete, sourced documentation packet exists that could genuinely support a preservation case.",
        tasks: [
          "Write a documented history combining archival research and interview material, with citations",
          "Organize photos, documents, and the writeup into one packet",
          "Share the packet with a local historical society or preservation group and note their response",
        ],
        durationDescriptor: "1 weekend",
      },
    ],
    deliverables: [
      "A sourced written history of the site with citations",
      "A photo and document archive of current condition and historical evidence",
      "A documentation packet shared with a real preservation-relevant organization",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Read the original methods closely",
        goal: "You have a precise, faithful protocol you could hand to someone else to run.",
        tasks: [
          "Find and read the original paper's full methods section, not a summary of it",
          "Rewrite the exact procedure as a step-by-step protocol you could follow",
          "Identify what you can and can't replicate exactly (sample size, materials, setting) given your constraints",
          "Get ethical sign-off from a teacher if the study involves other people as subjects",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Recruit and run the replication",
        goal: "You have a completed run of the study on a real (if small) sample.",
        tasks: [
          "Recruit participants matching the original study's population as closely as possible",
          "Run the protocol exactly as designed, keeping detailed session notes",
          "Log all raw results immediately after each session",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Compare and report honestly",
        goal: "You have an honest, documented comparison between your result and the original.",
        tasks: [
          "Run the same statistical analysis the original study used, as closely as you can replicate it",
          "Compare your effect size and conclusion directly against the original paper's",
          "Write a report explaining where your replication matched or diverged, and what might explain the difference (sample size, setting, time period)",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A written replication protocol closely matching the original study's methods",
      "A raw data log from all replication sessions",
      "A written report honestly comparing your results to the original study, including plausible explanations for any divergence",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Understand the constraints",
        goal: "You know the real budget, the real stakeholder's priorities, and every fixed constraint of the space.",
        tasks: [
          "Interview whoever owns the space about their budget ceiling and top priorities",
          "Note every fixed constraint: outlets, doors, windows, load-bearing walls, plumbing",
          "Build an accurate to-scale floor plan from your measurements (graph paper or free CAD tool)",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Design multiple layout options",
        goal: "You have 2-3 real layout options, each with rough costs attached.",
        tasks: [
          "Sketch 2-3 distinct layout options solving the stakeholder's stated problems",
          "Price out the furniture, paint, or materials each option would actually require",
          "Get informal feedback on the options from the stakeholder before committing to one",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Finalize the plan and present it",
        goal: "A complete, presentable redesign plan exists with a real budget attached.",
        tasks: [
          "Build a final polished layout (to-scale drawing or simple 3D render) of the chosen option",
          "Compile a full itemized budget with real prices for everything needed",
          "Present the plan to the space's owner and record their decision or feedback",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A to-scale final floor plan with measurements",
      "An itemized, real-priced budget for the redesign",
      "A presentation delivered to the space's actual owner, with their recorded response",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Document the flaws systematically",
        goal: "You have a full list of specific usability flaws, not just the one that annoyed you first.",
        tasks: [
          "Use the product for 3-4 more real tasks, screenshotting or photographing every friction point",
          "Write one sentence per flaw explaining exactly why it fails the user, not just that it's 'bad'",
          "Ask 2 other people to use the product while you watch, and note where they struggle too",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Sketch and justify the redesign",
        goal: "You have concrete redesigned screens or mockups fixing each documented flaw.",
        tasks: [
          "Sketch or mock up a redesign for each major flaw, on paper or in a free tool like Figma",
          "Write a one-line design rationale for each change, tying it back to the specific flaw it fixes",
          "Build a quick clickable or annotated version so someone else can see the flow",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Test and present it",
        goal: "The redesign has been shown to someone and you've recorded a reaction beyond your own opinion.",
        tasks: [
          "Show the before/after to the 2 people who struggled in phase 1 and note their reaction",
          "Compile a short before/after case study document with screenshots and rationale",
          "Post or share the case study somewhere designers or the product's own community would see it",
        ],
        durationDescriptor: "1-2 evenings",
      },
    ],
    deliverables: [
      "A before/after case study document with screenshots, flaws, and redesigned mockups",
      "Annotated design rationale explaining each change",
      "Feedback notes from at least 2 real users who reacted to the redesign",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Lock the theme and plan pieces",
        goal: "You have a defined cohesive theme and a specific list of pieces that work together.",
        tasks: [
          "Narrow your thumbnails to one clear theme (color palette, silhouette, fabric story)",
          "List the specific pieces the capsule will include (e.g. 4-6 garments that mix and match)",
          "Source fabric, secondhand garments to alter, or patterns for each piece, and confirm your budget covers it",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Construct the first pieces",
        goal: "2-3 pieces exist as finished, wearable garments.",
        tasks: [
          "Make or alter the first piece, fitting it on a real body (yourself or a model) and adjusting",
          "Construct 1-2 more pieces, applying what you learned from fit issues in the first",
          "Photograph each finished piece against your theme reference",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Finish the collection",
        goal: "All planned pieces are complete and function as one cohesive set.",
        tasks: [
          "Construct the remaining pieces in the capsule",
          "Style and photograph the full collection together, mixing and matching pieces",
          "Fix any fit or construction issues a trial styling session reveals",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 4 — Show it",
        goal: "The collection has been seen and worn beyond your own closet.",
        tasks: [
          "Style a lookbook shoot with a real model (a friend is fine) showing every piece worn",
          "Get the collection worn or shown at a real event (school fashion show, market, photo exhibition)",
          "Compile a lookbook document with photos and a short designer statement",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A finished, wearable capsule collection of 4-6 cohesive pieces",
      "A photographed lookbook of the full collection styled and worn",
      "A designer statement explaining the theme and construction choices",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Brief the client and research",
        goal: "You understand what the client actually needs and have researched their competitors.",
        tasks: [
          "Run a short client intake conversation: who their customers are, their values, what they've disliked about their current look",
          "Look at 3-4 competitors' branding for contrast and inspiration",
          "Sketch 5-6 rough logo directions on paper before touching a computer",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Design the core identity",
        goal: "You have 2-3 polished logo concepts with a defined color and type system.",
        tasks: [
          "Digitize your 2-3 strongest sketches into clean vector or high-res logo concepts",
          "Define a color palette and font pairing for each concept",
          "Mock up each concept on a real application (sign, business card, social post) so the client can see it in context",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Revise with client feedback",
        goal: "The client has chosen a direction and it's been refined to their actual approval.",
        tasks: [
          "Present all concepts to the client and get their specific reaction to each",
          "Revise the chosen concept based on their feedback, through at least one more round",
          "Finalize the logo files in the formats they'll actually need (vector, PNG, different sizes)",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Deliver the full system",
        goal: "The client has a usable brand guideline document and files in hand.",
        tasks: [
          "Write a simple brand guideline covering logo usage, colors, and fonts",
          "Deliver all final files and the guideline directly to the client",
          "Confirm they've actually started using it somewhere (sign, packaging, social media)",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "A complete, delivered brand identity (logo files, color palette, type system) for a real client",
      "A written brand guideline document",
      "Evidence the client is actually using the identity (a photo of it in use, a screenshot)",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Learn the real standards",
        goal: "You know the actual accessibility standards well enough to audit against them precisely, not by feel.",
        tasks: [
          "Research the accessibility code or standard that applies to this space (ADA, or your local equivalent)",
          "Build a checklist of measurable requirements: ramp slope, door width, counter height, signage",
          "Do a first measured pass of the space using this checklist, not just your initial walkthrough",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Complete the full audit",
        goal: "You have a complete, measured record of every violation found, with evidence.",
        tasks: [
          "Measure and photograph every point that fails the checklist",
          "Interview 1-2 people who actually use mobility aids about their real experience of the space if possible",
          "Rank the violations by how severely they block access",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Cost out the fixes",
        goal: "Each violation has a specific, realistically costed fix attached.",
        tasks: [
          "Research what each fix would actually require (ramp construction, door hardware, signage)",
          "Get rough cost estimates for the top 3-5 fixes",
          "Prioritize the fixes by cost versus impact",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Present to a decision-maker",
        goal: "The proposal has reached someone who could actually approve or start a fix.",
        tasks: [
          "Write a formal proposal document with findings, photos, and costed recommendations",
          "Present it directly to the space's owner or facilities manager",
          "Record their response and any commitment to act",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A complete accessibility audit measured against a real standard, with photo evidence",
      "A costed proposal ranking fixes by cost and impact",
      "A record of the proposal's delivery and the decision-maker's response",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Validate and set up the basics",
        goal: "You have real evidence people will pay, plus the operational basics to actually sell.",
        tasks: [
          "Follow up on the five responses and get at least 3 people to commit to a real first purchase",
          "Set your pricing, accounting for the actual cost of goods or time",
          "Set up a way to take payment and track orders (even a simple spreadsheet and a payment app)",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Make your first sales",
        goal: "You've completed real transactions and delivered the product or service.",
        tasks: [
          "Fulfill the first confirmed orders and log the actual revenue and costs",
          "Ask each customer for one piece of direct feedback after delivery",
          "Fix the biggest operational snag the first sales revealed (production time, delivery, pricing)",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Market and grow sales",
        goal: "Sales are coming from beyond your original five contacts.",
        tasks: [
          "Run a simple marketing push (social posts, flyers, word of mouth asks) to reach new customers",
          "Track which marketing channel actually produced sales versus which didn't",
          "Keep fulfilling orders and logging revenue and costs weekly",
        ],
        durationDescriptor: "4-6 weeks",
      },
      {
        title: "Phase 4 — Close the season and report",
        goal: "You have a complete profit-and-loss statement and specific lessons learned.",
        tasks: [
          "Total all revenue and costs into a final profit-and-loss statement",
          "Write a report on what worked, what didn't, and what you'd change if you ran it again",
          "Decide and document whether the business continues, pauses, or winds down",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A complete profit-and-loss statement covering the full run of the business",
      "A sales and order log showing real transactions and customer count",
      "A written report on lessons learned, including at least one thing that failed or underperformed",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Source and price",
        goal: "You have real inventory ready and a price that covers your costs.",
        tasks: [
          "Make or source your product inventory, tracking the exact cost per unit",
          "Set a price per item that covers cost plus a real margin",
          "Build a simple display or setup plan for the table",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Prep for the sale",
        goal: "Everything needed for event day is ready and confirmed.",
        tasks: [
          "Confirm the table reservation, time, and any rules the venue has",
          "Prepare a way to track sales and take payment (cash box, payment app)",
          "Promote the pop-up to at least 20 people beforehand so it's not a cold start",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Run the sale and report",
        goal: "The event happened and you have an honest financial record of it.",
        tasks: [
          "Run the pop-up for its full scheduled time, logging every sale",
          "Total revenue against your costs to calculate real profit or loss",
          "Write a short report on what sold, what didn't, and one thing you'd change next time",
        ],
        durationDescriptor: "1 event day",
      },
    ],
    deliverables: [
      "A profit-and-loss statement from the actual sales event",
      "A sales log showing units sold and revenue",
      "A short after-action report naming what worked and what you'd change",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Expand the interviews",
        goal: "You have enough interviews to see a real pattern, not just three opinions.",
        tasks: [
          "Interview 5-7 more people in your target customer group using the same core questions",
          "Ask each one specifically whether they'd pay, and roughly how much",
          "Log every answer in one place so you can compare across interviews",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Study the competition",
        goal: "You know exactly how your idea differs from what already exists.",
        tasks: [
          "Identify 2-3 existing alternatives or competitors people currently use",
          "Compare price, features, and gaps between your idea and each competitor",
          "Revise your idea based on a gap the interviews or competitor research revealed",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Write the verdict",
        goal: "A one-page plan exists with an honest validated-or-not conclusion.",
        tasks: [
          "Write a one-page business plan: the problem, the solution, the target customer, and pricing",
          "State clearly whether the interviews validated or invalidated the original idea, and why",
          "If invalidated, describe the pivot the data suggests; if validated, define the next concrete step",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "A compiled log of 8+ customer interviews with direct quotes",
      "A one-page business plan with a competitor comparison",
      "A written validate-or-invalidate verdict grounded in the interview data",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Land the client",
        goal: "You have a confirmed client and a clear, written agreement on scope and price.",
        tasks: [
          "Follow up your pitch with 2-3 more outreach messages if the first doesn't land",
          "Once someone's interested, write down exactly what you'll deliver, by when, and for how much",
          "Get their agreement in writing (a text or email confirming scope and price counts)",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Do the work",
        goal: "The deliverable is complete and matches what you agreed to.",
        tasks: [
          "Complete the work, checking in with the client once mid-way if it's more than a couple days",
          "Revise based on any feedback before final delivery",
          "Deliver the finished work on the agreed date",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Get paid and document it",
        goal: "Payment has actually been received and the whole arrangement is documented.",
        tasks: [
          "Send a simple invoice or payment request for the agreed amount",
          "Confirm payment is received and log the transaction",
          "Ask the client for a short written testimonial about the work",
        ],
        durationDescriptor: "1-2 evenings",
      },
    ],
    deliverables: [
      "Proof of a completed, paid transaction (invoice and payment confirmation)",
      "The finished deliverable itself, as a portfolio piece",
      "A short written client testimonial",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Plan the campaign",
        goal: "You have a confirmed partner organization and a concrete plan for how funds will be raised.",
        tasks: [
          "Confirm with the organization exactly how they'll receive and use the funds",
          "Choose your fundraising method (event, online campaign, product sales) and set a timeline to the goal date",
          "Build a simple tracker for donations as they come in",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Launch and drive donations",
        goal: "The campaign is live and actively bringing in real donations.",
        tasks: [
          "Launch the campaign and personally ask at least 15 people or contacts directly, not just posting once",
          "Send a mid-campaign update to donors and prospects showing progress toward the goal",
          "Follow up on stalled momentum with a specific push (a matching pledge, a deadline reminder)",
        ],
        durationDescriptor: "3-4 weeks",
      },
      {
        title: "Phase 3 — Close it out and report impact",
        goal: "The funds have been delivered and a report shows exactly how they were used.",
        tasks: [
          "Total final funds raised against the original goal",
          "Deliver the funds to the organization and get confirmation of receipt",
          "Write an impact report showing how the funds were actually used, and share it with everyone who donated",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A campaign donation log showing the final total raised against the goal",
      "Confirmation of funds delivered to the partner organization",
      "A written impact report shared with donors on how the funds were used",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build the real content",
        goal: "The site has actual content about you, not just a placeholder name.",
        tasks: [
          "Write your about section, project list, and contact info in a doc first",
          "Build out the pages (or sections) with that real content using HTML/CSS or your chosen site builder",
          "Add at least one real project or piece of work with a description",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Polish and deploy properly",
        goal: "The site looks intentional and works on both phone and desktop.",
        tasks: [
          "Check and fix the layout on a phone screen, not just your laptop",
          "Clean up navigation, fonts, and spacing so it reads as finished, not a draft",
          "Redeploy to your hosting so the live link reflects the polished version",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Get real feedback and revise",
        goal: "The site has been improved based on actual outside reactions.",
        tasks: [
          "Send the live link to 5 people and ask specifically what's confusing or missing",
          "Make at least 2 concrete changes based on that feedback",
          "Share the final link somewhere it'll get real traffic (a bio, an application, a portfolio listing)",
        ],
        durationDescriptor: "2-3 evenings",
      },
    ],
    deliverables: [
      "A live, working personal website with a real, shareable URL",
      "A documented before/after showing changes made from real user feedback",
      "The site's source files or export",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Design the logic and pick your stack",
        goal: "You have a clear spec for what the tool does and the API or logic it'll use.",
        tasks: [
          "Write out the exact input and output of the tool: what goes in, what comes out",
          "Pick your approach (a rule-based script, an API-backed bot, a simple form-driven tool) and set up the project",
          "Build the smallest working version that handles just one example case",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Build out the full functionality",
        goal: "The tool correctly handles the range of real cases it's meant for, not just the one example.",
        tasks: [
          "Extend the logic to handle 5-10 varied real examples you feed it",
          "Fix every case where the output is wrong or the tool breaks",
          "Add basic error handling for obviously bad input",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Test on real users and fix real bugs",
        goal: "People outside you have actually used it and you've fixed what they hit.",
        tasks: [
          "Get 3-5 real people to use the tool without your help, watching or asking for a screen recording",
          "Log every bug or confusing moment they hit",
          "Fix the bugs and re-test with at least one of the same users",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A working bot or tool with source code shared (repo or file)",
      "A log of real user tests documenting bugs found and fixed",
      "A short usage guide or demo showing the tool solving the real annoyance",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Order parts and build the starter circuit",
        goal: "You have working parts and have successfully run one basic beginner circuit.",
        tasks: [
          "Order or gather the parts list, checking a local electronics shop if shipping takes too long",
          "Build and run the beginner starter project exactly as documented, to prove your setup works",
          "Debug any wiring or upload issues until the starter project actually runs",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Design your own gadget",
        goal: "You have a specific, scoped design for what your own gadget will actually do.",
        tasks: [
          "Define the specific function your gadget will perform, beyond the starter tutorial",
          "Sketch the circuit and list any additional components needed",
          "Write pseudocode or an outline of the program logic before coding it",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Build and debug the real thing",
        goal: "A working physical prototype exists that does the intended function.",
        tasks: [
          "Wire the full circuit and write/upload the program",
          "Debug hardware issues (bad connections, wrong pin, power problems) as they come up, logging each one",
          "Test the gadget under its actual intended use case, not just on the bench",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 4 — Finish the build and document it",
        goal: "The gadget is in a finished enclosure and documented well enough for someone else to replicate.",
        tasks: [
          "Build or 3D-print/assemble a simple enclosure or housing",
          "Record a demo video showing the gadget working",
          "Write a build log documenting the parts, circuit, code, and the hardware bugs you debugged",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A finished, working hardware device with an enclosure",
      "A demo video showing it functioning",
      "A build log documenting the circuit, code, parts list, and debugging process",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Build the core mechanic",
        goal: "One mechanic works fully and is actually fun to interact with, even without art or levels.",
        tasks: [
          "Decide the single core mechanic your game is built around (jumping, matching, shooting, puzzle-solving)",
          "Build that mechanic until it works reliably, using placeholder shapes instead of art",
          "Get one friend to try just the mechanic and tell you honestly if it's engaging",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Build a complete level or scope",
        goal: "A full playable slice exists: a beginning, middle, and end (or win/lose condition).",
        tasks: [
          "Design and build one complete level or full play session around the core mechanic",
          "Add a win condition and a lose condition so a playthrough actually ends somewhere",
          "Add basic art, sound, or UI so it's not just gray boxes",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Playtest and revise",
        goal: "Real playtesters have completed the game and specific feedback has changed it.",
        tasks: [
          "Have 3-5 people outside your household play it start to finish while you watch",
          "Log every point where they got stuck, confused, or bored",
          "Fix the top issues and re-test with at least one returning playtester to confirm the fix",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A complete, playable game (with a win/lose condition) built in a real engine",
      "A build file or shareable link so others can actually play it",
      "Playtest notes showing specific feedback and the revisions it caused",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Understand the codebase and the issue",
        goal: "You know exactly what the issue is asking and where in the code it lives.",
        tasks: [
          "Clone the repo locally and get it running by following the project's own setup instructions",
          "Find the exact file(s) related to the issue by searching the codebase",
          "Read the project's CONTRIBUTING guide for its expected process and code style",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Make the change and test it",
        goal: "A working fix exists on your machine and you've verified it actually works.",
        tasks: [
          "Write the code change on a new branch, following the project's style conventions",
          "Run the project's existing tests, and write a new one if the change needs it",
          "Manually verify the fix actually resolves the issue as described",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 3 — Submit and respond to review",
        goal: "The pull request has been reviewed by a real maintainer and you've responded to their feedback.",
        tasks: [
          "Write a clear pull request description explaining what changed and why, linking the issue",
          "Open the PR and wait for maintainer feedback",
          "Address every piece of review feedback with a follow-up commit until it's merged or clearly resolved",
        ],
        durationDescriptor: "1-2 weeks (mostly waiting on review)",
      },
    ],
    deliverables: [
      "A submitted pull request with a link, whether merged or under active review",
      "A record of the maintainer's review comments and your responses to them",
      "A short writeup of what you learned reading and modifying an unfamiliar codebase",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Report and file the first story",
        goal: "You have one fully reported, fact-checked story ready to publish under a real deadline.",
        tasks: [
          "Get 2-3 more sources beyond your first quote to round out the story",
          "Draft the story following a real news structure (lead, context, quotes, close)",
          "Fact-check every name, date, and quote before submitting",
          "Submit it to your school paper or publication by their actual deadline",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 2 — Take on a recurring role",
        goal: "You're contributing regularly, not just as a one-off byline.",
        tasks: [
          "Pitch and report 2-3 more stories across different beats or topics",
          "Take on a recurring role at the publication (a regular column, section, or edit duty) if one's available",
          "Meet every deadline for these additional pieces",
        ],
        durationDescriptor: "4-6 weeks",
      },
      {
        title: "Phase 3 — Build a portfolio of published work",
        goal: "You have a body of bylined, published work you can point to.",
        tasks: [
          "Compile links or scans of every published piece into one portfolio document",
          "Write a short reflection on how your reporting or writing changed across the pieces",
          "Share the portfolio with your publication's editor for feedback on your growth",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "3+ bylined, published stories with links or scans",
      "A portfolio document compiling all published work with a growth reflection",
      "Evidence of meeting real publishing deadlines (submission timestamps, editor confirmations)",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Draft the full collection",
        goal: "You have complete first drafts of every piece the collection will include.",
        tasks: [
          "Finish the draft you started, then draft 5-6 more complete pieces without stopping to over-edit",
          "Keep a running list of a possible unifying thread (theme, voice, form) across the pieces",
          "Set aside any piece that isn't working rather than forcing it",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 2 — Revise each piece seriously",
        goal: "Every piece has been through at least one real revision pass, not just proofreading.",
        tasks: [
          "Get feedback on the full draft set from at least 2 readers (a teacher, writing group, or peer)",
          "Revise each piece based on that feedback, cutting or rewriting weak sections",
          "Read every piece aloud once to catch awkward phrasing",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Sequence and publish",
        goal: "The finished, sequenced collection is live somewhere readers can access it.",
        tasks: [
          "Decide the final piece order and write a title for the collection",
          "Format the manuscript and self-publish it (print-on-demand, ebook, or a bound zine)",
          "Distribute or share it with real readers and collect at least a few reactions",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A published collection of 6+ complete, revised pieces",
      "Evidence of distribution to real readers (sales, downloads, or handed-out copies)",
      "Draft-to-final comparisons showing the revision process for at least one piece",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Research and line up more voices",
        goal: "You have multiple confirmed interview subjects and a researched understanding of the issue.",
        tasks: [
          "Research the issue's background using at least 3 real sources (articles, reports, official records)",
          "Identify and reach out to 2-3 more people with different perspectives on the issue",
          "Draft a flexible interview question list for each subject",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Film the interviews and b-roll",
        goal: "You have all the raw interview and supporting footage the edit needs.",
        tasks: [
          "Film the first confirmed interview with clean audio and good lighting",
          "Film the remaining interviews, adjusting questions based on what earlier subjects revealed",
          "Shoot supporting b-roll footage of the actual issue or location",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Structure and edit",
        goal: "A complete, coherent documentary cut exists with a clear narrative arc.",
        tasks: [
          "Transcribe or log the key moments from each interview",
          "Build a structure/outline for the narrative before touching the edit timeline",
          "Edit a full cut combining interviews, b-roll, and any narration or text cards needed",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 4 — Finish, screen, and share",
        goal: "The documentary has been finished and shown to a real audience, including the people in it.",
        tasks: [
          "Get one outside viewer's feedback and fix anything unclear before final export",
          "Show the finished film to your interview subjects before it goes public, as a courtesy and accuracy check",
          "Publish or screen it publicly and share the link or event details widely",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A finished short documentary (8-15 minutes) with a public or shareable link",
      "Raw interview footage and a transcript log",
      "Evidence of a real screening or public release, including subject sign-off",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Script the full comic",
        goal: "You have a complete page-by-page script before drawing a final panel.",
        tasks: [
          "Expand your 4-panel idea (or a new one) into a full short story with a beginning, middle, and end",
          "Break the script into panel-by-panel thumbnails for every page",
          "Decide your art style and medium (digital, ink, pencil) and test it on one sample page",
        ],
        durationDescriptor: "2-3 evenings",
      },
      {
        title: "Phase 2 — Draw the full comic",
        goal: "Every page is fully drawn and lettered.",
        tasks: [
          "Pencil and ink (or digitally draw) every page from your thumbnails",
          "Letter the dialogue and captions, checking pacing reads clearly panel to panel",
          "Get one reader to flow through the pages and flag any confusing panel transitions",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 3 — Finish and distribute",
        goal: "The comic is in a finished, shareable format and has reached real readers.",
        tasks: [
          "Format the final pages for print or digital release, adding a cover",
          "Publish or print the comic and distribute it to at least 20 readers",
          "Collect reactions from readers who aren't close friends",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A finished, multi-page comic distributed to 20+ real readers",
      "The full script and thumbnail pages showing the planning process",
      "A record of reader reactions or feedback",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Plan the campaign arc",
        goal: "You have a content calendar of posts that build a story, not one-off unrelated posts.",
        tasks: [
          "Outline a 6-8 post arc: what story or argument the campaign builds across posts",
          "Draft captions and visuals for the first 3 posts",
          "Set up a simple way to track engagement (likes, shares, comments, link clicks) per post",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Post consistently and track",
        goal: "The full planned run of posts has gone out on a consistent schedule.",
        tasks: [
          "Post on a consistent schedule (e.g. every 2-3 days) for the full planned arc",
          "Log engagement numbers for each post right after posting and again after 48 hours",
          "Adjust the remaining posts based on which early ones performed best",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Analyze and report",
        goal: "You can say specifically what worked, backed by real numbers.",
        tasks: [
          "Compile all engagement data into one summary table or chart",
          "Write a short analysis of which post types or topics performed best and why",
          "Share the campaign results with the cause's organization or community if relevant",
        ],
        durationDescriptor: "1-2 evenings",
      },
    ],
    deliverables: [
      "A published multi-post campaign (6+ posts) with a link to the live content",
      "A tracked engagement dataset across all posts",
      "A written analysis of what performed best and why",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Secure the plot and plan",
        goal: "You have confirmed access to a real plot and a basic growing plan for it.",
        tasks: [
          "Get formal confirmation (in writing if possible) of access to the plot and any rules attached",
          "Test or research the soil and sun conditions to decide what can actually grow there",
          "Sketch a layout plan and list the tools, soil amendments, and seeds/starts you need",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Recruit volunteers and build the beds",
        goal: "You have a small recurring volunteer team and physical beds ready to plant.",
        tasks: [
          "Recruit at least 5 volunteers and set a recurring work schedule",
          "Clear the plot and build or prepare the growing beds as a group",
          "Plant the first round of seeds or starts",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Maintain it through a growing stretch",
        goal: "The garden has been tended consistently across real weeks, with volunteers still showing up.",
        tasks: [
          "Run regular maintenance sessions (watering, weeding, pest checks) on a fixed schedule",
          "Track who shows up each session and follow up with anyone who drops off",
          "Handle at least one real problem that comes up (pests, weather damage, a no-show volunteer week)",
        ],
        durationDescriptor: "6-8 weeks",
      },
      {
        title: "Phase 4 — Harvest and hand off",
        goal: "The garden has produced something real and has a plan to continue beyond you.",
        tasks: [
          "Harvest and distribute or donate whatever the garden produced",
          "Document the season with photos and a simple growing log",
          "Recruit or train someone to keep the garden running after your involvement changes",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A functioning garden plot with a documented full-season growing log",
      "A volunteer attendance record across the season",
      "Evidence of harvest distribution or donation, plus a handoff plan for continuity",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Learn the standard and expand the audit",
        goal: "You're auditing against real accessibility standards across the whole building, not just one route.",
        tasks: [
          "Research the accessibility standard that applies to your school (ADA or your local equivalent)",
          "Build a checklist covering ramps, doors, restrooms, signage, and classroom access",
          "Audit 3-4 more routes or areas of the school against the checklist",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Gather firsthand accounts",
        goal: "The findings include real experiences, not just your own measurements.",
        tasks: [
          "Interview any student, staff member, or visitor at your school who uses a mobility aid, if anyone is willing",
          "Photograph and measure every point that fails the checklist",
          "Cross-check your findings against the written standard to confirm each violation",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Write the report",
        goal: "A complete, evidence-backed report exists ranking findings by severity.",
        tasks: [
          "Compile all findings into a report with photos, measurements, and the specific standard each violates",
          "Rank findings by how severely they block access",
          "Draft specific, realistic recommendations for the top issues",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Present to someone with authority",
        goal: "The findings have reached an administrator who could actually act on them.",
        tasks: [
          "Request a meeting with school administration or facilities",
          "Present the findings and recommendations directly",
          "Record their response and any commitment to act, following up in writing afterward",
        ],
        durationDescriptor: "1 week",
      },
    ],
    deliverables: [
      "A complete accessibility audit report with photo evidence and cited standards",
      "A prioritized list of specific recommendations",
      "A record of the presentation to school administration and their response",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Set a specific, verified goal",
        goal: "You have a specific, org-confirmed target (item and quantity) instead of a vague 'donate stuff' ask.",
        tasks: [
          "Confirm the exact item and target quantity the organization actually needs, in writing if possible",
          "Pick collection logistics: drop-off points, dates, and who's responsible for transport",
          "Design a simple flyer or post stating the specific need clearly",
        ],
        durationDescriptor: "3-4 evenings",
      },
      {
        title: "Phase 2 — Run the collection",
        goal: "Donations are actively coming in and being logged against the target.",
        tasks: [
          "Promote the drive through at least 3 channels (school announcements, social posts, direct asks)",
          "Set up and staff collection points on the agreed schedule",
          "Log every donation received against the target quantity",
        ],
        durationDescriptor: "2-3 weeks",
      },
      {
        title: "Phase 3 — Deliver and report",
        goal: "The items have been delivered and a measurable outcome is documented.",
        tasks: [
          "Deliver the collected items to the organization and get confirmation of receipt",
          "Total the final amount collected against the original goal",
          "Write and share a short report on what was delivered and thank the people who contributed",
        ],
        durationDescriptor: "3-4 evenings",
      },
    ],
    deliverables: [
      "A donation log showing items collected against the confirmed target",
      "Confirmation of delivery from the receiving organization",
      "A short outcome report shared with donors",
    ],
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
    implementationPlan: [
      {
        title: "Phase 1 — Research the problem and existing policy",
        goal: "You understand the current policy landscape and have real evidence the problem exists.",
        tasks: [
          "Research how the problem is currently handled (or not) under existing local policy",
          "Find and cite 3-5 sources of evidence the problem is real (data, news coverage, official reports)",
          "Identify 1-2 comparable places that have tried a policy fix, and what happened",
        ],
        durationDescriptor: "1-2 weeks",
      },
      {
        title: "Phase 2 — Build the argument",
        goal: "You have a specific, evidence-backed policy recommendation, not just a complaint.",
        tasks: [
          "Draft a specific, actionable policy recommendation (not just 'do something about X')",
          "Back the recommendation with the evidence and comparable examples from your research",
          "Get one knowledgeable adult (teacher, local official's staff, relevant professional) to critique the draft",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 3 — Write the formal brief",
        goal: "A polished, professional-format policy brief exists, ready to send.",
        tasks: [
          "Write the brief in a real policy brief format: problem, evidence, recommendation, next steps",
          "Revise based on the adult reviewer's feedback",
          "Identify the specific real decision-maker (council member, school board, agency official) who should receive it",
        ],
        durationDescriptor: "1 week",
      },
      {
        title: "Phase 4 — Deliver it",
        goal: "The brief has actually reached a real decision-maker, not just been finished.",
        tasks: [
          "Send or hand-deliver the brief to the identified official, requesting a response",
          "Follow up if you don't hear back within a reasonable window",
          "Document whatever response you receive, including no response, as part of the record",
        ],
        durationDescriptor: "1-2 weeks",
      },
    ],
    deliverables: [
      "A formal, evidence-backed policy brief in a professional format",
      "A research log with cited sources supporting the recommendation",
      "A documented delivery to a real official, including their response if any",
    ],
    portfolioValue:
      "A brief delivered to a real official is direct evidence of civic engagement and persuasive, evidence-based writing.",
  },
];
