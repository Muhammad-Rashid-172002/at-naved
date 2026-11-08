import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/config/site";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * Guards /admin and /kitchen.
 * Live mode: verifies the Supabase session server-side and checks profiles.role = 'admin'.
 * Database access is additionally protected by Row Level Security, so data stays safe even if this layer is bypassed.
 * Demo mode: checks the demo session cookie (demo only — not a security boundary).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const toLogin = (reason?: string) => {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    if (reason) url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

  if (!isSupabaseConfigured) {
    return req.cookies.get(DEMO_COOKIE)?.value === "1" ? NextResponse.next() : toLogin();
  }

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return toLogin();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return toLogin("forbidden");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/kitchen/:path*"],
};
