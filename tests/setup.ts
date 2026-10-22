import "@testing-library/jest-dom/vitest";

/**
 * A working localStorage for jsdom.
 *
 * jsdom exposes a `localStorage` object here whose methods are not callable,
 * which made the demo adapter throw. The adapter now guards against that, but
 * guarding alone would mean these tests exercise the no-op path and prove
 * nothing about persistence — so give the environment a real implementation.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(k: string) {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
}

if (typeof window !== "undefined" && typeof window.localStorage?.setItem !== "function") {
  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}
