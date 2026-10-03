import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/primitives/Section";
import { Sourced, TrustBar } from "@/components/unis/Sourced";
import { TrackButton } from "@/components/unis/TrackButton";
import { UniTabs } from "@/components/unis/UniTabs";
import { getCurrentUser } from "@/lib/auth/session";
import { CONTROL_LABEL, qsLabel } from "@/lib/unis/format";
import { freshnessFlags } from "@/lib/unis/freshness";
import { getUniversity, latestQsEdition } from "@/lib/unis/repo";
import { trackedSlugs } from "@/lib/user/repo";

/*
 * Shared frame for a university profile: identity, trust bar and section
 * tabs (Overview, Courses & Fees, Admissions, Placements, Rankings,
 * Scholarships, Campus). Each tab is its own route, so students can link
 * straight to "IIT Bombay placements".
 */
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

  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/courses`, label: "Courses & Fees", count: u.programs.length },
    { href: `${base}/admissions`, label: "Admissions" },
    { href: `${base}/placements`, label: "Placements & Outcomes" },
    { href: `${base}/rankings`, label: "Rankings", count: u.rankings.length },
    { href: `${base}/scholarships`, label: "Scholarships", count: u.scholarships.length },
    { href: `${base}/campus`, label: "Campus" },
  ];

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <nav aria-label="Breadcrumb" className="meta text-paper/50">
          <Link href="/universities" className="hover:text-paper">Universities</Link> ›{" "}
          <Link href={`/universities/countries/${u.countryCode}`} className="hover:text-paper">{u.country}</Link> › {u.region}
        </nav>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="display-m">{u.name}</h1>
            {u.officialName !== u.name && <p className="mt-1 text-[0.875rem] text-paper/55">{u.officialName}</p>}
            <p className="mt-3 text-[0.9375rem] text-paper/70">
              {u.city}, {u.country} · {CONTROL_LABEL[u.control]} · <span className="capitalize">{u.category.replaceAll("-", " ")}</span> · Est. {u.founded}
              {qs && (
                <>
                  {" "}·{" "}
                  <Sourced sourceId={qs.ranking.sourceId} sources={S} confidence={qs.ranking.sourceId ? "official" : "requires-verification"}>
                    <strong className="text-electric">{qs.text}</strong>
                  </Sourced>
                </>
              )}
              {d.campusAreaAcres.value != null && <> · {d.campusAreaAcres.value.toLocaleString("en-US")}-acre campus</>}
            </p>
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
