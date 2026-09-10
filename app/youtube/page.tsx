import { Metadata } from 'next';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  ChevronDown,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { YoutubeGrid } from '@/components/youtube-grid';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'YouTube',
  description:
    'Video essays on AI in practice and the mind that grows with it. Tutorials, reviews, and essays on learning.',
  alternates: { canonical: '/youtube' },
};

const PROMISES = [
  {
    icon: Sparkles,
    title: 'AI, hands on',
    body: 'Tutorials and reviews. What the tools do, where they break, how to use them well.',
  },
  {
    icon: Brain,
    title: 'The mind, kept',
    body: 'Learning, memory, judgment. How to grow more capable with AI in the room.',
  },
  {
    icon: FlaskConical,
    title: 'Built, not told',
    body: 'Small demos and honest tests. Process on screen, not slogans.',
  },
] as const;

export default function YouTubePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <Navigation />

      <main id="page-main" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-24 pb-20 sm:px-6 sm:pt-28 lg:px-10 lg:pb-24 xl:px-12">
        {/* Hero — the channel as an object, not a centered paragraph */}
        <section className="home-hero relative isolate grid min-h-[min(78svh,760px)] grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12 lg:px-14 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 space-y-7 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-7"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Video essays · {siteConfig.twitterHandle}
            </p>

            <div className="max-w-2xl">
              <p className="mb-4 font-label text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                On camera
              </p>
              <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.9rem)] font-medium leading-[0.98] tracking-[-0.045em] text-primary dark:text-white">
                The machine learns. <span className="text-accent">So must we.</span>
              </h1>
            </div>

            <p className="max-w-xl font-body text-[1.05rem] leading-[1.65] text-on-surface-variant dark:text-white/70 sm:text-lg">
              AI tutorials, honest reviews, essays on learning. The tool <em>and</em> the mind
              behind it.
            </p>

            <div className="grid max-w-xl grid-cols-2 gap-5 border-t border-slate-900/[0.12] pt-5 dark:border-white/15">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  On screen
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  AI builds + reviews
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Underneath
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Learning, at the center
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-extrabold tracking-tight"
              >
                Subscribe on YouTube <ArrowUpRight className="btn-icon h-4 w-4" />
              </a>
              <Link
                href="/journal"
                className="home-hero-secondary h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-bold tracking-tight"
              >
                Read while you wait <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              <a href="#shape" className="transition-colors hover:text-accent">
                The shape ↓
              </a>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
              <a href="#more" className="transition-colors hover:text-accent">
                Stay close
              </a>
            </div>
          </motion.div>

          {/* Artifact — a channel card: what the work is about. No dates, no promises, nothing fake. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-900/[0.1] bg-white shadow-[0_28px_68px_-34px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 border-b border-slate-900/[0.08] px-5 py-3.5 dark:border-white/10">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    <span className="truncate">The channel</span>
                  </p>
                  <a
                    href={siteConfig.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-accent px-4 py-2 font-headline text-xs font-extrabold tracking-tight text-slate-950 transition-transform duration-300 hover:translate-x-0.5"
                  >
                    Subscribe <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="space-y-2.5 p-5 sm:p-6">
                  {[
                    { n: '01', title: 'AI, hands on', hint: 'Tutorials · Reviews' },
                    { n: '02', title: 'The mind, kept', hint: 'Learning · Memory · Judgment' },
                    { n: '03', title: 'Built, not told', hint: 'Demos · Honest tests' },
                  ].map((row) => (
                    <div
                      key={row.n}
                      className="flex items-center gap-3 rounded-2xl border border-slate-900/[0.06] bg-slate-50/70 p-3.5 dark:border-white/[0.07] dark:bg-white/[0.03]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-mono text-[11px] font-bold text-accent">
                        {row.n}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-headline text-sm font-bold text-primary">
                          {row.title}
                        </span>
                        <span className="block truncate font-body text-xs text-on-surface-variant">
                          {row.hint}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="border-t border-slate-900/[0.08] px-5 py-4 font-body text-sm leading-relaxed text-on-surface-variant dark:border-white/10">
                  The journal and Notes, on camera.
                </p>
              </div>

              <div className="absolute -right-2 top-16 hidden rotate-2 rounded-full border border-slate-900/[0.08] bg-white px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-lg sm:block dark:border-white/10 dark:bg-slate-900 dark:text-white">
                AI, hands on
              </div>
              <div className="absolute -left-2 bottom-14 hidden -rotate-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-accent shadow-lg backdrop-blur-sm sm:block">
                Mind, kept
              </div>
            </div>
          </motion.div>

          <a
            href="#shape"
            className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-primary dark:text-white/45 dark:hover:text-white lg:inline-flex"
            aria-label="Scroll to the shape"
          >
            The shape <ChevronDown className="scroll-hint h-3.5 w-3.5" />
          </a>
        </section>

        {/* Promise strip */}
        <section id="shape" className="scroll-mt-32 py-14 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                The shape
              </span>
              <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                Sharp tools. Sharper minds.
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
              Demos, reviews, and the science underneath.
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

        {/* Episodes — honest shelf until filming starts */}
        <section id="episodes" className="scroll-mt-32 border-t border-slate-900/[0.08] py-14 dark:border-white/10 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Shelf
              </span>
              <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                Older films, kept.
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
              Early films below. What&apos;s next: AI, and the mind.
            </p>
          </div>
          <YoutubeGrid />
        </section>

        {/* Closing */}
        <section id="more" className="scroll-mt-32 py-14 sm:py-16 lg:py-20">
          <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:rounded-[2.5rem] md:p-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Stay close
                </span>
                <h2 className="cta-card-heading mt-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl">
                  Thinking already live. Films to follow.
                </h2>
                <p className="cta-card-copy mt-4 max-w-md font-body text-base leading-relaxed">
                  Subscribe once — or read today.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={siteConfig.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent inline-flex items-center justify-center rounded-2xl px-6 py-3.5 font-headline text-sm font-bold tracking-tight"
                  >
                    Subscribe on YouTube
                    <ArrowUpRight className="btn-icon h-4 w-4" />
                  </a>
                  <Link
                    href="/notes"
                    className="cta-card-secondary inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 font-headline text-sm font-semibold transition-colors"
                  >
                    Try Notes first
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="grid content-center gap-4 lg:col-span-6">
                {[
                  { step: 'Step 1', title: 'Subscribe', body: 'One click. New films land in your feed.' },
                  { step: 'Step 2', title: 'Read meanwhile', body: 'Journal essays and Notes carry the same ideas now.' },
                  { step: 'Step 3', title: 'Build along', body: 'Tutorials are made to follow, not just watch.' },
                ].map((row) => (
                  <div
                    key={row.title}
                    className="flex gap-4 rounded-2xl border border-slate-900/[0.08] bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-mono text-xs font-bold text-accent">
                      {row.step.replace('Step ', '')}
                    </span>
                    <span>
                      <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        {row.step}
                      </span>
                      <span className="mt-1 block font-headline text-lg font-bold tracking-tight text-primary">
                        {row.title}
                      </span>
                      <span className="mt-1.5 block font-body text-sm leading-relaxed text-on-surface-variant">
                        {row.body}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              <span className="text-slate-400 dark:text-white/40">Start reading</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
              <Link href="/journal" className="transition-colors hover:text-accent">Journal</Link>
              <Link href="/notes" className="transition-colors hover:text-accent">Notes</Link>
              <Link href="/community" className="transition-colors hover:text-accent">Community</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
