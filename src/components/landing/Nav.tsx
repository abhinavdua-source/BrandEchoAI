import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const links = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper">
      <div className="container-desk flex items-center justify-between gap-6 py-3">
        <a
          href="#top"
          aria-label="BrandEcho AI, back to top"
          className="flex min-h-11 items-center"
        >
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="flex min-h-11 items-center px-3 text-[15px] text-ink underline-offset-4 hover:underline"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#"
            className="flex min-h-11 items-center px-3 text-[15px] text-ink underline-offset-4 hover:underline"
          >
            Log in
          </a>
          <Button asChild size="sm" className="ml-3">
            <a href="#signup">Start free</a>
          </Button>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 px-1 font-mono text-[13px] tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-rule lg:hidden">
          <div className="container-desk flex flex-col pb-6">
            {[...links, { label: "Log in", href: "#" }].map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-rule text-[16px] text-ink"
              >
                {l.label}
              </a>
            ))}
            <Button asChild className="mt-5">
              <a href="#signup" onClick={() => setOpen(false)}>
                Start free
              </a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
