import type { Metadata } from "next";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";
import { HistoryList } from "@/components/passion/HistoryList";

export const metadata: Metadata = { title: "Passion Projector History" };

export default function PassionHistoryPage() {
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="02">Evolution</SectionLabel>
        <h1 className="display-m mt-3 mb-4">Your history</h1>
        <p className="measure mb-10 text-[0.9375rem] text-current/60">
          This is a snapshot of your current curiosity, taken more than once.
          Your interests can change — this is where you watch that happen.
        </p>
        <HistoryList />
      </Container>
    </Section>
  );
}
