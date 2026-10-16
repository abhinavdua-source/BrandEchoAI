import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Attribute } from "@/lib/voice";
import { Alert, Button, Field, Input, Textarea } from "./ui";

export type BrandDraft = {
  name: string;
  summary: string;
  attributes: Attribute[];
  preferred_terms: string[];
  banned_terms: string[];
  rules: string[];
  example_copy: string;
  house_standard: number;
};

export const emptyBrand: BrandDraft = {
  name: "",
  summary: "",
  attributes: [
    { label: "Tone", value: "" },
    { label: "Register", value: "" },
    { label: "Rhythm", value: "" },
    { label: "Never", value: "" },
  ],
  preferred_terms: [],
  banned_terms: [],
  rules: [],
  example_copy: "",
  house_standard: 90,
};

/** Comma / Enter separated list of short terms, shown as removable pills. */
function TermsInput({
  id,
  value,
  onChange,
  tone,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  tone: "good" | "bad";
}) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));
    if (items.length) onChange([...value, ...items]);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((t) => (
            <li
              key={t}
              className={`inline-flex items-center gap-1.5 rounded-tag px-2 py-1 text-[14px] ${
                tone === "bad" ? "bg-red/10 text-ink" : "bg-green/12 text-ink"
              }`}
            >
              {t}
              <button
                type="button"
                aria-label={`Remove ${t}`}
                onClick={() => onChange(value.filter((v) => v !== t))}
                className="cursor-pointer px-0.5 text-secondary hover:text-red"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => text && add(text)}
        placeholder="Type and press Enter"
      />
    </div>
  );
}

export function BrandForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: BrandDraft;
  submitLabel: string;
  onSubmit: (brand: BrandDraft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [b, setB] = useState<BrandDraft>(initial);
  const [rulesText, setRulesText] = useState(initial.rules.join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof BrandDraft>(key: K, value: BrandDraft[K]) =>
    setB((prev) => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!b.name.trim()) {
      setError("Give the brand a name.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        ...b,
        name: b.name.trim(),
        attributes: b.attributes.filter((a) => a.label.trim() && a.value.trim()),
        rules: rulesText
          .split("\n")
          .map((r) => r.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the brand.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
      {error && <Alert>{error}</Alert>}

      <section className="grid gap-6 md:grid-cols-2">
        <Field label="Brand name" htmlFor="name">
          <Input
            id="name"
            value={b.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={120}
            required
          />
        </Field>
        <Field
          label="House standard"
          htmlFor="standard"
          hint="Drafts scoring below this are flagged as not ready to publish."
        >
          <Input
            id="standard"
            type="number"
            min={50}
            max={100}
            value={b.house_standard}
            onChange={(e) =>
              set("house_standard", Math.max(0, Math.min(100, Number(e.target.value) || 0)))
            }
          />
        </Field>
        <div className="md:col-span-2">
          <Field
            label="How the brand sounds"
            htmlFor="summary"
            hint="Two or three sentences, in plain language."
          >
            <Textarea
              id="summary"
              rows={3}
              value={b.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <fieldset className="flex flex-col gap-3">
        <legend className="pb-3 text-[14px] font-semibold text-ink">Voice attributes</legend>
        {b.attributes.map((a, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto] gap-2">
            <Input
              aria-label={`Attribute ${i + 1} label`}
              value={a.label}
              placeholder="Label"
              onChange={(e) =>
                set(
                  "attributes",
                  b.attributes.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                )
              }
            />
            <Input
              aria-label={`Attribute ${i + 1} value`}
              value={a.value}
              placeholder="e.g. Confident"
              onChange={(e) =>
                set(
                  "attributes",
                  b.attributes.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                )
              }
            />
            <Button
              variant="ghost"
              aria-label={`Remove attribute ${i + 1}`}
              onClick={() =>
                set(
                  "attributes",
                  b.attributes.filter((_, j) => j !== i),
                )
              }
            >
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button
            variant="outline"
            onClick={() => set("attributes", [...b.attributes, { label: "", value: "" }])}
          >
            Add attribute
          </Button>
        </div>
      </fieldset>

      <section className="grid gap-6 md:grid-cols-2">
        <Field label="Words we use" htmlFor="preferred">
          <TermsInput
            id="preferred"
            tone="good"
            value={b.preferred_terms}
            onChange={(v) => set("preferred_terms", v)}
          />
        </Field>
        <Field label="Words we never use" htmlFor="banned">
          <TermsInput
            id="banned"
            tone="bad"
            value={b.banned_terms}
            onChange={(v) => set("banned_terms", v)}
          />
        </Field>
      </section>

      <Field
        label="Writing rules"
        htmlFor="rules"
        hint="One rule per line, e.g. “Lead with the benefit, not the feature.”"
      >
        <Textarea
          id="rules"
          rows={6}
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
        />
      </Field>

      <Field
        label="Example of on-brand copy"
        htmlFor="example"
        hint="Optional. A paragraph you'd happily publish."
      >
        <Textarea
          id="example"
          rows={4}
          value={b.example_copy}
          onChange={(e) => set("example_copy", e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
