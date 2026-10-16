import { Reveal } from "./Reveal";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/mo",
    features: ["100 checks a month", "Brand profile", "Rewrites"],
    cta: { label: "Start free", href: "/signup" },
    recommended: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    features: ["Everything in Starter", "Unlimited checks", "Team review", "API access"],
    cta: { label: "Start free", href: "/signup" },
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited everything", "Dedicated support", "Custom models"],
    cta: { label: "Book a demo", href: "#demo" },
    recommended: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="border-t border-rule bg-tint">
      <div className="container-site section-y flex flex-col gap-10">
        <Reveal className="flex flex-col gap-3.5">
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title" className="text-h2">
            Simple plans that scale with your brand
          </h2>
        </Reveal>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] items-stretch gap-4">
          {plans.map((p, i) => {
            const dark = p.recommended;
            return (
              <Reveal
                as="article"
                key={p.name}
                index={i}
                aria-labelledby={`plan-${i}`}
                className={`flex flex-col gap-5 rounded-card p-7 ${
                  dark ? "bg-ink text-on-dark" : "border border-[var(--rule-card)] bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 id={`plan-${i}`} className="text-[17px] font-semibold">
                    {p.name}
                  </h3>
                  {dark && (
                    <span className="rounded-tag bg-red px-2 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-white uppercase">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="flex items-baseline gap-1">
                  <span className="font-serif text-[52px] leading-none">{p.price}</span>
                  {p.period && (
                    <span
                      className={`text-[15px] ${dark ? "text-on-dark-muted" : "text-secondary"}`}
                    >
                      {p.period}
                    </span>
                  )}
                </p>
                <ul
                  className={`m-0 flex flex-1 list-none flex-col gap-2.5 border-t p-0 pt-4 text-[15px] ${
                    dark ? "border-ink-soft" : "border-rule-soft"
                  }`}
                >
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a
                  href={p.cta.href}
                  className={`rounded-btn p-3 text-center font-medium transition-colors duration-200 ${
                    dark
                      ? "bg-on-dark text-ink hover:bg-red hover:text-white"
                      : "border border-ink text-ink hover:bg-ink hover:text-on-dark"
                  }`}
                >
                  {p.cta.label}
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
