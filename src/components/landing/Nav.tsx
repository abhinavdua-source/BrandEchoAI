import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const links = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];


export function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/92 backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-6 px-6 py-[14px]">
        <a href="#top" aria-label="BrandEchoAI home" className="flex items-baseline">
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] nav:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink hover:text-red">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-[18px] text-[15px] nav:flex">
          <Link to="/login" className="text-ink hover:text-red">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-btn bg-ink px-4 py-2.5 font-medium text-on-dark transition-colors duration-200 hover:bg-red hover:text-white"
          >
            Start free
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 rounded-btn border border-outline px-3.5 text-[14px] font-medium text-ink nav:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="flex flex-col border-t border-rule px-6 pt-1 pb-5 text-[17px] nav:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="border-b border-rule-soft py-3 text-ink hover:text-red"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            <Link
              to="/login"
              onClick={close}
              className="flex-1 rounded-btn border border-outline p-3 text-center text-ink"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={close}
              className="flex-1 rounded-btn bg-ink p-3 text-center font-medium text-on-dark hover:bg-red hover:text-white"
            >
              Start free
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
