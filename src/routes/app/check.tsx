import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod/v4";
import { runCheck } from "@/server/functions";
import { brandsQuery, usageQuery } from "@/lib/queries";
import { CHANNELS, DRAFT_MAX_CHARS, RECHECK_KEY } from "@/lib/voice";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  buttonClass,
} from "@/components/app/ui";

export const Route = createFileRoute("/app/check")({
  validateSearch: z.object({ brand: z.string().optional() }),
  component: NewCheck,
});

function NewCheck() {
  const { brand: brandParam } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const brands = useQuery(brandsQuery());
  const usage = useQuery(usageQuery());
  const [brandId, setBrandId] = useState("");
  const [channel, setChannel] = useState<string>("email");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECHECK_KEY);
      if (raw) {
        const prev = JSON.parse(raw) as {
          text?: string;
          brandId?: string;
          channel?: string;
          title?: string;
        };
        sessionStorage.removeItem(RECHECK_KEY);
        if (prev.text) setText(prev.text);
        if (prev.brandId) setBrandId(prev.brandId);
        if (prev.channel) setChannel(prev.channel);
        if (prev.title) setTitle(prev.title);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!brands.data?.length || brandId) return;
    const wanted = brands.data.find((b) => b.id === brandParam);
    setBrandId((wanted ?? brands.data[0]!).id);
  }, [brands.data, brandParam, brandId]);

  const outOfChecks =
    usage.data && usage.data.allowance !== null && usage.data.used >= usage.data.allowance;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { id } = await runCheck({ data: { brandId, text, channel, title } });
      await queryClient.invalidateQueries({ queryKey: ["checks"] });
      await queryClient.invalidateQueries({ queryKey: ["usage"] });
      navigate({ to: "/app/checks/$checkId", params: { checkId: id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The check didn't run. Try again.");
      setBusy(false);
    }
  }

  if (brands.isPending) return <Spinner />;
  if (!brands.data?.length) {
    return (
      <>
        <PageHeader eyebrow="Checker" title="Check a draft" />
        <Card className="flex flex-col items-start gap-4 p-8">
          <p className="text-[16px] text-muted">You need a brand profile to check against first.</p>
          <Link to="/app/brands/new" className={buttonClass("ink")}>
            Create a brand profile
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Checker" title="Check a draft">
        {usage.data && (
          <span className="text-[14px] text-secondary">
            {usage.data.allowance === null
              ? `${usage.data.used} checks this month`
              : `${Math.max(0, usage.data.allowance - usage.data.used)} of ${usage.data.allowance} checks left this month`}
          </span>
        )}
      </PageHeader>
      <form onSubmit={submit} className="flex max-w-[860px] flex-col gap-6" noValidate>
        {error && <Alert>{error}</Alert>}
        {outOfChecks && (
          <Alert tone="info">
            You've used this month's checks.{" "}
            <Link to="/app/billing" className="font-medium underline hover:text-red">
              See plans
            </Link>
            .
          </Alert>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          <Field label="Brand" htmlFor="brand">
            <Select id="brand" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              {brands.data.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Channel" htmlFor="channel">
            <Select id="channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
              {CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title (optional)" htmlFor="title">
            <Input
              id="title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spring launch email"
            />
          </Field>
        </div>
        <Field
          label="Draft"
          htmlFor="draft"
          hint={`${text.length.toLocaleString()} / ${DRAFT_MAX_CHARS.toLocaleString()} characters`}
        >
          <Textarea
            id="draft"
            rows={12}
            value={text}
            maxLength={DRAFT_MAX_CHARS}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an email, post, ad or landing page section…"
            className="font-serif text-[18px]"
          />
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={busy || !text.trim() || !brandId || Boolean(outOfChecks)}>
            {busy ? "Checking…" : "Check draft"}
          </Button>
          {busy && <Spinner label="Reading it like your best editor would…" />}
        </div>
      </form>
    </>
  );
}
