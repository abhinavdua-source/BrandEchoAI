import DodoPayments from "dodopayments";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { UserFacingError } from "./claude";

/*
 * Billing through Dodo Payments (merchant of record). Server-only.
 *
 * Flow: the app asks for a checkout -> the customer pays on Dodo's page ->
 * Dodo sends signed webhooks -> applyWebhook() updates public.subscriptions,
 * which sets the user's plan limits. The browser never writes plans.
 *
 * Secrets (Vercel env): DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_WEBHOOK_SECRET,
 * SUPABASE_SERVICE_ROLE_KEY. Mode: DODO_PAYMENTS_ENVIRONMENT = test_mode | live_mode.
 */

export type PaidPlan = "starter" | "professional";
type Mode = "test_mode" | "live_mode";

export const MODE: Mode =
  process.env["DODO_PAYMENTS_ENVIRONMENT"] === "live_mode" ? "live_mode" : "test_mode";

// Product IDs from the Dodo dashboard, per mode. Not secret.
const PRODUCTS: Record<Mode, Record<PaidPlan, string>> = {
  test_mode: {
    starter: "pdt_0NqCZSBZYVSUvGfvHdZvW",
    professional: "pdt_0NqCZgysviJSYCAgxXSho",
  },
  live_mode: {
    // Fill in once the live products exist in Dodo.
    starter: "",
    professional: "",
  },
};

export function planForProduct(productId: string): PaidPlan | null {
  const entry = Object.entries(PRODUCTS[MODE]).find(([, id]) => id && id === productId);
  return (entry?.[0] as PaidPlan | undefined) ?? null;
}

/**
 * Upgrades are offered in live mode, and in test mode everywhere except the
 * production site (so nobody upgrades for free with a test card).
 */
export function billingAvailable() {
  const configured = Boolean(process.env["DODO_PAYMENTS_API_KEY"] && PRODUCTS[MODE].starter);
  const testOnProduction = MODE === "test_mode" && process.env["VERCEL_ENV"] === "production";
  return { enabled: configured && !testOnProduction, mode: MODE };
}

let _dodo: DodoPayments | undefined;
function dodo() {
  if (!process.env["DODO_PAYMENTS_API_KEY"]) {
    throw new UserFacingError("Payments aren't set up yet. Please try again later.");
  }
  _dodo ??= new DodoPayments({
    bearerToken: process.env["DODO_PAYMENTS_API_KEY"],
    environment: MODE,
  });
  return _dodo;
}

function toUserError(err: unknown, action: string): never {
  if (err instanceof UserFacingError) throw err;
  if (err instanceof DodoPayments.APIError) {
    console.error(`[billing] ${action} failed: ${err.status}`, err.message);
  } else {
    console.error(`[billing] ${action} failed`, err);
  }
  throw new UserFacingError("The payment page couldn't be opened. Please try again.");
}

async function subscriptionRow(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** The user's Dodo customer id, creating the Dodo customer on first use. */
async function ensureCustomer(userId: string, email: string) {
  const row = await subscriptionRow(userId);
  if (row?.provider === "dodo" && row.provider_customer_id) return row.provider_customer_id;

  const customer = await dodo().customers.create({
    email,
    name: email.split("@")[0] || email,
    metadata: { user_id: userId },
  });
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      { user_id: userId, provider: "dodo", provider_customer_id: customer.customer_id },
      { onConflict: "user_id" },
    );
  if (error) throw error;
  return customer.customer_id;
}

/** Hosted checkout URL for a paid plan. */
export async function createCheckout(opts: {
  userId: string;
  email: string;
  plan: PaidPlan;
  origin: string;
}) {
  if (!billingAvailable().enabled) {
    throw new UserFacingError("Online upgrades aren't available yet.");
  }
  try {
    const customerId = await ensureCustomer(opts.userId, opts.email);
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: PRODUCTS[MODE][opts.plan], quantity: 1 }],
      customer: { customer_id: customerId },
      return_url: `${opts.origin}/app/billing?checkout=done`,
      metadata: { user_id: opts.userId, plan: opts.plan },
    });
    if (!session.checkout_url) throw new Error("no checkout_url");
    return session.checkout_url;
  } catch (err) {
    toUserError(err, "checkout");
  }
}

