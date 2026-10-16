import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/app/AuthShell";
import { Alert, Button, Field, Input } from "@/components/app/ui";
import { siteUrl } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — BrandEchoAI" }] }),
  ssr: false,
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: siteUrl("/app") },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/app" });
    } else {
      setSentTo(email);
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={
          <>
            We sent a confirmation link to <strong className="text-ink">{sentTo}</strong>. Open it
            to finish creating your account.
          </>
        }
        footer={
          <>
            Wrong address?{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-medium text-ink underline hover:text-red"
            >
              Start again
            </button>
          </>
        }
      >
        <p className="text-[15px] text-muted">
          The link expires in 24 hours. Check spam if it doesn't arrive.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start free"
      subtitle="10 checks a month and one brand profile. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline hover:text-red">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={busy || !email || !password}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-[13px] leading-[1.5] text-secondary">
          By creating an account you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
