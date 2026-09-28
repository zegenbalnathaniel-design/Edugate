import type { Metadata } from "next";
import Link from "next/link";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";

export const metadata: Metadata = { title: "Student hub" };

const LINKS = [
  {
    href: "/passion-projector",
    label: "Passion Projector",
    body: "Answer scenario questions, see which interest signals actually show up, and get project templates built around them.",
  },
  {
    href: "/student/projects",
    label: "Your projects",
    body: "Projects you've started from Passion Projector, with status and the full implementation plan for each.",
  },
  {
    href: "/student/passion-projector/history",
    label: "Your history",
    body: "Every completed Passion Projector session, kept — so you can see your own interests move over time.",
  },
  {
    href: "/discover",
    label: "Discover institutions",
    body: "Filter by country and field, real records, real filters.",
  },
  {
    href: "/compare",
    label: "Compare",
    body: "Put institutions side by side. No ranking score — just facts.",
  },
];

/**
 * Tier C (docs/00-decisions.md → D1): a real index over routes that already
 * exist. The full account-aware dashboard shell is out of scope for this
 * stage — this page exists so "Students" in the nav goes somewhere real
 * rather than nowhere.
 */
export default function StudentHubPage() {
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="01">For students</SectionLabel>
        <h1 className="display-m mt-3 mb-10">Your hub</h1>

        <div className="grid gap-4">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="glass-interactive block p-6">
              <p className="text-[1.0625rem] font-medium text-current">{l.label}</p>
              <p className="mt-1.5 text-[0.875rem] text-current/60">{l.body}</p>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
