import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section id="signup" aria-labelledby="cta-title" className="py-20 lg:py-28">
      <div className="container-desk">
        <div className="grid gap-10 border-y border-ink py-14 lg:grid-cols-[minmax(0,2fr)_auto] lg:items-end lg:py-20">
          <h2 id="cta-title" className="text-h2 max-w-3xl text-balance lg:text-[64px]">
            Ready to make every word sound like your brand?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#signup">Start free</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#demo">Book a demo</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
