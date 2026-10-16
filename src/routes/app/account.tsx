import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Alert, Button, Card, Field, Input, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/app/account")({
  component: Account,
});

function Account() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setMsg({ tone: "error", text: "Use at least 8 characters." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    setPassword("");
    setMsg(
      error
        ? { tone: "error", text: error.message }
        : { tone: "success", text: "Password updated." },
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Account settings" />
      <div className="flex max-w-[560px] flex-col gap-6">
        <Card className="flex flex-col gap-2 p-6">
          <h2 className="eyebrow">Signed in as</h2>
          <p className="text-[17px]">{user?.email}</p>
        </Card>
        <Card className="p-6">
          <form onSubmit={changePassword} className="flex flex-col gap-4" noValidate>
            <h2 className="eyebrow">Change password</h2>
            {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
            <Field label="New password" htmlFor="new-password" hint="At least 8 characters.">
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <div>
              <Button type="submit" disabled={busy || !password}>
                {busy ? "Saving…" : "Update password"}
              </Button>
            </div>
          </form>
        </Card>
        <div>
          <Button variant="outline" onClick={signOut}>
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}
