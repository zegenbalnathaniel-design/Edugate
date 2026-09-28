import type { Metadata } from "next";
import Link from "next/link";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";

export const metadata: Metadata = { title: "For parents" };

const LINKS = [
  {
    href: "/discover",
    label: "Discover institutions",
    body: "Filter by country and field alongside your child — same real data they see.",
  },
  {
    href: "/compare",
    label: "Compare",
    body: "Line institutions up side by side. No ranking score, no sponsored placement — just facts.",
  },
  {
    href: "/methodology",
    label: "Methodology",
    body: "Exactly how we source and label data, and how recommendations are phrased.",
  },
];

/**
 * Tier C (docs/00-decisions.md → D1, D7 open question 3): a real page, but
 * a narrow one. A parent-specific account, a shared dashboard, and
 * permissioned visibility into a child's Passion Projector results are not
 * built yet — the permission model for that is still an open decision, not
 * a detail we skipped. Rather than fake a dashboard, this page says so and
 * points at what already works today.
 */
export default function ParentsPage() {
  return (
    <Section register="warm" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="01">For parents</SectionLabel>
        <h1 className="display-m mt-3 mb-6">What's here for you today</h1>
        <p className="measure mb-10 text-[0.9375rem] text-current/70">
          We're not going to show you a fake "parent dashboard." A
          permissioned, shared view into your child's Passion Projector
          results doesn't exist yet — who grants that visibility, and by
          what default, is a real product decision we haven't made. Until
          it's built, here's what already works for you directly:
        </p>

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
