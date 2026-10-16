import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Current Supabase session, kept in sync with sign-in / sign-out events. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

/** Absolute URL on this site, for auth email links. */
export function siteUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

/** Only allow redirects back into this site's app. */
export function safeRedirect(target: unknown, fallback = "/app") {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
    ? target
    : fallback;
}
