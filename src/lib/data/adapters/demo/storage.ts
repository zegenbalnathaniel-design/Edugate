/**
 * The demo adapter's persistence layer.
 *
 * Namespaced localStorage under one versioned prefix so `?reset=1` (and the
 * settings action that calls the same function) can wipe exactly the demo
 * universe and nothing else the browser happens to be storing.
 * (docs/01-architecture.md → The data layer)
 */

type ID = string;

const NAMESPACE = "edugate:demo:v1:";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function readCollection<T>(key: string): T[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeCollection<T>(key: string, items: T[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(NAMESPACE + key, JSON.stringify(items));
}

export function readValue<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeValue<T>(key: string, value: T): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
}

/** Reset is a feature (docs/01-architecture.md): wipes only the demo namespace. */
export function resetDemoState(): void {
  if (!hasStorage()) return;
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(NAMESPACE)) toRemove.push(k);
  }
  toRemove.forEach((k) => window.localStorage.removeItem(k));
}

/**
 * A stable anonymous identity for the demo session, standing in for real
 * auth until Stage 3. Generated once, persisted, reused across reload — the
 * same mechanism every other repository write relies on.
 */
export function getLocalStudentId(): ID {
  if (!hasStorage()) return "std_demo";
  const existing = window.localStorage.getItem(NAMESPACE + "studentId");
  if (existing) return existing;
  const id = "std_" + Math.random().toString(36).slice(2, 10);
  window.localStorage.setItem(NAMESPACE + "studentId", id);
  return id;
}