/** Switch an active paid subscription between Starter and Professional. */
export async function changePlan(opts: { userId: string; plan: PaidPlan }) {
  const row = await subscriptionRow(opts.userId);
  if (!row?.provider_subscription_id || !["active", "trialing"].includes(row.status)) {
    throw new UserFacingError("There's no active subscription to change.");
  }
  try {
    await dodo().subscriptions.changePlan(row.provider_subscription_id, {
      product_id: PRODUCTS[MODE][opts.plan],
      quantity: 1,
      proration_billing_mode: "prorated_immediately",
    });
  } catch (err) {
    toUserError(err, "change plan");
  }
}

/** Link to Dodo's customer portal (update card, invoices, cancel). */
export async function customerPortalLink(userId: string) {
  const row = await subscriptionRow(userId);
  if (!row?.provider_customer_id) {
    throw new UserFacingError("There's no billing account yet. Upgrade first.");
  }
  try {
    const session = await dodo().customers.customerPortal.create(row.provider_customer_id);
    return session.link;
  } catch (err) {
    toUserError(err, "customer portal");
  }
}

// Dodo subscription status -> our status (only active/trialing grant the plan).
const STATUS: Record<string, string> = {
  active: "active",
  pending: "pending",
  on_hold: "past_due",
  past_due: "past_due",
  paused: "paused",
  cancelled: "canceled",
  expired: "canceled",
  failed: "canceled",
};

/**
 * Verify and apply a Dodo webhook. Throws on a bad signature. Idempotent, and
 * ignores events older than the last one applied to that subscription.
 */
export async function applyWebhook(rawBody: string, headers: Record<string, string>) {
  const secret = process.env["DODO_PAYMENTS_WEBHOOK_SECRET"];
  if (!secret) throw new Error("DODO_PAYMENTS_WEBHOOK_SECRET is not set");

  const event = dodo().webhooks.unwrap(rawBody, { headers, key: secret });
  if (!event.type.startsWith("subscription.")) return { handled: false, type: event.type };

  const sub = event.data as unknown as {
    subscription_id: string;
    product_id: string;
    status: string;
    next_billing_date?: string | null;
    customer: { customer_id: string };
    metadata?: Record<string, string> | null;
  };

  // Find the user: by stored Dodo customer id, else by checkout metadata.
  const byCustomer = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, provider_event_at")
    .eq("provider", "dodo")
    .eq("provider_customer_id", sub.customer.customer_id)
    .maybeSingle();
  if (byCustomer.error) throw byCustomer.error;
  const userId = byCustomer.data?.user_id ?? sub.metadata?.["user_id"];
  if (!userId) {
    console.error("[billing] webhook for unknown customer", sub.customer.customer_id, event.type);
    return { handled: false, type: event.type };
  }

  const eventAt = new Date(event.timestamp).toISOString();
  const lastAt = byCustomer.data?.provider_event_at;
  if (lastAt && new Date(lastAt) > new Date(eventAt)) {
    return { handled: false, type: event.type, stale: true };
  }

  const plan = planForProduct(sub.product_id);
  const status = STATUS[sub.status] ?? "canceled";
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: plan && status !== "canceled" ? plan : "free",
      status: plan ? status : "canceled",
      provider: "dodo",
      provider_customer_id: sub.customer.customer_id,
      provider_subscription_id: sub.subscription_id,
      current_period_end: sub.next_billing_date ?? null,
      provider_event_at: eventAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { handled: true, type: event.type, userId, plan, status };
}

/** Readiness of billing for /api/health. Uses read-only calls; returns no secrets. */
export async function billingHealth() {
  const report = {
    mode: MODE,
    dodoKeySet: Boolean(process.env["DODO_PAYMENTS_API_KEY"]),
    dodoReachable: false,
    webhookSecretSet: Boolean(process.env["DODO_PAYMENTS_WEBHOOK_SECRET"]),
    serviceRoleWorks: false,
    upgradesEnabledHere: billingAvailable().enabled,
  };
  if (report.dodoKeySet) {
    try {
      await dodo().products.retrieve(PRODUCTS[MODE].starter);
      report.dodoReachable = true;
    } catch (err) {
      console.error("[health] Dodo lookup failed", err instanceof Error ? err.message : err);
    }
  }
  if (process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    try {
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id", { count: "exact", head: true });
      report.serviceRoleWorks = !error;
    } catch (err) {
      console.error("[health] service role check failed", err);
    }
  }
  return report;
}
