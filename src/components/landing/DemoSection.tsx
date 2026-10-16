import { useState } from "react";

/*
 * The proof demo: a draft marked up in proofreader red beside its score and the
 * final on-brand copy. Static content; no live checking.
 */

type Segment = { text: string; note?: number; flag?: boolean };

const draft: Segment[] = [
  { text: "Our product is " },
  { text: "amazing", note: 1 },
  { text: " and it's " },
  { text: "honestly the best solution out there", note: 2 },
  { text: ". We're " },
  { text: "super excited", note: 1 },
  { text: " for you to try it" },
  { text: "!", flag: true },
];

const notes = [
  "Hype words. Our voice is confident, not loud.",
  "Unproven claim. Say what it does.",
  "No value prop anywhere.",
];

const draftLength = draft.reduce((n, s) => n + s.text.length, 0);

const finalCopy =
  "Our product helps your team get more done with one simple workflow. We're confident you'll see the difference from day one.";

type View = "draft" | "final";

export function DemoSection() {
  // Only matters below lg, where the two columns stack and one shows at a time.
  const [view, setView] = useState<View>("draft");

  return (
    <section id="demo" aria-labelledby="demo-title" className="border-y border-ink">
      <h2 id="demo-title" className="sr-only">
        Example: a draft checked against a brand book
      </h2>

      <div className="container-desk">
        <div
          role="group"
          aria-label="Choose which column to show"
          className="flex border-b border-rule lg:hidden"
        >
          {(["draft", "final"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`min-h-12 flex-1 border-b-2 font-mono text-[13px] tracking-[0.08em] uppercase ${
                view === v ? "border-ink text-ink" : "border-transparent text-graphite"
              }`}
            >
              {v === "draft" ? "Show draft" : "Show final copy"}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {/* LEFT: the marked-up draft */}
          <div
            className={`py-10 lg:block lg:border-r lg:border-rule lg:py-14 lg:pr-12 ${
              view === "draft" ? "block" : "hidden"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-label">Draft — marked up</p>
              <p className="font-mono text-[13px] text-graphite">
                Email campaign · {draftLength} chars
              </p>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_200px]">
              <p className="font-serif text-[24px] leading-[1.45] text-ink sm:text-[28px]">
                {draft.map((s, i) =>
                  s.note ? (
                    <span key={i}>
                      <del className="strike-red">
                        <span className="sr-only">Flagged: </span>
                        {s.text}
                      </del>
                      <sup className="ml-0.5 font-mono text-[12px] text-red">{s.note}</sup>
                    </span>
                  ) : s.flag ? (
                    <span key={i} className="text-red">
                      {s.text}
                    </span>
                  ) : (
                    <span key={i}>{s.text}</span>
                  ),
                )}
              </p>

              <ol aria-label="Margin notes" className="space-y-4 border-l-2 border-red pl-4">
                {notes.map((n, i) => (
                  <li
                    key={n}
                    className="flex gap-2 font-serif text-[17px] leading-[1.4] text-red italic"
                  >
                    <span className="font-mono text-[12px] not-italic">{i + 1}</span>
                    {n}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* RIGHT: score and final copy */}
          <div
            className={`py-10 lg:block lg:py-14 lg:pl-12 ${view === "final" ? "block" : "hidden"}`}
          >
            <div className="flex items-center gap-6">
              <div
                role="img"
                aria-label="Consistency score: 72 out of 100"
                className="flex h-[124px] w-[124px] shrink-0 -rotate-6 flex-col items-center justify-center rounded-full border-[3px] border-red text-red"
              >
                <span className="font-serif text-[48px] leading-none">72</span>
                <span className="mt-1 font-mono text-[13px]">/ 100</span>
              </div>
              <div>
                <p className="text-label">Consistency</p>
                <p className="mt-2 text-[16px] leading-[1.5] text-body">
                  Below your house standard of 90. Three edits needed.
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-rule pt-8">
              <p className="text-label">Final copy</p>
              <p className="mt-4 font-serif text-[24px] leading-[1.4] text-ink">{finalCopy}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
