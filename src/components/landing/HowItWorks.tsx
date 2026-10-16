const steps = [
  {
    title: "Hand over the brand book",
    body: "PDF guidelines, tone docs, banned words. Upload once.",
  },
  {
    title: "It learns your voice",
    body: "Tone, vocabulary, values and how you never sound.",
  },
  {
    title: "Every draft gets marked",
    body: "A score from 0 to 100 and a note on every slip.",
  },
  {
    title: "Rewritten on-brand",
    body: "Accept the clean copy, or edit it yourself.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="py-20 lg:py-28">
      <div className="container-desk">
        <p className="text-label">How it works</p>
        <h2 id="how-title" className="text-h2 mt-5">
          How the desk works
        </h2>

        <ol className="mt-14 grid border-t border-ink sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="border-b border-rule pt-6 pb-8">
              <span className="font-mono text-[15px] text-red">0{i + 1}</span>
              <h3 className="text-h3 mt-4">{s.title}</h3>
              <p className="mt-3 text-[16px] leading-[1.55] text-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
