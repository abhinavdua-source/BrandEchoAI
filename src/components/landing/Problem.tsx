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
    <section aria-labelledby="problem-title" className="py-20 lg:py-28">
      <div className="container-desk">
        <p className="text-label">The problem</p>
        <h2 id="problem-title" className="text-h2 mt-5 max-w-4xl text-balance">
          Your brand isn't just a logo. It's every word you publish.
        </h2>

        <ul className="mt-14 grid border-t border-ink md:grid-cols-3">
          {problems.map((p, i) => (
            <li
              key={p.title}
              className={`border-b border-rule py-8 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0 ${
                i > 0 ? "md:border-l md:border-rule" : ""
              }`}
            >
              <h3 className="text-h3">{p.title}</h3>
              <p className="mt-3 text-[16px] leading-[1.55] text-body">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
