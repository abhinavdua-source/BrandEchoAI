// Placeholders: no customer logos or quotes are published until they're real.
export function Customers() {
  return (
    <section
      id="customers"
      aria-labelledby="customers-title"
      className="pt-10 pb-20 lg:pt-14 lg:pb-28"
    >
      <div className="container-desk">
        <h2 id="customers-title" className="text-label">
          Used by
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <li
              key={i}
              className="placeholder-dashed flex h-20 items-center justify-center font-mono text-[13px]"
            >
              [Customer logo]
            </li>
          ))}
        </ul>

        <div className="mt-16 grid border-t border-ink md:grid-cols-2">
          {[0, 1].map((i) => (
            <figure
              key={i}
              className={`border-b border-rule py-10 md:border-b-0 md:px-10 md:first:pl-0 ${
                i > 0 ? "md:border-l md:border-rule" : ""
              }`}
            >
              <blockquote className="font-serif text-[28px] leading-[1.3] text-ink italic">
                [Testimonial — coming soon]
              </blockquote>
              <figcaption className="mt-5 font-mono text-[13px] text-graphite">
                [Name, Role, Company]
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
