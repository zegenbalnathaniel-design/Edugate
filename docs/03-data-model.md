# 03 — Data Model

Conceptual model per §99. Expressed as TypeScript because these types are the real artifact — fixtures, Zod schemas, and repository signatures all derive from them.

---

## Global conventions

```ts
type ID = string                       // prefixed: "col_", "crs_", "psn_" …
type Provenance = "illustrative" | "institution-supplied" | "verified"
type ISODate = string

interface Entity {
  id: ID
  createdAt: ISODate
  updatedAt: ISODate
  provenance: Provenance               // D2.2 — not optional, anywhere
}
```

**`provenance` is mandatory on every entity.** It is the mechanism that makes §98 structural rather than a thing we have to remember. `"verified"` may only be set alongside a real `verification` record — enforced in Zod with a refinement, so a fixture cannot claim verification it does not have.

**No field anywhere named** `tier`, `plan`, `subscription`, `premium`, `isPaid`, `sponsored`, `promoted`, `boost` (D3).

---

## Identity

```ts
type Role = "student" | "parent" | "institution_admin" | "institution_staff" | "edugate_admin"
type StaffCapability = "admissions" | "communications" | "analytics"

interface User extends Entity {
  email: string
  name: string
  role: Role
  emailVerified: boolean
  onboardingComplete: boolean
  institutionId?: ID                   // institution_* roles
  capabilities?: StaffCapability[]     // institution_staff only
}
```

### StudentProfile (§19, §47)

```ts
interface StudentProfile extends Entity {
  userId: ID
  age: number
  grade: 9 | 10 | 11 | 12
  school: string
  curriculum: CurriculumBoard          // see open question 2
  country: string; city: string
  subjects: string[]
  academicInterests: string[]
  performance: AcademicPerformance     // self-reported, labelled as such
  careerInterests: string[]
  preferredCountries: string[]; preferredCities: string[]
  degreeInterests: string[]
  budget: BudgetRange
  applicationTimeline: { targetIntake: string; startedPreparing: ISODate }
  extracurriculars: Activity[]
  achievements: Achievement[]
  completeness: Completeness           // derived, never stored
}

interface Completeness {
  overall: number                      // 0–1
  sections: { key: string; filled: number; total: number; nextAction: string }[]
}
```

`completeness` is computed on read. Storing it guarantees it goes stale, and §47 requires it be *actionable* — each gap names the specific next action.

### ParentProfile & the permission edge (§55, §83)

```ts
interface ParentProfile extends Entity {
  userId: ID
  children: ChildLink[]
}

interface ChildLink {
  studentUserId: ID
  relationship: string
  status: "pending" | "active" | "revoked"
  permissions: ChildPermission[]
}

type ChildPermission =
  | "academics" | "applications" | "documents"
  | "scholarships" | "passion_profile" | "projects"
```

**This is the trust-defining structure in the product.** The link is a first-class entity with its own status and granular scopes, not a foreign key. Two consequences: the student can revoke a category without severing the relationship, and every parent-side query filters on it in the repository layer. §58's "visibility without override" means parent-scoped repositories expose **no** write methods on student-owned records — enforced by the interface, not by hiding buttons.

Default grant on link acceptance is **open question 3**.

---

## Education entities

```ts
interface Institution extends Entity {
  slug: string; name: string
  type: "university" | "college" | "school" | "institute"
  location: { country: string; state: string; city: string; coords?: [number, number] }
  description: string
  programs: ID[]                       // → Course
  fees: FeeStructure
  admissions: AdmissionsInfo
  scholarships: ID[]
  campus: CampusInfo
  studentExperience: ExperienceInfo
  outcomes?: OutcomeInfo               // optional — absent unless genuinely sourced
  verification: VerificationRecord | null
  media: MediaAsset[]
}

interface Course extends Entity {
  slug: string; name: string
  degree: DegreeLevel
  field: FieldKey                      // → the field taxonomy, §33
  durationMonths: number
  subjects: string[]
  requirements: Requirement[]
  fees: FeeStructure
  institutions: ID[]
  careerPathways: ID[]
  scholarships: ID[]
  deadlines: Deadline[]
  curriculumReality: CurriculumReality  // §49
}

interface CurriculumReality {
  whatYouStudy: string[]
  theoryToPracticeRatio: number        // 0–1, qualitative bucket in UI, not a percentage
  assessmentTypes: string[]
  typicalProjects: string[]
  workloadDescriptor: "light" | "moderate" | "heavy" | "intensive"
  skillsDeveloped: string[]
}
```

Note `outcomes` is **optional** and `theoryToPracticeRatio` renders as a qualitative band, never a number. Both are D2.4 applied at the type level: the model makes the honest thing easy and the fabricated thing awkward.

