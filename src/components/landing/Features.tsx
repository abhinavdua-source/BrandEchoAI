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
    <section id="features" aria-labelledby="features-title" className="py-20 lg:py-28">
      <div className="container-desk grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <p className="text-label">Features</p>
          <h2 id="features-title" className="text-h2 mt-5 text-balance">
            What's on the desk
          </h2>
        </div>

        <dl className="border-t border-ink">
          {features.map((f) => (
            <div
              key={f.name}
              className="grid gap-2 border-b border-rule py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:gap-8"
            >
              <dt className="font-serif text-[24px] leading-[1.25] text-ink">{f.name}</dt>
              <dd className="text-[16px] leading-[1.55] text-body sm:pt-1">{f.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
