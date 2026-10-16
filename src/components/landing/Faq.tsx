const faqs = [
  {
    q: "How does BrandEcho AI learn my brand?",
    a: "You upload your guidelines, tone notes and a few pieces of copy you're proud of. BrandEcho AI builds a brand profile from them and checks every draft against it.",
  },
  {
    q: "Can I upload existing guidelines?",
    a: "Yes. PDFs, documents and links all work. You can review and edit everything it picks up before it's used.",
  },
  {
    q: "Does it support multiple brands?",
    a: "Yes. Create a separate profile for each brand or sub-brand and choose which one a draft is checked against.",
  },
  {
    q: "Can my team collaborate?",
    a: "On the Professional plan, your whole team shares one brand library, one set of checks and one version history.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-20 lg:py-28">
      <div className="container-desk grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <p className="text-label">FAQ</p>
          <h2 id="faq-title" className="text-h2 mt-5">
            Questions, answered
          </h2>
        </div>

        <div className="border-t border-ink">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-rule">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-6 font-serif text-[22px] leading-[1.3] text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="font-mono text-[20px] text-ink">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-[16px] leading-[1.55] text-body">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