```ts
interface Career extends Entity {
  slug: string; title: string
  description: string
  fields: FieldKey[]
  degrees: ID[]; skills: string[]
  relatedCourses: ID[]; relatedInstitutions: ID[]; relatedProjects: ID[]
  workStyle: WorkStyleTags
}

interface Scholarship extends Entity {
  slug: string; name: string; provider: string
  eligibility: EligibilityCriteria
  coverage: Coverage
  deadline: ISODate
  applicationProcess: Step[]
  basis: ("merit" | "need" | "field" | "demographic")[]
}
```

---

## Verification (§76) — the trust model

```ts
type VerificationState = "unverified" | "pending" | "verified" | "needs_information" | "rejected"

interface VerificationRecord extends Entity {
  institutionId: ID
  state: VerificationState
  submittedAt: ISODate
  reviewedAt: ISODate | null
  reviewedBy: ID | null
  categories: { key: VerifiableCategory; state: VerificationState; note?: string }[]
  history: VerificationEvent[]
}
```

Per-category state matters: an institution's fee data can be verified while its outcomes data is not, and §22's "verified information" badge should be honest at that granularity rather than as one blunt flag.

**Institution edits to a verified category demote that category to `pending`** (§64) — a repository-level rule, not a UI convention.

---

## Applications & documents (§42–46)

```ts
type ApplicationStage =
  | "research" | "shortlisted" | "preparing" | "submitted"
  | "under_review" | "interview" | "decision"
  | "accepted" | "rejected" | "waitlisted"

interface Application extends Entity {
  studentId: ID; institutionId: ID; courseId: ID
  stage: ApplicationStage
  deadline: ISODate
  checklist: ChecklistItem[]
  documents: ID[]
  tasks: Task[]; notes: Note[]
  nextAction: string | null            // derived
  stageHistory: { stage: ApplicationStage; at: ISODate }[]
}

interface Document extends Entity {
  ownerId: ID
  category: "academic" | "identity" | "applications" | "financial"
            | "recommendations" | "essays" | "certificates" | "other"
  name: string; mimeType: string; sizeBytes: number
  storageRef: string                   // demo adapter: IndexedDB key
  attachedTo: { type: "application"; id: ID }[]
  visibleToParent: boolean
}
```

Documents go to **IndexedDB**, not `localStorage` — real file blobs, real previews, and a 5MB quota would break immediately otherwise.

---

## Passion (§100)

Full treatment in `04-passion-engine.md`. Entities:

```ts
interface PassionSession extends Entity {
  studentId: ID
  status: "in_progress" | "complete" | "abandoned"
  responses: PassionResponse[]
  askedQuestionIds: ID[]               // required for normalization — see 04
  profile: PassionProfile | null
  completedAt: ISODate | null
}

interface PassionResponse {
  questionId: ID; optionId: ID; at: ISODate
}

interface PassionProfile {
  signals: SignalScore[]
  axes: AxisScore[]
  archetype: Archetype | null          // null is a valid, honest outcome
  fieldConnections: FieldConnection[]
  evidence: EvidenceMap
}

interface Project extends Entity {
  studentId: ID
  sourceSessionId: ID | null
  title: string; rationale: string
  skills: string[]
  difficulty: "starter" | "intermediate" | "ambitious"
  estimatedHours: number
  firstStep: string
  status: "idea" | "started" | "in_progress" | "completed"
  evidence: ID[]                       // → Document
  reflection: string | null
}
```

---

## Supporting entities

`Notification` (7 types, §52/§80) · `Event` (5 types + registrations, §70) · `Lead` (§67) · `CounsellingSession` (§59) · `Workshop` (§60) · `CommunityPost` / `Comment` / `Report` (§61) · `Message` / `Announcement` / `Template` (§71) · `AnalyticsSnapshot` (§69) · `ModerationItem` (§73).

All extend `Entity` and therefore all carry `provenance`.

---

## Relationship map

```
User ──1:1── {Student|Parent|Institution}Profile
Parent ──ChildLink[*]── Student          (status + granular permissions)
Student ──*── PassionSession ──1── PassionProfile ──*── Project
Student ──*── Application ──1── Institution, Course
Application ──*── Document ──*── Application   (many-to-many via attachedTo)
Institution ──*── Course ──*── Career
Institution ──0:1── VerificationRecord (per-category states)
Course/Institution ──*── Scholarship
Student ──*── SavedItem (polymorphic: college|course|scholarship|career|project)
```

The load-bearing joins are `ChildLink` (privacy), `VerificationRecord` (trust), and `PassionProfile → Project` (the differentiator, §113).
