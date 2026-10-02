import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/primitives/Section";
import { RecordEditor } from "@/components/forms/RecordEditor";
import { requireAdmin } from "@/lib/auth/session";
import { adminUniversityJson } from "@/lib/user/actions";

export const metadata: Metadata = { title: "Edit record", robots: { index: false } };

export default async function EditRecordPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const json = await adminUniversityJson(slug);
  if (!json) notFound();
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <nav className="meta text-paper/50"><Link href="/admin" className="hover:text-paper">Admin</Link> › {slug}</nav>
        <h1 className="display-s mt-3 mb-2">Edit record</h1>
        <p className="mb-6 text-[0.875rem] text-paper/60">
          Every non-null fact needs a sourceId that exists in <code>sources</code>; unverifiable values should be <code>null</code> with confidence
          <code> requires-verification</code>. Note: the repo&apos;s data file wins on the next deploy only if its lastVerified is newer.
        </p>
        <RecordEditor slug={slug} json={json} />
      </Container>
    </Section>
  );
}
