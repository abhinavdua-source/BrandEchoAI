import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

/**
 * Page-wide motion: Lenis momentum scrolling (also glides to anchor links,
 * honoring scroll-margin-top) and the scroll-reveal observer. Both stay off
 * when the visitor prefers reduced motion.
 */
export function SiteMotion() {
  useEffect(() => {
    window.__revealReady = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (reduce || !root.classList.contains("motion")) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            observer.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document
      .querySelectorAll('[data-reveal="scroll"], [data-reveal="lines"][data-trigger="scroll"]')
      .forEach((el) => observer.observe(el));

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.6,
      anchors: true, // header offset comes from scroll-margin-top in styles.css
      stopInertiaOnNavigate: true,
    });

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
