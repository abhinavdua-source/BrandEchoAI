import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { plansQuery, usageQuery } from "@/lib/queries";
import { Alert, Card, PageHeader, Spinner } from "@/components/app/ui";

export const Route = createFileRoute("/app/billing")({
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

function Billing() {
  const plans = useQuery(plansQuery());
  const usage = useQuery(usageQuery());
  if (plans.isPending || usage.isPending) return <Spinner />;
  const current = usage.data?.plan_id ?? "free";

  return (
    <>
      <PageHeader eyebrow="Plan" title="Your plan" />
      <div className="mb-8 max-w-[760px]">
        <Alert tone="info">
          Paid plans and online upgrades are coming soon. Your Free plan stays active in the
          meantime.
        </Alert>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
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
              {!isCurrent && p.id !== "free" && (
                <button
                  type="button"
                  disabled
                  className="min-h-11 cursor-not-allowed rounded-btn border border-outline text-[15px] font-medium text-secondary"
                >
                  Upgrade — coming soon
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
