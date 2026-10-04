import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, DataTable } from "@/components/unis/Blocks";
import { FitPanel } from "@/components/unis/FitPanel";
import { ReportForm } from "@/components/unis/ReportForm";
import { Sourced } from "@/components/unis/Sourced";
import { getCurrentUser } from "@/lib/auth/session";
import { FIELD_NAMES } from "@/lib/unis/filters";
import { CONTROL_LABEL, moneyRange, ORG_LABEL, salary, TEST_POLICY_LABEL } from "@/lib/unis/format";
import { INSTITUTION_TYPE_LABEL } from "@/lib/unis/geo";
import { getUniversity } from "@/lib/unis/repo";
import { selectivity, SELECTIVITY_LABEL } from "@/lib/unis/selectivity";
import type { ConfidenceLevel } from "@/lib/unis/schema";
import { getProfile } from "@/lib/user/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return row
    ? { title: `${row.name}: courses, fees, admissions, placements & rankings`, description: row.data.summary }
    : { title: "University" };
}

const OPP_LABEL: Record<string, string> = {
  research: "Research", entrepreneurship: "Entrepreneurship", networking: "Networking", internships: "Internships",
  careers: "Careers", international: "International", "student-life": "Student life",
};

export default async function UniversityOverview({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const d = u.details;
  const base = `/universities/${u.slug}`;
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  type V = { value: unknown; sourceId: string | null; confidence: ConfidenceLevel; asOf: string | null; notes?: string };
  const src = (v: V, shown: ReactNode) => (
    <Sourced sourceId={v.sourceId} sources={S} confidence={v.confidence} asOf={v.asOf} notes={v.notes}>
      {shown}
    </Sourced>
  );
  const num = (v: V) => src(v, typeof v.value === "number" ? v.value.toLocaleString("en-US") : (v.value as string));

  // Latest edition per ranking organisation, overall tables first.
  const latest = Object.values(
    Object.groupBy(
      [...u.rankings].sort((a, b) => b.edition - a.edition),
      (r) => `${r.org}:${/subject/i.test(r.category) ? r.category : "main"}`,
    ),
  )
    .map((g) => g![0])
    .filter((r) => !/subject/i.test(r.category))
    .slice(0, 4);
  const outcome = [...d.outcomes].sort((a, b) => b.year.localeCompare(a.year)).find((o) => o.medianSalary != null || o.employmentRate);
  const stat = [...d.admissionStats].sort((a, b) => b.year.localeCompare(a.year))[0];
  const ct = u.costs;

  const rows: [string, ReactNode][] = [
    ["Established", u.founded],
    ["Ownership", `${CONTROL_LABEL[u.control]} · ${u.category.replaceAll("-", " ")}`],
    ...(u.institutionType ? ([["Institution type", INSTITUTION_TYPE_LABEL[u.institutionType]]] as [string, ReactNode][]) : []),
    ...(u.affiliation.value || u.countryCode === "IN" ? ([["Affiliation", num(u.affiliation)]] as [string, ReactNode][]) : []),
    ...(u.accreditation.length
      ? ([[
          "Accreditation & approvals",
          <span key="acc" className="flex flex-wrap gap-x-4 gap-y-1">
            {u.accreditation.map((a) => (
              <Sourced key={`${a.body}${a.label}`} sourceId={a.sourceId} sources={S} confidence={a.confidence} asOf={a.asOf}>
                {a.body === "OTHER" ? a.label : a.body}{a.grade ? ` ${a.grade}` : ""}{a.cycle ? ` (${a.cycle})` : ""}{a.body !== "OTHER" && a.label ? ` — ${a.label}` : ""}
              </Sourced>
            ))}
          </span>,
        ]] as [string, ReactNode][])
      : []),
    ...(u.gender && u.gender !== "co-ed" ? ([["Campus", u.gender === "women" ? "Women's college" : "Men's college"]] as [string, ReactNode][]) : []),
    ...(u.minorityStatus.value ? ([["Minority status", num(u.minorityStatus)]] as [string, ReactNode][]) : []),
    ["Location", `${u.city}, ${u.region}, ${u.country}${u.campuses.length > 1 ? ` (${u.campuses.length} campuses)` : ""}`],
    ["Campus size", d.campusAreaAcres.value != null ? src(d.campusAreaAcres, `${d.campusAreaAcres.value.toLocaleString("en-US")} acres`) : num(d.campusAreaAcres)],
    ["Students", num(u.stats.totalStudents)],
    ["Undergraduates", num(u.stats.undergraduates)],
    ["International students", num(u.stats.internationalShare)],
    ["Faculty", num(d.faculty)],
    ["Student : faculty ratio", num(u.stats.studentFacultyRatio)],
    [
      "Rankings",
      latest.length ? (
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          {latest.map((r) => (
            <Sourced key={r.org + r.edition} sourceId={r.sourceId} sources={S}>
              {ORG_LABEL[r.org]} {r.edition}: <strong>#{r.rank}</strong>
            </Sourced>
          ))}
        </span>
      ) : (
        <span className="text-paper/50">None verified</span>
      ),
    ],
    [
      "Entrance tests",
      u.testing.length ? u.testing.map((t) => `${t.test} (${TEST_POLICY_LABEL[t.policy].toLowerCase()})`).join(", ") : <span className="text-paper/50">See each course</span>,
    ],
    ["Apply via", num(u.applicationPlatform)],
    ["Tuition, international", src(ct.internationalTuition, moneyRange(ct.internationalTuition.value, ct.currency))],
    ["Tuition, domestic", src(ct.domesticTuition, moneyRange(ct.domesticTuition.value, ct.currency))],
  ];
  const sel = selectivity(u);
  rows.push([
    "Selectivity",
    sel ? (
      <Sourced key="sel" sourceId={sel.sourceId} sources={S} asOf={sel.year}>
        {SELECTIVITY_LABEL[sel.band]} <span className="text-paper/55">({sel.reason})</span>
      </Sourced>
    ) : (
      <span className="text-paper/50">Not enough published data</span>
    ),
  ]);
  if (stat?.acceptanceRate)
    rows.push([
      "Acceptance rate",
      <Sourced key="ar" sourceId={stat.sourceId} sources={S} confidence={stat.confidence} asOf={stat.year} notes={stat.notes}>
        {stat.acceptanceRate} <span className="text-paper/55">({stat.scope})</span>
      </Sourced>,
    ]);
  if (outcome)
    rows.push([
      outcome.medianSalary != null ? "Median salary" : "Graduate outcomes",
      <Sourced key="oc" sourceId={outcome.sourceId} sources={S} confidence={outcome.confidence} asOf={outcome.year} notes={outcome.notes}>
        {outcome.medianSalary != null ? salary(outcome.medianSalary, outcome.currency) : outcome.employmentRate}{" "}
        <span className="text-paper/55">({outcome.cohort}, {outcome.year})</span>
      </Sourced>,
    ]);

  const oppGroups = Object.entries(Object.groupBy(u.opportunities, (o) => o.category));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-14">
        <Block title="About">
          <p className="measure text-[1.0625rem] leading-relaxed text-paper/80">{u.summary}</p>
        </Block>

        <Block title={`${u.name} highlights`} note="Tap any value to see its source, date and confidence.">
          <DataTable head={["Particular", "Details"]} rows={rows.map(([k, v]) => [k, v])} caption={`${u.name} highlights`} minWidth={480} />
        </Block>

        <Block title={`Courses on Edugate (${u.programs.length})`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {u.programs.slice(0, 6).map((p) => (
              <Link key={p.slug} href={`${base}/programs/${p.slug}`} className="glass glass-interactive block p-5">
                <p className="meta text-paper/50">
                  {FIELD_NAMES[p.field]} · {p.degree}
                  {p.durationYears ? ` · ${p.durationYears} yrs` : ""}
                </p>
                <p className="mt-1.5 font-display text-[1.125rem]">{p.name}</p>
                <p className="mt-2 line-clamp-3 text-[0.8125rem] text-paper/65">{p.summary}</p>
                <p className="mt-3 text-[0.8125rem] text-cyan">Requirements, curriculum & your gaps →</p>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[0.875rem]">
            <Link href={`${base}/courses`} className="text-cyan hover:underline">
              {u.programs.length > 6 ? `See all ${u.programs.length} courses` : "Compare courses, fees and eligibility"} →
            </Link>
          </p>
        </Block>

        {oppGroups.length > 0 && (
          <Block title="Opportunities">
            <div className="grid gap-6 sm:grid-cols-2">
              {oppGroups.map(([cat, list]) => (
                <div key={cat}>
                  <h3 className="meta mb-2 text-paper/50">{OPP_LABEL[cat] ?? cat}</h3>
                  <ul className="space-y-3">
                    {list!.map((o) => (
                      <li key={o.name} className="text-[0.9375rem]">
                        <Sourced sourceId={o.sourceId} sources={S}>
                          <strong>{o.name}</strong>
                        </Sourced>
                        <span className="block text-[0.8125rem] text-paper/65">{o.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Block>
        )}

        {d.alumni.length > 0 && (
          <Block title="Notable alumni">
            <ul className="grid gap-3 sm:grid-cols-2">
              {d.alumni.map((a) => (
                <li key={a.name} className="text-[0.9375rem]">
                  <Sourced sourceId={a.sourceId} sources={S}>
                    <strong>{a.name}</strong>
                  </Sourced>
                  <span className="block text-[0.8125rem] text-paper/65">{a.note}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        <ReportForm university={u.slug} />
      </div>

      <aside className="space-y-6">
        <FitPanel u={u} profile={profile} />
        <div className="glass p-5 text-[0.875rem]">
          <p className="meta text-paper/50">Jump to</p>
          <ul className="mt-3 space-y-2">
            <li><Link href={`${base}/admissions`} className="text-cyan hover:underline">How to apply, deadlines{d.cutoffs.length ? " & cutoffs" : ""} →</Link></li>
            <li><Link href={`${base}/fees`} className="text-cyan hover:underline">Fees, hostel & total cost →</Link></li>
            <li><Link href={`${base}/scholarships`} className="text-cyan hover:underline">Scholarships ({u.scholarships.length}) →</Link></li>
            <li><Link href={`${base}/placements`} className="text-cyan hover:underline">Placements & graduate outcomes →</Link></li>
            <li><Link href={`${base}/careers`} className="text-cyan hover:underline">Careers & higher study →</Link></li>
            <li><Link href={`${base}/student-life`} className="text-cyan hover:underline">Clubs, festivals & student life →</Link></li>
            <li><Link href={`${base}/compare`} className="text-cyan hover:underline">Compare with similar institutions →</Link></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
