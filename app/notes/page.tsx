import type { Metadata } from 'next';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Mail,
  Moon,
  Target,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { AuthorAvatar } from '@/components/author-avatar';
import { getPublicNotes } from '@/lib/newsletter-service';
import { SAMPLE_NOTE } from '@/lib/newsletter-sample';
import { formatNoteDate, wordCount } from '@/lib/newsletter-model';
import { NotesBody } from '@/components/notes-body';
import { NotesMasthead } from '@/components/notes-masthead';
import { notesBrand } from '@/lib/notes-brand';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `${notesBrand.name}`,
  description: `${notesBrand.tagline} A weekly letter from Gargeya on the human mind, learning with AI, and what we actually score. Sunday evening. No roundup.`,
  alternates: { canonical: '/notes' },
};

export const dynamic = 'force-dynamic';

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const PROMISES = [
  {
    icon: Target,
    title: 'One claim',
    body: 'Carried through to the end. Quiet weeks stay quiet.',
  },
  {
    icon: BookOpen,
    title: 'Real evidence',
    body: 'Studies and trials, linked. Check the numbers yourself.',
  },
  {
    icon: Moon,
    title: 'No noise',
    body: 'Sunday evening, your time. Never a roundup.',
  },
] as const;

export default async function NotesPage() {
  const sent = await getPublicNotes();
  const example = sent[0]
    ? {
        title: sent[0].title,
        dek: sent[0].dek,
        bodyMd: sent[0].bodyMd,
        weekOf: sent[0].weekOf,
        slug: sent[0].slug,
        links: sent[0].links,
      }
    : SAMPLE_NOTE;
  const exampleIsLive = Boolean(sent[0]);
  const exampleWeekOf = example.weekOf === 'example' ? '2026-09-06' : example.weekOf;
  const exampleMinutes = Math.max(1, Math.round(wordCount(example.bodyMd) / 220));
  const second = sent[1] || null;
  const exampleHeadings = example.bodyMd
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-24 pb-20 sm:px-6 sm:pt-28 lg:px-10 lg:pb-24 xl:px-12"
      >
        {/* Hero — the letter as an object, not a centered paragraph */}
        <section className="home-hero relative isolate grid min-h-[min(78svh,760px)] grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12 lg:px-14 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 space-y-7 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-7"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Sunday evening · One argument · ~{exampleMinutes} min
            </p>

            <NotesMasthead size="hero" />

            <p className="max-w-xl font-body text-[1.05rem] leading-[1.65] text-on-surface-variant sm:text-lg">
              A Sunday letter from {siteConfig.shortName} on how people learn and grow with AI in
              the room: capability, judgment, assessment, and the techniques that keep you in the
              loop. Not a news dump. Not a recap of tweets.
            </p>

            <div className="flex items-center gap-3">
              <AuthorAvatar src={siteConfig.authorAvatar} name={siteConfig.name} size="md" />
              <div className="leading-tight">
                <p className="font-label text-sm font-semibold text-primary">{siteConfig.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {siteConfig.authorRole} · Free · Sunday 19:00 local
                </p>
              </div>
            </div>

            <div className="max-w-xl rounded-2xl border border-slate-900/[0.08] bg-white/70 p-4 backdrop-blur-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="mb-3 font-headline text-base font-bold text-primary">
                Get it on Sunday evening
              </p>
              <NewsletterSignup source="notes" variant="light" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              <a href="#latest" className="transition-colors hover:text-accent">
                Read the latest ↓
              </a>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
              <a href="#archive" className="transition-colors hover:text-accent">
                Browse the inbox
              </a>
            </div>
          </motion.div>

          {/* Letter artifact — an email window, not a text card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-[480px]">
              {second ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-x-6 -top-6 rotate-[-3deg] rounded-[1.5rem] border border-slate-900/[0.08] bg-white/60 p-5 opacity-70 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    {formatNoteDate(second.weekOf)}
                  </p>
                  <p className="mt-1 truncate font-headline text-sm font-bold text-primary">
                    {second.title}
                  </p>
                </div>
              ) : null}

              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-900/[0.1] bg-white shadow-[0_28px_68px_-34px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 border-b border-slate-900/[0.08] px-5 py-3.5 dark:border-white/10">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="truncate">Notes — Sunday letter</span>
                  </p>
                  <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-accent">
                    19:00
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <AuthorAvatar src={siteConfig.authorAvatar} name={siteConfig.name} size="sm" />
                    <div className="min-w-0 leading-tight">
                      <p className="truncate font-label text-sm font-semibold text-primary">
                        {siteConfig.name}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">
                        to you · {formatNoteDate(exampleWeekOf)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 font-headline text-xl font-bold leading-snug tracking-tight text-primary">
                    {example.title}
                  </p>
                  {example.dek ? (
                    <p className="mt-1.5 line-clamp-3 font-body text-sm leading-relaxed text-on-surface-variant">
                      {example.dek}
                    </p>
                  ) : null}

                  {/* Paper lines — suggests a real letter without re-rendering the body */}
                  <div className="mt-5 space-y-2.5" aria-hidden="true">
                    <div className="h-2 rounded-full bg-slate-900/[0.08] dark:bg-white/10" />
                    <div className="h-2 w-[92%] rounded-full bg-slate-900/[0.08] dark:bg-white/10" />
                    <div className="h-2 w-[84%] rounded-full bg-accent/25" />
                    <div className="h-2 w-[95%] rounded-full bg-slate-900/[0.08] dark:bg-white/10" />
                    <div className="h-2 w-[70%] rounded-full bg-slate-900/[0.08] dark:bg-white/10" />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-900/[0.08] pt-4 dark:border-white/10">
                    <span className="flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                      <Clock className="h-3.5 w-3.5 text-accent" />~{exampleMinutes} min
                    </span>
                    <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                      One argument · No roundup
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 top-16 hidden rotate-2 rounded-full border border-slate-900/[0.08] bg-white px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-lg sm:block dark:border-white/10 dark:bg-slate-900 dark:text-white">
                Reply-friendly
              </div>
              <div className="absolute -left-2 bottom-14 hidden -rotate-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-accent shadow-lg backdrop-blur-sm sm:block">
                Unsubscribe anytime
              </div>
            </div>
          </motion.div>
        </section>

        {/* Promise strip */}
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                What you get
              </span>
              <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                Built like a letter.
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
              Nothing filler. When it lands, this is the shape.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {PROMISES.map((promise) => (
              <article key={promise.title} className="board-card group rounded-[1.75rem] p-7">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-white">
                  <promise.icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                </div>
                <h3 className="font-headline text-xl font-bold tracking-tight text-primary">
                  {promise.title}
                </h3>
                <p className="mt-3 font-body text-[15px] leading-relaxed text-on-surface-variant">
                  {promise.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Latest letter — wide reading preview + rail */}
        <section id="latest" className="scroll-mt-32 border-t border-slate-900/[0.08] py-14 dark:border-white/10 sm:py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                {exampleIsLive ? 'Latest letter' : 'How a letter looks'}
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-primary sm:text-4xl">
                {example.title}
              </h2>
              {example.dek ? (
                <p className="mt-3 font-body text-lg leading-relaxed text-on-surface-variant">
                  {example.dek}
                </p>
              ) : null}
              <p className="mt-3 text-sm text-on-surface-variant">
                {siteConfig.shortName} · {formatNoteDate(exampleWeekOf)} · ~{exampleMinutes} min
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!exampleIsLive ? (
                <span className="inline-flex items-center rounded-full border border-slate-200/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant dark:border-white/10">
                  Sample · live lands Sunday
                </span>
              ) : null}
              {exampleIsLive ? (
                <Link
                  href={`/notes/${example.slug}`}
                  className="btn-accent inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-headline text-sm font-bold"
                >
                  Continue reading <ArrowRight className="btn-icon h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="surface-panel relative overflow-hidden rounded-[1.75rem] lg:col-span-8">
              <div
                className="max-h-[36rem] overflow-hidden p-6 sm:p-10"
                aria-hidden={exampleIsLive ? true : undefined}
                {...(exampleIsLive ? { inert: true } : {})}
              >
                <div className="notes-prose article-prose">
                  <NotesBody content={example.bodyMd} />
                </div>
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[var(--color-surface)]"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-7">
                {exampleIsLive ? (
                  <Link
                    href={`/notes/${example.slug}`}
                    className="btn-accent rounded-2xl px-6 py-3 font-headline text-sm font-bold"
                  >
                    Continue reading
                    <ArrowRight className="btn-icon h-4 w-4" />
                  </Link>
                ) : (
                  <span className="board-card inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-on-surface-variant">
                    Full letter lands Sunday
                  </span>
                )}
              </div>
            </div>

            <aside className="space-y-5 lg:col-span-4">
              {exampleHeadings.length > 0 ? (
                <div className="board-card rounded-[1.5rem] p-6">
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    Inside this letter
                  </p>
                  <ol className="mt-4 space-y-3">
                    {exampleHeadings.map((heading, i) => (
                      <li key={`${slugifyHeading(heading)}-${i}`} className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-bold text-accent">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-headline text-sm font-semibold leading-snug text-primary">
                          {heading}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="board-card rounded-[1.5rem] p-6">
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  At a glance
                </p>
                <dl className="mt-4 space-y-3 font-body text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between gap-3">
                    <dt>Date</dt>
                    <dd className="font-semibold text-primary">{formatNoteDate(exampleWeekOf)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>Read time</dt>
                    <dd className="font-semibold text-primary">~{exampleMinutes} min</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>Cadence</dt>
                    <dd className="font-semibold text-primary">Sunday 19:00</dd>
                  </div>
                </dl>
                <p className="mt-4 border-t border-slate-900/[0.08] pt-4 font-body text-sm leading-relaxed text-on-surface-variant dark:border-white/10">
                  If this landed, reply and tell me where it broke — every letter ends with an
                  inbox, not a like button.
                </p>
              </div>

              {example.links.length > 0 ? (
                <div className="board-card rounded-[1.5rem] p-6">
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    Go deeper
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {example.links.slice(0, 4).map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-start gap-1.5 font-body text-sm font-medium text-accent hover:underline"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </section>

        {/* Archive — an inbox, not a bullet list */}
        {sent.length > 0 ? (
          <section id="archive" className="scroll-mt-32 border-t border-slate-900/[0.08] py-14 dark:border-white/10 sm:py-16 lg:py-20">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  The inbox
                </span>
                <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                  Recent letters.
                </h2>
              </div>
              <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
                {sent.length} {sent.length === 1 ? 'letter' : 'letters'} live · one a week, only
                when honest.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/[0.08] bg-white dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-900/[0.08] px-5 py-3.5 sm:px-7 dark:border-white/10">
                <p className="flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  <Mail className="h-3.5 w-3.5 text-accent" /> Inbox
                </p>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Sunday 19:00
                </p>
              </div>
              <ul className="divide-y divide-slate-900/[0.06] dark:divide-white/[0.07]">
                {sent.map((week, i) => {
                  const minutes = Math.max(1, Math.round(wordCount(week.bodyMd) / 220));
                  return (
                    <li key={week.id}>
                      <Link
                        href={`/notes/${week.slug}`}
                        className="group grid gap-3 px-5 py-5 transition-colors duration-300 hover:bg-accent/[0.05] sm:grid-cols-12 sm:items-center sm:gap-6 sm:px-7"
                      >
                        <div className="flex items-center gap-3 sm:col-span-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-accent' : 'bg-slate-300 dark:bg-white/20'}`}
                            aria-hidden="true"
                          />
                          <span className="font-mono text-xs font-semibold text-on-surface-variant">
                            {formatNoteDate(week.weekOf)}
                          </span>
                        </div>
                        <div className="min-w-0 sm:col-span-8">
                          <p className="truncate font-headline text-lg font-bold tracking-tight text-primary transition-colors group-hover:text-accent">
                            {week.title}
                          </p>
                          {week.dek ? (
                            <p className="mt-0.5 truncate font-body text-sm text-on-surface-variant">
                              {week.dek}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 sm:col-span-2 sm:justify-end">
                          <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                            ~{minutes} min
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Closing — the promise restated, one more inbox door */}
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:rounded-[2.5rem] md:p-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Sunday evening
                </span>
                <h2 className="cta-card-heading mt-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl">
                  One argument. Evidence attached. Reply open.
                </h2>
                <ul className="mt-6 space-y-3">
                  {[
                    'A single claim, carried through to a technique you can use.',
                    'Studies and trials linked — check the numbers yourself.',
                    'Quiet weeks stay quiet. No filler to feed a schedule.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-on-surface-variant sm:text-[15px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-6">
                <div className="rounded-[1.5rem] border border-slate-900/[0.08] bg-white/70 p-5 backdrop-blur-sm sm:p-7 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="font-headline text-lg font-bold text-primary">Get the next one</p>
                  <p className="mt-1.5 mb-5 font-body text-sm text-on-surface-variant">
                    Free · Sunday 19:00 in your timezone · unsubscribe anytime.
                  </p>
                  <NewsletterSignup source="notes-closing" variant="light" />
                  <a
                    href="#latest"
                    className="project-link mt-5 rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>Read this week first</span>
                    <ArrowRight className="btn-icon h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
