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
        role="status"
        className={
          dark
            ? 'rounded-xl border border-white/15 bg-white/[0.06] p-4 font-body text-sm text-[#f3f1ea]'
            : 'rounded-xl border border-[var(--rule)] bg-[var(--sage)] p-4 font-body text-sm text-[var(--ink)]'
        }
      >
        Check your inbox and confirm your subscription to the Sunday letter.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
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
              ? 'h-12 min-w-0 flex-grow rounded-md border border-white/20 bg-white/[0.06] px-4 text-base text-[#f3f1ea] placeholder:text-[#b9c4be] focus:border-[#f3f1ea] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] disabled:opacity-50'
              : 'h-12 min-w-0 flex-grow rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] px-4 text-base text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:border-[var(--ink-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] disabled:opacity-50'
          }
        />
        <button
          type="submit"
          disabled={subscribing}
          className={
            dark
              ? 'group inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#f3f1ea] px-6 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)] disabled:cursor-not-allowed disabled:opacity-50'
              : 'btn-accent notes-signup-button group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          {subscribing ? 'Subscribing…' : 'Subscribe'}
          {!subscribing ? <ArrowRight className="btn-icon h-4 w-4" /> : null}
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className={`flex items-center gap-2 text-xs ${dark ? 'text-[#f0a58f]' : 'text-[var(--clay)]'}`}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        <p className={`text-xs font-body ${dark ? 'text-[#b9c4be]' : 'text-[var(--ink-2)]'}`}>
          Sunday evening. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
