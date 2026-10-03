import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/primitives/Section";
import { BlueprintView } from "@/components/architect/BlueprintView";
import { DownloadMarkdown } from "@/components/architect/DownloadMarkdown";
import { requireUser } from "@/lib/auth/session";
import { deleteArchitectProject } from "@/lib/architect/actions";
import { getProject } from "@/lib/architect/repo";
import { dateLabel } from "@/lib/unis/format";

export const metadata: Metadata = { title: "Saved blueprint", robots: { index: false } };

export default async function SavedBlueprint({ params }: PageProps<"/passion-projector/architect/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/passion-projector/architect/${id}`);
  const row = await getProject(user.id, id);
  if (!row) notFound();

  return (
    <Section register="dark" className="min-h-screen pt-32 pb-24">
      <Container>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link href="/passion-projector/architect" className="text-[0.875rem] text-cyan hover:underline">
            ← Project Architect
          </Link>
          <span className="text-[0.8125rem] text-paper/45">Saved {dateLabel(row.createdAt.toISOString().slice(0, 10))}</span>
          <div className="ml-auto flex gap-3">
            <DownloadMarkdown project={row.data} />
            <form action={deleteArchitectProject}>
              <input type="hidden" name="id" value={row.id} />
              <button className="inline-flex h-10 items-center rounded-full border border-attention/50 px-4 text-[0.875rem] text-attention hover:bg-attention/10">
                Delete
              </button>
            </form>
          </div>
        </div>
        <BlueprintView project={row.data} />
      </Container>
    </Section>
  );
}
