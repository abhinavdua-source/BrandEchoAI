import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod/v4";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/app/AuthShell";
import { Alert, Button, Field, Input } from "@/components/app/ui";
import { safeRedirect } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — BrandEchoAI" }] }),
  ssr: false,
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LogIn,
});

function LogIn() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "That email and password don't match an account."
          : error.message,
      );
      return;
    }
    navigate({ to: safeRedirect(redirect) });
  }

  return (
    <AuthShell
      title="Log in"
      footer={
        <>
          New to BrandEchoAI?{" "}
          <Link to="/signup" className="font-medium text-ink underline hover:text-red">
            Start free
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="-mt-2 text-right">
          <Link to="/forgot-password" className="text-[14px] text-ink underline hover:text-red">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={busy || !email || !password}>
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
