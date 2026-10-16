import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { DemoSection } from "@/components/landing/DemoSection";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Numbers } from "@/components/landing/Numbers";
import { Customers } from "@/components/landing/Customers";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

const title = "BrandEcho AI — Keep your brand voice consistent. Everywhere.";
const description =
  "BrandEcho AI checks every email, post and campaign against your brand book, flags what's off, and rewrites it in your voice.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper">
      <Nav />
      <main>
        <Hero />
        <DemoSection />
        <Problem />
        <HowItWorks />
        <Features />
        <Numbers />
        <Customers />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
