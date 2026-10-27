import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod/v4";
import {
  getBillingStatus,
  openBillingPortal,
  startCheckout,
  switchPlan,
  syncBilling,
} from "@/functions/billing";
import { plansQuery, subscriptionQuery, usageQuery } from "@/lib/queries";
import { Alert, Button, Card, PageHeader, Spinner, formatDate } from "@/components/app/ui";

export const Route = createFileRoute("/app/billing")({
  validateSearch: z.object({ checkout: z.string().optional() }),
  component: Billing,
});

const features: Record<string, string[]> = {
  free: ["10 checks a month", "1 brand profile", "Rewrites and history"],
  starter: ["100 checks a month", "1 brand profile", "Rewrites and history"],
  professional: [
    "Unlimited checks",
    "Unlimited brand profiles",
    "Team review (soon)",
    "API access (soon)",
  ],
};

type PaidPlan = "starter" | "professional";
const isPaid = (id: string): id is PaidPlan => id === "starter" || id === "professional";

function Billing() {
  const { checkout } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const plans = useQuery(plansQuery());
  const usage = useQuery(usageQuery());
  const sub = useQuery(subscriptionQuery());
  const billing = useQuery({ queryKey: ["billing-status"], queryFn: () => getBillingStatus() });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const current = usage.data?.plan_id ?? "free";
  const paidActive = isPaid(current);
  const returnedFromCheckout = checkout === "done";

  const hasCustomer = Boolean(sub.data?.provider_customer_id);

  // Ask Dodo directly for the latest subscription state (in case a webhook
  // was missed), then refresh the plan shown here.
  async function syncNow() {
    try {
      await syncBilling();
    } catch {
      /* the webhook may still arrive */
    }
    await queryClient.invalidateQueries({ queryKey: ["usage"] });
    await queryClient.invalidateQueries({ queryKey: ["subscription"] });
  }

  // Once per visit for accounts that have been to checkout.
  useEffect(() => {
    if (hasCustomer && !returnedFromCheckout) void syncNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCustomer]);

  // After Dodo checkout: keep checking for up to ~90 seconds.
  useEffect(() => {
    if (!returnedFromCheckout || paidActive) return;
    let tries = 0;
    void syncNow();
    const id = setInterval(() => {
      tries += 1;
      void syncNow();
      if (tries >= 30) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedFromCheckout, paidActive]);

  useEffect(() => {
    if (returnedFromCheckout && paidActive) {
      setNotice("Payment confirmed. Your new plan is active.");
      queryClient.invalidateQueries({ queryKey: ["can-create-brand"] });
      navigate({ to: "/app/billing", search: {}, replace: true });
    }
  }, [returnedFromCheckout, paidActive, navigate, queryClient]);

  async function run(key: string, action: () => Promise<void>) {
    setError(null);
    setBusy(key);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(null);
    }
  }

  const upgrade = (plan: PaidPlan) =>
    run(plan, async () => {
      const { url } = await startCheckout({ data: { plan } });
      window.location.assign(url);
    });

  const changeTo = (plan: PaidPlan) =>
    run(plan, async () => {
      await switchPlan({ data: { plan } });
      setNotice("Plan change requested. It'll show here in a few seconds.");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["usage"] });
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        setBusy(null);
      }, 4000);
    });

  const portal = () =>
    run("portal", async () => {
      const { url } = await openBillingPortal();
      window.location.assign(url);
    });

  if (plans.isPending || usage.isPending || billing.isPending) return <Spinner />;
  const enabled = Boolean(billing.data?.enabled);
  const testMode = billing.data?.mode === "test_mode";

  return (
    <>
      <PageHeader eyebrow="Plan" title="Your plan">
        {sub.data?.provider_customer_id && (
          <Button variant="outline" onClick={portal} disabled={busy !== null}>
            {busy === "portal" ? "Opening…" : "Manage billing"}
          </Button>
        )}
      </PageHeader>

      <div className="mb-8 flex max-w-[760px] flex-col gap-3">
        {error && <Alert>{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}
        {returnedFromCheckout && !paidActive && (
          <Alert tone="info">
            <span className="inline-flex items-center gap-3">
              <Spinner label="Confirming your payment…" />
            </span>
          </Alert>
        )}
        {!enabled && (
          <Alert tone="info">
            Online upgrades are coming soon. Your Free plan stays active in the meantime.
          </Alert>
        )}
        {enabled && testMode && (
          <Alert tone="info">
            Test mode: no real money moves. Pay with Dodo's test card 4242 4242 4242 4242, any
            future date and any CVC.
          </Alert>
        )}
        {paidActive && sub.data?.current_period_end && (
          <p className="text-[15px] text-secondary">
            Renews on {formatDate(sub.data.current_period_end)}. Cancel or update your card under
            Manage billing.
          </p>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        {plans.data?.map((p) => {
          const isCurrent = p.id === current;
          return (
            <Card key={p.id} className={`flex flex-col gap-4 p-6 ${isCurrent ? "border-ink" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-semibold">{p.name}</h2>
                {isCurrent && (
                  <span className="rounded-tag bg-ink px-2 py-1 font-mono text-[11px] tracking-[0.06em] text-on-dark uppercase">
                    Current
                  </span>
                )}
              </div>
              <p className="flex items-baseline gap-1">
                <span className="font-serif text-[44px] leading-none">${p.price_cents / 100}</span>
                <span className="text-[15px] text-secondary">/mo</span>
              </p>
              <ul className="flex flex-1 flex-col gap-2 border-t border-rule-soft pt-4 text-[15px]">
                {(features[p.id] ?? []).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {!isCurrent && isPaid(p.id) && (
                <Button
                  variant={p.id === "professional" ? "ink" : "outline"}
                  disabled={!enabled || busy !== null}
                  onClick={() =>
                    paidActive ? changeTo(p.id as PaidPlan) : upgrade(p.id as PaidPlan)
                  }
                >
                  {!enabled
                    ? "Upgrade — coming soon"
                    : busy === p.id
                      ? paidActive
                        ? "Switching…"
                        : "Opening checkout…"
                      : paidActive
                        ? `Switch to ${p.name}`
                        : `Upgrade to ${p.name}`}
                </Button>
              )}
              {!isCurrent && p.id === "free" && paidActive && (
                <p className="text-[14px] text-secondary">
                  To move back to Free, cancel under Manage billing.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
