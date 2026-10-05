import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/primitives/Section";
import { Crumbs } from "@/components/explore/Crumbs";
import { Sourced, TrustBar } from "@/components/unis/Sourced";
import { TrackButton } from "@/components/unis/TrackButton";
import { UniTabs } from "@/components/unis/UniTabs";
import { getCurrentUser } from "@/lib/auth/session";
import { CONTROL_LABEL, qsLabel } from "@/lib/unis/format";
import { freshnessFlags } from "@/lib/unis/freshness";
import { INSTITUTION_TYPE_LABEL } from "@/lib/unis/geo";
import { placeCrumbs } from "@/lib/unis/paths";
import { getUniversity, latestQsEdition } from "@/lib/unis/repo";
import { trackedSlugs } from "@/lib/user/repo";

/*
 * Shared frame for an institution profile: place in the Explore hierarchy,
 * identity, trust bar and section tabs (Overview, Courses, Admissions, Fees,
 * Scholarships, Placements, Campus, Student Life, Careers, Rankings, Compare).
 * Each tab is its own route, so students can link straight to
 * "Loyola College fees" or "IIT Bombay placements".
 */

/** Initials badge — shown until a logo with a reuse licence is sourced (we never hotlink trademarks). */
function Monogram({ name, logo }: { name: string; logo: { url: string; alt: string } | null }) {
  if (logo) return <img src={logo.url} alt={logo.alt} className="size-16 shrink-0 rounded-2xl bg-paper object-contain p-1.5" />;
  const initials = name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w) && !["Of", "The", "And", "For"].includes(w))
    .slice(0, 3)
    .map((w) => w[0])
    .join("");
  return (
    <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-paper/20 bg-navy-800 font-display text-[1.375rem] text-electric">
      {initials}
    </span>
  );
}
export default async function UniversityLayout({ children, params }: LayoutProps<"/universities/[slug]">) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const [user, latestQs] = await Promise.all([getCurrentUser(), latestQsEdition()]);
  const tracked = user ? await trackedSlugs(user.id) : new Set<string>();
  const qs = qsLabel(u);
  const flags = freshnessFlags(u, latestQs);
  const d = u.details;
  const base = `/universities/${u.slug}`;

  const ct = u.costs;
  const hasFees = !!(ct.domesticTuition.value || ct.internationalTuition.value || ct.livingEstimate.value || d.feeBreakdown.length || u.programs.some((p) => p.fees?.value || p.feeBreakdown.length));
  const hasLife = d.studentLife.length > 0 || u.opportunities.some((o) => ["student-life", "international", "exchange"].includes(o.category));
  const hasCareers =
    d.alumni.length > 0 ||
    u.programs.some((p) => (p.careers && (p.careers.paths.length || p.careers.higherStudy.length)) || p.opportunities.some((o) => ["internships", "industry", "research"].includes(o.category))) ||
    u.opportunities.some((o) => ["careers", "internships", "industry", "entrepreneurship", "networking"].includes(o.category));
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/courses`, label: "Courses", count: u.programs.length },
    { href: `${base}/admissions`, label: "Admissions" },
    { href: `${base}/fees`, label: "Fees", show: hasFees },
    { href: `${base}/scholarships`, label: "Scholarships", count: u.scholarships.length, show: u.scholarships.length > 0 },
    { href: `${base}/placements`, label: "Placements" },
    { href: `${base}/campus`, label: "Campus" },
    { href: `${base}/student-life`, label: "Student Life", show: hasLife },
    { href: `${base}/careers`, label: "Careers", show: hasCareers },
    { href: `${base}/rankings`, label: "Rankings", count: u.rankings.length, show: u.rankings.length > 0 },
    { href: `${base}/compare`, label: "Compare" },
  ]
    // Tabs with nothing verified to show are left out rather than opened onto an empty page.
    .filter((t) => t.show !== false)
    .map(({ show: _show, ...t }) => t);
  const naac = u.accreditation.find((a) => a.body === "NAAC" && a.grade);
  const nirf = u.rankings.filter((r) => r.org === "NIRF" && !/subject/i.test(r.category)).sort((a, b) => b.edition - a.edition)[0];

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <Crumbs items={[...placeCrumbs({ ...u, hub: u.hub }), { label: u.name }]} />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="flex max-w-4xl gap-5">
            <Monogram name={u.name} logo={u.media.logo} />
            <div>
            <h1 className="display-m">{u.name}</h1>
            {u.officialName !== u.name && <p className="mt-1 text-[0.875rem] text-paper/55">{u.officialName}</p>}
            <p className="mt-3 text-[0.9375rem] text-paper/70">
              {u.locality ? `${u.locality}, ` : ""}{u.city}{u.countryCode === "IN" ? `, ${u.region}` : `, ${u.country}`} · {u.institutionType ? INSTITUTION_TYPE_LABEL[u.institutionType] : <span className="capitalize">{u.category.replaceAll("-", " ")}</span>} · {CONTROL_LABEL[u.control]} · Est. {u.founded}
              {u.affiliation.value && (
                <> · <Sourced sourceId={u.affiliation.sourceId} sources={S} confidence={u.affiliation.confidence} asOf={u.affiliation.asOf}>Affiliated to {u.affiliation.value}</Sourced></>
              )}
              {naac && (
                <> · <Sourced sourceId={naac.sourceId} sources={S} confidence={naac.confidence} asOf={naac.asOf}><strong className="text-electric">NAAC {naac.grade}</strong></Sourced></>
              )}
              {nirf && (
                <> · <Sourced sourceId={nirf.sourceId} sources={S}><strong className="text-electric">NIRF {nirf.edition} {nirf.category}: #{nirf.rank}</strong></Sourced></>
              )}
              {qs && (
                <>
                  {" "}·{" "}
                  <Sourced sourceId={qs.ranking.sourceId} sources={S} confidence={qs.ranking.sourceId ? "official" : "requires-verification"}>
                    <strong className="text-electric">{qs.text}</strong>
                  </Sourced>
                </>
              )}
              {d.campusAreaAcres.value != null && <> · {d.campusAreaAcres.value.toLocaleString("en-US")}-acre campus</>}
              {u.gender === "women" && <> · Women&apos;s college</>}
            </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackButton university={u.slug} back={base} tracked={tracked.has(`${u.slug}/`)} />
            <Link href={`/compare?u=${u.slug}`} className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">
              Compare
            </Link>
            <a href={u.website} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem] hover:border-paper/60">
              Official site ↗
            </a>
          </div>
        </div>

        <TrustBar lastVerified={u.lastVerified} sources={S} />
        {flags.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-[var(--radius-md)] border border-pending/40 bg-pending/10 p-4 text-[0.875rem]">
            {flags.map((fl) => (
              <li key={fl.kind}>⚠ {fl.message}</li>
            ))}
          </ul>
        )}

        <UniTabs tabs={tabs} />
        <div className="pt-10">{children}</div>
      </Container>
    </Section>
  );
}
