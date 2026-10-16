/** Wordmark: "BrandEcho" in Newsreader italic, "AI" in Plex Mono on the same baseline. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline text-ink ${className}`}>
      <span className="font-serif text-[26px] leading-none italic">BrandEcho</span>
      <span className="ml-[0.35em] font-mono text-[15.5px] leading-none font-medium">AI</span>
    </span>
  );
}
