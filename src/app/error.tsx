"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Something went wrong loading this page</h1>
        <p className="mt-2 text-tamarind-muted">Check your connection and try again.</p>
        <button onClick={reset} className="mt-6 inline-flex h-12 items-center rounded-full bg-ketchup px-6 font-bold text-white">
          Try again
        </button>
      </div>
    </div>
  );
}
