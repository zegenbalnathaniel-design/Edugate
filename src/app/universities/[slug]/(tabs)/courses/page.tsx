import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, DataTable, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { CURRICULUM_LABELS } from "@/lib/profile/schema";
import { FIELD_NAMES } from "@/lib/unis/filters";
import { moneyRange, TEST_POLICY_LABEL, usdApprox } from "@/lib/unis/format";
import { getUniversity } from "@/lib/unis/repo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} courses & fees` : "Courses & fees" };
}

export default async function CoursesPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const ct = u.costs;
  const fees = u.details.feeBreakdown;

  return (
    <div className="space-y-14">
      <Block
        title={`Courses & fees (${u.programs.length})`}
        note="The courses Edugate has verified in detail. The university offers more — see its official course list."
      >
        <DataTable
          caption="Courses, fees and eligibility"
          minWidth={820}
          head={["Course", "Degree · duration", "Tuition", "Eligibility published for", "Tests"]}
          rows={u.programs.map((p) => {
            const fee = p.fees ?? ct.internationalTuition;
            return [
              <Link key="n" href={`/universities/${u.slug}/programs/${p.slug}`} className="hover:text-cyan">
                {p.name}
                <span className="block text-[0.75rem] font-normal text-paper/50">{FIELD_NAMES[p.field]}{p.school ? ` · ${p.school}` : ""}</span>
              </Link>,
              `${p.degree}${p.durationYears ? ` · ${p.durationYears} yrs` : ""}`,
              <Sourced key="f" sourceId={fee.sourceId} sources={S} confidence={fee.confidence} asOf={fee.asOf} notes={fee.notes}>
                {moneyRange(fee.value, ct.currency)}
                <span className="block text-[0.75rem] text-paper/50">{p.fees ? "Course-specific" : "International, university-wide"}</span>
              </Sourced>,
              p.requirements.filter((r) => r.accepted !== false).map((r) => CURRICULUM_LABELS[r.curriculum]).join(", ") || <span className="text-paper/50">See course page</span>,
              p.tests.length ? p.tests.map((t) => `${t.test}: ${TEST_POLICY_LABEL[t.policy].toLowerCase()}`).join("; ") : <span className="text-paper/50">—</span>,
            ];
          })}
        />
      </Block>

      <Block title="Tuition & living costs" note="Before scholarships or aid. Amounts in the university's own currency, with a dated approximate US$ conversion.">
        <dl className="grid gap-5 sm:grid-cols-3">
          {(
            [
              ["International tuition", ct.internationalTuition],
              ["Domestic tuition", ct.domesticTuition],
              ["Living estimate", ct.livingEstimate],
            ] as const
          ).map(([label, v]) => (
            <div key={label} className="glass p-4">
              <dt className="meta text-paper/50">{label}</dt>
              <dd className="mt-1 tabular">
                <Sourced sourceId={v.sourceId} sources={S} confidence={v.confidence} asOf={v.asOf} notes={v.notes}>
                  {moneyRange(v.value, ct.currency)}
                </Sourced>
                {v.value && usdApprox(v.value, ct.currency) && <span className="block text-[0.75rem] text-paper/45">{usdApprox(v.value, ct.currency)}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="Fee breakdown" note="Itemised as the university publishes it.">
        {fees.length === 0 ? (
          <NotYet>No itemised fee schedule verified yet. The tuition figures above are the verified totals; check the official fee page for hostel, mess and other charges.</NotYet>
        ) : (
          <DataTable
            caption="Fee breakdown"
            head={["Item", "Applies to", "Amount", "Approx. US$"]}
            rows={fees.map((f) => [
              f.item,
              f.audience === "all" ? "All students" : f.audience === "domestic" ? "Domestic" : "International",
              <Sourced key="a" sourceId={f.sourceId} sources={S} confidence={f.confidence} asOf={f.asOf} notes={f.notes}>
                {moneyRange(f.amount, f.currency)}
              </Sourced>,
              <span key="u" className="text-paper/55">{usdApprox(f.amount, f.currency) ?? "—"}</span>,
            ])}
          />
        )}
      </Block>
    </div>
  );
}
