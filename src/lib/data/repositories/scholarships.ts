import type { Scholarship, ScholarshipQuery, Page } from "@/lib/data/types";
import { SCHOLARSHIPS } from "@/lib/data/fixtures/education/scholarships";

export interface ScholarshipRepo {
  list(q: ScholarshipQuery): Promise<Page<Scholarship>>;
  bySlug(slug: string): Promise<Scholarship | null>;
  byIds(ids: string[]): Promise<Scholarship[]>;
}

function matches(s: Scholarship, q: ScholarshipQuery): boolean {
  if (q.search) {
    const term = q.search.toLowerCase();
    if (!s.name.toLowerCase().includes(term)) return false;
  }
  if (q.field && !(s.eligibility.fields ?? []).includes(q.field)) return false;
  if (q.basis && !s.basis.includes(q.basis)) return false;
  return true;
}

export const scholarshipRepo: ScholarshipRepo = {
  async list(q) {
    let items = SCHOLARSHIPS.filter((s) => matches(s, q));
    const total = items.length;
    if (q.limit) items = items.slice(0, q.limit);
    return { items, total };
  },

  async bySlug(slug) {
    return SCHOLARSHIPS.find((s) => s.slug === slug) ?? null;
  },

  async byIds(ids) {
    return ids.map((id) => SCHOLARSHIPS.find((s) => s.id === id)).filter((s): s is Scholarship => !!s);
  },
};
