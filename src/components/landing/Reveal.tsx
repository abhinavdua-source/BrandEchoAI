import type { CSSProperties, ElementType, ReactNode } from "react";

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
