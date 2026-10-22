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

/**
 * Storage is usable only if its methods are actually callable.
 *
 * Checking the object exists is not enough: Safari in Lockdown Mode, some
 * privacy extensions and a few test environments expose a localStorage whose
 * methods are missing or throw. Reads already had try/catch; writes did not,
 * so a broken-but-present storage threw straight out of writeCollection.
 */
function hasStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage?.setItem === "function" &&
      typeof window.localStorage?.getItem === "function"
    );
  } catch {
    return false; // accessing localStorage itself can throw when blocked
  }
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
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(items));
  } catch {
    // Quota exceeded or storage blocked mid-session. Demo persistence is a
    // convenience; losing it must not break the page the user is on.
  }
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
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  } catch {
    // Same contract as writeCollection: persistence is best-effort.
  }
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
