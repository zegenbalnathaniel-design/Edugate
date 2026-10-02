import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { getCurrentUser } from "@/lib/auth/session";
import { fitDimensions, type FitDimension } from "@/lib/unis/fit";
import { allUniversities, type UniversityRow } from "@/lib/unis/repo";
import { getProfile } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Your university discovery" };

type Scored = { row: UniversityRow; dims: Record<string, FitDimension> };

const why = (s: Scored, keys: string[]) =>
  keys.flatMap((k) => {
    const d = s.dims[k];
    if (!d || (d.state !== "aligned" && d.state !== "partial")) return [];
    const first = d.reasons.find((r) => !r.startsWith("For ")) ?? d.reasons[0];
    return [`${d.state === "aligned" ? "✓" : "◐"} ${d.label}: ${first.replace(/^[✓✗○] /, "")}`];
  }).slice(0, 3);

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Section register="deep" className="min-h-screen pt-32 pb-24">
        <Container width="narrow">
          <SectionLabel index="01">Discover</SectionLabel>
          <h1 className="display-m mt-3 mb-4">Find the university that fits you.</h1>
          <p className="measure text-[1.0625rem] text-paper/75">
            Explore universities by what you actually care about — academics, curriculum, cost, scholarships, opportunities, location —
            and see exactly why each one appears.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?next=/profile" className="inline-flex h-11 items-center rounded-full bg-electric px-6 font-semibold text-[var(--on-electric)]">Build my profile</Link>
            <Link href="/universities" className="inline-flex h-11 items-center rounded-full border border-paper/25 px-6">Explore universities</Link>
            <Link href="/universities?q=" className="inline-flex h-11 items-center rounded-full border border-paper/25 px-6">Search universities</Link>
          </div>
        </Container>
      </Section>
    );
  }

  const profile = await getProfile(user.id);
  const empty = !profile.fields.length && !profile.curriculum && !profile.countries.length && profile.budgetUsdPerYear == null;
  const rows = await allUniversities();
  const scored: Scored[] = rows.map((row) => ({ row, dims: Object.fromEntries(fitDimensions(row.data, profile).map((d) => [d.key, d])) }));
  const ok = (s: Scored, k: string) => s.dims[k]?.state === "aligned";
  const notBad = (s: Scored, k: string) => s.dims[k]?.state !== "misaligned";
  const inField = scored.filter((s) => profile.fields.length === 0 || ok(s, "program"));

  const groups: { title: string; blurb: string; items: Scored[]; keys: string[] }[] = [
    { title: "Strong academic alignment", blurb: "Offers your field, and your curriculum and subjects meet the published requirements we could check.", items: inField.filter((s) => ok(s, "curriculum") && notBad(s, "testing")), keys: ["program", "curriculum", "testing"] },
    { title: "Financially relevant", blurb: "Published international tuition is within (or close to) your yearly budget.", items: inField.filter((s) => s.dims.cost.state === "aligned" || s.dims.cost.state === "partial"), keys: ["cost", "program", "location"] },
    { title: "Research opportunities", blurb: "Documented undergraduate research programmes in a university offering your field.", items: inField.filter((s) => ok(s, "research")), keys: ["research", "program"] },
    { title: "Entrepreneurship", blurb: "Documented incubators, accelerators or founder programmes.", items: inField.filter((s) => ok(s, "entrepreneurship")), keys: ["entrepreneurship", "program"] },
    { title: "Something unexpected", blurb: "Outside your preferred countries, but offers your field without a known academic mismatch — worth a look.", items: profile.countries.length ? inField.filter((s) => s.dims.location.state === "misaligned" && notBad(s, "curriculum")) : [], keys: ["program", "curriculum", "cost"] },
  ];

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Your university discovery</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Based on your profile</h1>
        <p className="measure text-[0.9375rem] text-paper/65">
          Groups are built from transparent fit checks — open any university to see every dimension and its source. Edugate doesn&apos;t
          label universities “safety”, “target” or “reach”: there&apos;s no validated method behind those labels.
        </p>
        {empty && (
          <p className="mt-6 rounded-[var(--radius-md)] border border-pending/50 bg-pending/10 p-4 text-[0.9375rem]">
            ⚠ Your profile is empty, so nothing can be matched yet. <Link href="/profile" className="text-cyan underline">Add your fields, curriculum and budget →</Link>
          </p>
        )}
        {groups.map((g) => (
          <section key={g.title} className="mt-14">
            <h2 className="font-display text-[1.5rem]">{g.title} <span className="text-paper/45">({g.items.length})</span></h2>
            <p className="mt-1 mb-5 text-[0.875rem] text-paper/60">{g.blurb}</p>
            {g.items.length === 0 ? (
              <p className="text-[0.875rem] text-paper/50">Nothing here yet for your profile.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {g.items.slice(0, 6).map((s) => <UniversityCard key={s.row.slug} row={s.row} why={why(s, g.keys)} />)}
              </div>
            )}
          </section>
        ))}
      </Container>
    </Section>
  );
}
