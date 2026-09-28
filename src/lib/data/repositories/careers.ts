import type { Career, CareerQuery, Page } from "@/lib/data/types";
import { CAREERS } from "@/lib/data/fixtures/education/careers";

export interface CareerRepo {
  list(q: CareerQuery): Promise<Page<Career>>;
  bySlug(slug: string): Promise<Career | null>;
  byId(id: string): Promise<Career | null>;
  byIds(ids: string[]): Promise<Career[]>;
}

function matches(career: Career, q: CareerQuery): boolean {
  if (q.search) {
    const term = q.search.toLowerCase();
    if (!career.title.toLowerCase().includes(term) && !career.description.toLowerCase().includes(term)) {
      return false;
    }
  }
  if (q.field && !career.fields.includes(q.field)) return false;
  return true;
}

export const careerRepo: CareerRepo = {
  async list(q) {
    let items = CAREERS.filter((c) => matches(c, q));
    const total = items.length;
    if (q.limit) items = items.slice(0, q.limit);
    return { items, total };
  },

  async bySlug(slug) {
    return CAREERS.find((c) => c.slug === slug) ?? null;
  },

  async byId(id) {
    return CAREERS.find((c) => c.id === id) ?? null;
  },

  async byIds(ids) {
    return ids.map((id) => CAREERS.find((c) => c.id === id)).filter((c): c is Career => !!c);
  },
};
