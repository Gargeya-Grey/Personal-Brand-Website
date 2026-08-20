'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlarmClock,
  Ban,
  Check,
  DoorOpen,
  Heart,
  MessageCircle,
  Quote,
  Sparkles,
  Sun,
  Sunset,
} from 'lucide-react';
import {
  DAILY_COUNTS,
  ENTER_ROOMS,
  GROWTH_HONEST,
  GROWTH_STRATEGY_UPDATED,
  HOW_TO_FOLLOW,
  MONTHLY_CHECK,
  MORNING_CARD,
  NINETY_DAYS,
  PERSONALITY,
  PROFILE_POSITION,
  REPLY_OR_QUOTE,
  SITTINGS,
  SKIP_ROOMS,
  STOP_FOR_NINETY,
  WEEKLY_CHECK,
  WEEK_OWN,
  WRITE_RULES,
} from '@/lib/x-growth-strategy';

const TRACK_KEY = 'x_growth_strategy_track';

type Track = {
  date: string;
  morning: boolean;
  evening: boolean;
  educationUsed: number;
};

function istDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function loadTrack(): Track {
  const date = istDateKey();
  const empty: Track = { date, morning: false, evening: false, educationUsed: 0 };
  try {
    const raw = localStorage.getItem(TRACK_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Track;
    if (parsed.date !== date) return empty;
    return {
      date,
      morning: Boolean(parsed.morning),
      evening: Boolean(parsed.evening),
      educationUsed: Math.min(2, Number(parsed.educationUsed) || 0),
    };
  } catch {
    return empty;
  }
}

const NAV = [
  { id: 'today', label: 'Today' },
  { id: 'profile', label: 'Profile' },
  { id: 'mix', label: 'Mix' },
  { id: 'write', label: 'Write' },
  { id: 'week', label: 'Week' },
  { id: 'rooms', label: 'Rooms' },
] as const;

export function XGrowthStrategy() {
  const [track, setTrack] = useState<Track>(loadTrack);
  const [openPart, setOpenPart] = useState<string | null>('ai-comfort');
  const [activeNav, setActiveNav] = useState('today');

  useEffect(() => {
    if (!track.date) return;
    try {
      localStorage.setItem(TRACK_KEY, JSON.stringify(track));
    } catch {
      /* ignore */
    }
  }, [track]);

  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveNav(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.2, 0.5] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const sittingsDone = (track.morning ? 1 : 0) + (track.evening ? 1 : 0);
  const openPersonality = useMemo(
    () => PERSONALITY.find((p) => p.id === openPart) ?? PERSONALITY[0],
    [openPart]
  );

  const toggleSitting = (id: 'morning' | 'evening') => {
    setTrack((t) => ({ ...t, [id]: !t[id] }));
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] shadow-[var(--atelier-shadow-sm)]">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, var(--atelier-gold-soft), transparent 68%)' }}
          aria-hidden
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--atelier-gold)]">
              Live plan · updated {GROWTH_STRATEGY_UPDATED}
            </p>
            <p className="text-sm text-[var(--atelier-muted)]">
              To change what the scout writes, edit{' '}
              <code className="text-[var(--atelier-ink)]">data/gargeya-voice.md</code>
              . There is no score file. You pick what to post.
            </p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--atelier-ink)] leading-[1.08]">
              Borrow big rooms.
              <span className="block text-[var(--atelier-muted)] font-semibold mt-1">
                Stay a whole person.
              </span>
            </h2>
            <p className="text-[var(--atelier-muted)] leading-relaxed max-w-xl">
              People find you under someone else&apos;s post. They stay if your small tweets make
              them feel clearer, kinder, or less alone. Same position for 90 days.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--atelier-gold)]/25 bg-[var(--atelier-gold-soft)]/50 p-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--atelier-gold)] mb-2">
              Am I happy with this?
            </p>
            <p className="font-headline font-bold text-[var(--atelier-ink)]">{GROWTH_HONEST.title}</p>
            <p className="text-sm text-[var(--atelier-muted)] leading-relaxed mt-2">{GROWTH_HONEST.body}</p>
          </div>
        </div>
      </div>

      <nav
        className="sticky top-24 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/90 p-1 shadow-[var(--atelier-shadow-sm)] backdrop-blur-md"
        aria-label="Strategy sections"
      >
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              activeNav === item.id
                ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section id="today" className="scroll-mt-36 space-y-5">
        <SectionHead
          eyebrow="Do this"
          title="Today, twice"
          sub="Check a sitting when you finish. This stays on this device."
        />
        <div className="grid sm:grid-cols-2 gap-4">
          {SITTINGS.map((s) => {
            const done = s.id === 'morning' ? track.morning : track.evening;
            const Icon = s.id === 'morning' ? Sun : Sunset;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSitting(s.id)}
                className={`text-left rounded-[1.5rem] border p-5 sm:p-6 transition-all ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-500/8'
                    : 'border-[var(--atelier-line)] bg-[var(--atelier-card)] hover:border-[var(--atelier-gold)]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--atelier-gold-soft)] text-[var(--atelier-gold)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-headline font-bold text-[var(--atelier-ink)]">{s.name}</p>
                      <p className="text-xs font-bold text-[var(--atelier-gold)]">{s.time}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-[var(--atelier-line)] text-transparent'
                    }`}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--atelier-muted)]">{s.why}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.do.map((line) => (
                    <li key={line} className="text-sm text-[var(--atelier-ink)] flex gap-2">
                      <span className="text-[var(--atelier-gold)] mt-0.5">·</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-faint)]">
                  About {s.minutes} minutes · tap when done
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProgressPill label="Sittings" value={`${sittingsDone}/2`} hot={sittingsDone === 2} />
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-card)] px-3 py-1.5">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--atelier-faint)]">
              Education used
            </span>
            {[0, 1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTrack((t) => ({ ...t, educationUsed: n }))}
                className={`h-7 min-w-7 rounded-full px-2 text-xs font-bold ${
                  track.educationUsed === n
                    ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                    : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-[0.65rem] text-[var(--atelier-faint)] pr-1">/ 2</span>
          </div>
          <Link href="/editorial?workspace=x" className="atelier-btn atelier-btn-gold !h-9 !px-4 !text-xs">
            Open To-Do
          </Link>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6">
          <SectionHead
            eyebrow="Morning card"
            title="Five yeses and the day is done"
            compact
          />
          <ol className="mt-4 space-y-2">
            {MORNING_CARD.map((line, i) => (
              <li key={line} className="text-sm text-[var(--atelier-ink)] flex gap-3">
                <span className="font-headline font-extrabold text-[var(--atelier-gold)] w-4">
                  {i + 1}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="profile" className="scroll-mt-36 space-y-5">
        <SectionHead
          eyebrow="Once, then leave it"
          title="What the profile says"
          sub={PROFILE_POSITION.line}
        />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6 space-y-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
              Bio
            </p>
            <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--atelier-ink)] leading-relaxed">
              {PROFILE_POSITION.bio}
            </pre>
            <p className="text-sm text-[var(--atelier-muted)]">
              Name: {PROFILE_POSITION.name}. Link: {PROFILE_POSITION.link}.
            </p>
            <p className="text-sm text-[var(--atelier-ink)]">{PROFILE_POSITION.pin}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6 space-y-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
              Photo and split
            </p>
            <p className="text-sm text-[var(--atelier-ink)] leading-relaxed">{PROFILE_POSITION.split}</p>
            <p className="text-sm text-[var(--atelier-muted)] leading-relaxed">{PROFILE_POSITION.photo}</p>
          </div>
        </div>
      </section>

      <section id="mix" className="scroll-mt-36 space-y-5">
        <SectionHead eyebrow="The numbers" title="What a day looks like" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DAILY_COUNTS.map((c) => (
            <div
              key={c.label}
              className="rounded-[1.35rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-4 sm:p-5"
            >
              <p className="font-headline text-4xl font-extrabold text-[var(--atelier-gold)] tracking-tight">
                {c.n}
              </p>
              <p className="font-headline font-bold text-[var(--atelier-ink)] mt-1">{c.label}</p>
              <p className="text-xs text-[var(--atelier-muted)] mt-1.5 leading-relaxed">{c.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6 space-y-4">
            <SectionHead eyebrow="Reply or quote" title="Almost always reply" compact />
            <div className="flex gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--atelier-gold-soft)] text-[var(--atelier-gold)]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <p className="text-sm text-[var(--atelier-ink)] leading-relaxed">{REPLY_OR_QUOTE.default}</p>
            </div>
            <div className="flex gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--atelier-gold-soft)] text-[var(--atelier-gold)]">
                <Quote className="h-5 w-5" />
              </span>
              <p className="text-sm text-[var(--atelier-muted)] leading-relaxed">{REPLY_OR_QUOTE.once}</p>
            </div>
            <p className="text-sm font-semibold text-[var(--atelier-ink)]">{REPLY_OR_QUOTE.never}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6">
            <SectionHead eyebrow="The rest of you" title="Tap a part" compact />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {PERSONALITY.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenPart(p.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    openPart === p.id
                      ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                      : 'border border-[var(--atelier-line)] text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[var(--atelier-paper)]/70 border border-[var(--atelier-line)] p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
                {openPersonality.feel}
              </p>
              <p className="mt-1.5 text-sm text-[var(--atelier-ink)] leading-relaxed">
                {openPersonality.believe}
              </p>
              <blockquote className="mt-3 text-sm italic text-[var(--atelier-muted)] leading-relaxed border-l-2 border-[var(--atelier-gold)]/50 pl-3">
                {openPersonality.example}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section id="write" className="scroll-mt-36 space-y-5">
        <SectionHead
          eyebrow="Voice"
          title="Write like you"
          sub="If you would not send it in a DM, do not post it."
        />
        <div className="grid sm:grid-cols-2 gap-3">
          {WRITE_RULES.map((r) => (
            <div
              key={r.good}
              className="grid grid-cols-1 gap-2 rounded-[1.35rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-4"
            >
              <p className="text-sm text-emerald-700 dark:text-emerald-400 flex gap-2">
                <Heart className="h-4 w-4 shrink-0 mt-0.5" />
                {r.good}
              </p>
              <p className="text-sm text-[var(--atelier-faint)] flex gap-2">
                <Ban className="h-4 w-4 shrink-0 mt-0.5" />
                {r.bad}
              </p>
            </div>
          ))}
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOW_TO_FOLLOW.map((h) => (
            <li
              key={h.step}
              className="rounded-[1.35rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-4"
            >
              <p className="font-headline text-2xl font-extrabold text-[var(--atelier-gold)]">{h.step}</p>
              <p className="font-headline font-bold text-[var(--atelier-ink)] mt-1">{h.title}</p>
              <p className="text-sm text-[var(--atelier-muted)] mt-1.5 leading-relaxed">{h.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="week" className="scroll-mt-36 space-y-5">
        <SectionHead
          eyebrow="This week"
          title="Three different parts a day"
          sub="Never three education originals. Scout prepares. You pick at 11:30 and 19:00."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {WEEK_OWN.map((d) => (
            <article
              key={d.day}
              className="rounded-[1.35rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-4"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
                {d.day}
              </p>
              <ul className="mt-3 space-y-2">
                {d.parts.map((part) => (
                  <li
                    key={part}
                    className="rounded-xl bg-[var(--atelier-paper)]/80 px-3 py-2 text-sm font-semibold text-[var(--atelier-ink)]"
                  >
                    {part}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 space-y-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
              Weekly
            </p>
            <ul className="space-y-2">
              {WEEKLY_CHECK.map((w) => (
                <li key={w.item} className="text-sm text-[var(--atelier-ink)] leading-relaxed">
                  <span className="font-semibold">{w.item}.</span> {w.done}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 space-y-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
              Monthly
            </p>
            <ul className="space-y-2">
              {MONTHLY_CHECK.map((m) => (
                <li key={m.week} className="text-sm text-[var(--atelier-ink)] leading-relaxed">
                  <span className="font-semibold">{m.week}.</span> {m.do}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {NINETY_DAYS.map((p) => (
            <article
              key={p.range}
              className="rounded-[1.35rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-4"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
                {p.range}
              </p>
              <p className="mt-2 text-sm text-[var(--atelier-ink)] leading-relaxed">{p.job}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="rooms" className="scroll-mt-36 space-y-5 pb-6">
        <SectionHead eyebrow="Where" title="Walk in. Walk past." />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/5 p-5 sm:p-6">
            <p className="inline-flex items-center gap-2 font-headline font-bold text-[var(--atelier-ink)]">
              <DoorOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Enter
            </p>
            <ul className="mt-3 space-y-2">
              {ENTER_ROOMS.map((line) => (
                <li key={line} className="text-sm text-[var(--atelier-ink)] leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6">
            <p className="inline-flex items-center gap-2 font-headline font-bold text-[var(--atelier-ink)]">
              <Ban className="h-4 w-4 text-[var(--atelier-faint)]" />
              Skip
            </p>
            <ul className="mt-3 space-y-2">
              {SKIP_ROOMS.map((line) => (
                <li key={line} className="text-sm text-[var(--atelier-muted)] leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--atelier-line)] bg-[var(--atelier-card)] p-5 sm:p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-gold)]">
            Stop for 90 days
          </p>
          <ul className="mt-3 grid sm:grid-cols-2 gap-2">
            {STOP_FOR_NINETY.map((line) => (
              <li key={line} className="text-sm text-[var(--atelier-muted)] leading-relaxed flex gap-2">
                <Ban className="h-4 w-4 shrink-0 mt-0.5 text-[var(--atelier-faint)]" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-[var(--atelier-faint)] flex items-center gap-2">
          <AlarmClock className="h-3.5 w-3.5" />
          Scout writes every 4 hours. You sit at 11:30 and 19:00 and pick. Skip leftovers.
        </p>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
  compact,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? '' : 'space-y-1'}>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--atelier-gold)]">
        {eyebrow}
      </p>
      <h3
        className={`font-headline font-extrabold tracking-tight text-[var(--atelier-ink)] ${
          compact ? 'text-xl' : 'text-2xl sm:text-3xl'
        }`}
      >
        {title}
      </h3>
      {sub ? <p className="text-sm text-[var(--atelier-muted)] max-w-xl leading-relaxed">{sub}</p> : null}
    </div>
  );
}

function ProgressPill({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
        hot
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
          : 'border-[var(--atelier-line)] bg-[var(--atelier-card)] text-[var(--atelier-ink)]'
      }`}
    >
      <Sparkles className="h-3.5 w-3.5 text-[var(--atelier-gold)]" />
      {label} {value}
    </span>
  );
}
