import { useEffect } from "react";

// Microsoft Clarity (heatmaps + session recordings). Public project id.
const CLARITY_ID = "z12b3f4ymc";
// Only record the real site, not local dev or Vercel previews.
const HOSTS = ["brandechoai.studio", "www.brandechoai.studio"];

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

/**
 * Loads Clarity after the page has loaded, on website pages only. It never
 * starts on /app pages (customer drafts and brand guidelines live there), and
 * the app area and all forms carry data-clarity-mask, so their content stays
 * out of recordings even after client-side navigation.
 */
export function Analytics() {
  useEffect(() => {
    if (!HOSTS.includes(window.location.hostname)) return;
    if (window.location.pathname.startsWith("/app")) return;
    if (window.clarity) return;

    const load = () => {
      const q: unknown[] = [];
      window.clarity = Object.assign((...args: unknown[]) => void q.push(args), { q });
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
      document.head.appendChild(s);
    };

    if (document.readyState === "complete") load();
    else window.addEventListener("load", load, { once: true });
  }, []);

  return null;
}
