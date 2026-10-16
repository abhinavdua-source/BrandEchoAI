import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brandQuery, checkQuery } from "@/lib/queries";
import { CHANNELS, RECHECK_KEY } from "@/lib/voice";
import { CheckResultView } from "@/components/app/CheckResultView";
import { Alert, Button, PageHeader, Spinner, buttonClass, formatDate } from "@/components/app/ui";

export const Route = createFileRoute("/app/checks/$checkId")({
  component: CheckPage,
});

function CheckPage() {
  const { checkId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const check = useQuery(checkQuery(checkId));
  const brand = useQuery({
    ...brandQuery(check.data?.brand_id ?? ""),
    enabled: Boolean(check.data?.brand_id),
  });

  if (check.isPending) return <Spinner />;
  if (check.isError || !check.data) {
    return (
      <Alert>
        This check couldn't be found.{" "}
        <Link to="/app/history" className="font-medium underline">
          Back to history
        </Link>
      </Alert>
    );
  }
  const c = check.data;
  const standard = brand.data?.house_standard ?? 90;

  function recheck(text: string) {
    try {
      sessionStorage.setItem(
        RECHECK_KEY,
        JSON.stringify({ text, brandId: c.brand_id, channel: c.channel, title: c.title }),
      );
    } catch {
      /* storage unavailable */
    }
    navigate({ to: "/app/check" });
  }

  async function remove() {
    if (!window.confirm("Delete this check from your history?")) return;
    const { error } = await supabase.from("checks").delete().eq("id", checkId);
    if (error) return window.alert(error.message);
    await queryClient.invalidateQueries({ queryKey: ["checks"] });
    navigate({ to: "/app/history" });
  }

  const channel = CHANNELS.find((ch) => ch.id === c.channel)?.label ?? "Other";

  return (
    <>
      <PageHeader
        eyebrow={`${c.brand_name} · ${channel} · ${formatDate(c.created_at)}`}
        title={c.title || "Check result"}
      >
        <Button variant="outline" onClick={() => recheck(c.draft)}>
          Edit original
        </Button>
        <Link to="/app/check" className={buttonClass("ink")}>
          New check
        </Link>
      </PageHeader>
      <div className="max-w-[860px]">
        <CheckResultView
          draft={c.draft}
          issues={c.issues}
          rewrite={c.rewrite}
          score={c.score}
          standard={standard}
          verdict={c.verdict}
          onRecheck={recheck}
        />
        <div className="mt-8 flex justify-end">
          <Button variant="danger" onClick={remove}>
            Delete check
          </Button>
        </div>
      </div>
    </>
  );
}
