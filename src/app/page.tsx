import { Hero } from "@/components/landing/Hero";
import { ScrollStory } from "@/components/story/ScrollStory";
import {
  ProblemSection,
  DiscoverSection,
  DiscernSection,
  DecideSection,
  TrustSection,
  ClosingSection,
} from "@/components/landing/Narrative";

/**
 * The landing page tells one story: chaos → discovery → discernment → decision
 * (§09, §107). The pinned ScrollStory right after the hero plays that story
 * literally — a student lost across Reddit, Instagram and Google, then Edugate.
 * Registers alternate on every section — dark, deep, light, deep, warm, deep,
 * light, dark — so the page never runs two consecutive sections in the same
 * visual key (§08).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ScrollStory />
      <ProblemSection />
      <DiscoverSection />
      <DiscernSection />
      <DecideSection />
      <TrustSection />
      <ClosingSection />
    </>
  );
}
