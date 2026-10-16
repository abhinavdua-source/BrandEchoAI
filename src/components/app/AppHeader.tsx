import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/landing/Logo";

const links = [
  { to: "/app", label: "Dashboard", exact: true },
  { to: "/app/check", label: "New check", exact: false },
  { to: "/app/brands", label: "Brands", exact: false },
  { to: "/app/history", label: "History", exact: false },
  { to: "/app/billing", label: "Plan", exact: false },
] as const;

const linkClass =
  "text-ink hover:text-red data-[status=active]:font-semibold data-[status=active]:text-red";

export function AppHeader({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/92 backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-6 px-6 py-[14px]">
        <Link to="/app" aria-label="BrandEchoAI dashboard" className="flex items-baseline">
          <Logo />
        </Link>
        <nav aria-label="App" className="hidden items-center gap-6 text-[15px] nav:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.exact }} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 text-[15px] nav:flex">
          <Link to="/app/account" className={`max-w-[200px] truncate ${linkClass}`} title={email}>
            {email}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="cursor-pointer text-ink hover:text-red"
          >
            Log out
          </button>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="app-menu"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 rounded-btn border border-outline px-3.5 text-[14px] font-medium text-ink nav:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav
          id="app-menu"
          aria-label="App"
          className="flex flex-col border-t border-rule px-6 pt-1 pb-5 text-[17px] nav:hidden"
        >
          {[...links, { to: "/app/account", label: "Account", exact: false } as const].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              onClick={() => setOpen(false)}
              className={`border-b border-rule-soft py-3 ${linkClass}`}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={signOut}
            className="py-3 text-left text-ink hover:text-red"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
