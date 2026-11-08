import seed from "./seed.json";
import { envContact } from "@/config/site";
import type { Catalog } from "@/lib/types";

/** Built-in demo catalog. Used in demo mode and as a fallback if Supabase is unreachable. */
export function seedCatalog(): Catalog {
  const data = structuredClone(seed) as Catalog;
  data.settings.phone = envContact.phone || data.settings.phone;
  data.settings.whatsapp = envContact.whatsapp || data.settings.whatsapp;
  return data;
}
