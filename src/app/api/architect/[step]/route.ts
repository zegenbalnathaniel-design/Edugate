import { getCurrentUser } from "@/lib/auth/session";
import { accountsAvailable } from "@/lib/db";
import { ArchitectError, architectConfigured, generate, research } from "@/lib/architect/claude";
import { blueprintPrompt, ideatePrompt, interviewPrompt, researchPrompt } from "@/lib/architect/prompts";
import { refund, reserve, STEP_UNITS, type Step } from "@/lib/architect/repo";
import {
  alignMatrix,
  BlueprintCore,
  BlueprintExtended,
  BlueprintRequest,
  Discovery,
  enforceVerification,
  IdeateRequest,
  Ideation,
  InterviewTurn,
  ResearchRequest,
} from "@/lib/architect/schemas";

// Blueprint and ideation calls write long structured documents.
export const maxDuration = 300;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function POST(request: Request, ctx: RouteContext<"/api/architect/[step]">) {
  const { step } = await ctx.params;
  if (!(step in STEP_UNITS)) return json({ error: "Unknown step" }, 404);

  if (!architectConfigured()) return json({ error: "The Project Architect isn't switched on for this deployment." }, 503);
  if (!(await accountsAvailable())) return json({ error: "Accounts are switched off on this deployment." }, 503);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to use the Project Architect." }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  // Validate before reserving, so a malformed request costs nothing.
  const run = plan(step as Step, body);
  if (!run) return json({ error: "Invalid request" }, 400);

  const reservation = await reserve(user.id, step as Step);
  if (!reservation)
    return json({ error: "You've reached today's Architect allowance. It resets 24 hours after your earlier steps." }, 429);

  try {
    return json(await run());
  } catch (e) {
    await refund(reservation.id);
    if (e instanceof ArchitectError) return json({ error: e.message }, e.status);
    console.error("[architect]", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

/** Parses the body for a step and returns the work to run, or null if the body is invalid. */
function plan(step: Step, body: unknown): (() => Promise<unknown>) | null {
  switch (step) {
    case "interview": {
      const d = Discovery.safeParse(body);
      if (!d.success) return null;
      const round = Math.ceil(d.data.transcript.length / 3);
      return () => generate(InterviewTurn, interviewPrompt(d.data, round), { effort: "low", maxTokens: 8000 });
    }
    case "ideate": {
      const d = IdeateRequest.safeParse(body);
      if (!d.success) return null;
      return async () =>
        alignMatrix(
          await generate(Ideation, ideatePrompt(d.data, d.data.feedback, d.data.rejectedTitles), {
            effort: "medium",
            maxTokens: 32000,
          }),
        );
    }
    case "research": {
      const d = ResearchRequest.safeParse(body);
      if (!d.success) return null;
      return () => research(researchPrompt(d.data.concepts, d.data.profile));
    }
    case "blueprint": {
      const d = BlueprintRequest.safeParse(body);
      if (!d.success) return null;
      const { part, concepts, profile, research: r } = d.data;
      const prompt = blueprintPrompt(part, d.data, concepts, profile, r);
      const opts = { effort: "medium" as const, maxTokens: 32000 };
      return part === "core"
        ? async () => enforceVerification(await generate(BlueprintCore, prompt, opts), r)
        : () => generate(BlueprintExtended, prompt, opts);
    }
  }
}
