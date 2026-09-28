import type { Metadata } from "next";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";
import { ProjectsList } from "@/components/passion/ProjectsList";

export const metadata: Metadata = { title: "Your Projects" };

/**
 * Tier B (docs/00-decisions.md → D1): full CRUD-feel state transitions,
 * persisted to the demo layer, no stub buttons. The full student dashboard
 * shell arrives in Stage 3 — this route stands alone until then.
 */
export default function StudentProjectsPage() {
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="01">Your projects</SectionLabel>
        <h1 className="display-m mt-3 mb-10">Projects</h1>
        <ProjectsList />
      </Container>
    </Section>
  );
}
