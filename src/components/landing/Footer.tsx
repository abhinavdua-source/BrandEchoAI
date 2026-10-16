import { Logo } from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    // Privacy and Terms pages don't exist yet.
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-on-dark">
      <div className="container-site flex flex-col gap-9 pt-12 pb-7">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex flex-col gap-2.5">
            <Logo tone="dark" />
            <p className="text-[15px] text-on-dark-muted">Brand voice, checked before it ships.</p>
          </div>
          <div className="flex flex-wrap gap-14 text-[15px]">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
                <span className="font-mono text-[12px] font-medium tracking-[0.08em] text-on-dark-faint uppercase">
                  {c.title}
                </span>
                {c.links.map((l) => (
                  <a key={l.label} href={l.href} className="text-on-dark hover:text-red-on-dark">
                    {l.label}
                  </a>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <p className="border-t border-ink-soft pt-5 text-[13px] text-on-dark-faint">
          © 2026 BrandEcho AI
        </p>
      </div>
    </footer>
  );
}
