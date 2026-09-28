import type { Institution, InstitutionQuery, Page, ComparisonMatrix } from "@/lib/data/types";
import { INSTITUTIONS } from "@/lib/data/fixtures/education/institutions";

/**
 * Repository over the closed fictional universe (docs/01-architecture.md).
 * Async from day one — a real backend later changes no call sites.
 */
export interface InstitutionRepo {
  list(q: InstitutionQuery): Promise<Page<Institution>>;
  bySlug(slug: string): Promise<Institution | null>;
  byId(id: string): Promise<Institution | null>;
  compare(ids: string[]): Promise<ComparisonMatrix>;
}

function matches(inst: Institution, q: InstitutionQuery): boolean {
  if (q.search) {
    const term = q.search.toLowerCase();
    if (!inst.name.toLowerCase().includes(term) && !inst.description.toLowerCase().includes(term)) {
      return false;
    }
  }
  if (q.country && inst.location.country !== q.country) return false;
  if (q.city && inst.location.city !== q.city) return false;
  return true;
}

export const institutionRepo: InstitutionRepo = {
  async list(q) {
    let items = INSTITUTIONS.filter((inst) => matches(inst, q));
    const total = items.length;
    if (q.limit) items = items.slice(0, q.limit);
    return { items, total };
  },

  async bySlug(slug) {
    return INSTITUTIONS.find((inst) => inst.slug === slug) ?? null;
  },

  async byId(id) {
    return INSTITUTIONS.find((inst) => inst.id === id) ?? null;
  },

  async compare(ids) {
    const institutions = ids
      .map((id) => INSTITUTIONS.find((inst) => inst.id === id))
      .filter((inst): inst is Institution => !!inst);

    const rows: ComparisonMatrix["rows"] = [
      { label: "Type", values: institutions.map((i) => i.type) },
      { label: "Location", values: institutions.map((i) => `${i.location.city}, ${i.location.country}`) },
      {
        label: "Tuition",
        values: institutions.map(
          (i) => `${i.tuition.currency} ${i.tuition.min.toLocaleString()}–${i.tuition.max.toLocaleString()} / ${i.tuition.period}`,
        ),
      },
      { label: "Selectivity", values: institutions.map((i) => i.admissions.selectivity.replace("-", " ")) },
      { label: "Setting", values: institutions.map((i) => i.campus.setting) },
      { label: "Programs", values: institutions.map((i) => i.programs.length) },
    ];

    return { institutions, rows };
  },
};
