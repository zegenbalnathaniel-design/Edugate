import type { Course, CourseQuery, Page } from "@/lib/data/types";
import { COURSES } from "@/lib/data/fixtures/education/courses";

export interface CourseRepo {
  list(q: CourseQuery): Promise<Page<Course>>;
  bySlug(slug: string): Promise<Course | null>;
  byId(id: string): Promise<Course | null>;
  byInstitution(institutionId: string): Promise<Course[]>;
}

function matches(course: Course, q: CourseQuery): boolean {
  if (q.search) {
    const term = q.search.toLowerCase();
    if (!course.name.toLowerCase().includes(term)) return false;
  }
  if (q.field && course.field !== q.field) return false;
  if (q.degree && course.degree !== q.degree) return false;
  if (q.institutionId && !course.institutions.includes(q.institutionId)) return false;
  return true;
}

export const courseRepo: CourseRepo = {
  async list(q) {
    let items = COURSES.filter((c) => matches(c, q));
    const total = items.length;
    if (q.limit) items = items.slice(0, q.limit);
    return { items, total };
  },

  async bySlug(slug) {
    return COURSES.find((c) => c.slug === slug) ?? null;
  },

  async byId(id) {
    return COURSES.find((c) => c.id === id) ?? null;
  },

  async byInstitution(institutionId) {
    return COURSES.filter((c) => c.institutions.includes(institutionId));
  },
};
