import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brandQuery, checksQuery } from "@/lib/queries";
import { BrandForm, type BrandDraft } from "@/components/app/BrandForm";
import {
  Alert,
  Button,
  PageHeader,
  ScoreBadge,
  Spinner,
  buttonClass,
  formatDate,
} from "@/components/app/ui";

export const Route = createFileRoute("/app/brands/$brandId")({
  component: BrandPage,
});

function BrandPage() {
  const { brandId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const brand = useQuery(brandQuery(brandId));
  const checks = useQuery(checksQuery({ brandId, limit: 10 }));
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (brand.isPending) return <Spinner />;
  if (brand.isError) return <Alert>Couldn't load this brand. Refresh to try again.</Alert>;
  if (!brand.data) {
    return (
      <Alert>
        This brand doesn't exist or was deleted.{" "}
        <Link to="/app/brands" className="font-medium underline">
          Back to brands
        </Link>
      </Alert>
    );
  }
  const b = brand.data;

  async function save(next: BrandDraft) {
    const { error } = await supabase.from("brands").update(next).eq("id", brandId);
    if (error) throw new Error(error.message);
    await queryClient.invalidateQueries({ queryKey: ["brands"] });
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove() {
    if (!window.confirm(`Delete "${b.name}"? Past checks stay in your history.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("brands").delete().eq("id", brandId);
    setDeleting(false);
    if (error) return window.alert(error.message);
    await queryClient.invalidateQueries({ queryKey: ["brands"] });
    await queryClient.invalidateQueries({ queryKey: ["can-create-brand"] });
    navigate({ to: "/app/brands" });
  }

  return (
    <>
      <PageHeader eyebrow="Brand profile" title={b.name}>
        <Link to="/app/check" search={{ brand: b.id }} className={buttonClass("ink")}>
          Check a draft
        </Link>
        <Button variant="danger" onClick={remove} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete brand"}
        </Button>
      </PageHeader>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          {saved && <Alert tone="success">Saved. New checks will use these changes.</Alert>}
          <BrandForm
            key={b.updated_at}
            initial={{
              name: b.name,
              summary: b.summary,
              attributes: b.attributes,
              preferred_terms: b.preferred_terms,
              banned_terms: b.banned_terms,
              rules: b.rules,
              example_copy: b.example_copy,
              house_standard: b.house_standard,
            }}
            submitLabel="Save changes"
            onSubmit={save}
          />
        </div>
        <aside className="flex flex-col gap-4">
          <h2 className="eyebrow">Recent checks</h2>
          {checks.data?.length ? (
            <ul className="flex flex-col border-t border-ink">
              {checks.data.map((c) => (
                <li key={c.id} className="border-b border-rule">
                  <Link
                    to="/app/checks/$checkId"
                    params={{ checkId: c.id }}
                    className="flex items-center gap-3 py-3"
                  >
                    <ScoreBadge score={c.score} standard={b.house_standard} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">{c.title || "Untitled"}</span>
                      <span className="text-[13px] text-secondary">{formatDate(c.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-muted">No checks with this brand yet.</p>
          )}
        </aside>
      </div>
    </>
  );
}
