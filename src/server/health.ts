import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/integrations/supabase/public-config";
import { MODEL } from "./claude";

/*
 * Readiness report for the deployed server: is the Claude key set, can this
 * server reach the configured model, and can it read the database. Uses only
 * free calls (model lookup, a public table) and returns no secrets.
 */
export async function healthReport() {
  const report = {
    anthropicKeySet: Boolean(process.env["ANTHROPIC_API_KEY"]),
    claudeReachable: false,
    model: MODEL,
    databaseReachable: false,
    checkedAt: new Date().toISOString(),
  };

  if (report.anthropicKeySet) {
    try {
      await new Anthropic().models.retrieve(MODEL);
      report.claudeReachable = true;
    } catch (err) {
      console.error("[health] Claude lookup failed", err instanceof Error ? err.message : err);
    }
  }

  try {
    const supabase = createClient(
      process.env["SUPABASE_URL"] || PUBLIC_SUPABASE_URL,
      process.env["SUPABASE_PUBLISHABLE_KEY"] || PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false } },
    );
    const { error } = await supabase.from("plans").select("id").limit(1);
    report.databaseReachable = !error;
  } catch (err) {
    console.error("[health] database check failed", err);
  }

  return report;
}
