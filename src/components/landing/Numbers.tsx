// Placeholder figures until there is real customer data to quote.
const figures = [
  { value: "[XX]%", caption: "Brand consistency" },
  { value: "[XX]%", caption: "Less editing time" },
  { value: "[X]×", caption: "Faster content production" },
];

export function Numbers() {
  return (
    <section aria-labelledby="numbers-title" className="pt-20 pb-10 lg:pt-28 lg:pb-14">
      <div className="container-desk">
        <h2 id="numbers-title" className="text-label">
          By the numbers
        </h2>
        <dl className="mt-6 grid border-y border-ink md:grid-cols-3">
          {figures.map((f, i) => (
            <div
              key={f.caption}
              className={`flex flex-col-reverse gap-3 border-b border-rule py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 ${
                i > 0 ? "md:border-l md:border-rule" : ""
              }`}
            >
              <dt className="font-mono text-[13px] tracking-[0.08em] text-graphite uppercase">
                {f.caption}
              </dt>
              <dd className="font-serif text-[64px] leading-none text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
