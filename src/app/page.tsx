import { Hero } from "@/components/landing/Hero";
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
 * (§09, §107). Registers alternate on every section — dark, light, deep, warm,
 * deep, light, dark — so the page never runs two consecutive sections in the
 * same visual key (§08).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <DiscoverSection />
      <DiscernSection />
      <DecideSection />
      <TrustSection />
      <ClosingSection />
    </>
  );
}
