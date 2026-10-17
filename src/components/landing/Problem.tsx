import { Reveal, RevealLines } from "./Reveal";

const problems = [
  {
    title: "Inconsistent messaging",
    body: "Every writer brings their own tone, so customers hear five companies instead of one.",
  },
  {
    title: "Slow reviews",
    body: "Brand leads spend hours a week line-editing copy against the guidelines.",
  },
  {
    title: "Weak brand recall",
    body: "People remember brands that sound the same every time. Drift makes you forgettable.",
  },
];

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="border-t border-rule">
      <div className="container-site section-y grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-[clamp(32px,5vw,64px)]">
        <div className="flex flex-col gap-3.5">
          <Reveal as="p" className="eyebrow">
            The problem
          </Reveal>
          <RevealLines
            as="h2"
            id="problem-title"
            className="text-h2"
            text="Your brand isn't just a logo. It's every word you publish."
          />
        </div>
        <ul className="m-0 flex list-none flex-col p-0">
          {problems.map((p, i) => (
            <Reveal
              as="li"
              key={p.title}
              index={i}
              className={`grid grid-cols-[minmax(0,190px)_minmax(0,1fr)] gap-x-6 gap-y-2 border-t py-[18px] max-[480px]:grid-cols-1 ${
                i === 0 ? "border-ink" : "border-rule"
              } ${i === problems.length - 1 ? "border-b border-b-rule" : ""}`}
            >
              <h3 className="text-[17px] font-semibold">{p.title}</h3>
              <p className="text-[16px] leading-[1.5] text-pretty text-muted">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
