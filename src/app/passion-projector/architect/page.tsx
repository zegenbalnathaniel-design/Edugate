import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { ArchitectFlow } from "@/components/architect/ArchitectFlow";
import { getCurrentUser } from "@/lib/auth/session";
import { accountsAvailable } from "@/lib/db";
import { architectConfigured } from "@/lib/architect/claude";
import { dailyAllowance, listProjects, unitsUsedToday } from "@/lib/architect/repo";
import { dateLabel } from "@/lib/unis/format";

export const metadata: Metadata = {
  title: "Project Architect",
  description:
    "An adaptive interview that turns your interests, skills and constraints into project concepts you can compare, then a full blueprint for the one you choose: plan, budget, risks and a 12-week schedule.",
};

/*
 * The Passion Project Architect (docs/08-passion-architect.md). It calls a
 * paid API, so it needs three things a deployment may not have: an API key,
 * a persistent database (for accounts and metering), and a signed-in user.
 * Each missing piece gets an honest explanation instead of a broken flow.
 */
export default async function ArchitectPage() {
  // Depends on runtime config and the session, so never prerender it.
  await connection();
  const [configured, accounts] = [architectConfigured(), await accountsAvailable()];
  const user = configured && accounts ? await getCurrentUser() : null;

  return (
    <Section register="dark" className="min-h-screen pt-32 pb-24">
      <Container>
        <SectionLabel index="02">Passion Projector</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Project Architect</h1>
        <p className="measure mb-10 text-body-l text-paper/70">
          A conversation first: it asks about what you&apos;ve done, noticed and care about. Then 8–12 project concepts built from your
          answers, a fit matrix to compare them, and a full blueprint for the one you choose — with every fact marked as verified,
          assumed or unknown.
        </p>

        {!configured || !accounts ? (
          <Unavailable reason={!configured ? "key" : "db"} />
        ) : !user ? (
          <div className="glass max-w-xl p-6 sm:p-8">
            <p className="text-[0.9375rem]">
              The Architect saves your blueprints to your account, and each step runs on a metered AI service — so it needs you to be signed in.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login?next=/passion-projector/architect" className="inline-flex h-11 items-center rounded-full bg-electric px-6 font-semibold text-[var(--on-electric)]">
                Sign in
              </Link>
              <Link href="/signup?next=/passion-projector/architect" className="inline-flex h-11 items-center rounded-full border border-paper/25 px-6">
                Create an account
              </Link>
            </div>
          </div>
        ) : (
          <SignedIn userId={user.id} />
        )}

        <p className="mt-16 text-[0.875rem] text-paper/55">
          Want something quicker? The{" "}
          <Link href="/passion-projector" className="text-cyan hover:underline">
            15-question snapshot
          </Link>{" "}
          runs entirely in your browser, with no account.
        </p>
      </Container>
    </Section>
  );
}

async function SignedIn({ userId }: { userId: string }) {
  const [projects, used] = await Promise.all([listProjects(userId), unitsUsedToday(userId)]);
  return (
    <>
      {projects.length > 0 && (
        <div className="mb-10">
          <p className="meta mb-3 text-paper/50">Your saved blueprints</p>
          <ul className="flex flex-wrap gap-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/passion-projector/architect/${p.id}`} className="glass inline-block px-4 py-3 text-[0.9375rem] hover:text-cyan">
                  {p.title}
                  <span className="ml-2 text-[0.75rem] text-paper/45">{dateLabel(p.createdAt.toISOString().slice(0, 10))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ArchitectFlow allowance={{ used, total: dailyAllowance() }} />
    </>
  );
}

function Unavailable({ reason }: { reason: "key" | "db" }) {
  return (
    <div className="max-w-2xl rounded-[var(--radius-md)] border border-pending/50 bg-pending/10 px-5 py-4 text-[0.9375rem]">
      <p className="font-semibold">The Project Architect isn&apos;t switched on for this deployment yet.</p>
      <p className="mt-2 text-paper/75">
        {reason === "key"
          ? "It runs on the Claude API, and no API key has been configured here."
          : "It needs a permanent database for accounts and saved blueprints, and this preview doesn't have one connected."}{" "}
        Nothing is faked in the meantime — the quick snapshot below works without it.
      </p>
    </div>
  );
}
