"use client";

import { DEMO_ADMIN, DEMO_COOKIE } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/env";
import { getBrowserSupabase } from "@/lib/supabase/client";

export async function signInAdmin(email: string, password: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${60 * 60 * 12}; samesite=lax`;
      return {};
    }
    return { error: "Email or password is incorrect." };
  }
  const sb = getBrowserSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return { error: error?.message ?? "Sign-in failed." };
  const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") {
    await sb.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  return {};
}

export async function signOutAdmin(): Promise<void> {
  if (!isSupabaseConfigured) {
    document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }
  await getBrowserSupabase().auth.signOut();
}
