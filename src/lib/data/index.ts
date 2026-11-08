"use client";

import { isSupabaseConfigured } from "@/lib/env";
import { demoRepo } from "./demo-repo";
import type { DataRepo } from "./repo-types";
import { supabaseRepo } from "./supabase-repo";

export function getRepo(): DataRepo {
  return isSupabaseConfigured ? supabaseRepo : demoRepo;
}

export { RepoError } from "./repo-types";
export type { DataRepo, Topic } from "./repo-types";
