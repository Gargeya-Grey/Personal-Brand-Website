'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center space-y-6 liquid-glass rounded-[2rem] p-10">
        <p className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs">
          Error
        </p>
        <h1 className="font-headline text-3xl font-extrabold text-primary">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          An unexpected error occurred. You can try again or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="h-12 px-8 rounded-full bg-accent text-slate-950 font-headline font-bold text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-outline-variant/40 font-headline font-bold text-sm text-primary"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
