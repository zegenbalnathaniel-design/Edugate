import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { AuthForm } from "@/components/forms/AuthForm";
import { getCurrentUser } from "@/lib/auth/session";
import { accountsAvailable } from "@/lib/db";

export const metadata: Metadata = { title: "Create your account" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/account");
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <div className="mx-auto max-w-md">
          <SectionLabel>Account</SectionLabel>
          <h1 className="display-m mt-3 mb-3">Create your account</h1>
          <p className="mb-8 text-[0.9375rem] text-paper/65">Your profile is private by default — only you can see it, and you can export or delete it any time.</p>
          {!(await accountsAvailable()) && (
            <p className="mb-6 rounded-[var(--radius-md)] border border-pending/50 bg-pending/10 px-4 py-3 text-[0.875rem] text-paper">
              ⚠ This preview has no permanent database connected yet, so accounts are switched off. Everything else — universities,
              programs, comparison, scholarships — works without one.
            </p>
          )}
          <div className="glass p-6 sm:p-8">
            <AuthForm mode="signup" next={next} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
