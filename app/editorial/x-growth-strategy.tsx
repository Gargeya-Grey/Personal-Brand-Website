'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  AlarmClock,
  ArrowRight,
  Ban,
  Check,
  DoorOpen,
  Heart,
  Lightbulb,
  MessageCircle,
  Quote,
  Sparkles,
  Sun,
  Sunset,
  Target,
  Timer,
  Users,
  X,
} from 'lucide-react';
import {
  AUDIENCE,
  CONTENT_MIX,
  DAILY_COUNTS,
  ENTER_ROOMS,
  GROWTH_HONEST,
  GROWTH_STRATEGY_UPDATED,
  HOW_TO_FOLLOW,
  MONTHLY_CHECK,
  MORNING_CARD,
  NINETY_DAYS,
  POST_ACTIONS,
  POST_SHAPE,
  PROFILE_POSITION,
  REPLY_OR_QUOTE,
  SITTINGS,
  SKIP_ROOMS,
  STOP_FOR_NINETY,
  THESIS,
  WEEKLY_CADENCE,
  WEEKLY_CHECK,
  WRITE_RULES,
} from '@/lib/x-growth-strategy';

const TRACK_KEY = 'x_growth_strategy_track';

type Track = {
  date: string;
  morning: boolean;
  evening: boolean;
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
  const empty: Track = { date, morning: false, evening: false };

  try {
    const raw = localStorage.getItem(TRACK_KEY);
    if (!raw) return empty;

    const parsed = JSON.parse(raw) as Track;
    if (parsed.date !== date) return empty;

    return {
      date,
      morning: Boolean(parsed.morning),
      evening: Boolean(parsed.evening),
    };
  } catch {
    return empty;
  }
}

const NAV = [
  { id: 'today', label: 'Start here' },
  { id: 'profile', label: 'Identity' },
  { id: 'mix', label: 'Content' },
  { id: 'write', label: 'Writing' },
  { id: 'week', label: '90 days' },
  { id: 'rooms', label: 'Rooms' },
] as const;

