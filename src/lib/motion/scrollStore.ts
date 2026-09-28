import { create } from "zustand";

/**
 * Scroll state lives outside React on purpose.
 *
 * Lenis emits on every frame. Writing that into React state would re-render the
 * tree 60x/second; instead the WebGL layer reads this store imperatively inside
 * useFrame via `useScrollStore.getState()`, which never triggers a render.
 * (docs/01-architecture.md → Motion integration)
 */
interface ScrollState {
  /** Absolute scroll offset in px. */
  scroll: number;
  /** Normalized 0–1 progress through the document. */
  progress: number;
  /** Signed px/frame. Drives velocity-reactive motion (§87). */
  velocity: number;
  /** Velocity normalized and clamped to roughly -1…1, for shader uniforms. */
  normalizedVelocity: number;
  set: (s: Partial<Omit<ScrollState, "set">>) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  scroll: 0,
  progress: 0,
  velocity: 0,
  normalizedVelocity: 0,
  set: (s) => set(s),
}));

/** Read scroll without subscribing — safe to call inside useFrame. */
export const getScroll = () => useScrollStore.getState();
