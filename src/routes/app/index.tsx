import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { brandsQuery, checksQuery, plansQuery, usageQuery } from "@/lib/queries";
import {
  Card,
  PageHeader,
  ScoreBadge,
  Spinner,
  buttonClass,
  formatDate,
} from "@/components/app/ui";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const brands = useQuery(brandsQuery());
  const recent = useQuery(checksQuery({ limit: 6 }));
  const usage = useQuery(usageQuery());
  const plans = useQuery(plansQuery());
  const plan = plans.data?.find((p) => p.id === usage.data?.plan_id);
  const standardFor = (brandId: string | null) =>
    brands.data?.find((b) => b.id === brandId)?.house_standard ?? 90;

  if (brands.isPending) return <Spinner />;
  const hasBrand = Boolean(brands.data?.length);

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Your desk">
        <Link to={hasBrand ? "/app/check" : "/app/brands/new"} className={buttonClass("ink")}>
          {hasBrand ? "Check a draft" : "Create a brand profile"}
        </Link>
      </PageHeader>

      {!hasBrand && (
        <Card className="mb-10 grid gap-6 p-6 md:grid-cols-3 md:p-8">
          {[
            ["01", "Hand over the brand book", "Upload your guidelines PDF or paste them in."],
            ["02", "Review the profile", "Check the tone, vocabulary and rules we pulled out."],
            [
              "03",
              "Check your first draft",
              "Get a score, notes on every slip and a clean rewrite.",
            ],
          ].map(([n, t, d]) => (
            <div key={n} className="flex flex-col gap-2 border-t border-ink pt-4">
              <span className="font-mono text-[13px] font-medium text-red">{n}</span>
              <h2 className="font-serif text-[21px] leading-tight font-medium">{t}</h2>
              <p className="text-[15px] text-muted">{d}</p>
            </div>
          ))}
        </Card>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="eyebrow">Recent checks</h2>
            <Link to="/app/history" className="text-[14px] text-ink underline hover:text-red">
              All history
            </Link>
          </div>
          {recent.isPending ? (
            <Spinner />
          ) : recent.data?.length ? (
            <ul className="flex flex-col border-t border-ink">
              {recent.data.map((c) => (
                <li key={c.id} className="border-b border-rule">
                  <Link
                    to="/app/checks/$checkId"
                    params={{ checkId: c.id }}
                    className="flex items-center gap-4 py-4"
                  >
                    <ScoreBadge score={c.score} standard={standardFor(c.brand_id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-medium">
                        {c.title || "Untitled"}
                      </span>
                      <span className="block truncate text-[14px] text-secondary">{c.verdict}</span>
                    </span>
                    <span className="hidden shrink-0 text-[14px] text-secondary sm:block">
                      {c.brand_name} · {formatDate(c.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-ink pt-4 text-[15px] text-muted">
              No checks yet. Your results will show up here.
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3 p-6">
            <h2 className="eyebrow">This month</h2>
            {usage.data ? (
              <>
                <p className="font-serif text-[40px] leading-none">
                  {usage.data.used}
                  <span className="text-[18px] text-secondary">
                    {usage.data.allowance === null
                      ? " checks"
                      : ` / ${usage.data.allowance} checks`}
                  </span>
                </p>
                {usage.data.allowance !== null && (
                  <div className="h-1.5 rounded-[3px] bg-rule">
                    <div
                      className="h-full rounded-[3px] bg-ink"
                      style={{
                        width: `${Math.min(100, (usage.data.used / usage.data.allowance) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <p className="text-[14px] text-secondary">
                  {plan?.name ?? "Free"} plan ·{" "}
                  <Link to="/app/billing" className="text-ink underline hover:text-red">
                    Change
                  </Link>
                </p>
              </>
            ) : (
              <Spinner />
            )}
          </Card>
          <Card className="flex flex-col gap-3 p-6">
            <h2 className="eyebrow">Brands</h2>
            {brands.data?.map((b) => (
              <Link
                key={b.id}
                to="/app/brands/$brandId"
                params={{ brandId: b.id }}
                className="font-serif text-[20px] hover:text-red"
              >
                {b.name}
              </Link>
            ))}
            <Link to="/app/brands" className="text-[14px] text-ink underline hover:text-red">
              Manage brands
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
