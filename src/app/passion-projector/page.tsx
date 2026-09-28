import type { Metadata } from "next";
import { PassionProjectorClient } from "@/components/passion/PassionProjectorClient";

export const metadata: Metadata = {
  title: "Passion Projector",
  description:
    "Answer scenario questions, not self-ratings, and leave with real interest signals, an evidence trail for each one, and a project you could start tonight.",
};

/**
 * The signature feature (docs/04-passion-engine.md). Interactive by nature —
 * unlike the hero's decorative canvas, there is no meaningful non-JS version
 * of an adaptive question flow, so the noscript fallback is honest about that
 * rather than pretending otherwise (docs/01-architecture.md → Rendering
 * strategy: the canvas layer specifically stays optional; the feature itself
 * cannot).
 */
export default function PassionProjectorPage() {
  return (
    <div data-register="dark">
      <noscript>
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <h1 className="display-m mb-4">Passion Projector</h1>
          <p className="text-body-l text-paper/70">
            This feature is an interactive question flow and needs JavaScript
            enabled to run.
          </p>
        </div>
      </noscript>
      <PassionProjectorClient />
    </div>
  );
}
