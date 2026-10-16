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
    // No About, Careers, Privacy or Terms pages yet.
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink pt-12 pb-10">
      <div className="container-desk">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[15px] leading-[1.55] text-body">
              Brand voice, checked before it ships.
            </p>
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="text-label">{c.title}</p>
              <ul className="mt-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="flex min-h-11 items-center text-[15px] text-ink underline-offset-4 hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 border-t border-rule pt-6 font-mono text-[13px] text-graphite">
          © 2026 BrandEcho AI
        </p>
      </div>
    </footer>
  );
}
