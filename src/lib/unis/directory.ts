import gcc from "../../../data/directories/chennai-gcc-colleges.json";

/*
 * The Greater Chennai Corporation's list of colleges in the city — the roster
 * Edugate's Chennai coverage is measured against (docs/09 §9). Names are as the
 * Corporation publishes them; `slug` links an entry to its full Edugate profile.
 */
export type DirectoryEntry = { name: string; slug: string | null };
export type DirectoryCategory = { key: string; label: string; colleges: DirectoryEntry[] };
export type Directory = { source: { label: string; url: string; retrievedAt: string; notes: string }; categories: DirectoryCategory[] };

export const CHENNAI_DIRECTORY: Directory = gcc as Directory;

export function directoryCoverage(d: Directory = CHENNAI_DIRECTORY) {
  const all = d.categories.flatMap((c) => c.colleges);
  return { total: all.length, profiled: all.filter((e) => e.slug).length };
}
