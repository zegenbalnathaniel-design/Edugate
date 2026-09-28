import type { Metadata } from "next";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";
import { InstitutionCard } from "@/components/education/InstitutionCard";
import { institutionRepo } from "@/lib/data/repositories/institutions";
import type { FieldKey } from "@/lib/data/types";
import { FIELD_LABELS } from "@/lib/data/types";

export const metadata: Metadata = { title: "Discover" };

/**
 * Tier B (docs/00-decisions.md → D1): real filtering, real results, no
 * stubs. Filters are a GET form, not client state — the page works with
 * JavaScript disabled (docs/01-architecture.md → Rendering strategy).
 */
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; country?: string; field?: string }>;
}) {
  const params = await searchParams;
  const field = params.field as FieldKey | undefined;

  const [{ items }, { items: allInstitutions }] = await Promise.all([
    institutionRepo.list({ search: params.search, country: params.country, field }),
    institutionRepo.list({}),
  ]);

  const countries = Array.from(new Set(allInstitutions.map((i) => i.location.country))).sort();

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">Discover</SectionLabel>
        <h1 className="display-m mt-3 mb-10">Institutions</h1>

        <form className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-4" method="get">
          <input
            type="search"
            name="search"
            defaultValue={params.search}
            placeholder="Search by name"
            className="rounded-sm border border-current/20 bg-transparent px-3 py-2.5 text-[0.9375rem] sm:col-span-2"
          />
          <select
            name="country"
            defaultValue={params.country ?? ""}
            className="rounded-sm border border-current/20 bg-transparent px-3 py-2.5 text-[0.9375rem]"
          >
            <option value="" className="bg-navy-900">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c} className="bg-navy-900">{c}</option>
            ))}
          </select>
          <select
            name="field"
            defaultValue={params.field ?? ""}
            className="rounded-sm border border-current/20 bg-transparent px-3 py-2.5 text-[0.9375rem]"
          >
            <option value="" className="bg-navy-900">All fields</option>
            {(Object.entries(FIELD_LABELS) as [FieldKey, string][]).map(([key, label]) => (
              <option key={key} value={key} className="bg-navy-900">{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-sm border border-cyan/40 bg-cyan/10 px-4 py-2.5 text-[0.875rem] text-cyan sm:col-span-4 sm:w-fit"
          >
            Filter
          </button>
        </form>

        {items.length === 0 ? (
          <div className="rounded-md border border-current/12 p-8 text-center">
            <p className="mb-4 text-[0.9375rem] text-current/70">
              No institutions match those filters.
            </p>
            <a href="/discover" className="link-underline text-cyan-deep">Clear filters</a>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((inst) => (
              <InstitutionCard key={inst.id} institution={inst} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
