'use client';

import { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

export function NewsletterSignup({
  source,
  variant = 'light',
}: {
  source: string;
  variant?: 'light' | 'dark';
}) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');

  const dark = variant === 'dark';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source,
          timezone: browserTimeZone(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not subscribe. Try again or email me directly.');
        setSubscribing(false);
        return;
      }
      setSubscribed(true);
    } catch {
      setError('Could not subscribe. Try again or email me directly.');
    } finally {
      setSubscribing(false);
    }
  };

  if (subscribed) {
    return (
      <p
        className={
          dark
            ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-emerald-400'
            : 'rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-headline text-sm font-bold text-accent dark:border-emerald-500/30 dark:bg-emerald-950/20'
        }
      >
        You&apos;re on Notes. One letter, Sunday evening.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      <div className={dark ? 'flex flex-col gap-3 sm:flex-row' : 'flex flex-col gap-3 sm:flex-row'}>
        <label htmlFor={`notes-email-${source}`} className="sr-only">
          Email for Notes
        </label>
        <input
          id={`notes-email-${source}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={subscribing}
          placeholder="Your email"
          required
          autoComplete="email"
          className={
            dark
              ? 'h-12 w-full min-w-0 rounded-full border border-white/10 bg-white/[0.03] px-5 font-body text-sm text-white placeholder-slate-500 transition-colors focus:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 sm:flex-1'
              : 'h-12 flex-grow rounded-xl border border-slate-200 bg-slate-50 px-5 text-base text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-accent focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white'
          }
        />
        <button
          type="submit"
          disabled={subscribing}
          className={
            dark
              ? 'h-12 w-full shrink-0 cursor-pointer rounded-full bg-white px-6 font-headline text-sm font-bold tracking-tight text-slate-950 transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
              : 'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-8 font-headline text-sm font-bold text-primary shadow-md transition-all hover:bg-accent/90 active:scale-[0.98] dark:text-primary-container'
          }
        >
          {subscribing ? 'Subscribing…' : 'Subscribe'}
          {!dark && !subscribing ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
      {error ? (
        <p role="alert" className={`flex items-center gap-2 text-xs ${dark ? 'text-red-400' : 'text-red-600 dark:text-red-400'}`}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        <p className={`text-[10px] font-body ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          Sunday evening. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
