import { z } from "zod/v4";

/*
 * Shapes shared by the server (Claude structured output) and the app UI.
 */

export const ISSUE_CATEGORIES = [
  "tone",
  "vocabulary",
  "claim",
  "clarity",
  "value_prop",
  "style",
  "grammar",
] as const;

export const ISSUE_LABELS: Record<(typeof ISSUE_CATEGORIES)[number], string> = {
  tone: "Tone",
  vocabulary: "Vocabulary",
  claim: "Unproven claim",
  clarity: "Clarity",
  value_prop: "Value proposition",
  style: "Style",
  grammar: "Grammar",
};

export const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "social", label: "Social post" },
  { id: "web", label: "Website copy" },
  { id: "ad", label: "Ad" },
  { id: "blog", label: "Blog / article" },
  { id: "other", label: "Other" },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];

export const BrandProfileSchema = z.object({
  name: z.string().describe("The brand or company name as written in the guidelines."),
  summary: z
    .string()
    .describe("Two or three sentences describing how the brand sounds, in plain language."),
  attributes: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .describe(
      "4 to 6 short voice attributes, e.g. {label: 'Tone', value: 'Confident'}, {label: 'Register', value: 'Plain-spoken'}, {label: 'Never', value: 'Hype words'}.",
    ),
  preferred_terms: z.array(z.string()).describe("Words or phrases the brand prefers to use."),
  banned_terms: z.array(z.string()).describe("Words or phrases the brand avoids."),
  rules: z
    .array(z.string())
    .describe("Concrete do / don't writing rules, each one short and imperative."),
  example_copy: z
    .string()
    .describe("A short excerpt of on-brand example copy from the guidelines, or empty."),
});

export type BrandProfile = z.infer<typeof BrandProfileSchema>;

export const CheckResultSchema = z.object({
  score: z
    .number()
    .int()
    .describe(
      "Consistency with the brand voice from 0 (nothing like it) to 100 (perfectly on-brand).",
    ),
  verdict: z.string().describe("One sentence summarising the result for the writer."),
  issues: z
    .array(
      z.object({
        quote: z
          .string()
          .describe("The exact off-brand phrase, copied character-for-character from the draft."),
        category: z.enum(ISSUE_CATEGORIES),
        note: z.string().describe("Why it is off-brand, in under 12 words."),
        suggestion: z.string().describe("A replacement phrase in the brand's voice, or empty."),
      }),
    )
    .describe("Each off-brand phrase, in the order it appears. Empty if the draft is on-brand."),
  rewrite: z
    .string()
    .describe("The full draft rewritten in the brand's voice, keeping its meaning and length."),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;
export type CheckIssue = CheckResult["issues"][number];

export type Attribute = { label: string; value: string };

export const DRAFT_MAX_CHARS = 6000;
export const GUIDELINES_MAX_CHARS = 120_000;
// Vercel caps request bodies at ~4.5 MB; base64 adds a third, so keep PDFs under 3 MB.
export const PDF_MAX_BYTES = 3 * 1024 * 1024;

// "Edit & recheck" hands a draft to the checker through sessionStorage (too long for a URL).
export const RECHECK_KEY = "brandecho:recheck";
