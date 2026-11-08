import { createClient } from "@supabase/supabase-js";
import { seedCatalog } from "@/data/seed";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Catalog } from "@/lib/types";
import { fetchCatalog } from "./supabase-mappers";

/** Server-side catalog for SSR/SEO. Public data only, read with the anon key. */
export async function getServerCatalog(): Promise<Catalog> {
  if (!isSupabaseConfigured) return seedCatalog();
  try {
    const sb = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    return await fetchCatalog(sb);
  } catch (e) {
    console.error("[catalog] Falling back to seed data:", e);
    return seedCatalog();
  }
}
