import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";

/** Frame for the sign-up / log-in pages: site header, one focused column. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-[14px]">
          <Link to="/" aria-label="BrandEchoAI home" className="flex items-baseline">
            <Logo />
          </Link>
          <Link to="/" className="text-[15px] text-ink hover:text-red">
            Back to site
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 py-[clamp(40px,8vw,96px)]">
        <div className="w-full max-w-[420px]">
          <h1 className="font-serif text-[clamp(32px,4vw,40px)] leading-[1.08] font-normal tracking-[-0.02em]">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-[16px] leading-[1.55] text-muted">{subtitle}</p>}
          <div data-clarity-mask="True" className="mt-8">
            {children}
          </div>
          {footer && (
            <div className="mt-8 border-t border-rule pt-6 text-[15px] text-muted">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
