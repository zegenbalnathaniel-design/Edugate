import type { Scholarship } from "@/lib/data/types";

/**
 * Real scholarships (docs/00-decisions.md → D2, superseded). Every entry is
 * a real, currently-running program — a national government scheme, a
 * bilateral fellowship, or a specific university's own published aid
 * program — with a `sources` citation to the provider's official page.
 * `applicationProcess` steps are written from the provider's own published
 * process description, not invented. Coverage amounts are the provider's
 * published figures, which do shift year to year — the source link is
 * where a visitor should confirm the current number.
 */
export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch_inspire_she",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "inspire-scholarship-for-higher-education",
    name: "INSPIRE Scholarship for Higher Education (SHE)",
    provider: "Department of Science and Technology, Government of India",
    eligibility: {
      description: "For students aged 17–22 pursuing a natural sciences bachelor's or master's program, who rank in the top 1% of their board's 12th-standard results, place in the top 10,000 in the relevant national exam, or hold an NTSE/JBNSTS/Olympiad-medal credential.",
      fields: ["life_sciences"],
      countries: ["India"],
    },
    coverage: { type: "fixed-amount", amount: { currency: "INR", min: 80000, max: 80000, period: "year" } },
    deadline: "2027-03-31",
    applicationProcess: [
      { order: 1, label: "Register on the INSPIRE portal", description: "Create an account on online-inspire.gov.in and complete the applicant profile." },
      { order: 2, label: "Submit board/exam credentials", description: "Upload 12th-standard board results or the relevant national exam / Olympiad credential establishing eligibility." },
      { order: 3, label: "Confirm enrollment in a natural sciences program", description: "Provide proof of admission to an eligible bachelor's or integrated master's program in the natural sciences." },
      { order: 4, label: "Annual renewal", description: "Renew eligibility each year, including the summer research attachment component, to continue receiving the scholarship." },
    ],
    basis: ["merit", "field"],
    sources: [
      { label: "INSPIRE Scheme — Department of Science and Technology official site", url: "https://dst.gov.in/inspire-scheme-innovation-science-pursuit-inspired-research", retrievedAt: "2026-09-28" },
      { label: "INSPIRE-SHE overview — India Science, Technology & Innovation portal", url: "https://www.indiascienceandtechnology.gov.in/nurturing-minds/scholarships/post-graduation/inspire-she-innovation-science-pursuit-inspired", retrievedAt: "2026-09-28" },
    ],
  },
  {
    id: "sch_aicte_pragati",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "aicte-pragati-scholarship-for-girls",
    name: "AICTE Pragati Scholarship for Girls",
    provider: "All India Council for Technical Education (AICTE)",
    eligibility: {
      description: "For girl students admitted to a degree or diploma program at an AICTE-approved technical institution, from families with annual income up to ₹8,00,000. Up to two girls per family may apply.",
      fields: ["technology", "engineering"],
      countries: ["India"],
    },
    coverage: { type: "fixed-amount", amount: { currency: "INR", min: 50000, max: 50000, period: "year" } },
    deadline: "2026-10-31",
    applicationProcess: [
      { order: 1, label: "Apply on the National Scholarship Portal", description: "Register and submit the application through the National Scholarship Portal (scholarships.gov.in)." },
      { order: 2, label: "Submit income and admission documentation", description: "Upload family income certificate and proof of admission to an AICTE-approved program." },
      { order: 3, label: "Institution verification", description: "The enrolling institution verifies the submitted documents on the portal." },
      { order: 4, label: "Direct benefit transfer", description: "Approved scholarship amounts are transferred directly to the student's bank account." },
    ],
    basis: ["need", "demographic"],
    sources: [
      { label: "AICTE Pragati & Saksham Scholarship Scheme — official portal", url: "http://www.aicte-pragati-saksham-gov.in/resources/combine%20pragati%20&%20saksham%20(1).pdf", retrievedAt: "2026-09-28" },
    ],
  },
  {
    id: "sch_aicte_saksham",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "aicte-saksham-scholarship",
    name: "AICTE Saksham Scholarship for Differently-Abled Students",
    provider: "All India Council for Technical Education (AICTE)",
    eligibility: {
      description: "For students with more than 40% disability admitted to a degree or diploma program at an AICTE-approved technical institution, from families with annual income under ₹6,00,000.",
      fields: ["technology", "engineering"],
      countries: ["India"],
    },
    coverage: { type: "fixed-amount", amount: { currency: "INR", min: 50000, max: 50000, period: "year" } },
    deadline: "2026-10-31",
    applicationProcess: [
      { order: 1, label: "Apply on the National Scholarship Portal", description: "Register and submit the application through the National Scholarship Portal (scholarships.gov.in)." },
      { order: 2, label: "Submit disability and income documentation", description: "Upload a disability certificate (40%+) and family income certificate." },
      { order: 3, label: "Institution verification", description: "The enrolling institution verifies the submitted documents on the portal." },
    ],
    basis: ["need", "demographic"],
    sources: [
      { label: "AICTE Pragati & Saksham Scholarship Scheme — official portal", url: "http://www.aicte-pragati-saksham-gov.in/resources/combine%20pragati%20&%20saksham%20(1).pdf", retrievedAt: "2026-09-28" },
    ],
  },
  {
    id: "sch_chevening",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "chevening-scholarship",
    name: "Chevening Scholarship",
    provider: "UK Foreign, Commonwealth & Development Office",
    eligibility: {
      description: "For citizens of Chevening-eligible countries (160+, including India) with at least two years of work experience after their undergraduate degree, applying to a one-year UK master's program.",
      countries: ["India", "United Kingdom"],
    },
    coverage: { type: "full", amount: { currency: "GBP", min: 20000, max: 45000, period: "total" } },
    deadline: "2026-10-06",
    applicationProcess: [
      { order: 1, label: "Apply to three UK master's courses", description: "Applicants must apply to and secure at least one unconditional offer from three eligible UK university courses." },
      { order: 2, label: "Submit the Chevening application", description: "Complete the online application on chevening.org during the annual application window." },
      { order: 3, label: "Interview", description: "Shortlisted candidates are interviewed, typically at a British High Commission or Embassy." },
      { order: 4, label: "Award and visa support", description: "Selected scholars receive tuition, a living stipend, travel and a UK visa application covered." },
    ],
    basis: ["merit"],
    sources: [
      { label: "Chevening eligibility criteria — official site", url: "https://www.chevening.org/resource-hub/guidance/eligibility/", retrievedAt: "2026-09-28" },
      { label: "Chevening Scholarships — British Council Study UK", url: "https://study-uk.britishcouncil.org/scholarships-funding/chevening-scholarships", retrievedAt: "2026-09-28" },
    ],
  },
  {
    id: "sch_daad_graduate",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "daad-graduate-scholarship",
    name: "DAAD Graduate Scholarship",
    provider: "German Academic Exchange Service (DAAD)",
    eligibility: {
      description: "For graduates holding a bachelor's degree (for master's-level funding) or a master's degree (for doctoral-level funding), with strong academic records, applying to study or research at a German university or research institution.",
      countries: ["Germany"],
    },
    coverage: { type: "partial", amount: { currency: "EUR", min: 992, max: 1400, period: "total" } },
    deadline: "2026-10-15",
    applicationProcess: [
      { order: 1, label: "Choose an eligible DAAD program", description: "Identify the specific DAAD scholarship program matching your degree level and field on daad.de." },
      { order: 2, label: "Submit academic and language documentation", description: "Provide transcripts, degree certificates and language proficiency evidence (German or English, depending on the program)." },
      { order: 3, label: "Submit a research or study proposal", description: "Provide a statement of purpose or research proposal as required by the specific program." },
      { order: 4, label: "Selection committee review", description: "DAAD's selection committee reviews applications; some programs include an interview." },
    ],
    basis: ["merit"],
    sources: [
      { label: "DAAD Scholarships — An Overview — official site", url: "https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/", retrievedAt: "2026-09-28" },
    ],
  },
  {
    id: "sch_fulbright_nehru_masters",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "fulbright-nehru-masters-fellowship",
    name: "Fulbright-Nehru Master's Fellowship",
    provider: "United States-India Educational Foundation (USIEF)",
    eligibility: {
      description: "For Indian citizens who have completed the equivalent of a US bachelor's degree and have at least three years of professional work experience, committed to returning to India after the fellowship. Government of India and state government employees are not eligible.",
      countries: ["India"],
    },
    coverage: { type: "full", amount: { currency: "USD", min: 20000, max: 50000, period: "total" } },
    deadline: "2027-05-15",
    applicationProcess: [
      { order: 1, label: "Submit the online application", description: "Complete the Fulbright-Nehru application through USIEF's official portal." },
      { order: 2, label: "Submit work-experience and academic documentation", description: "Provide degree transcripts and documentation of at least three years' professional experience." },
      { order: 3, label: "Interview with USIEF", description: "Shortlisted candidates are interviewed by a USIEF selection committee." },
      { order: 4, label: "US host-institution placement", description: "USIEF and the Institute of International Education assist finalists with placement at a US institution." },
    ],
    basis: ["merit"],
    sources: [
      { label: "2026–2027 Fulbright-Nehru Master's Fellowships — USIEF official site", url: "https://www.usief.org.in/fulbright-fellowships/fellowships-for-indian-citizen/fulbright-nehru-masters-fellowships/", retrievedAt: "2026-09-28" },
    ],
  },
  {
    id: "sch_ashoka_need_based",
    createdAt: "2026-09-28",
    updatedAt: "2026-09-28",
    provenance: "verified",
    slug: "ashoka-university-need-based-financial-aid",
    name: "Ashoka University Need-Based Financial Aid",
    provider: "Ashoka University",
    eligibility: {
      description: "For admitted undergraduate students at Ashoka University whose family's assessed ability to pay falls short of the full cost of attendance. Families with gross annual income under roughly ₹12–15 lakh are strongly encouraged to apply.",
      countries: ["India"],
    },
    coverage: { type: "partial" },
    deadline: "2027-04-30",
    applicationProcess: [
      { order: 1, label: "Complete the financial aid application", description: "Submit the financial aid form alongside (or shortly after) the undergraduate admission application at apply.ashoka.edu.in." },
      { order: 2, label: "Submit financial documentation", description: "Provide income, savings and asset documentation for the immediate family." },
      { order: 3, label: "Aid assessment", description: "Ashoka's financial aid office assesses ability to pay and determines a fee waiver percentage, fixed for the duration of the undergraduate program." },
    ],
    basis: ["need"],
    sources: [
      { label: "Merit and Need-Based Scholarships — Ashoka University official site", url: "https://www.ashoka.edu.in/admissions/scholarships/", retrievedAt: "2026-09-28" },
    ],
  },
];
