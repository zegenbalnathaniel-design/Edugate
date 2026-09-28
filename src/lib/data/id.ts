/** Prefixed ids, e.g. "psn_a1b2c3d4" — matches the convention in docs/03-data-model.md. */
export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
