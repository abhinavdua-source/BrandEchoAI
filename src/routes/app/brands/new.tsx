import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractProfile } from "@/server/functions";
import { canCreateBrandQuery } from "@/lib/queries";
import { GUIDELINES_MAX_CHARS, PDF_MAX_BYTES } from "@/lib/voice";
import { BrandForm, emptyBrand, type BrandDraft } from "@/components/app/BrandForm";
import {
  Alert,
  Button,
  Card,
  Field,
  PageHeader,
  Spinner,
  Textarea,
  buttonClass,
} from "@/components/app/ui";

export const Route = createFileRoute("/app/brands/new")({
  component: NewBrand,
});

type Source = "pdf" | "text" | "blank";

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function NewBrand() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canCreate = useQuery(canCreateBrandQuery());
  const [source, setSource] = useState<Source>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<BrandDraft | null>(null);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && f.type !== "application/pdf") {
      setError("Choose a PDF file, or paste the text instead.");
      return setFile(null);
    }
    if (f && f.size > PDF_MAX_BYTES) {
      setError(
        "That PDF is over 3 MB. Paste the guidelines text instead, or upload a smaller export.",
      );
      return setFile(null);
    }
    setFile(f);
  }

  async function analyse() {
    setError(null);
    setBusy(true);
    try {
      const profile =
        source === "pdf" && file
          ? await extractProfile({ data: { kind: "pdf", base64: await readAsBase64(file) } })
          : await extractProfile({ data: { kind: "text", text } });
      setDraft({
        name: profile.name,
        summary: profile.summary,
        attributes: profile.attributes,
        preferred_terms: profile.preferred_terms,
        banned_terms: profile.banned_terms,
        rules: profile.rules,
        example_copy: profile.example_copy,
        house_standard: 90,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read those guidelines.");
    } finally {
      setBusy(false);
    }
  }

  async function save(b: BrandDraft) {
    const { data, error } = await supabase
      .from("brands")
      .insert({ ...b, guidelines_text: source === "text" ? text : "" })
      .select("id")
      .single();
    if (error) {
      throw new Error(
        error.code === "42501"
          ? "Your plan's brand limit is reached. Upgrade to add another brand."
          : error.message,
      );
    }
    await queryClient.invalidateQueries({ queryKey: ["brands"] });
    await queryClient.invalidateQueries({ queryKey: ["can-create-brand"] });
    navigate({ to: "/app/brands/$brandId", params: { brandId: data.id } });
  }

  if (canCreate.data === false) {
    return (
      <>
        <PageHeader eyebrow="Brand library" title="New brand profile" />
        <Alert tone="info">
          Your plan includes one brand profile.{" "}
          <Link to="/app/billing" className="font-medium underline hover:text-red">
            See plans
          </Link>{" "}
          to add more.
        </Alert>
      </>
    );
  }

  if (draft) {
    return (
      <>
        <PageHeader eyebrow="Review before saving" title={draft.name || "New brand profile"} />
        {source !== "blank" && (
          <div className="mb-8">
            <Alert tone="success">
              Here's what we read from your guidelines. Edit anything that's off, then save.
            </Alert>
          </div>
        )}
        <BrandForm
          initial={draft}
          submitLabel="Save brand"
          onSubmit={save}
          onCancel={() => setDraft(null)}
        />
      </>
    );
  }

  const tabs: { id: Source; label: string }[] = [
    { id: "pdf", label: "Upload PDF" },
    { id: "text", label: "Paste text" },
    { id: "blank", label: "Start blank" },
  ];

  return (
    <>
      <PageHeader eyebrow="Brand library" title="New brand profile" />
      <Card className="flex max-w-[760px] flex-col gap-6 p-6 md:p-8">
        <div
          role="group"
          aria-label="How to start"
          className="flex w-fit gap-0.5 rounded-btn bg-seg p-[3px]"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={source === t.id}
              onClick={() => {
                setSource(t.id);
                setError(null);
              }}
              className={`rounded-seg px-3 py-1.5 text-[14px] font-medium ${
                source === t.id ? "bg-surface text-ink shadow-seg" : "text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <Alert>{error}</Alert>}

        {source === "pdf" && (
          <Field label="Brand guidelines (PDF, up to 3 MB)" htmlFor="file">
            <input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={pickFile}
              className="block w-full rounded-btn border border-dashed border-outline bg-panel p-4 text-[15px] file:mr-4 file:rounded-btn file:border-0 file:bg-ink file:px-4 file:py-2 file:text-on-dark"
            />
          </Field>
        )}
        {source === "text" && (
          <Field
            label="Paste your guidelines"
            htmlFor="text"
            hint={`${text.length.toLocaleString()} / ${GUIDELINES_MAX_CHARS.toLocaleString()} characters. Tone docs, style guides, banned words — anything goes.`}
          >
            <Textarea
              id="text"
              rows={12}
              value={text}
              maxLength={GUIDELINES_MAX_CHARS}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
        )}
        {source === "blank" && (
          <p className="text-[16px] leading-[1.55] text-muted">
            Fill in the profile yourself: tone, vocabulary and rules.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {source === "blank" ? (
            <Button onClick={() => setDraft(emptyBrand)}>Continue</Button>
          ) : (
            <Button
              onClick={analyse}
              disabled={busy || (source === "pdf" ? !file : text.trim().length < 40)}
            >
              {busy ? "Reading guidelines…" : "Read guidelines"}
            </Button>
          )}
          {busy && <Spinner label="This usually takes 20–40 seconds" />}
          <Link to="/app/brands" className={buttonClass("ghost")}>
            Cancel
          </Link>
        </div>
      </Card>
    </>
  );
}
