import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/app/AuthShell";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/app/ui";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Book a demo — BrandEchoAI" },
      {
        name: "description",
        content:
          "See BrandEchoAI check your own copy against your brand book. Tell us about your team.",
      },
    ],
  }),
  component: BookDemo,
});

const TEAM_SIZES = ["1-5", "6-20", "21-100", "100+"] as const;

function BookDemo() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    team_size: "",
    message: "",
  });
  // Hidden from people; bots that fill every field get a fake success.
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Add your name and a valid work email.");
      return;
    }
    if (trap) {
      setSent(true);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("demo_requests").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      team_size: form.team_size,
      message: form.message.trim(),
    });
    setBusy(false);
    if (error) {
      console.error("[demo] request failed", error.message);
      setError("Your request didn't go through. Please try again in a moment.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        title="Thanks — we'll be in touch"
        subtitle={
          <>
            We've got your request and will email <strong className="text-ink">{form.email}</strong>{" "}
            to set up a time.
          </>
        }
        footer={
          <>
            Want to try it now?{" "}
            <Link to="/signup" className="font-medium text-ink underline hover:text-red">
              Start free
            </Link>
          </>
        }
      >
        <p className="text-[15px] text-muted">
          In the demo we'll check a few of your own drafts against your brand book, live.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Book a demo"
      subtitle="See BrandEchoAI check your own copy against your brand book. Tell us a little about your team and we'll reply to set up a time."
      footer={
        <>
          Rather try it yourself?{" "}
          <Link to="/signup" className="font-medium text-ink underline hover:text-red">
            Start free
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field label="Your name" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            maxLength={120}
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
          />
        </Field>
        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </Field>
        <Field label="Company" htmlFor="company">
          <Input
            id="company"
            autoComplete="organization"
            maxLength={160}
            value={form.company}
            onChange={(e) => set("company")(e.target.value)}
          />
        </Field>
        <Field label="Team size" htmlFor="team">
          <Select
            id="team"
            value={form.team_size}
            onChange={(e) => set("team_size")(e.target.value)}
          >
            <option value="">Choose…</option>
            {TEAM_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} people
              </option>
            ))}
          </Select>
        </Field>
        <Field label="What would you like to see? (optional)" htmlFor="message">
          <Textarea
            id="message"
            rows={4}
            maxLength={2000}
            value={form.message}
            onChange={(e) => set("message")(e.target.value)}
          />
        </Field>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Request a demo"}
        </Button>
      </form>
    </AuthShell>
  );
}
