import type { Metadata } from "next";
import { WrappedFlow } from "@/components/wrapped/WrappedFlow";

export const metadata: Metadata = {
  title: "University Wrapped — find your best-fit course, country and university",
  description:
    "About 40 quick, playful questions. Edugate turns them into your interest DNA, best-fit degrees, careers, countries and an honest Dream / Reach / Target / Safety university list — weighed against real fees and published cut-offs.",
};

/** Static shell: the quiz runs in the browser; results are computed by a server action against the catalogue. */
export default function WrappedPage() {
  return <WrappedFlow />;
}
