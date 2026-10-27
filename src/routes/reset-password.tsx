import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/app/AuthShell";
import { Alert, Button, Field, Input, Spinner } from "@/components/app/ui";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — BrandEchoAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  ssr: false,
  component: ResetPassword,
});

// The emailed link signs the user in with a recovery session (read from the
// URL by the Supabase client); then they can set a new password.
function ResetPassword() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else navigate({ to: "/app" });
  }

  return (
    <AuthShell title="Choose a new password">
      {loading ? (
        <Spinner />
      ) : !session ? (
        <Alert>
          This reset link is invalid or has expired.{" "}
          <Link to="/forgot-password" className="font-medium underline hover:text-red">
            Request a new one
          </Link>
          .
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {error && <Alert>{error}</Alert>}
          <Field label="New password" htmlFor="password" hint="At least 8 characters.">
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
          <Button type="submit" disabled={busy || !password}>
            {busy ? "Saving…" : "Save password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
