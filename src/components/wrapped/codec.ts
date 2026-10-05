import type { Answers } from "@/lib/wrapped/model";

/* Answers ⇄ a short URL-safe string, so a Wrapped can be shared as a link (no account, nothing stored). */

export function encodeAnswers(a: Answers): string {
  const json = JSON.stringify(a);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAnswers(s: string): Answers | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const v = JSON.parse(new TextDecoder().decode(bytes));
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Answers) : null;
  } catch {
    return null;
  }
}

const KEY = "edugate.wrapped.v1";

export function loadSaved(): { answers: Answers; at: string | null } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v.answers === "object" ? v : null;
  } catch {
    return null;
  }
}

export function save(answers: Answers, at: string | null) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ answers, at }));
  } catch {
    /* storage unavailable — the quiz still works, it just won't resume */
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
