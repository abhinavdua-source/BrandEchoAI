import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import {
  BrandProfileSchema,
  CheckResultSchema,
  type Attribute,
  type BrandProfile,
  type CheckResult,
} from "@/lib/voice";

/*
 * Server-only Claude calls. Imported only from server function handlers.
 * Model is configurable with BRANDECHO_MODEL (default Claude Opus 5.5).
 */

export const MODEL = process.env["BRANDECHO_MODEL"] || "claude-opus-5-5";

let _client: Anthropic | undefined;
function client() {
  if (!process.env["ANTHROPIC_API_KEY"]) {
    throw new UserFacingError("The checker isn't configured yet (missing ANTHROPIC_API_KEY).");
  }
  _client ??= new Anthropic();
  return _client;
}

/** An error whose message is safe to show to the signed-in user. */
export class UserFacingError extends Error {}

// Refusals are rerouted to a fallback model by the API itself.
const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[],
  fallbacks: "default" as const,
};

function toUserError(err: unknown): never {
  if (err instanceof UserFacingError) throw err;
  if (err instanceof Anthropic.RateLimitError) {
    throw new UserFacingError("The checker is busy right now. Try again in a minute.");
  }
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("[claude] authentication failed", err.message);
    throw new UserFacingError("The checker isn't configured correctly. Contact support.");
  }
  if (err instanceof Anthropic.BadRequestError) {
    console.error("[claude] bad request", err.message);
    throw new UserFacingError("That input couldn't be processed. Try a shorter or different file.");
  }
  if (err instanceof Anthropic.APIError) {
    console.error(`[claude] API error ${err.status}`, err.message);
    throw new UserFacingError("The checker had a problem. Please try again.");
  }
  console.error("[claude] unexpected error", err);
  throw new UserFacingError("Something went wrong. Please try again.");
}

function finish<T>(response: { stop_reason: string | null; parsed_output: T | null }): T {
  if (response.stop_reason === "refusal") {
    throw new UserFacingError("This content couldn't be checked. Try rephrasing it.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new UserFacingError("The result came back incomplete. Please try again.");
  }
  return response.parsed_output;
}

const EXTRACT_SYSTEM = `You read company brand guidelines and turn them into a compact brand voice profile that an editor can check copy against.
Be faithful to the source: only include rules, terms and attributes the guidelines state or clearly imply. Keep every item short and concrete. Write in plain English.`;

export async function extractBrandProfile(
  source: { kind: "pdf"; base64: string } | { kind: "text"; text: string },
): Promise<BrandProfile> {
  const content: Anthropic.Beta.BetaContentBlockParam[] =
    source.kind === "pdf"
      ? [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: source.base64 },
          },
          { type: "text", text: "Build the brand voice profile from these guidelines." },
        ]
      : [
          {
            type: "text",
            text: `<guidelines>\n${source.text}\n</guidelines>\n\nBuild the brand voice profile from these guidelines.`,
          },
        ];

  try {
    const response = await client().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      output_config: { effort: "medium", format: betaZodOutputFormat(BrandProfileSchema) },
      system: EXTRACT_SYSTEM,
      messages: [{ role: "user", content }],
    });
    return finish(response);
  } catch (err) {
    toUserError(err);
  }
}

export type BrandForCheck = {
  name: string;
  summary: string;
  attributes: Attribute[];
  preferred_terms: string[];
  banned_terms: string[];
  rules: string[];
  example_copy: string;
  house_standard: number;
};

const CHECK_INSTRUCTIONS = `You are a senior brand editor. You check marketing drafts against one company's brand voice and rewrite them so they sound like that company.

Scoring: 100 means indistinguishable from the brand's best copy; 90 is the usual house standard for publishing; 70 means noticeably off (wrong tone, hype, vague claims); below 50 means it reads like a different company. Judge voice and wording, not the product claims' truth, except flag claims that are vague or unproven where the brand rules ask for specifics.

Issues: list each off-brand phrase once, in reading order, quoting it exactly as it appears in the draft so it can be highlighted. Prefer a few precise issues over many small ones. If the draft is on-brand, return no issues.

Rewrite: keep the writer's meaning, audience and roughly the same length and format (line breaks, lists). Apply the brand's rules and vocabulary. Never invent facts, numbers or offers that aren't in the draft.`;

function brandBlock(b: BrandForCheck) {
  const list = (items: string[]) =>
    items.length ? items.map((i) => `- ${i}`).join("\n") : "- (none)";
  return `<brand name="${b.name}">
<summary>${b.summary || "(none)"}</summary>
<attributes>
${b.attributes.map((a) => `- ${a.label}: ${a.value}`).join("\n") || "- (none)"}
</attributes>
<rules>
${list(b.rules)}
</rules>
<preferred_terms>
${list(b.preferred_terms)}
</preferred_terms>
<banned_terms>
${list(b.banned_terms)}
</banned_terms>
<example_copy>
${b.example_copy || "(none)"}
</example_copy>
<house_standard>${b.house_standard}</house_standard>
</brand>`;
}

export async function checkDraft(
  brand: BrandForCheck,
  draft: { text: string; channel: string },
): Promise<CheckResult> {
  try {
    const response = await client().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      ...FALLBACK,
      output_config: { effort: "medium", format: betaZodOutputFormat(CheckResultSchema) },
      // Instructions + brand profile are stable per brand, so they form the
      // cached prefix; the draft changes every request and comes after it.
      system: [
        { type: "text", text: CHECK_INSTRUCTIONS },
        { type: "text", text: brandBlock(brand), cache_control: { type: "ephemeral" } },
      ],
      messages: [
        {
          role: "user",
          content: `Channel: ${draft.channel}\n\n<draft>\n${draft.text}\n</draft>`,
        },
      ],
    });
    const result = finish(response);
    return { ...result, score: Math.max(0, Math.min(100, Math.round(result.score))) };
  } catch (err) {
    toUserError(err);
  }
}
