"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/fields";
import { DEMO_ADMIN } from "@/config/site";
import { signInAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") === "forbidden" ? "This account does not have admin access." : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signInAdmin(email, password);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    const next = params.get("next");
    router.replace(next && (next.startsWith("/admin") || next.startsWith("/kitchen")) ? next : "/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-[28px] border-[3px] border-tamarind bg-white p-6 shadow-sticker sm:p-8">
      <Logo />
      <h1 className="mt-6 font-display text-3xl font-extrabold">Restaurant admin</h1>
      <p className="mt-1 text-tamarind-muted">Sign in to manage orders and the menu.</p>
      <div className="mt-6 space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-ketchup-light px-4 py-3 text-sm font-semibold text-ketchup-dark">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </div>
      {!isSupabaseConfigured && (
        <div className="mt-6 rounded-xl bg-mustard-soft p-4 text-sm">
          <p className="font-bold">Demo mode</p>
          <p className="mt-1 text-tamarind-soft">
            Email: <code className="font-semibold">{DEMO_ADMIN.email}</code>
            <br />
            Password: <code className="font-semibold">{DEMO_ADMIN.password}</code>
          </p>
          <button
            type="button"
            className="mt-2 font-bold text-ketchup underline underline-offset-4"
            onClick={() => {
              setEmail(DEMO_ADMIN.email);
              setPassword(DEMO_ADMIN.password);
            }}
          >
            Fill in demo login
          </button>
        </div>
      )}
    </form>
  );
}
