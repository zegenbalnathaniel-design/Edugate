import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { inputCls, secondaryBtnCls } from "@/components/forms/styles";
import { deleteAccount, logout } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { getDbMode } from "@/lib/db";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ delete?: string }> }) {
  const user = await requireUser("/account");
  const mode = await getDbMode();
  const { delete: del } = await searchParams;
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel>Account</SectionLabel>
        <h1 className="display-m mt-3 mb-2">{user.name ?? "Your account"}</h1>
        <p className="text-[0.9375rem] text-paper/60">
          {user.email}
          {user.role === "admin" && " · admin"}
        </p>
        {mode === "embedded-memory" && (
          <p className="mt-6 rounded-[var(--radius-md)] border border-pending/50 bg-pending/10 px-4 py-3 text-[0.875rem] text-paper">
            ⚠ Preview mode: this deployment has no permanent database connected yet, so accounts and saved items may reset.
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["/profile", "Your profile", "Curriculum, subjects, tests, budget and priorities."],
            ["/discover", "Your discovery", "Universities that fit what you entered, and why."],
            ["/tracker", "Application tracker", "Saved universities, deadlines and checklists."],
          ].map(([href, title, body]) => (
            <Link key={href} href={href} className="glass glass-interactive block p-5">
              <p className="font-medium text-paper">{title}</p>
              <p className="mt-1 text-[0.8125rem] text-paper/60">{body}</p>
            </Link>
          ))}
          {user.role === "admin" && (
            <Link href="/admin" className="glass glass-interactive block p-5">
              <p className="font-medium text-paper">Data admin</p>
              <p className="mt-1 text-[0.8125rem] text-paper/60">Verify records, review reports, fix stale data.</p>
            </Link>
          )}
        </div>

        <section className="glass mt-12 space-y-6 p-6 sm:p-8">
          <h2 className="meta text-paper/60">Your data</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/account/export" className={secondaryBtnCls}>Export everything (JSON)</a>
            <form action={logout}>
              <button className={secondaryBtnCls}>Sign out</button>
            </form>
          </div>
          <form action={deleteAccount} className="space-y-3 border-t border-paper/10 pt-6">
            <p className="text-[0.9375rem] text-paper/80">
              Delete your account and everything attached to it — profile, tracker, saved searches. This can&apos;t be undone.
            </p>
            {del === "confirm" && <p role="alert" className="text-[0.875rem] text-attention">⚠ Type DELETE exactly to confirm.</p>}
            <div className="flex flex-wrap gap-3">
              <label className="sr-only" htmlFor="confirm">Type DELETE to confirm</label>
              <input id="confirm" name="confirm" placeholder="Type DELETE" className={`${inputCls} max-w-48`} autoComplete="off" />
              <button className="inline-flex h-11 items-center rounded-full border border-attention/60 px-5 text-[0.875rem] text-paper hover:bg-attention/15">
                Delete account
              </button>
            </div>
          </form>
        </section>
      </Container>
    </Section>
  );
}
