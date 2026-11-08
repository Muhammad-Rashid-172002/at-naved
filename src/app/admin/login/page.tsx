import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-mustard px-4 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
