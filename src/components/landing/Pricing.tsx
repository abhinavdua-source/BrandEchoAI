import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/mo",
    features: ["100 checks", "Brand profile", "Rewrites"],
    cta: { label: "Start free", href: "#signup" },
    recommended: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    features: ["Everything in Starter", "Unlimited checks", "Team review", "API access"],
    cta: { label: "Start free trial", href: "#signup" },
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
    <section id="pricing" aria-labelledby="pricing-title" className="py-20 lg:py-28">
      <div className="container-desk">
        <p className="text-label">Pricing</p>
        <h2 id="pricing-title" className="text-h2 mt-5 max-w-3xl text-balance">
          Simple plans that scale with your brand
        </h2>

        <div className="mt-14 grid md:grid-cols-3">
          {plans.map((p, i) => (
            <article
              key={p.name}
              aria-labelledby={`plan-${i}`}
              className={`flex flex-col pb-10 md:px-8 md:first:pl-0 md:last:pr-0 ${
                i > 0 ? "md:border-l md:border-l-rule" : ""
              } ${p.recommended ? "border-t-4 border-t-ink pt-6" : "border-t border-t-rule pt-[27px]"}`}
            >
              {/* Label row is kept on every plan (empty when not recommended) so prices align. */}
              <p
                aria-hidden={!p.recommended}
                className="min-h-[18px] font-mono text-[13px] leading-[18px] tracking-[0.08em] text-ink uppercase"
              >
                {p.recommended ? "Recommended" : ""}
              </p>
              <h3 id={`plan-${i}`} className="text-h3 mt-2">
                {p.name}
              </h3>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-[56px] leading-none text-ink">{p.price}</span>
                {p.period && (
                  <span className="font-mono text-[15px] text-graphite">{p.period}</span>
                )}
              </p>
              <ul className="mt-8 flex-1 border-t border-rule">
                {p.features.map((f) => (
                  <li key={f} className="border-b border-rule py-3 text-[16px] text-body">
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.recommended ? "default" : "outline"}
                className="mt-8 w-full"
              >
                <a href={p.cta.href}>{p.cta.label}</a>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
