import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Attribute, CheckIssue } from "@/lib/voice";

/* Data access for the app. Row-level security scopes every query to the user. */

export type Brand = Omit<Tables<"brands">, "attributes"> & { attributes: Attribute[] };
export type Check = Omit<Tables<"checks">, "issues"> & { issues: CheckIssue[] };
export type Plan = Tables<"plans">;
export type Usage = { used: number; allowance: number | null; plan_id: string };

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export const brandsQuery = () =>
  queryOptions({
    queryKey: ["brands"],
    queryFn: async () =>
      unwrap(
        await supabase.from("brands").select("*").order("created_at", { ascending: true }),
      ) as Brand[],
  });

export const brandQuery = (id: string) =>
  queryOptions({
    queryKey: ["brands", id],
    queryFn: async () =>
      unwrap(await supabase.from("brands").select("*").eq("id", id).maybeSingle()) as Brand | null,
  });

export const checksQuery = (opts: { brandId?: string; limit?: number } = {}) =>
  queryOptions({
    queryKey: ["checks", opts],
    queryFn: async () => {
      let q = supabase
        .from("checks")
        .select("id, brand_id, brand_name, channel, title, score, verdict, created_at")
        .order("created_at", { ascending: false })
        .limit(opts.limit ?? 200);
      if (opts.brandId) q = q.eq("brand_id", opts.brandId);
      return unwrap(await q) as Pick<
        Check,
        "id" | "brand_id" | "brand_name" | "channel" | "title" | "score" | "verdict" | "created_at"
      >[];
    },
  });

export const checkQuery = (id: string) =>
  queryOptions({
    queryKey: ["checks", "one", id],
    queryFn: async () =>
      unwrap(await supabase.from("checks").select("*").eq("id", id).maybeSingle()) as Check | null,
  });

export const usageQuery = () =>
  queryOptions({
    queryKey: ["usage"],
    queryFn: async () => unwrap(await supabase.rpc("my_usage").single()) as Usage,
  });

export const plansQuery = () =>
  queryOptions({
    queryKey: ["plans"],
    staleTime: Infinity,
    queryFn: async () =>
      unwrap(await supabase.from("plans").select("*").order("sort_order")) as Plan[],
  });

export const canCreateBrandQuery = () =>
  queryOptions({
    queryKey: ["can-create-brand"],
    queryFn: async () => unwrap(await supabase.rpc("can_create_brand")) as boolean,
  });
