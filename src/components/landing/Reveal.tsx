import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Marks an element to fade and rise in when it scrolls into view. `index`
 * staggers siblings. `immediate` plays the entrance on first paint instead (for
 * above-the-fold content). Works with SiteMotion and the `.motion` class set
 * in the document head; without them the content renders as-is.
 */
export function Reveal({
  as: Tag = "div",
  index = 0,
  immediate = false,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  index?: number;
  immediate?: boolean;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  return (
    <Tag
      data-reveal={immediate ? "load" : "scroll"}
      className={className}
      style={{ "--reveal-i": index } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Headline whose rendered lines slide up from behind a mask, one after another.
 * `text` is plain; wrap a word in *asterisks* to set it in red italic.
 * `immediate` plays on load (above the fold); otherwise it plays on scroll.
 */
export function RevealLines({
  as: Tag = "h2",
  text,
  immediate = false,
  delayMs = 0,
  className,
  ...rest
}: {
  as?: ElementType;
  text: string;
  immediate?: boolean;
  delayMs?: number;
  className?: string;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Group words by their rendered line (same offsetTop = same line).
    let line = -1;
    let top = -Infinity;
    el.querySelectorAll<HTMLElement>("[data-word]").forEach((w) => {
      if (w.offsetTop > top + 2) {
        line += 1;
        top = w.offsetTop;
      }
      w.style.setProperty("--line", String(line));
    });
    if (immediate) {
      // The hidden start state is already painted (server-rendered), so
      // flushing layout and adding the class starts the transition right away.
      void el.offsetWidth;
      el.classList.add("is-in");
    }
  }, [text, immediate]);

  return (
    <Tag
      ref={ref}
      data-reveal="lines"
      data-trigger={immediate ? "load" : "scroll"}
      className={className}
      style={{ "--lines-delay": `${delayMs}ms` } as CSSProperties}
      {...rest}
    >
      {words.map((w, i) => {
        const em = /^\*(.+)\*([.,;:!?]*)$/.exec(w);
        return (
          <Fragment key={i}>
            <span className="line-mask">
              <span data-word className="line-word">
                {em ? (
                  <>
                    <em className="text-red italic">{em[1]}</em>
                    {em[2]}
                  </>
                ) : (
                  w
                )}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
