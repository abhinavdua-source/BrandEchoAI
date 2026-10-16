import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CHANNELS,
  DRAFT_MAX_CHARS,
  GUIDELINES_MAX_CHARS,
  PDF_MAX_BYTES,
  type Attribute,
} from "@/lib/voice";
import { MODEL, UserFacingError, checkDraft, extractBrandProfile } from "@/server/claude";

/*
 * Server functions called from the app. Each one requires a signed-in user and
 * talks to Supabase with that user's session, so row-level security applies.
 */

function rethrow(err: unknown): never {
  // Only messages we wrote ourselves reach the browser.
  if (err instanceof UserFacingError) throw new Error(err.message);
  console.error("[server]", err);
  throw new Error("Something went wrong. Please try again.");
}

const ExtractInput = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("pdf"),
    base64: z.string().max(Math.ceil((PDF_MAX_BYTES * 4) / 3) + 16),
  }),
  z.object({ kind: z.literal("text"), text: z.string().min(40).max(GUIDELINES_MAX_CHARS) }),
]);

/** Reads uploaded or pasted guidelines and returns a draft brand profile (not saved). */
export const extractProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ExtractInput)
  .handler(async ({ data }) => {
    try {
      return await extractBrandProfile(data);
    } catch (err) {
      rethrow(err);
    }
  });

const CheckInput = z.object({
  brandId: z.uuid(),
  text: z.string().trim().min(1).max(DRAFT_MAX_CHARS),
  channel: z.enum(CHANNELS.map((c) => c.id) as [string, ...string[]]),
  title: z.string().trim().max(120).default(""),
});

/** Checks a draft against a brand, saves the result and returns its id. */
export const runCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CheckInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    try {
      const { data: usage, error: usageError } = await supabase.rpc("my_usage").single();
      if (usageError || !usage) throw usageError ?? new Error("usage unavailable");
      if (usage.allowance !== null && usage.used >= usage.allowance) {
        throw new UserFacingError(
          `You've used all ${usage.allowance} checks for this month. Upgrade your plan for more.`,
        );
      }

      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("*")
        .eq("id", data.brandId)
        .maybeSingle();
      if (brandError) throw brandError;
      if (!brand) throw new UserFacingError("That brand profile no longer exists.");

      const result = await checkDraft(
        {
          name: brand.name,
          summary: brand.summary,
          attributes: (brand.attributes as Attribute[]) ?? [],
          preferred_terms: brand.preferred_terms,
          banned_terms: brand.banned_terms,
          rules: brand.rules,
          example_copy: brand.example_copy,
          house_standard: brand.house_standard,
        },
        { text: data.text, channel: data.channel },
      );

      const { data: saved, error: saveError } = await supabase
        .from("checks")
        .insert({
          user_id: userId,
          brand_id: brand.id,
          brand_name: brand.name,
          channel: data.channel,
          title: data.title || data.text.slice(0, 60),
          draft: data.text,
          score: result.score,
          verdict: result.verdict,
          issues: result.issues,
          rewrite: result.rewrite,
          model: MODEL,
        })
        .select("id")
        .single();
      if (saveError) throw saveError;

      return { id: saved.id };
    } catch (err) {
      rethrow(err);
    }
  });
