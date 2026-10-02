import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { auditLog, universities, users } from "@/lib/db/schema";
import { dateLabel } from "@/lib/unis/format";
import { freshnessFlags } from "@/lib/unis/freshness";
import { allUniversities, latestQsEdition } from "@/lib/unis/repo";
import { resolveReport } from "@/lib/user/actions";
import { listReports } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Data admin", robots: { index: false } };

export default async function AdminPage() {
  await requireAdmin();
  const db = await getDb();
  const [rows, latest, reports, log] = await Promise.all([
    allUniversities(),
    latestQsEdition(),
    listReports("open"),
    db.select({ a: auditLog, uni: universities.name, who: users.email }).from(auditLog).leftJoin(universities, eq(universities.id, auditLog.universityId)).leftJoin(users, eq(users.id, auditLog.userId)).orderBy(desc(auditLog.createdAt)).limit(15),
  ]);
  const flagged = rows.map((r) => ({ r, flags: freshnessFlags(r.data, latest) })).filter((x) => x.flags.length);
  const unverifiedCount = (u: (typeof rows)[number]["data"]) => JSON.stringify(u).split('"requires-verification"').length - 1;

  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="wide">
        <SectionLabel index="01">Admin</SectionLabel>
        <h1 className="display-m mt-3 mb-10">Data integrity</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="glass p-5">
            <h2 className="meta mb-4 text-paper/60">User reports ({reports.length} open)</h2>
            {reports.length === 0 ? <p className="text-[0.875rem] text-paper/60">No open reports.</p> : (
              <ul className="divide-y divide-paper/10">
                {reports.map(({ r, uniName, uniSlug, reporter }) => (
                  <li key={r.id} className="py-3 text-[0.875rem]">
                    <p><Link href={`/admin/universities/${uniSlug}`} className="text-cyan">{uniName}</Link>{r.programSlug && ` · ${r.programSlug}`} — <strong>{r.fieldLabel}</strong></p>
                    <p className="mt-1 text-paper/75">{r.message}</p>
                    <p className="mt-1 text-[0.75rem] text-paper/45">{reporter ?? "anonymous"} · {dateLabel(r.createdAt.toISOString().slice(0, 10))}</p>
                    <form action={resolveReport} className="mt-2 flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <button name="status" value="accepted" className="rounded-full border border-verified/50 px-3 py-1 text-[0.8125rem]">Accept (fix in editor)</button>
                      <button name="status" value="dismissed" className="rounded-full border border-paper/25 px-3 py-1 text-[0.8125rem]">Dismiss</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="glass p-5">
            <h2 className="meta mb-4 text-paper/60">Freshness queue ({flagged.length})</h2>
            {flagged.length === 0 ? <p className="text-[0.875rem] text-paper/60">Nothing stale right now.</p> : (
              <ul className="divide-y divide-paper/10 text-[0.875rem]">
                {flagged.map(({ r, flags }) => (
                  <li key={r.slug} className="py-2.5">
                    <Link href={`/admin/universities/${r.slug}`} className="text-cyan">{r.name}</Link>
                    <ul className="mt-1 text-paper/70">{flags.map((f) => <li key={f.kind}>⚠ {f.message}</li>)}</ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="glass mt-8 overflow-x-auto p-5">
          <h2 className="meta mb-4 text-paper/60">Records ({rows.length})</h2>
          <table className="w-full min-w-[640px] text-left text-[0.875rem]">
            <thead><tr className="text-paper/55"><th className="py-2 font-medium">University</th><th className="font-medium">Last verified</th><th className="font-medium">Sources</th><th className="font-medium">Needs verification</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-t border-paper/10">
                  <td className="py-2">{r.name}</td>
                  <td>{dateLabel(r.data.lastVerified)}</td>
                  <td>{r.data.sources.length}</td>
                  <td>{unverifiedCount(r.data)}</td>
                  <td className="text-right"><Link href={`/admin/universities/${r.slug}`} className="text-cyan">Edit / verify →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="glass mt-8 p-5">
          <h2 className="meta mb-4 text-paper/60">Audit log</h2>
          <ul className="space-y-1.5 text-[0.8125rem]">
            {log.map(({ a, uni, who }) => (
              <li key={a.id}><span className="text-paper/45">{a.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span> · <strong>{a.action}</strong> · {uni ?? "—"} · {who ?? "system"} — {a.summary}</li>
            ))}
          </ul>
        </section>
      </Container>
    </Section>
  );
}
