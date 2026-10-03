import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { BetaContentBlock, BetaMessageParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { z } from "zod";
import { SYSTEM } from "./prompts";
import { normaliseEnums, type Research, type ResearchSource } from "./schemas";

/*
 * Every Claude call the Architect makes goes through here.
 *  - Streaming + finalMessage(): long structured outputs would otherwise hit
 *    request timeouts.
 *  - fallbacks: "default" re-runs a declined request on Anthropic's
 *    recommended fallback model server-side instead of failing outright.
 *  - Thinking is always adaptive on this model; depth is set with `effort`.
 */

export const MODEL = "claude-opus-5-5";
const BETAS = ["server-side-fallback-2026-07-01"];

export function architectConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic());

const system = [{ type: "text" as const, text: SYSTEM, cache_control: { type: "ephemeral" as const } }];

export class ArchitectError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
  }
}

type Effort = "low" | "medium" | "high";

/** One structured-output call, validated against the same Zod schema it was asked to follow. */
export async function generate<S extends z.ZodType>(
  schema: S,
  prompt: string,
  { effort, maxTokens }: { effort: Effort; maxTokens: number },
): Promise<z.infer<S>> {
  const message = await call(() =>
    anthropic()
      .beta.messages.stream({
        model: MODEL,
        max_tokens: maxTokens,
        betas: BETAS,
        fallbacks: "default",
        system,
        // Schema only, without the helper's auto-parser: the SDK would otherwise
        // reject near-miss enum values before normaliseEnums can repair them.
        output_config: { effort, format: { type: "json_schema", schema: zodOutputFormat(schema).schema } },
        messages: [{ role: "user", content: prompt }],
      })
      .finalMessage(),
  );

  checkStop(message.stop_reason);
  const text = textOf(message.content);
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ArchitectError("The response came back malformed. Please try again.");
  }
  const parsed = schema.safeParse(normaliseEnums(json));
  if (!parsed.success) {
    console.error("[architect] schema mismatch:", parsed.error.issues.slice(0, 5));
    throw new ArchitectError("The response didn't match the expected structure. Please try again.");
  }
  return parsed.data;
}

/**
 * Validation research with the server-side web search tool. Search results
 * and citations are collected from the response itself, so the blueprint can
 * only call something "verified" if it traces to a page search returned.
 * Any failure degrades to `available: false` rather than blocking the
 * blueprint — which then treats every premise as unverified.
 */
export async function research(prompt: string): Promise<Research> {
  const messages: BetaMessageParam[] = [{ role: "user", content: prompt }];
  const blocks: BetaContentBlock[] = [];
  try {
    for (let i = 0; i < 4; i++) {
      const message = await call(() =>
        anthropic()
          .beta.messages.stream({
            model: MODEL,
            max_tokens: 16000,
            betas: BETAS,
            fallbacks: "default",
            system,
            output_config: { effort: "medium" },
            tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
            messages,
          })
          .finalMessage(),
      );
      blocks.push(...message.content);
      // Long searches pause; send the turn back so the server resumes it.
      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }
      checkStop(message.stop_reason);
      break;
    }
  } catch (e) {
    if (e instanceof ArchitectError && e.status === 429) throw e;
    console.warn("[architect] research unavailable:", e instanceof Error ? e.message : e);
    return { notes: "", sources: [], available: false };
  }

  const sources = new Map<string, ResearchSource>();
  const add = (url: string, title: string | null | undefined) => {
    if (/^https?:\/\//.test(url) && !sources.has(url)) sources.set(url, { url, title: title || url });
  };
  for (const b of blocks) {
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) for (const r of b.content) add(r.url, r.title);
    if (b.type === "text") for (const c of b.citations ?? []) if ("url" in c && typeof c.url === "string") add(c.url, c.title);
  }
  const notes = textOf(blocks).trim();
  return { notes, sources: [...sources.values()], available: notes.length > 0 && sources.size > 0 };
}

function textOf(content: BetaContentBlock[]) {
  return content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
}

function checkStop(reason: string | null) {
  if (reason === "refusal")
    throw new ArchitectError("This request was declined. Try rephrasing the project direction.", 422);
  if (reason === "max_tokens") throw new ArchitectError("The response ran too long and was cut off. Please try again.");
}

async function call<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError)
      throw new ArchitectError("The AI service is busy right now. Wait a minute and try again.", 429);
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
      console.error("[architect] API key rejected:", e.message);
      throw new ArchitectError("The Architect isn't configured correctly on this deployment.", 503);
    }
    if (e instanceof Anthropic.BadRequestError) {
      console.error("[architect] bad request:", e.message);
      throw new ArchitectError("The request couldn't be processed. Please try again.");
    }
    if (e instanceof Anthropic.APIError) {
      console.error("[architect] API error:", e.status, e.message);
      throw new ArchitectError("The AI service had a problem. Please try again shortly.", 503);
    }
    throw e;
  }
}
