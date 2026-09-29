'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, ExternalLink } from 'lucide-react';
import {
  DAILY_PRACTICE,
  GROWTH_STRATEGY_UPDATED,
  POST_CHECK,
  REPLY_PRACTICE,
  RESEARCH_LIMIT,
  RESEARCH_NOTES,
  SITTINGS,
  THESIS,
  WEEKLY_REVIEW,
  WRITING_EXERCISE,
  WRITING_LENSES,
} from '@/lib/x-growth-strategy';

const TRACK_KEY = 'x_growth_strategy_track';
type Track = { date: string; morning: boolean; evening: boolean };

function istDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function emptyTrack(): Track {
  return { date: istDateKey(), morning: false, evening: false };
}

function loadTrack(): Track {
  const today = emptyTrack();
  try {
    const saved = JSON.parse(localStorage.getItem(TRACK_KEY) || 'null') as Track | null;
    if (saved?.date === today.date) {
      return { date: today.date, morning: Boolean(saved.morning), evening: Boolean(saved.evening) };
    }
  } catch { /* The guide works without local storage. */ }
  return today;
}

export function XGrowthStrategy() {
  const [track, setTrack] = useState<Track>(loadTrack);
  const [lensId, setLensId] = useState<(typeof WRITING_LENSES)[number]['id']>('learning');
  const lens = WRITING_LENSES.find((item) => item.id === lensId) ?? WRITING_LENSES[0];

  useEffect(() => {
    try { localStorage.setItem(TRACK_KEY, JSON.stringify(track)); }
    catch { /* Tracking is optional. */ }
  }, [track]);

  useEffect(() => {
    const refreshDay = () => {
      const today = emptyTrack();
      setTrack((current) => current.date === today.date ? current : today);
    };
    const timer = window.setInterval(refreshDay, 60_000);
    window.addEventListener('focus', refreshDay);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshDay);
    };
  }, []);

  function toggleSitting(id: 'morning' | 'evening') {
    setTrack((current) => {
      const today = emptyTrack();
      const latest = current.date === today.date ? current : today;
      return { ...latest, [id]: !latest[id] };
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-[var(--atelier-ink)] sm:space-y-8">
      <section aria-labelledby="growth-thesis" className="atelier-card-lg p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="strategy-kicker">The question to return to</p>
          <p className="text-xs text-[var(--atelier-muted)]">Updated {GROWTH_STRATEGY_UPDATED}</p>
        </div>
        <h2 id="growth-thesis" className="mt-5 max-w-2xl font-headline text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {THESIS.title}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">{THESIS.statement}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--atelier-muted)]">{THESIS.grounding}</p>
        <p className="mt-5 border-t border-[var(--atelier-line)] pt-4 text-sm font-medium leading-relaxed">{THESIS.audience}</p>
      </section>

      <section aria-labelledby="growth-writing" className="atelier-card p-5 sm:p-8">
        <p className="strategy-kicker">When you’re stuck</p>
        <h3 id="growth-writing" className="mt-2 font-headline text-xl font-bold tracking-tight sm:text-2xl">Pick one real moment.</h3>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Writing focus">
          {WRITING_LENSES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={lensId === item.id}
              aria-controls="growth-writing-prompt"
              onClick={() => setLensId(item.id)}
              className={'min-h-11 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-gold)] ' + (
                lensId === item.id
                  ? 'border-[var(--atelier-ink)] bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                  : 'border-[var(--atelier-line)] text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div id="growth-writing-prompt" aria-live="polite" aria-atomic="true" className="mt-5 border-l-2 border-[var(--atelier-gold)] pl-4">
          <p className="font-headline text-base font-semibold leading-relaxed">{lens.question}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">{lens.nudge}</p>
        </div>
        <h4 className="mt-6 text-sm font-semibold">Five minutes, four notes</h4>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--atelier-muted)]">
          {WRITING_EXERCISE.map((question) => <li key={question} className="pl-1">{question}</li>)}
        </ol>
        <p className="mt-4 text-sm leading-relaxed">Use the notes to write a natural paragraph. Let the specific detail do the impressing.</p>
        <p className="mt-4 border-t border-[var(--atelier-line)] pt-4 text-sm leading-relaxed text-[var(--atelier-muted)]">{POST_CHECK}</p>
      </section>

      <section aria-labelledby="growth-routine" className="atelier-card p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="strategy-kicker">The repeatable part</p>
            <h3 id="growth-routine" className="mt-2 font-headline text-xl font-bold tracking-tight sm:text-2xl">Two sittings. Then leave.</h3>
          </div>
          <Link href="/editorial?workspace=x" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[var(--atelier-gold)] focus-visible:outline-2 focus-visible:outline-offset-2">
            Open To-Do <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-4 text-sm leading-relaxed">{DAILY_PRACTICE}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SITTINGS.map((sitting) => (
            <button
              key={sitting.id}
              type="button"
              aria-label={(sitting.id === 'morning' ? 'Morning' : 'Evening') + ' sitting complete'}
              aria-pressed={track[sitting.id]}
              onClick={() => toggleSitting(sitting.id)}
              className={'rounded-xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--atelier-gold)] ' + (
                track[sitting.id] ? 'border-[var(--atelier-gold)] bg-[var(--atelier-gold-soft)]' : 'border-[var(--atelier-line)]'
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-headline text-sm font-semibold">{sitting.label} · {sitting.minutes} min</span>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--atelier-gold)]">
                  {track[sitting.id] && <Check size={14} aria-hidden="true" />}
                  {track[sitting.id] ? 'Done' : 'Mark done'}
                </span>
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-[var(--atelier-muted)]">{sitting.action}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--atelier-muted)]">Daily checks stay on this device and reset at midnight IST.</p>
        <p className="mt-5 text-sm leading-relaxed text-[var(--atelier-muted)]">{REPLY_PRACTICE}</p>
        <div className="mt-5 border-t border-[var(--atelier-line)] pt-4">
          <h4 className="text-sm font-semibold">Review once a week</h4>
          <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">{WEEKLY_REVIEW}</p>
        </div>
      </section>

      <details className="group rounded-xl border border-[var(--atelier-line)] px-5 sm:px-8">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
          Why this approach fits X
          <ChevronDown size={16} className="shrink-0 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-5 pb-5 text-sm leading-relaxed sm:pb-6">
          {RESEARCH_NOTES.map((note) => (
            <div key={note.title}>
              <p className="font-semibold">{note.title}</p>
              <p className="mt-1 text-[var(--atelier-muted)]">{note.evidence}</p>
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-[var(--atelier-gold)] underline underline-offset-4">
                {note.source} <ExternalLink size={13} aria-hidden="true" />
              </a>
              <p className="mt-1">{note.implication}</p>
            </div>
          ))}
          <p className="border-t border-[var(--atelier-line)] pt-4 text-xs leading-relaxed text-[var(--atelier-muted)]">{RESEARCH_LIMIT}</p>
        </div>
      </details>
    </div>
  );
}
