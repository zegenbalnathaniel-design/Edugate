import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/explore/Crumbs";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { HOME_HUB, INSTITUTION_TYPE_LABEL, INSTITUTION_TYPE_ORDER, slugify, stateLabel } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";
import { geoFacets, universitiesWhere } from "@/lib/unis/repo";
import { normalizeDegree, programSubjects, SUBJECT_BY_KEY } from "@/lib/unis/taxonomy";

async function resolve(stateSlug: string, citySlug: string) {
  const f = (await geoFacets()).find((x) => x.countryCode === "IN" && slugify(x.region) === stateSlug && slugify(x.hub) === citySlug);
  return f ?? null;
}

export async function generateMetadata({ params }: PageProps<"/explore/india/[state]/[city]">): Promise<Metadata> {
  const { state, city } = await params;
  const f = await resolve(state, city);
  return f ? { title: `Colleges in ${f.hub}`, description: `Universities and colleges in ${f.hub}, ${f.region}: courses, fees, admissions and scholarships.` } : { title: "City" };
}

const chip = (on: boolean) =>
  `inline-flex items-center rounded-full border px-3 py-1 text-[0.8125rem] ${on ? "border-electric bg-electric/15 text-paper" : "border-paper/20 hover:border-paper/60"}`;

export default async function CityPage({ params, searchParams }: PageProps<"/explore/india/[state]/[city]">) {
  const { state, city } = await params;
  const sp = await searchParams;
  const f = await resolve(state, city);
  if (!f) notFound();
  const all = await universitiesWhere({ countryCodes: ["IN"], region: f.region, hub: f.hub });
  const type = typeof sp.type === "string" ? sp.type : "";
  const degree = typeof sp.degree === "string" ? sp.degree : "";
  const women = sp.gender === "women";
  const rows = all.filter(
    (u) =>
      (!type || u.institutionType === type) &&
      (!degree || u.data.programs.some((p) => normalizeDegree(p.degree, p.level) === degree)) &&
      (!women || u.data.gender === "women"),
  );

  const types = INSTITUTION_TYPE_ORDER.filter((t) => all.some((u) => u.institutionType === t));
  const untyped = rows.filter((u) => !u.institutionType);
  const degrees = [...new Set(all.flatMap((u) => u.data.programs.map((p) => normalizeDegree(p.degree, p.level))))].filter((d) => d !== "Other").sort();
  const subjectCount = new Map<string, number>();
  for (const u of all) for (const p of u.data.programs) for (const s of programSubjects(p)) subjectCount.set(s, (subjectCount.get(s) ?? 0) + 1);
  const topSubjects = [...subjectCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18);
  const programmes = all.reduce((a, u) => a + u.data.programs.length, 0);
  const hrefWith = (k: string, v: string) => {
    const p = new URLSearchParams({ ...(type && { type }), ...(degree && { degree }), ...(women && { gender: "women" }) });
    if (v) p.set(k, v);
    else p.delete(k);
    const q = p.toString();
    return `${explorePath.city(f.region, f.hub)}${q ? `?${q}` : ""}`;
  };
  const home = f.hub === HOME_HUB.city;

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <Crumbs
          items={[
            { label: "Explore", href: explorePath.root },
            { label: "India", href: explorePath.india },
            { label: stateLabel(f.region), href: explorePath.state(f.region) },
            { label: f.hub },
          ]}
        />
        <SectionLabel index={home ? "01" : "02"} className="mt-6">{f.hub}</SectionLabel>
        <h1 className="display-m mt-3">Colleges in {f.hub}</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          {all.length} institution{all.length === 1 ? "" : "s"} and {programmes} programmes verified on Edugate so far
          {home ? " — Chennai is where Edugate goes deepest first" : ""}. Institutions are grouped by type: universities, deemed universities, autonomous and affiliated colleges, and specialist institutes.
        </p>

        <section aria-labelledby="city-courses" className="mt-8">
          <h2 id="city-courses" className="meta text-paper/50">Find a course in {f.hub}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {topSubjects.map(([k, n]) => (
              <li key={k}>
                <Link href={`/courses/${k}?city=${encodeURIComponent(f.hub)}`} className={chip(false)}>
                  {SUBJECT_BY_KEY[k as keyof typeof SUBJECT_BY_KEY]?.label ?? k} <span className="ml-1 text-paper/45">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 space-y-3" role="group" aria-label="Filter institutions">
          <div className="flex flex-wrap items-center gap-2">
            <span className="meta mr-1 text-paper/45">Type</span>
            <Link href={hrefWith("type", "")} className={chip(!type)}>All</Link>
            {types.map((t) => <Link key={t} href={hrefWith("type", t)} className={chip(type === t)}>{INSTITUTION_TYPE_LABEL[t]}</Link>)}
          </div>
          {degrees.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="meta mr-1 text-paper/45">Degree</span>
              <Link href={hrefWith("degree", "")} className={chip(!degree)}>Any</Link>
              {degrees.map((d) => <Link key={d} href={hrefWith("degree", d)} className={chip(degree === d)}>{d}</Link>)}
            </div>
          )}
          {all.some((u) => u.data.gender === "women") && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="meta mr-1 text-paper/45">Campus</span>
              <Link href={hrefWith("gender", "")} className={chip(!women)}>All</Link>
              <Link href={hrefWith("gender", "women")} className={chip(women)}>Women&apos;s colleges</Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-[0.875rem]" aria-live="polite"><strong>{rows.length}</strong> of {all.length} shown</p>
        {[...types, ...(untyped.length ? ["__none"] : [])].map((t) => {
          const list = t === "__none" ? untyped : rows.filter((u) => u.institutionType === t);
          if (!list.length) return null;
          return (
            <section key={t} className="mt-10" aria-labelledby={`t-${t}`}>
              <h2 id={`t-${t}`} className="font-display text-[1.375rem]">
                {t === "__none" ? "Other institutions" : INSTITUTION_TYPE_LABEL[t]} <span className="text-paper/45">({list.length})</span>
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((u) => <UniversityCard key={u.slug} row={u} />)}
              </div>
            </section>
          );
        })}
        {rows.length === 0 && (
          <p className="mt-8 rounded-[var(--radius-md)] border border-paper/10 px-4 py-3 text-[0.9375rem] text-paper/60">
            No institution here matches those filters yet. <Link href={explorePath.city(f.region, f.hub)} className="text-cyan">Clear filters</Link>
          </p>
        )}
      </Container>
    </Section>
  );
}
