import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getGlobalStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.rpc("get_global_stats");
  if (error) {
    return { total: 0, actions: 0, hours_saved: 0 };
  }
  const d = (data ?? {}) as { total?: number; actions?: number; hours_saved?: number };
  return {
    total: Number(d.total ?? 0),
    actions: Number(d.actions ?? 0),
    hours_saved: Number(d.hours_saved ?? 0),
  };
});
