/**
 * BrandEchoAI wordmark ("Ink" style from the handoff): "BrandEcho" in
 * Newsreader 600 with "AI" set tight against it in red italic.
 */
export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <span
      className={`font-serif text-[25px] leading-none font-semibold tracking-[-0.025em] ${
        dark ? "text-on-dark" : "text-ink"
      }`}
    >
      BrandEcho
      <span
        className={`font-medium tracking-[-0.01em] italic ${dark ? "text-red-on-dark" : "text-red"}`}
      >
        AI
      </span>
    </span>
  );
}
