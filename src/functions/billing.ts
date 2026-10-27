import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod/v4";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { UserFacingError } from "@/server/claude";
import {
  billingAvailable,
  changePlan,
  createCheckout,
  customerPortalLink,
  syncFromDodo,
} from "@/server/billing";

/* Billing server functions for the Plan page. All require a signed-in user. */

function rethrow(err: unknown): never {
  if (err instanceof UserFacingError) throw new Error(err.message);
  console.error("[billing]", err);
  throw new Error("Something went wrong with billing. Please try again.");
}

function siteOrigin() {
  const req = getRequest();
  const origin = req?.headers.get("origin");
  if (origin) return origin;
  const host = req?.headers.get("x-forwarded-host") ?? req?.headers.get("host");
  return host ? `https://${host}` : "https://brandechoai.studio";
}

const PlanInput = z.object({ plan: z.enum(["starter", "professional"]) });

/** Whether upgrade buttons should be live on this deployment. */
export const getBillingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => billingAvailable());

/** Returns a Dodo checkout URL for the chosen plan. */
export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(PlanInput)
  .handler(async ({ data, context }) => {
    try {
      const email = context.claims.email;
      if (typeof email !== "string" || !email) {
        throw new UserFacingError("Your account needs an email address to upgrade.");
      }
      const url = await createCheckout({
        userId: context.userId,
        email,
        plan: data.plan,
        origin: siteOrigin(),
      });
      return { url };
    } catch (err) {
      rethrow(err);
    }
  });

/** Switches an active subscription to the other paid plan. */
export const switchPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(PlanInput)
  .handler(async ({ data, context }) => {
    try {
      await changePlan({ userId: context.userId, plan: data.plan });
      return { ok: true };
    } catch (err) {
      rethrow(err);
    }
  });

/** Returns a link to Dodo's customer portal. */
export const openBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      return { url: await customerPortalLink(context.userId) };
    } catch (err) {
      rethrow(err);
    }
  });

/** Re-reads the user's subscription from Dodo (backstop for missed webhooks). */
export const syncBilling = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      return await syncFromDodo(context.userId);
    } catch (err) {
      rethrow(err);
    }
  });
