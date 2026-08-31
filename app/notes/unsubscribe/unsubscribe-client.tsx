'use client';

import { useState } from 'react';

export function UnsubscribeClient({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setError('');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not unsubscribe.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Network error. Try again.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-body text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200">
        You are off the list. {email} stays on file so you can subscribe again from Notes. No letters until then.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="font-body text-on-surface-variant">
        This will stop weekly Notes for <span className="font-medium text-primary">{email}</span>.
      </p>
      <button
        type="submit"
        disabled={status === 'saving'}
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-headline text-sm font-bold text-primary transition hover:bg-accent/90 disabled:opacity-50"
      >
        {status === 'saving' ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </form>
  );
}
