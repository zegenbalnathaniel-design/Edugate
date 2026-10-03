"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { deleteProject, saveProject } from "./repo";
import { enforceVerification, SaveRequest } from "./schemas";

export async function saveArchitectProject(input: unknown): Promise<{ id?: string; error?: string }> {
  const user = await requireUser("/passion-projector/architect");
  const parsed = SaveRequest.safeParse(input);
  if (!parsed.success) return { error: "This blueprint couldn't be saved — it looks incomplete." };
  // Re-apply the verification guard server-side: the client could have edited the payload.
  const project = { ...parsed.data, core: enforceVerification(parsed.data.core, parsed.data.research) };
  const id = await saveProject(user.id, project);
  revalidatePath("/passion-projector/architect");
  return { id };
}

export async function deleteArchitectProject(form: FormData) {
  const user = await requireUser("/passion-projector/architect");
  await deleteProject(user.id, String(form.get("id") ?? ""));
  revalidatePath("/passion-projector/architect");
  redirect("/passion-projector/architect");
}
