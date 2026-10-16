export function FinalCta() {
  return (
    <section id="signup" aria-labelledby="cta-title" className="bg-red text-white">
      <div className="container-site flex flex-wrap items-center justify-between gap-7 py-[clamp(48px,6vw,72px)]">
        <h2
          id="cta-title"
          className="max-w-[620px] font-serif text-[clamp(30px,3.4vw,42px)] leading-[1.1] font-normal tracking-[-0.02em] text-balance"
        >
          Ready to make every word sound like your brand?
        </h2>
        <div id="demo" className="flex flex-wrap gap-3">
          <a
            href="#signup"
            className="rounded-btn bg-white px-[22px] py-[14px] text-[16px] font-medium text-ink transition-colors duration-200 hover:bg-ink hover:text-white"
          >
            Start free
          </a>
          <a
            href="#demo"
            className="rounded-btn border border-white px-[22px] py-[14px] text-[16px] font-medium text-white transition-colors duration-200 hover:bg-white/12 hover:text-white"
          >
            Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}
