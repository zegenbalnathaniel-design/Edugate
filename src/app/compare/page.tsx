import type { Metadata } from "next";
import Link from "next/link";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";
import { institutionRepo } from "@/lib/data/repositories/institutions";

export const metadata: Metadata = { title: "Compare" };

/**
 * Tier B. Real institutions, side by side, via `InstitutionRepo.compare()`.
 * No ranking score anywhere here — D3 forbids a payment-derived rank, and
 * this page doesn't rank at all, it just lays facts side by side.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const selected = ids ? ids.split(",").filter(Boolean) : [];
  const matrix = selected.length > 0 ? await institutionRepo.compare(selected) : null;
  const { items: all } = await institutionRepo.list({});

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="01">Compare</SectionLabel>
        <h1 className="display-m mt-3 mb-10">Institutions, side by side</h1>

        {!matrix || matrix.institutions.length === 0 ? (
          <div>
            <p className="mb-6 text-[0.9375rem] text-current/70">
              Pick two or more institutions from <Link href="/discover" className="link-underline text-cyan-deep">Discover</Link> to compare them here.
            </p>
            <div className="flex flex-wrap gap-3">
              {all.slice(0, 6).map((i) => (
                <a
                  key={i.id}
                  href={`/compare?ids=${[...selected, i.id].join(",")}`}
                  className="meta rounded-full border border-current/20 px-3 py-1.5 hover:border-cyan/50"
                >
                  + {i.name}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[0.875rem]">
              <thead>
                <tr>
                  <th className="meta border-b border-current/15 py-3 pr-4 text-current/45">Criterion</th>
                  {matrix.institutions.map((i) => (
                    <th key={i.id} className="border-b border-current/15 py-3 pr-4 font-medium">
                      <Link href={`/college/${i.slug}`} className="link-underline">{i.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((row) => (
                  <tr key={row.label}>
                    <td className="meta border-b border-current/8 py-3 pr-4 text-current/45">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="tabular border-b border-current/8 py-3 pr-4 capitalize">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  );
}
