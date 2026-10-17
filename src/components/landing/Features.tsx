import { Reveal, RevealLines } from "./Reveal";

const features = [
  {
    name: "Brand voice analysis",
    body: "Every sentence is read against your tone, vocabulary and values.",
  },
  {
    name: "Consistency score",
    body: "A score from 0 to 100, so on-brand stops being a matter of opinion.",
  },
  { name: "Instant rewrites", body: "Clean, on-brand copy for any paragraph in seconds." },
  {
    name: "Brand library",
    body: "Guidelines, approved phrases and banned words, kept in one place.",
  },
  { name: "Team review", body: "Writers, editors and brand leads work from the same standard." },
  { name: "Version history", body: "Every draft, score and rewrite is saved for comparison." },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title">
      <div className="container-site section-y flex flex-col gap-10">
        <div className="flex flex-col gap-3.5">
          <Reveal as="p" className="eyebrow">
            Features
          </Reveal>
          <RevealLines as="h2" id="features-title" className="text-h2" text="What's on the desk" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] border-t border-l border-t-ink border-l-rule">
          {features.map((f, i) => (
            <Reveal
              key={f.name}
              index={i % 3}
              className="flex flex-col gap-2 border-r border-b border-rule px-6 pt-6 pb-7"
            >
              <h3 className="text-[17px] font-semibold">{f.name}</h3>
              <p className="text-[15px] leading-[1.5] text-muted">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
