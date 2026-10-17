import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal, RevealLines } from "./Reveal";

const steps = [
  {
    title: "Hand over the brand book",
    body: "PDF guidelines, tone docs, banned words. Upload once.",
  },
  { title: "It learns your voice", body: "Tone, vocabulary, values and how you never sound." },
  { title: "Every draft gets marked", body: "A score from 0 to 100 and a note on every slip." },
  { title: "Rewritten on-brand", body: "Accept the clean copy, or edit it yourself." },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // The band's content moves a little slower than the page, adding depth.
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);

  return (
    <section
      ref={ref}
      id="how"
      aria-labelledby="how-title"
      className="overflow-hidden bg-ink text-on-dark"
    >
      <motion.div style={{ y }} className="container-site section-y flex flex-col gap-10">
        <div className="flex flex-col gap-3.5">
          <Reveal as="p" className="eyebrow text-red-on-dark">
            How it works
          </Reveal>
          <RevealLines as="h2" id="how-title" className="text-h2" text="How the desk works" />
        </div>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-7 gap-y-8 p-0">
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              index={i}
              className="flex flex-col gap-2.5 border-t border-ink-line pt-4"
            >
              <span className="font-mono text-[13px] font-medium text-red-on-dark">0{i + 1}</span>
              <h3 className="font-serif text-[23px] leading-[1.2] font-medium">{s.title}</h3>
              <p className="text-[15px] leading-[1.5] text-on-dark-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </motion.div>
    </section>
  );
}
