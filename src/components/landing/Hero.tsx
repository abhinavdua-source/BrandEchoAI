import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal } from "./Reveal";
import { btnInk, btnOutline } from "./styles";

type View = "draft" | "final";

function Note({ n }: { n: number }) {
  return <sup className="font-mono text-[11px] font-medium text-red">{n}</sup>;
}

function Cut({ children }: { children: string }) {
  return (
    <del className="mark-cut">
      <span className="sr-only">Flagged: </span>
      {children}
    </del>
  );
}

const notes: [string, string][] = [
  ["Hype words.", "Our voice is confident, not loud."],
  ["Unproven claim.", "Say what it does."],
  ["No value prop", "anywhere."],
];

function ExampleCard() {
  const [view, setView] = useState<View>("draft");
  const isDraft = view === "draft";

  const tab = (active: boolean) =>
    `rounded-seg border-0 px-3 py-1.5 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 ${
      active ? "bg-surface text-ink shadow-seg" : "bg-transparent text-secondary"
    }`;

  // Both views share one grid cell and only visibility/opacity change, so the
  // card keeps the same height when switching.
  const pane = (active: boolean) =>
    `col-start-1 row-start-1 flex flex-col gap-5 px-[22px] pt-6 pb-[22px] transition-[opacity,visibility] duration-[250ms] ease-glide ${
      active ? "visible opacity-100" : "invisible opacity-0"
    }`;

  return (
    <figure className="m-0 overflow-hidden rounded-card border border-[var(--rule-card)] bg-surface shadow-card">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-rule-soft px-4 py-3">
        <span className="font-mono text-[12px] text-secondary">Email campaign · 108 chars</span>
        <div
          role="group"
          aria-label="Example view"
          className="flex gap-0.5 rounded-btn bg-seg p-[3px]"
        >
          <button
            type="button"
            aria-pressed={isDraft}
            onClick={() => setView("draft")}
            className={tab(isDraft)}
          >
            Draft
          </button>
          <button
            type="button"
            aria-pressed={!isDraft}
            onClick={() => setView("final")}
            className={tab(!isDraft)}
          >
            Final copy
          </button>
        </div>
      </figcaption>

      <div className="grid">
        <div className={pane(isDraft)} aria-hidden={!isDraft}>
          <p className="font-serif text-[clamp(20px,2vw,23px)] leading-[1.55]">
            Our product is <Cut>amazing</Cut>
            <Note n={1} /> and it's <Cut>honestly the best solution out there</Cut>
            <Note n={2} />. We're <Cut>super excited</Cut>
            <Note n={1} /> for you to try it!
            <Note n={3} />
          </p>
          <ol className="m-0 flex list-none flex-col gap-2 border-t border-dashed border-rule-dash p-0 pt-3.5 text-[14px] leading-[1.45] text-note">
            {notes.map(([lead, rest], i) => (
              <li key={lead} className="flex gap-2.5">
                <span className="pt-0.5 font-mono text-[12px] font-medium text-red">{i + 1}</span>
                <span>
                  <strong className="font-semibold text-ink">{lead}</strong> {rest}
                </span>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-[18px] rounded-panel bg-panel px-4 py-3.5">
            <div className="flex items-baseline gap-0.5 font-serif">
              <span className="text-[40px] leading-none font-medium text-red">72</span>
              <span className="text-[16px] text-secondary">/100</span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div
                role="img"
                aria-label="Score 72 of 100; house standard is 90"
                className="relative h-1.5 rounded-[3px] bg-rule"
              >
                <div className="absolute inset-y-0 left-0 w-[72%] rounded-[3px] bg-red" />
                <div className="absolute -inset-y-1 left-[90%] w-0.5 bg-ink" />
              </div>
              <span className="text-[13px] leading-[1.4] text-note">
                Consistency is below your house standard of 90. Three edits needed.
              </span>
            </div>
          </div>
        </div>

        <div className={pane(!isDraft)} aria-hidden={isDraft}>
          <p className="font-serif text-[clamp(20px,2vw,23px)] leading-[1.55]">
            Our product{" "}
            <span className="mark-fix">helps your team get more done with one simple workflow</span>
            . We're{" "}
            <span className="mark-fix">confident you'll see the difference from day one</span>.
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule-dash pt-3.5">
            <span className="font-mono text-[12px] font-medium text-green-text">
              Three edits applied
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("draft")}
                className="min-h-11 rounded-btn border border-outline px-3.5 text-[14px] font-medium text-ink transition-colors hover:border-ink"
              >
                Edit
              </button>
              <button
                type="button"
                className="min-h-11 rounded-btn bg-ink px-3.5 text-[14px] font-medium text-on-dark transition-colors hover:bg-red hover:text-white"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Gentle drift on the example card as the hero scrolls away.
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -28]);

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(40px,5vw,72px)] pt-[clamp(48px,7vw,88px)] pb-[clamp(56px,7vw,88px)]"
    >
      <div className="flex flex-col gap-6">
        <Reveal immediate as="p" index={0} className="eyebrow">
          Brand voice, checked before it ships
        </Reveal>
        <Reveal
          immediate
          as="h1"
          index={1}
          id="hero-title"
          className="font-serif text-[clamp(42px,5.6vw,70px)] leading-[1.02] font-normal tracking-[-0.025em] text-balance"
        >
          Every word you publish, held to <em className="text-red italic">your</em> brand book.
        </Reveal>
        <Reveal
          immediate
          as="p"
          index={2}
          className="max-w-[520px] text-[clamp(17px,1.5vw,19px)] leading-[1.55] text-pretty text-muted"
        >
          Upload your guidelines once. BrandEchoAI reads every email, post and campaign the way your
          best editor would, flags what's off, and rewrites it in your voice.
        </Reveal>
        <Reveal immediate index={3} className="flex flex-wrap gap-3 pt-1">
          <Link to="/signup" className={btnInk}>
            Start free
          </Link>
          <a href="/demo" className={btnOutline}>
            Book a demo
          </a>
        </Reveal>
      </div>

      <Reveal immediate index={3}>
        <motion.div style={{ y }}>
          <ExampleCard />
        </motion.div>
      </Reveal>
    </section>
  );
}