export function XGrowthStrategy() {
  const [track, setTrack] = useState<Track>(loadTrack);
  const [openPart, setOpenPart] = useState<string>('beliefs');
  const [activeNav, setActiveNav] = useState('today');

  useEffect(() => {
    if (!track.date) return;

    try {
      localStorage.setItem(TRACK_KEY, JSON.stringify(track));
    } catch {
      /* Tracking is a convenience, never a blocker. */
    }
  }, [track]);

  useEffect(() => {
    const elements = NAV.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => Boolean(element)
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveNav(visible.target.id);
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.2, 0.5] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const sittingsDone = (track.morning ? 1 : 0) + (track.evening ? 1 : 0);
  const openPersonality = useMemo(
    () => CONTENT_MIX.find((part) => part.id === openPart) ?? CONTENT_MIX[0],
    [openPart]
  );

  const toggleSitting = (id: 'morning' | 'evening') => {
    setTrack((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="strategy-page space-y-10 sm:space-y-14">
      <section className="strategy-hero">
        <div className="strategy-hero-grid">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="strategy-badge strategy-badge-live">
                <span className="strategy-live-dot" />
                Live operating system
              </span>
              <span className="strategy-badge">Updated {GROWTH_STRATEGY_UPDATED}</span>
            </div>

            <p className="strategy-kicker mt-8">A 90-day field guide</p>
            <h2 className="strategy-hero-title mt-3">
              Become known for
              <span>one important question.</span>
            </h2>
            <p className="strategy-hero-question mt-5">{PROFILE_POSITION.line}</p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link href="/editorial?workspace=x" className="atelier-btn atelier-btn-gold">
                Open To-Do <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#today" className="strategy-text-link">
                Start today <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <aside className="strategy-hero-aside">
            <div className="strategy-hero-aside-top">
              <p className="strategy-kicker">The north star</p>
              <Target className="h-5 w-5 text-[var(--atelier-gold)]" />
            </div>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-[var(--atelier-ink)]">
              {THESIS.statement}
            </p>
            <div className="strategy-hero-rule mt-6">
              <p className="strategy-kicker">Operating principle</p>
              <p className="mt-2 font-headline text-xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
                {THESIS.principle}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <HeroStat value="2" label="sittings / day" />
              <HeroStat value="90" label="days fixed" />
            </div>
          </aside>
        </div>
      </section>

      <nav className="strategy-rail" aria-label="Strategy sections">
        <span className="strategy-rail-label">Guide</span>
        <div className="flex min-w-max items-center gap-1">
          {NAV.map((item) => {
            const active = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={'#' + item.id}
                aria-current={active ? 'location' : undefined}
                className={'strategy-rail-link' + (active ? ' is-active' : '')}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      <section id="today" className="strategy-section scroll-mt-36">
        <SectionIntro
          number="01"
          eyebrow="Start here"
          title="Two sittings. Then leave."
          sub="The system is designed to fit inside a day, not consume one. Check a sitting when you finish; this progress stays on this device."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid gap-4 md:grid-cols-2">
            {SITTINGS.map((sitting, index) => {
              const done = sitting.id === 'morning' ? track.morning : track.evening;
              const Icon = sitting.id === 'morning' ? Sun : Sunset;

              return (
                <button
                  key={sitting.id}
                  type="button"
                  aria-pressed={done}
                  onClick={() => toggleSitting(sitting.id)}
                  className={'strategy-sitting' + (done ? ' is-done' : '')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="strategy-sitting-index">0{index + 1}</span>
                    <span className="strategy-sitting-state">
                      {done ? <Check className="h-3.5 w-3.5" /> : 'Open'}
                      {done ? 'Done' : ''}
                    </span>
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <span className="strategy-icon-box">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="text-left">
                      <p className="font-headline text-lg font-extrabold tracking-tight text-[var(--atelier-ink)]">
                        {sitting.name}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[var(--atelier-gold)]">{sitting.time}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-left text-sm leading-relaxed text-[var(--atelier-muted)]">
                    {sitting.why}
                  </p>
                  <ul className="mt-4 space-y-2 text-left">
                    {sitting.do.map((line) => (
                      <li key={line} className="flex gap-2 text-sm leading-relaxed text-[var(--atelier-ink)]">
                        <span className="mt-1 text-[var(--atelier-gold)]">•</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--atelier-faint)]">
                    <Timer className="h-3.5 w-3.5" />
                    {sitting.minutes} minute cap
                  </p>
                </button>
              );
            })}
          </div>

          <aside className="strategy-command">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="strategy-kicker">Today&apos;s state</p>
                <p className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
                  {sittingsDone}/2
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-[var(--atelier-gold)]" />
            </div>
            <div className="strategy-progress mt-5" aria-label={sittingsDone + ' of 2 sittings complete'}>
              <span style={{ width: (sittingsDone / 2) * 100 + '%' }} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[var(--atelier-muted)]">
              Pick the strongest room. Add something useful. Stop before the feed starts choosing for you.
            </p>
            <Link href="/editorial?workspace=x" className="atelier-btn atelier-btn-primary mt-6 w-full">
              Choose a pack <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="strategy-mini-note mt-4">
              <Timer className="h-4 w-4 shrink-0 text-[var(--atelier-gold)]" />
              <span>Two short sessions beat one anxious scroll.</span>
            </div>
          </aside>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="strategy-surface">
            <SurfaceHeading eyebrow="After the sitting" title="Five quiet checks" icon={<Check className="h-4 w-4" />} />
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {MORNING_CARD.map((line, index) => (
                <li key={line} className="strategy-check-row">
                  <span>{index + 1}</span>
                  <p>{line}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="strategy-surface strategy-surface-accent">
            <SurfaceHeading eyebrow="The rule" title="Do the work, then leave." icon={<Lightbulb className="h-4 w-4" />} />
            <p className="mt-4 text-sm leading-relaxed text-[var(--atelier-muted)]">
              {GROWTH_HONEST.body}
            </p>
            <div className="strategy-quote mt-5">
              <p className="text-sm font-semibold leading-relaxed text-[var(--atelier-ink)]">
                {GROWTH_HONEST.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="profile" className="strategy-section scroll-mt-36">
        <SectionIntro
          number="02"
          eyebrow="Identity"
          title="Make the question easy to remember."
          sub="The profile is not a second strategy. It is the shortest, clearest doorway into the territory."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="strategy-profile-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="strategy-kicker">The profile line</p>
                <p className="mt-4 max-w-2xl font-headline text-2xl font-extrabold leading-tight tracking-tight text-[var(--atelier-ink)] sm:text-3xl">
                  {PROFILE_POSITION.line}
                </p>
              </div>
              <Users className="hidden h-6 w-6 shrink-0 text-[var(--atelier-gold)] sm:block" />
            </div>

            <div className="mt-8 grid gap-5 border-t border-[var(--atelier-line)] pt-5 sm:grid-cols-2">
              <div>
                <p className="strategy-kicker">Bio</p>
                <div className="mt-3 space-y-1 text-sm leading-relaxed text-[var(--atelier-ink)]">
                  {PROFILE_POSITION.bio.split('\n').map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="strategy-kicker">Pinned signal</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--atelier-muted)]">{PROFILE_POSITION.pin}</p>
              </div>
            </div>
          </div>

          <div className="strategy-surface">
            <SurfaceHeading eyebrow="Who this is for" title="A narrow audience is a kind one." icon={<Users className="h-4 w-4" />} />
            <ul className="mt-5 space-y-3">
              {AUDIENCE.map((person) => (
                <li key={person} className="flex gap-3 text-sm leading-relaxed text-[var(--atelier-ink)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--atelier-gold)]" />
                  {person}
                </li>
              ))}
            </ul>
            <div className="strategy-subtle-note mt-6">
              <p className="strategy-kicker">The split</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">{PROFILE_POSITION.split}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="mix" className="strategy-section scroll-mt-36">
        <SectionIntro
          number="03"
          eyebrow="Content system"
          title="One strong signal, four ways to carry it."
          sub="The thesis stays fixed. The content type changes the doorway into it."
        />

        <div className="strategy-metrics mt-6">
          {DAILY_COUNTS.map((count) => (
            <div key={count.label} className="strategy-metric">
              <p className="strategy-metric-number">{count.n}</p>
              <p className="font-headline font-bold text-[var(--atelier-ink)]">{count.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--atelier-muted)]">{count.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="strategy-surface">
            <SurfaceHeading eyebrow="Reply or quote" title="Almost always reply." icon={<MessageCircle className="h-4 w-4" />} />
            <div className="mt-5 space-y-5">
              <SignalRow icon={<MessageCircle className="h-4 w-4" />} text={REPLY_OR_QUOTE.default} />
              <SignalRow icon={<Quote className="h-4 w-4" />} text={REPLY_OR_QUOTE.once} muted />
            </div>
            <div className="strategy-warning mt-5">
              <Ban className="h-4 w-4 shrink-0" />
              <p>{REPLY_OR_QUOTE.never}</p>
            </div>
          </div>

          <div className="strategy-surface">
            <SurfaceHeading eyebrow="The original mix" title="Choose the doorway." icon={<Sparkles className="h-4 w-4" />} />
            <div className="mt-5 flex flex-wrap gap-2">
              {CONTENT_MIX.map((part) => {
                const active = openPart === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setOpenPart(part.id)}
                    className={'strategy-filter' + (active ? ' is-active' : '')}
                  >
                    {part.name}
                  </button>
                );
              })}
            </div>
            <div className="strategy-lens mt-5">
              <p className="strategy-kicker">{openPersonality.feel}</p>
              <p className="mt-3 text-base font-semibold leading-relaxed text-[var(--atelier-ink)]">
                {openPersonality.believe}
              </p>
              <blockquote className="mt-5 border-l-2 border-[var(--atelier-gold)] pl-4 text-sm italic leading-relaxed text-[var(--atelier-muted)]">
                {openPersonality.example}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section id="write" className="strategy-section scroll-mt-36">
        <SectionIntro
          number="04"
          eyebrow="Writing mechanics"
          title="Give the reader somewhere to go."
          sub="A good post does not end at the statement. It creates a useful next move."
        />

        <div className="strategy-flow mt-6">
          {POST_SHAPE.map((part) => (
            <article key={part.step} className="strategy-flow-step">
              <span className="strategy-flow-number">{part.step}</span>
              <p className="mt-5 font-headline text-lg font-extrabold tracking-tight text-[var(--atelier-ink)]">
                {part.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">{part.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="strategy-surface">
            <SurfaceHeading eyebrow="One clear action" title="What should this post earn?" icon={<Heart className="h-4 w-4" />} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {POST_ACTIONS.map((action) => (
                <div key={action.action} className="strategy-action-card">
                  <p className="font-headline font-bold text-[var(--atelier-ink)]">{action.action}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--atelier-muted)]">{action.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="strategy-surface strategy-surface-accent">
            <SurfaceHeading eyebrow="The follow-through" title="Useful beats polished." icon={<ArrowRight className="h-4 w-4" />} />
            <ol className="mt-5 space-y-3">
              {HOW_TO_FOLLOW.map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="strategy-mini-number">{item.step}</span>
                  <div>
                    <p className="font-headline text-sm font-bold text-[var(--atelier-ink)]">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--atelier-muted)]">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WRITE_RULES.map((rule) => (
            <div key={rule.good} className="strategy-rule-card">
              <p className="strategy-rule-good">
                <Heart className="h-4 w-4 shrink-0" />
                {rule.good}
              </p>
              <p className="strategy-rule-bad">
                <X className="h-4 w-4 shrink-0" />
                {rule.bad}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="week" className="strategy-section scroll-mt-36">
        <SectionIntro
          number="05"
          eyebrow="The 90-day wedge"
          title="Repeat what people remember."
          sub="Measure qualified attention, learn which angles travel, and let the thesis compound."
        />

        <div className="strategy-timeline mt-6">
          {NINETY_DAYS.map((phase, index) => (
            <article key={phase.range} className="strategy-timeline-card">
              <span className="strategy-timeline-index">0{index + 1}</span>
              <p className="strategy-kicker mt-6">{phase.range}</p>
              <p className="mt-3 font-headline text-xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
                {phase.job}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="strategy-surface">
            <SurfaceHeading eyebrow="Weekly operating rhythm" title="A cadence you can keep." icon={<Timer className="h-4 w-4" />} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {WEEKLY_CADENCE.map((item, index) => (
                <div key={item.label + item.text} className="strategy-cadence-row">
                  <span className="strategy-mini-number">0{index + 1}</span>
                  <div>
                    <p className="strategy-kicker">{item.label}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--atelier-ink)]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="strategy-surface">
            <SurfaceHeading eyebrow="Review without spiraling" title="Keep the mission fixed." icon={<Target className="h-4 w-4" />} />
            <div className="mt-5 space-y-4">
              <ReviewList items={WEEKLY_CHECK} />
              <div className="strategy-subtle-note">
                <p className="strategy-kicker">Milestones</p>
                <div className="mt-3 space-y-3">
                  {MONTHLY_CHECK.map((item) => (
                    <p key={item.week} className="text-sm leading-relaxed text-[var(--atelier-muted)]">
                      <span className="font-semibold text-[var(--atelier-ink)]">{item.week}.</span> {item.do}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rooms" className="strategy-section scroll-mt-36 pb-4">
        <SectionIntro
          number="06"
          eyebrow="Room selection"
          title="Walk in. Add something. Walk out."
          sub="Borrow big rooms for discovery, but keep the contribution grounded in your territory."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="strategy-room strategy-room-enter">
            <div className="flex items-center justify-between gap-3">
              <p className="font-headline text-xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
                Enter
              </p>
              <DoorOpen className="h-5 w-5 text-[var(--atelier-gold)]" />
            </div>
            <ul className="mt-5 space-y-3">
              {ENTER_ROOMS.map((room) => (
                <li key={room} className="flex gap-3 text-sm leading-relaxed text-[var(--atelier-ink)]">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--atelier-gold)]" />
                  {room}
                </li>
              ))}
            </ul>
          </div>

          <div className="strategy-room strategy-room-skip">
            <div className="flex items-center justify-between gap-3">
              <p className="font-headline text-xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
                Walk past
              </p>
              <Ban className="h-5 w-5 text-[var(--atelier-faint)]" />
            </div>
            <ul className="mt-5 space-y-3">
              {SKIP_ROOMS.map((room) => (
                <li key={room} className="flex gap-3 text-sm leading-relaxed text-[var(--atelier-muted)]">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--atelier-faint)]" />
                  {room}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="strategy-stop-panel mt-4">
          <div>
            <p className="strategy-kicker">Stop for 90 days</p>
            <p className="mt-2 font-headline text-xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
              Do not let a quiet week rewrite the strategy.
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {STOP_FOR_NINETY.map((line) => (
              <li key={line} className="flex gap-2 text-sm leading-relaxed text-[var(--atelier-muted)]">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[var(--atelier-faint)]" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="strategy-footer-note mt-5">
          <AlarmClock className="h-3.5 w-3.5" />
          Scout writes every 4 hours. You sit at 11:30 and 19:00, pick what is worth carrying, and skip leftovers.
        </p>
      </section>
    </div>
  );
}

function SectionIntro({
  number,
  eyebrow,
  title,
  sub,
}: {
  number: string;
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="strategy-section-intro">
      <span className="strategy-section-number">{number}</span>
      <div>
        <p className="strategy-kicker">{eyebrow}</p>
        <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-[var(--atelier-ink)] sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--atelier-muted)]">{sub}</p>
      </div>
    </div>
  );
}

function SurfaceHeading({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="strategy-kicker">{eyebrow}</p>
        <p className="mt-2 font-headline text-lg font-extrabold tracking-tight text-[var(--atelier-ink)]">
          {title}
        </p>
      </div>
      <span className="strategy-heading-icon">{icon}</span>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="strategy-hero-stat">
      <p className="font-headline text-2xl font-extrabold tracking-tight text-[var(--atelier-ink)]">{value}</p>
      <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--atelier-muted)]">
        {label}
      </p>
    </div>
  );
}

function SignalRow({ icon, text, muted }: { icon: ReactNode; text: string; muted?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="strategy-heading-icon shrink-0">{icon}</span>
      <p className={'text-sm leading-relaxed ' + (muted ? 'text-[var(--atelier-muted)]' : 'text-[var(--atelier-ink)]')}>
        {text}
      </p>
    </div>
  );
}

function ReviewList({
  items,
}: {
  items: readonly { item: string; done: string }[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((review) => (
        <li key={review.item} className="flex gap-3 text-sm leading-relaxed text-[var(--atelier-muted)]">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--atelier-gold)]" />
          <span>
            <strong className="text-[var(--atelier-ink)]">{review.item}.</strong> {review.done}
          </span>
        </li>
      ))}
    </ul>
  );
}
