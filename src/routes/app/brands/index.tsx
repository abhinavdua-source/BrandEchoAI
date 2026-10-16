import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { brandsQuery, canCreateBrandQuery } from "@/lib/queries";
import { Alert, Card, PageHeader, Spinner, buttonClass, formatDate } from "@/components/app/ui";

export const Route = createFileRoute("/app/brands/")({
  component: Brands,
});

function Brands() {
  const brands = useQuery(brandsQuery());
  const canCreate = useQuery(canCreateBrandQuery());

  return (
    <>
      <PageHeader eyebrow="Brand library" title="Brand profiles">
        {canCreate.data === false ? (
          <Link to="/app/billing" className={buttonClass("outline")}>
            Upgrade to add more brands
          </Link>
        ) : (
          <Link to="/app/brands/new" className={buttonClass("ink")}>
            New brand
          </Link>
        )}
      </PageHeader>

      {brands.isPending ? (
        <Spinner />
      ) : brands.isError ? (
        <Alert>Couldn't load your brands. Refresh to try again.</Alert>
      ) : brands.data.length === 0 ? (
        <Card className="flex flex-col items-start gap-4 p-8">
          <h2 className="font-serif text-[26px] leading-tight">Start with your brand book</h2>
          <p className="max-w-[560px] text-[16px] leading-[1.55] text-muted">
            Upload your guidelines PDF or paste them in. BrandEchoAI pulls out your tone, vocabulary
            and rules, and you can edit anything before saving.
          </p>
          <Link to="/app/brands/new" className={buttonClass("ink")}>
            Create your first brand
          </Link>
        </Card>
      ) : (
        <ul className="flex flex-col border-t border-ink">
          {brands.data.map((b) => (
            <li key={b.id} className="border-b border-rule">
              <Link
                to="/app/brands/$brandId"
                params={{ brandId: b.id }}
                className="grid gap-3 py-5 hover:text-ink md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] md:items-center"
              >
                <span className="font-serif text-[22px] leading-tight">{b.name}</span>
                <span className="flex flex-wrap gap-2">
                  {b.attributes.slice(0, 4).map((a) => (
                    <span
                      key={a.label}
                      className="rounded-tag bg-tint px-2 py-1 text-[13px] text-ink"
                    >
                      <span className="text-secondary">{a.label}:</span> {a.value}
                    </span>
                  ))}
                </span>
                <span className="text-[14px] text-secondary">
                  Updated {formatDate(b.updated_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
