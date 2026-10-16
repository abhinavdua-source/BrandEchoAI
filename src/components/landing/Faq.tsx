import { useState } from "react";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "How does BrandEchoAI learn my brand?",
    a: "You upload your guidelines, tone notes and a few pieces of copy you're proud of. BrandEchoAI builds a brand profile from them and checks every draft against it.",
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
  // One item open at a time; the first starts open. Clicking the open item closes it.
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-rule">
      <div className="container-site section-y grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-[clamp(32px,5vw,64px)]">
        <Reveal className="flex flex-col gap-3.5">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="text-h2">
            Questions, answered
          </h2>
        </Reveal>
        <Reveal index={1} className="flex flex-col border-t border-ink">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-rule">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent py-[18px] text-left font-sans text-[17px] font-semibold text-ink hover:text-red"
                  >
                    {f.q}
                    <span aria-hidden className="font-mono text-[20px] font-normal text-red">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-glide ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="max-w-[560px] pb-5 text-[16px] leading-[1.55] text-muted">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
