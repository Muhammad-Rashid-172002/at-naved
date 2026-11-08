/** Branded loading state shown while a page streams in. */
export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-cream-soft" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-20 w-20">
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-char/10 border-t-flame" />
          <span className="absolute inset-[18%] grid place-items-center rounded-full bg-gradient-to-br from-mustard to-flame font-display text-lg font-extrabold text-char shadow-glow">
            AT
          </span>
        </div>
        <p className="text-xs font-extrabold uppercase tracking-[.3em] text-tamarind-muted">Heating the grill…</p>
      </div>
    </div>
  );
}
