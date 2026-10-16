import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { brandsQuery, checksQuery } from "@/lib/queries";
import { CHANNELS } from "@/lib/voice";
import {
  Alert,
  Field,
  PageHeader,
  ScoreBadge,
  Select,
  Spinner,
  formatDate,
} from "@/components/app/ui";

export const Route = createFileRoute("/app/history")({
  component: History,
});

function History() {
  const [brandId, setBrandId] = useState("");
  const brands = useQuery(brandsQuery());
  const checks = useQuery(checksQuery(brandId ? { brandId } : {}));
  const standardFor = (id: string | null) =>
    brands.data?.find((b) => b.id === id)?.house_standard ?? 90;
  const channelLabel = (id: string) => CHANNELS.find((c) => c.id === id)?.label ?? "Other";

  return (
    <>
      <PageHeader eyebrow="History" title="Every check, saved">
        {brands.data && brands.data.length > 1 && (
          <div className="w-[220px]">
            <Field label="Brand" htmlFor="filter">
              <Select id="filter" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <option value="">All brands</option>
                {brands.data.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      </PageHeader>
      {checks.isPending ? (
        <Spinner />
      ) : checks.isError ? (
        <Alert>Couldn't load your history. Refresh to try again.</Alert>
      ) : checks.data.length === 0 ? (
        <p className="border-t border-ink pt-4 text-[15px] text-muted">No checks yet.</p>
      ) : (
        <ul className="flex flex-col border-t border-ink">
          {checks.data.map((c) => (
            <li key={c.id} className="border-b border-rule">
              <Link
                to="/app/checks/$checkId"
                params={{ checkId: c.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[auto_minmax(0,1fr)_160px_120px]"
              >
                <ScoreBadge score={c.score} standard={standardFor(c.brand_id)} />
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-medium">
                    {c.title || "Untitled"}
                  </span>
                  <span className="block truncate text-[14px] text-secondary">{c.verdict}</span>
                </span>
                <span className="col-start-2 text-[14px] text-secondary md:col-start-auto">
                  {c.brand_name} · {channelLabel(c.channel)}
                </span>
                <span className="col-start-2 text-[14px] text-secondary md:col-start-auto md:text-right">
                  {formatDate(c.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
