import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { UniversityCard } from "@/components/unis/UniversityCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { savedSearches } from "@/lib/db/schema";
import { CURRICULA, CURRICULUM_LABELS } from "@/lib/profile/schema";
import { activeFilterCount, BASIS_LABEL, COST_BANDS, FIELD_NAMES, filtersToQuery, parseFilters, QS_BANDS, SORTS } from "@/lib/unis/filters";
import { INSTITUTION_TYPE_LABEL, sortStates, stateLabel, TIER_LABEL, TIERS } from "@/lib/unis/geo";
import { countryFacets, geoFacets, latestQsEdition, searchUniversities } from "@/lib/unis/repo";
import { SELECTIVITY, SELECTIVITY_LABEL } from "@/lib/unis/selectivity";
import { DEGREES, TESTS } from "@/lib/unis/taxonomy";

function Checks({ legend, name, options, selected }: { legend: string; name: string; options: [string, string][]; selected: string[] }) {
  return (
    <fieldset className="grid gap-1.5">
      <legend className="meta mb-1.5 text-paper/55">{legend}</legend>
      <div className="grid max-h-40 gap-1 overflow-y-auto pr-1">
        {options.map(([v, l]) => (
          <label key={v} className="flex items-center gap-2 text-[0.875rem]">
            <input type="checkbox" name={name} value={v} defaultChecked={selected.includes(v)} className="accent-[var(--color-electric)]" /> {l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
import { deleteSearch, saveSearch } from "@/lib/user/actions";

export const metadata: Metadata = { title: "Universities" };

const box = "rounded-[var(--radius-md)] border border-current/20 bg-navy-800 px-3 py-2 text-[0.875rem]";

export default async function UniversitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const [{ rows, total, unknownFeesHidden }, countries, qsEdition, user, geo] = await Promise.all([
    searchUniversities(f),
    countryFacets(),
    latestQsEdition(),
    getCurrentUser(),
    geoFacets(),
  ]);
  const inStates = sortStates([...new Set(geo.filter((g) => g.countryCode === "IN").map((g) => g.region))].map((name) => ({ name })));
  const inCities = [...new Set(geo.filter((g) => g.countryCode === "IN").map((g) => g.hub))].sort();
  const saved = user ? await (await getDb()).select().from(savedSearches).where(eq(savedSearches.userId, user.id)).orderBy(desc(savedSearches.createdAt)) : [];
  const query = filtersToQuery(f);
  const nActive = activeFilterCount(f);

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Universities</SectionLabel>
        <h1 className="display-m mt-3">What are you looking for?</h1>
        <p className="measure mt-3 text-[0.9375rem] text-paper/65">
          {total} universities across {countries.length} countries, every fact linked to its source. Start with a field and a
          curriculum — open the advanced filters when you need them.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[19rem_1fr]">
          <aside>
            <form method="get" className="glass sticky top-24 space-y-5 p-5" aria-label="Filter universities">
              <label className="grid gap-1.5">
                <span className="meta text-paper/55">Search</span>
                <input name="q" defaultValue={f.q} placeholder="University, city or program" className={box} />
              </label>
              <fieldset className="grid gap-1.5">
                <legend className="meta mb-1.5 text-paper/55">Field of study</legend>
                <div className="grid max-h-44 gap-1 overflow-y-auto pr-1">
                  {Object.entries(FIELD_NAMES).map(([k, v]) => (
                    <label key={k} className="flex items-center gap-2 text-[0.875rem]">
                      <input type="checkbox" name="field" value={k} defaultChecked={f.fields.includes(k)} className="accent-[var(--color-electric)]" /> {v}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Checks legend="Where" name="tier" options={TIERS.map((t) => [t, TIER_LABEL[t]])} selected={f.tiers} />
              <Checks legend="Indian state" name="state" options={inStates.map((x) => [x.name, stateLabel(x.name)])} selected={f.states} />
              <Checks legend="City" name="city" options={inCities.map((c) => [c, c])} selected={f.hubs} />
              <fieldset className="grid gap-1.5">
                <legend className="meta mb-1.5 text-paper/55">Country</legend>
                <div className="grid max-h-40 gap-1 overflow-y-auto pr-1">
                  {countries.map((c) => (
                    <label key={c.code} className="flex items-center gap-2 text-[0.875rem]">
                      <input type="checkbox" name="country" value={c.code} defaultChecked={f.countries.includes(c.code)} className="accent-[var(--color-electric)]" />
                      {c.name} <span className="text-paper/40">({c.count})</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-1.5">
                <span className="meta text-paper/55">Your curriculum</span>
                <select name="curriculum" defaultValue={f.curricula[0] ?? ""} className={box}>
                  <option value="">Any</option>
                  {CURRICULA.map((c) => <option key={c} value={c}>{CURRICULUM_LABELS[c]}</option>)}
                </select>
              </label>
              <Checks legend="Yearly fee (₹)" name="cost" options={Object.entries(COST_BANDS).map(([k, v]) => [k, v.label])} selected={f.costBands} />
              <details open={Boolean(f.qs.length || f.sat || f.maxUsd || f.control.length || f.sort !== "qs" || f.degrees.length || f.bases.length || f.tests.length || f.selectivity.length || f.types.length)} className="space-y-4">
                <summary className="cursor-pointer text-[0.875rem] text-cyan">Advanced filters</summary>
                <div className="mt-3 space-y-4">
                  <Checks legend="Degree" name="degree" options={DEGREES.filter((d) => d !== "Other").map((d) => [d, d])} selected={f.degrees} />
                  <Checks legend="How you get in" name="basis" options={Object.entries(BASIS_LABEL)} selected={f.bases} />
                  <Checks legend="Entrance test" name="test" options={TESTS.map((t) => [t.key, t.label])} selected={f.tests} />
                  <Checks legend="Selectivity (published evidence)" name="sel" options={SELECTIVITY.map((x) => [x, SELECTIVITY_LABEL[x]])} selected={f.selectivity} />
                  <Checks legend="Institution type" name="type" options={Object.entries(INSTITUTION_TYPE_LABEL)} selected={f.types} />
                </div>
                <fieldset className="mt-3 grid gap-1">
                  <legend className="meta mb-1.5 text-paper/55">QS World University Rankings{qsEdition ? ` ${qsEdition}` : ""}</legend>
                  {Object.keys(QS_BANDS).map((b) => (
                    <label key={b} className="flex items-center gap-2 text-[0.875rem]">
                      <input type="checkbox" name="qs" value={b} defaultChecked={f.qs.includes(b as never)} className="accent-[var(--color-electric)]" /> {b}
                    </label>
                  ))}
                </fieldset>
                <label className="mt-3 grid gap-1.5">
                  <span className="meta text-paper/55">SAT</span>
                  <select name="sat" defaultValue={f.sat} className={box}>
                    <option value="">Any policy</option>
                    <option value="not-required">Not required (published)</option>
                    <option value="required">Required</option>
                  </select>
                </label>
                <label className="mt-3 grid gap-1.5">
                  <span className="meta text-paper/55">Max international tuition (US$/yr, approx.)</span>
                  <input name="maxUsd" type="number" min={0} step={1000} defaultValue={f.maxUsd ?? ""} placeholder="e.g. 40000" className={box} />
                </label>
                <fieldset className="mt-3 grid gap-1">
                  <legend className="meta mb-1.5 text-paper/55">Type</legend>
                  {["public", "government-aided", "private", "public-private"].map((c) => (
                    <label key={c} className="flex items-center gap-2 text-[0.875rem] capitalize">
                      <input type="checkbox" name="control" value={c} defaultChecked={f.control.includes(c)} className="accent-[var(--color-electric)]" /> {c.replace("-", "–")}
                    </label>
                  ))}
                </fieldset>
                <label className="mt-3 grid gap-1.5">
                  <span className="meta text-paper/55">Sort by</span>
                  <select name="sort" defaultValue={f.sort} className={box}>
                    {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </details>
              <div className="flex gap-2 pt-1">
                <button className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-electric text-[0.875rem] font-semibold text-[var(--on-electric)]">Apply</button>
                {nActive > 0 && <Link href="/universities" className="inline-flex h-10 items-center rounded-full border border-paper/25 px-4 text-[0.875rem]">Clear</Link>}
              </div>
              <p className="text-[0.75rem] text-paper/45">Values in one filter match any; different filters must all match.</p>
            </form>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.9375rem]" aria-live="polite">
                <strong>{rows.length}</strong> of {total} universities{nActive > 0 && ` match ${nActive} filter${nActive > 1 ? "s" : ""}`}
                {unknownFeesHidden > 0 && <span className="text-paper/55"> · {unknownFeesHidden} hidden because their international tuition isn&apos;t verified</span>}
              </p>
              {nActive > 0 && (
                <form action={saveSearch} className="flex gap-2">
                  <input type="hidden" name="query" value={query} />
                  <input name="name" placeholder="Name this search" maxLength={80} className={`${box} w-40`} aria-label="Search name" />
                  <button className="rounded-full border border-paper/25 px-3 text-[0.8125rem] hover:border-paper/60">Save</button>
                </form>
              )}
            </div>
            {saved.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {saved.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-paper/20 py-1 pl-3 pr-1 text-[0.8125rem]">
                    <Link href={`/universities?${s.query}`} className="hover:text-cyan">{s.name}</Link>
                    <form action={deleteSearch}><input type="hidden" name="id" value={s.id} /><button aria-label={`Delete ${s.name}`} className="rounded-full px-1.5 text-paper/50 hover:text-paper">×</button></form>
                  </span>
                ))}
              </div>
            )}
            {rows.length === 0 ? (
              <div className="glass p-8 text-center">
                <p className="text-[1rem]">No universities match all of those filters.</p>
                <p className="mt-2 text-[0.875rem] text-paper/60">
                  That&apos;s a real answer, not an error — remove the most restrictive filter first. The dataset is still growing, so
                  &ldquo;no match&rdquo; can also mean &ldquo;not on Edugate yet&rdquo;.
                </p>
                <Link href="/universities" className="mt-4 inline-block text-cyan">Clear all filters</Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((r) => <UniversityCard key={r.slug} row={r} />)}
              </div>
            )}
            <p className="mt-10 text-[0.8125rem] text-paper/50">
              Demo dataset of {total} universities — verify all admissions information with the university before applying. Browse
              by <Link href="/universities/countries" className="link-underline text-cyan">country</Link> or see{" "}
              <Link href="/scholarships" className="link-underline text-cyan">scholarships</Link>.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
