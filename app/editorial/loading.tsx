/** Streaming shell while auth + data resolve — keeps layout stable (less CLS). */
export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-full bg-[var(--atelier-line)]" />
          <div className="h-9 w-48 rounded-2xl bg-[var(--atelier-line)]" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-full bg-[var(--atelier-line)]" />
          <div className="h-10 w-28 rounded-full bg-[var(--atelier-line)]" />
        </div>
      </div>
      <div className="atelier-card h-16 rounded-[1.5rem]" />
      <div className="atelier-card-lg h-40 rounded-[1.75rem]" />
      <div className="space-y-3">
        <div className="atelier-card h-28 rounded-[1.5rem]" />
        <div className="atelier-card h-28 rounded-[1.5rem]" />
        <div className="atelier-card h-28 rounded-[1.5rem] opacity-70" />
      </div>
      <span className="sr-only">Loading editorial workspace…</span>
    </div>
  );
}
