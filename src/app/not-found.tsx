import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-mustard px-6 text-center">
      <div>
        <Logo />
        <p className="mt-10 font-display text-8xl font-extrabold leading-none">404</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold">This page is not on the menu</h1>
        <p className="mt-2 text-tamarind-soft">The link may be old or mistyped.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center rounded-full bg-tamarind px-6 font-bold text-white">Go home</Link>
          <Link href="/menu" className="inline-flex h-12 items-center rounded-full bg-ketchup px-6 font-bold text-white">See the menu</Link>
        </div>
      </div>
    </div>
  );
}
