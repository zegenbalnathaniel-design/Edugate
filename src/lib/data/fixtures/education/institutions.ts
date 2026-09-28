import type { Institution } from "@/lib/data/types";

/**
 * Illustrative, closed-fictional-universe institutions (docs/00-decisions.md
 * → D2). No real institution is named anywhere in this file — every name is
 * an invented compound, cross-checked against real universities/colleges
 * before being committed. `outcomes` is intentionally never set (D2.4):
 * nothing here is genuinely sourced. `media` is always empty — there are no
 * real image assets to point at.
 *
 * Verification is a small, honest minority: most institutions carry
 * `verification: null` (the honest default for a pre-launch platform, D2.5).
 * A handful are `provenance: "verified"` with a real per-category record.
 * A few more stay `provenance: "illustrative"` but carry a `verification`
 * record in "pending" / mixed per-category states, to make the granular
 * trust model (docs/03-data-model.md → Verification) visible: an
 * institution's fee data can be verified while its outcomes data never is,
 * because outcomes data is never genuinely sourced in this fixture set.
 */
export const INSTITUTIONS: Institution[] = [
  /* ------------------------------------------------------------------ */
  /* India (8)                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: "col_meridian_tech",
    createdAt: "2025-06-01",
    updatedAt: "2026-08-12",
    provenance: "verified",
    slug: "meridian-institute-of-technology",
    name: "Meridian Institute of Technology",
    type: "institute",
    location: { country: "India", state: "Karnataka", city: "Bangalore" },
    description:
      "Meridian Institute of Technology is a mid-sized engineering and computing institute on Bangalore's eastern tech corridor, built around project-based studios rather than lecture-only teaching. Its labs and coursework lean heavily on partnerships with the city's software and hardware employers, so classroom work is usually tied to a real build.",
    programs: ["crs_meridian_cs_bs", "crs_meridian_ds_ms", "crs_meridian_robotics"],
    tuition: { currency: "INR", min: 180000, max: 320000, period: "year" },
    scholarships: ["sch_meridian_merit"],
    admissions: {
      selectivity: "selective",
      requirements: [
        "Completed secondary schooling with a strong record in mathematics and physical sciences",
        "Institute entrance assessment covering quantitative reasoning and problem-solving",
        "Statement of purpose describing a prior build, project, or independent exploration",
      ],
      deadlines: [
        { label: "Early Application", date: "2026-12-15" },
        { label: "Regular Application", date: "2027-03-20" },
      ],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "compact campus, roughly 3,000-4,000 students",
      housingAvailable: true,
      notableFacilities: ["open-access hardware lab", "robotics workshop", "24-hour project studio", "central library"],
    },
    studentExperience: {
      classSizeDescriptor: "small studio sections for core project courses, larger lecture halls for foundational subjects",
      clubs: ["robotics club", "open-source society", "competitive programming circle", "hardware hacking collective"],
      testimonialThemes: [
        "close access to faculty during project work",
        "steep first-year workload that eases once studio habits form",
        "a campus culture built around shipping something, not just studying it",
      ],
    },
    media: [],
    verification: {
      id: "ver_meridian_tech",
      createdAt: "2026-04-01",
      updatedAt: "2026-05-10",
      provenance: "verified",
      institutionId: "col_meridian_tech",
      state: "verified",
      submittedAt: "2026-04-01",
      reviewedAt: "2026-05-10",
      reviewedBy: "usr_admin_kavya",
      categories: [
        { key: "academics", state: "verified" },
        { key: "programs", state: "verified" },
        { key: "fees", state: "verified" },
        { key: "admissions", state: "verified" },
        { key: "campus", state: "verified" },
        { key: "outcomes", state: "unverified" },
      ],
    },
  },
  {
    id: "col_northfield_university",
    createdAt: "2025-05-14",
    updatedAt: "2026-08-01",
    provenance: "verified",
    slug: "northfield-university",
    name: "Northfield University",
    type: "university",
    location: { country: "India", state: "Delhi", city: "New Delhi" },
    description:
      "Northfield University is a broad-based public university offering programs across the humanities, social sciences, and sciences from a single central campus. It has a long-standing debate union and student press, and most undergraduate programs combine a core curriculum with room for cross-departmental electives.",
    programs: ["crs_northfield_econ_bs", "crs_northfield_psych_bs", "crs_northfield_polsci"],
    tuition: { currency: "INR", min: 150000, max: 280000, period: "year" },
    scholarships: ["sch_northfield_firstgen"],
    admissions: {
      selectivity: "highly-selective",
      requirements: [
        "Completed secondary schooling with strong marks in relevant subject stream",
        "University entrance examination in the chosen discipline group",
        "Two academic references",
      ],
      deadlines: [
        { label: "Early Application", date: "2026-12-01" },
        { label: "Regular Application", date: "2027-02-28" },
      ],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "large campus, roughly 12,000-15,000 students across all programs",
      housingAvailable: true,
      notableFacilities: ["central library", "student press office", "debate and moot chambers", "multi-faith prayer hall"],
    },
    studentExperience: {
      classSizeDescriptor: "large lecture halls for first-year core courses, seminar-sized discussion sections from second year",
      clubs: ["debate union", "student newspaper", "model United Nations society", "amateur theatre group"],
      testimonialThemes: [
        "a wide elective net that lets interests shift after the first year",
        "an active, opinionated campus political culture",
        "administrative processes that can feel slow for a campus this size",
      ],
    },
    media: [],
    verification: {
      id: "ver_northfield_university",
      createdAt: "2026-03-18",
      updatedAt: "2026-04-22",
      provenance: "verified",
      institutionId: "col_northfield_university",
      state: "verified",
      submittedAt: "2026-03-18",
      reviewedAt: "2026-04-22",
      reviewedBy: "usr_admin_kavya",
      categories: [
        { key: "academics", state: "verified" },
        { key: "programs", state: "verified" },
        { key: "fees", state: "verified" },
        { key: "admissions", state: "verified" },
        { key: "campus", state: "verified" },
        { key: "outcomes", state: "unverified" },
      ],
    },
  },
  {
    id: "col_calder_design",
    createdAt: "2025-07-22",
    updatedAt: "2026-07-30",
    provenance: "illustrative",
    slug: "calder-school-of-design",
    name: "Calder School of Design",
    type: "institute",
    location: { country: "India", state: "Maharashtra", city: "Pune" },
    description:
      "Calder School of Design is a portfolio-admission design institute organized around open studio floors rather than fixed classrooms. Coursework moves between individual studio critique and small group briefs set with outside design practitioners.",
    programs: ["crs_calder_uxdesign", "crs_calder_comm_design"],
    tuition: { currency: "INR", min: 220000, max: 400000, period: "year" },
    scholarships: ["sch_calder_design_talent"],
    admissions: {
      selectivity: "selective",
      requirements: [
        "Portfolio of at least eight original works spanning two or more media",
        "Studio-based entrance test on the day of interview",
        "Panel interview discussing the portfolio",
      ],
      deadlines: [{ label: "Application & Portfolio Deadline", date: "2027-01-10" }],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "small campus, roughly 900-1,200 students",
      housingAvailable: false,
      notableFacilities: ["print and bookbinding workshop", "materials library", "open studio floors", "exhibition gallery"],
    },
    studentExperience: {
      classSizeDescriptor: "studio groups of a dozen or so students per critique session",
      clubs: ["print and zine collective", "typography club", "annual degree show committee"],
      testimonialThemes: [
        "critique culture that takes getting used to, then becomes the best part",
        "a lot of self-directed studio time outside scheduled hours",
        "strong peer network across design disciplines",
      ],
    },
    media: [],
    verification: {
      id: "ver_calder_design",
      createdAt: "2026-05-02",
      updatedAt: "2026-05-02",
      provenance: "illustrative",
      institutionId: "col_calder_design",
      state: "pending",
      submittedAt: "2026-05-02",
      reviewedAt: null,
      reviewedBy: null,
      categories: [
        { key: "academics", state: "verified" },
        { key: "fees", state: "verified" },
        { key: "admissions", state: "pending" },
        { key: "programs", state: "pending" },
        { key: "campus", state: "unverified" },
        { key: "outcomes", state: "unverified" },
      ],
    },
  },
  {
    id: "col_aravalli_management",
    createdAt: "2025-08-05",
    updatedAt: "2026-06-18",
    provenance: "illustrative",
    slug: "aravalli-institute-of-management",
    name: "Aravalli Institute of Management",
    type: "institute",
    location: { country: "India", state: "Rajasthan", city: "Jaipur" },
    description:
      "Aravalli Institute of Management is a business school built around case-method teaching and a residential cohort model, with most students living on or near campus for the duration of the program. It runs a dedicated venture-building elective alongside its core management curriculum.",
    programs: ["crs_aravalli_mba", "crs_aravalli_bba_entrepreneurship"],
    tuition: { currency: "INR", min: 350000, max: 900000, period: "year" },
    scholarships: ["sch_aravalli_womenbusiness"],
    admissions: {
      selectivity: "moderate",
      requirements: [
        "Management aptitude test score from a recognized national or institute-run exam",
        "Group discussion and personal interview round",
        "Prior academic transcripts",
      ],
      deadlines: [
        { label: "Round 1 Application", date: "2026-12-10" },
        { label: "Round 2 Application", date: "2027-04-05" },
      ],
    },
    campus: {
      setting: "suburban",
      sizeDescriptor: "residential campus on the edge of the city, roughly 1,500 students",
      housingAvailable: true,
      notableFacilities: ["case-method lecture theatres", "venture incubation room", "residential dining halls", "outdoor amphitheatre"],
    },
    studentExperience: {
      classSizeDescriptor: "fixed cohort sections of about 60 students for core courses",
      clubs: ["consulting case club", "venture building society", "finance and markets club", "cultural committee"],
      testimonialThemes: [
        "an intense cold-call case culture in the first term",
        "tight cohort bonds from the residential setup",
        "heavy group-project load alongside individual coursework",
      ],
    },
    media: [],
    verification: {
      id: "ver_aravalli_management",
      createdAt: "2026-06-01",
      updatedAt: "2026-06-01",
      provenance: "illustrative",
      institutionId: "col_aravalli_management",
      state: "pending",
      submittedAt: "2026-06-01",
      reviewedAt: null,
      reviewedBy: null,
      categories: [
        { key: "fees", state: "verified" },
        { key: "admissions", state: "verified" },
        { key: "academics", state: "pending" },
        { key: "programs", state: "pending" },
        { key: "campus", state: "unverified" },
        { key: "outcomes", state: "unverified" },
      ],
    },
  },
  {
    id: "col_sundara_arts_sciences",
    createdAt: "2025-06-28",
    updatedAt: "2026-07-05",
    provenance: "illustrative",
    slug: "sundara-college-of-arts-and-sciences",
    name: "Sundara College of Arts & Sciences",
    type: "college",
    location: { country: "India", state: "Tamil Nadu", city: "Chennai" },
    description:
      "Sundara College of Arts & Sciences is a public-funded liberal arts and sciences college with a long-running student newspaper and community radio station. Its low fee structure keeps it broadly accessible relative to private colleges in the city.",
    programs: ["crs_sundara_media_journalism", "crs_sundara_life_sciences"],
    tuition: { currency: "INR", min: 60000, max: 150000, period: "year" },
    scholarships: ["sch_sundara_media_grant", "sch_solaris_biosciences"],
    admissions: {
      selectivity: "moderate",
      requirements: [
        "Completed secondary schooling with minimum aggregate in the relevant stream",
        "Merit-based seat allocation through a common counselling process",
      ],
      deadlines: [{ label: "Application Deadline", date: "2027-03-01" }],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "mid-sized campus, roughly 4,500 students",
      housingAvailable: true,
      notableFacilities: ["community radio studio", "student newspaper office", "wet laboratory block", "open-air auditorium"],
    },
    studentExperience: {
      classSizeDescriptor: "large lecture sections in first year, smaller labs and tutorials in later years",
      clubs: ["student newspaper", "community radio collective", "nature and field-studies club"],
      testimonialThemes: [
        "an affordable option with an active student press culture",
        "labs that can feel crowded during peak hours",
        "a genuinely mixed student body across income backgrounds",
      ],
    },
    media: [],
    verification: null,
  },
  {
    id: "col_ashwood_engineering",
    createdAt: "2025-09-11",
    updatedAt: "2026-07-19",
    provenance: "illustrative",
    slug: "ashwood-institute-of-engineering-and-technology",
    name: "Ashwood Institute of Engineering & Technology",
    type: "institute",
    location: { country: "India", state: "Telangana", city: "Hyderabad" },
    description:
      "Ashwood Institute of Engineering & Technology sits in Hyderabad's outer tech and manufacturing belt and runs a mandatory industry-internship term in its third year. Its architecture program shares studio space with the mechanical workshops, which keeps the two disciplines in regular contact.",
    programs: ["crs_ashwood_mech_eng", "crs_ashwood_civil_arch"],
    tuition: { currency: "INR", min: 120000, max: 250000, period: "year" },
    scholarships: ["sch_meridian_merit"],
    admissions: {
      selectivity: "moderate",
      requirements: [
        "Completed secondary schooling with strong marks in mathematics and physics",
        "State or national engineering entrance exam score",
      ],
      deadlines: [{ label: "Application Deadline", date: "2027-03-15" }],
    },
    campus: {
      setting: "suburban",
      sizeDescriptor: "mid-sized campus, roughly 5,000 students",
      housingAvailable: true,
      notableFacilities: ["mechanical workshops", "architecture model-making studio", "materials testing lab", "sports ground"],
    },
    studentExperience: {
      classSizeDescriptor: "lecture sections of 60-80, lab and studio groups closer to 20",
      clubs: ["automotive design club", "architecture studio society", "student chapter of an engineering body"],
      testimonialThemes: [
        "the third-year internship term genuinely changes how students approach coursework after",
        "workshop access outside class hours is a big draw",
        "commute from the city center can be long for day scholars",
      ],
    },
    media: [],
    verification: null,
  },
  {
    id: "col_brightwater_law",
    createdAt: "2025-05-30",
    updatedAt: "2026-06-25",
    provenance: "illustrative",
    slug: "brightwater-university-of-law",
    name: "Brightwater University of Law",
    type: "university",
    location: { country: "India", state: "Maharashtra", city: "Mumbai" },
    description:
      "Brightwater University of Law is a dedicated law school running both an integrated undergraduate law degree and postgraduate specializations, with a full-time moot court and legal-aid clinic attached to the campus. Faculty are a mix of full-time academics and practicing lawyers teaching part-time.",
    programs: ["crs_brightwater_llb", "crs_brightwater_llm"],
    tuition: { currency: "INR", min: 200000, max: 450000, period: "year" },
    scholarships: ["sch_brightwater_law_merit"],
    admissions: {
      selectivity: "selective",
      requirements: [
        "National or state law entrance examination score",
        "Personal interview round",
        "Prior academic transcripts",
      ],
      deadlines: [{ label: "Application Deadline", date: "2027-02-20" }],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "small campus, roughly 1,800 students across undergraduate and postgraduate programs",
      housingAvailable: true,
      notableFacilities: ["moot court chamber", "legal-aid clinic", "law library with regional case archives", "seminar rooms"],
    },
    studentExperience: {
      classSizeDescriptor: "seminar-style classes of 30-40 for most substantive law courses",
      clubs: ["moot court society", "legal-aid volunteer clinic", "debate and negotiation club"],
      testimonialThemes: [
        "heavy reading load that front-loads the first two years",
        "practicing faculty bring current case context into class",
        "moot court culture is competitive but widely considered worthwhile",
      ],
    },
    media: [],
    verification: null,
  },
  {
    id: "col_solaris_life_sciences",
    createdAt: "2025-10-02",
    updatedAt: "2026-07-11",
    provenance: "illustrative",
    slug: "solaris-institute-of-life-sciences",
    name: "Solaris Institute of Life Sciences",
    type: "institute",
    location: { country: "India", state: "Gujarat", city: "Ahmedabad" },
    description:
      "Solaris Institute of Life Sciences focuses on biotechnology and public health, with laboratory coursework built around a rotating set of applied research briefs rather than fixed lab manuals. It maintains a small on-campus wet lab shared across undergraduate and postgraduate cohorts.",
    programs: ["crs_solaris_biotech", "crs_solaris_public_health"],
    tuition: { currency: "INR", min: 140000, max: 300000, period: "year" },
    scholarships: ["sch_solaris_biosciences"],
    admissions: {
      selectivity: "moderate",
      requirements: [
        "Completed secondary schooling with strong marks in biology and chemistry",
        "Institute entrance assessment",
      ],
      deadlines: [{ label: "Application Deadline", date: "2027-04-01" }],
    },
    campus: {
      setting: "suburban",
      sizeDescriptor: "small campus, roughly 1,100 students",
      housingAvailable: true,
      notableFacilities: ["shared wet laboratory", "public health field-data room", "seminar library", "greenhouse plot"],
    },
    studentExperience: {
      classSizeDescriptor: "lab groups of 15-20 for most practical coursework",
      clubs: ["public health outreach society", "microbiology club", "science communication collective"],
      testimonialThemes: [
        "lab access is generous once safety training is complete",
        "field placements for public health students vary a lot year to year",
        "a close-knit cohort given the institute's small size",
      ],
    },
    media: [],
    verification: null,
  },
  /* ------------------------------------------------------------------ */
  /* United States (2)                                                  */
  /* ------------------------------------------------------------------ */
  {
    id: "col_wrenfield_university",
    createdAt: "2025-04-20",
    updatedAt: "2026-08-05",
    provenance: "verified",
    slug: "wrenfield-university",
    name: "Wrenfield University",
    type: "university",
    location: { country: "United States", state: "Massachusetts", city: "Boston" },
    description:
      "Wrenfield University is a private research university with undergraduate colleges spanning computing, the social sciences, and the humanities. Its computer science program runs alongside a cross-registration agreement with a handful of neighboring colleges, widening the elective pool considerably.",
    programs: ["crs_wrenfield_cs_bs", "crs_wrenfield_econ_ba"],
    tuition: { currency: "USD", min: 48000, max: 62000, period: "year" },
    scholarships: ["sch_wrenfield_global", "sch_cairnwood_stem"],
    admissions: {
      selectivity: "highly-selective",
      requirements: [
        "Secondary school transcript with standardized test scores (test-optional policy available)",
        "Personal essay and two letters of recommendation",
        "Extracurricular and activity record",
      ],
      deadlines: [
        { label: "Early Decision", date: "2026-11-01" },
        { label: "Regular Decision", date: "2027-01-15" },
      ],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "mid-sized campus, roughly 6,500 undergraduates",
      housingAvailable: true,
      notableFacilities: ["cross-registration study lounge", "maker space", "central research library", "recreational athletics center"],
    },
    studentExperience: {
      classSizeDescriptor: "large introductory lectures, discussion sections capped around 20",
      clubs: ["cross-campus hackathon society", "debate team", "a cappella and music groups", "model government society"],
      testimonialThemes: [
        "the cross-registration option is a genuine draw for double-major students",
        "first-year advising can feel impersonal until students find a department home",
        "strong on-campus research opportunities for undergraduates who seek them out",
      ],
    },
    media: [],
    verification: {
      id: "ver_wrenfield_university",
      createdAt: "2026-02-14",
      updatedAt: "2026-03-20",
      provenance: "verified",
      institutionId: "col_wrenfield_university",
      state: "verified",
      submittedAt: "2026-02-14",
      reviewedAt: "2026-03-20",
      reviewedBy: "usr_admin_dara",
      categories: [
        { key: "academics", state: "verified" },
        { key: "programs", state: "verified" },
        { key: "fees", state: "verified" },
        { key: "admissions", state: "verified" },
        { key: "campus", state: "verified" },
        { key: "outcomes", state: "unverified" },
      ],
    },
  },
  {
    id: "col_cairnwood_polytechnic",
    createdAt: "2025-09-01",
    updatedAt: "2026-07-22",
    provenance: "illustrative",
    slug: "cairnwood-polytechnic-institute",
    name: "Cairnwood Polytechnic Institute",
    type: "institute",
    location: { country: "United States", state: "California", city: "San Jose" },
    description:
      "Cairnwood Polytechnic Institute is a technical institute in the South Bay offering hands-on engineering and applied sciences programs, including a dedicated sports science track with an on-campus performance lab. Most upper-division courses are project-team based rather than exam-only.",
    programs: ["crs_cairnwood_mech_eng", "crs_cairnwood_sports_science"],
    tuition: { currency: "USD", min: 26000, max: 41000, period: "year" },
    scholarships: ["sch_cairnwood_stem", "sch_wrenfield_global"],
    admissions: {
      selectivity: "selective",
      requirements: [
        "Secondary school transcript with coursework in mathematics and science",
        "Short answer application essays",
      ],
      deadlines: [{ label: "Priority Application", date: "2027-01-05" }],
    },
    campus: {
      setting: "suburban",
      sizeDescriptor: "small campus, roughly 3,200 students",
      housingAvailable: true,
      notableFacilities: ["applied mechanics lab", "human performance lab", "prototyping workshop", "outdoor track"],
    },
    studentExperience: {
      classSizeDescriptor: "project-team sections capped around 25 for upper-division courses",
      clubs: ["formula student racing team", "sports analytics club", "robotics build team"],
      testimonialThemes: [
        "the performance lab is heavily used by both sports science and engineering students",
        "project-team courses reward students who show up consistently, not just at deadlines",
        "smaller size means faculty know most students by name",
      ],
    },
    media: [],
    verification: null,
  },
  /* ------------------------------------------------------------------ */
  /* United Kingdom (1)                                                 */
  /* ------------------------------------------------------------------ */
  {
    id: "col_faircross_college",
    createdAt: "2025-07-03",
    updatedAt: "2026-07-28",
    provenance: "illustrative",
    slug: "faircross-college",
    name: "Faircross College",
    type: "college",
    location: { country: "United Kingdom", state: "England", city: "Manchester" },
    description:
      "Faircross College is a media and design-focused higher education college housed in a converted industrial building in central Manchester, with shared edit suites and a small architecture model shop. Many courses bring in working practitioners for short guest-taught modules.",
    programs: ["crs_faircross_media_prod", "crs_faircross_arch"],
    tuition: { currency: "GBP", min: 9500, max: 14500, period: "year" },
    scholarships: ["sch_faircross_creative"],
    admissions: {
      selectivity: "moderate",
      requirements: [
        "Secondary qualifications meeting the course's minimum entry grades",
        "Portfolio or showreel for design and media production courses",
        "Personal statement",
      ],
      deadlines: [{ label: "Main Application Deadline", date: "2027-01-25" }],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "small campus, roughly 2,200 students",
      housingAvailable: false,
      notableFacilities: ["shared edit suites", "architecture model shop", "sound recording booth", "student gallery space"],
    },
    studentExperience: {
      classSizeDescriptor: "studio and seminar groups of 15-25 across most courses",
      clubs: ["student film society", "architecture society", "campus radio station"],
      testimonialThemes: [
        "guest practitioner sessions are a highlight most students mention",
        "edit suite bookings get competitive near deadline weeks",
        "no on-campus housing, so most students commute or find flats nearby",
      ],
    },
    media: [],
    verification: null,
  },
  /* ------------------------------------------------------------------ */
  /* Ireland (1)                                                        */
  /* ------------------------------------------------------------------ */
  {
    id: "col_thornfield_college",
    createdAt: "2025-08-19",
    updatedAt: "2026-06-30",
    provenance: "illustrative",
    slug: "thornfield-college",
    name: "Thornfield College",
    type: "college",
    location: { country: "Ireland", state: "Leinster", city: "Dublin" },
    description:
      "Thornfield College is a general-admission liberal arts and business college in central Dublin, with a broad-access admissions policy and evening course options for students working alongside their studies. Most degrees combine a fixed first-year core with elective choice from second year onward.",
    programs: ["crs_thornfield_psych", "crs_thornfield_business"],
    tuition: { currency: "EUR", min: 7800, max: 12500, period: "year" },
    scholarships: [],
    admissions: {
      selectivity: "open",
      requirements: [
        "Secondary school completion certificate",
        "Application form with a short personal statement",
      ],
      deadlines: [{ label: "Application Deadline", date: "2027-02-10" }],
    },
    campus: {
      setting: "urban",
      sizeDescriptor: "small campus, roughly 2,600 students including evening-course students",
      housingAvailable: false,
      notableFacilities: ["psychology observation lab", "business case room", "student support office", "evening study lounge"],
    },
    studentExperience: {
      classSizeDescriptor: "lecture sections of 40-60, smaller tutorial groups for discussion",
      clubs: ["psychology society", "business and enterprise society", "evening students' association"],
      testimonialThemes: [
        "genuinely welcoming to students balancing work and study",
        "evening course options are a real draw for older students",
        "fewer traditional campus-life extras than a residential university",
      ],
    },
    media: [],
    verification: null,
  },
];
