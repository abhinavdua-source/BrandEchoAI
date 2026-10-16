import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pt-16 pb-16 lg:pt-24 lg:pb-24">
      <div className="container-desk">
        <p className="text-label">Brand voice, checked before it ships</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <h1 id="hero-title" className="text-h1 text-balance">
            Every word you publish, held to <em>your</em> brand book.
          </h1>
          <div className="max-w-md lg:pb-3">
            <p className="text-[17px] leading-[1.55] text-body sm:text-[18px]">
              Upload your guidelines once. BrandEcho AI reads every email, post and campaign the way
              your best editor would, flags what's off, and rewrites it in your voice.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#signup">Start free</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#demo">Book a demo</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
