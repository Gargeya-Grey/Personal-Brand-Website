import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Award,
  ChevronDown,
  Users,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'X & Discord Community',
  description:
    'Follow Gargeya Sharma on X for public writing, or join Discord for high-signal builder chat.',
  alternates: { canonical: '/community' },
};

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.259 5.672L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.37-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.02.06.03.1.02c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  );
}

const PROMISES = [
  {
    icon: AtSign,
    title: 'Open feed',
    body: 'Daily thinking on X. Threads, opinions, work in progress.',
  },
  {
    icon: Users,
    title: 'Quieter circle',
    body: 'Discord after the feed. Reviews, build talk, close reading.',
  },
  {
    icon: Award,
    title: 'High bar',
    body: 'Craft over output. Built to make you more capable.',
  },
] as const;

export default function CommunityPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-24 pb-20 sm:px-6 sm:pt-28 lg:px-10 lg:pb-24 xl:px-12"
      >
        {/* Hero — the rooms as objects, not a centered paragraph */}
        <section className="home-hero relative isolate grid min-h-[min(78svh,760px)] grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12 lg:px-14 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 space-y-7 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-7"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Open feed · Quieter circle
            </p>

            <div className="max-w-2xl">
              <p className="mb-4 font-label text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                Global network
              </p>
              <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.9rem)] font-medium leading-[0.98] tracking-[-0.045em] text-primary dark:text-white">
                A builder community for <span className="text-accent">high-signal work.</span>
              </h1>
            </div>

            <p className="max-w-xl font-body text-[1.05rem] leading-[1.65] text-on-surface-variant dark:text-white/70 sm:text-lg">
              High-signal builders, systems people, and curious minds. Start with public writing
              on X — then join Discord when you want the room.
            </p>

            <div className="grid max-w-xl grid-cols-2 gap-5 border-t border-slate-900/[0.12] pt-5 dark:border-white/15">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Open door
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  {siteConfig.twitterHandle} on X
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Private room
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Discord circle
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-extrabold tracking-tight"
              >
                Follow on X <ArrowUpRight className="btn-icon h-4 w-4" />
              </a>
              <a
                href={siteConfig.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="home-hero-secondary h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-bold tracking-tight"
              >
                Enter Discord <ArrowRight className="btn-icon h-4 w-4" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              <a href="#ways" className="transition-colors hover:text-accent">
                Ways in ↓
              </a>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
              <a href="#standard" className="transition-colors hover:text-accent">
                The standard
              </a>
            </div>
          </motion.div>

          {/* Artifact — stacked rooms: X post on top, Discord invite peeking */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-[480px] pb-10">
              <div
                aria-hidden="true"
                className="absolute inset-x-6 -bottom-2 rotate-[2.5deg] rounded-[1.5rem] border border-white/10 bg-[#121a2b] p-5 opacity-90"
              >
                <p className="flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  <DiscordLogo className="h-3.5 w-3.5 text-[#c4caff]" /> Discord · private room
                </p>
                <p className="mt-1 truncate font-headline text-sm font-bold text-white">
                  Architecture reviews + build talk
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1220] shadow-[0_28px_68px_-34px_rgba(0,0,0,0.7)]">
                <div className="relative h-44 overflow-hidden sm:h-52">
                  <Image
                    src="/profile.webp"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover object-[center_20%]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/25 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute left-5 right-5 top-4 flex items-center justify-between font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm">
                        <XLogo className="h-3.5 w-3.5 text-white" />
                      </span>
                      Public writing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Live
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-5 right-5">
                    <p className="font-display text-2xl font-medium tracking-[-0.02em] text-white sm:text-3xl">
                      {siteConfig.twitterHandle}
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="font-body text-sm leading-relaxed text-white/65">
                    Opinions, threads, and whatever I&apos;m chewing on — the fastest way to see
                    how I write and what I care about.
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                      Day to day · Open
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-2xl bg-accent px-4 py-2.5 font-headline text-xs font-extrabold tracking-tight text-slate-950">
                      Follow <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 top-10 hidden rotate-2 rounded-full border border-slate-900/[0.08] bg-white px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-lg sm:block dark:border-white/10 dark:bg-slate-900 dark:text-white">
                Start here
              </div>
              <div className="absolute -left-2 bottom-20 hidden -rotate-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-accent shadow-lg backdrop-blur-sm sm:block">
                Quieter circle inside
              </div>
            </div>
          </motion.div>

          <a
            href="#ways"
            className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-primary dark:text-white/45 dark:hover:text-white lg:inline-flex"
            aria-label="Scroll to ways in"
          >
            Ways in <ChevronDown className="scroll-hint h-3.5 w-3.5" />
          </a>
        </section>

        {/* Promise strip */}
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                What you get
              </span>
              <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                Two doors, one standard.
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
              Same bar, both rooms.
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

        {/* Primary CTAs — X first (public door), Discord second (private room) */}
        <section id="ways" className="scroll-mt-32 border-t border-slate-900/[0.08] py-14 dark:border-white/10 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Ways in
              </span>
              <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                Meet me where I already write.
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
              X is the open feed. Discord is the quieter circle.
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* X — full-bleed presence card (primary traffic path) */}
            <motion.a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="x-presence-card group relative grid cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 md:grid-cols-12"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative min-h-[220px] overflow-hidden md:col-span-5 md:min-h-[320px] lg:col-span-4">
                <Image
                  src="/profile.webp"
                  alt={siteConfig.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  priority={false}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-slate-950/90"
                  aria-hidden="true"
                />
              </div>

              <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 md:col-span-7 md:p-10 lg:col-span-8 lg:p-12">
                <XLogo
                  className="pointer-events-none absolute -right-6 -top-8 h-44 w-44 text-white/[0.04] transition-transform duration-700 group-hover:scale-105 sm:h-56 sm:w-56 md:-right-4 md:top-1/2 md:h-64 md:w-64 md:-translate-y-1/2"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                    <XLogo className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 shrink-0 text-white/40 transition-colors duration-300 group-hover:text-accent" />
                </div>

                <div className="relative space-y-5">
                  <div className="space-y-2">
                    <p className="font-label text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                      Public writing · day to day
                    </p>
                    <h3 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-[-0.03em] text-white">
                      {siteConfig.twitterHandle}
                    </h3>
                    <p className="max-w-lg font-body text-base leading-relaxed text-white/65 sm:text-lg">
                      Opinions, threads, and whatever I&apos;m chewing on — the fastest way to see
                      how I write and what I care about.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2.5 rounded-2xl bg-accent px-5 py-3 font-headline text-sm font-extrabold tracking-tight text-slate-950 shadow-[0_12px_40px_-12px_rgba(5,150,105,0.65)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:bg-accent/90">
                    Follow on X
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.a>

            <motion.a
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="discord-room-card group relative grid cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 md:grid-cols-12"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 md:col-span-7 lg:col-span-8 lg:p-10">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#5865F2]/20 text-[#c4caff]">
                    <DiscordLogo className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 text-white/40 transition-colors duration-300 group-hover:text-accent md:hidden" />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="font-label text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                      Private room · invite only energy
                    </p>
                    <h3 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-white">
                      Join Discord
                    </h3>
                    <p className="max-w-lg font-body text-sm leading-relaxed text-white/65 sm:text-base">
                      Architecture reviews, build talk, and high-signal chat — when you want the
                      quieter circle after following along on X.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2.5 rounded-2xl border border-white/20 bg-white/[0.06] px-5 py-3 font-headline text-sm font-bold tracking-tight text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-accent/50 group-hover:bg-accent group-hover:text-slate-950">
                    Enter Discord
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {/* Atmosphere — light glyph, no fake channel list */}
              <div
                className="relative hidden items-center md:col-span-5 md:flex lg:col-span-4"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_70%_50%,rgba(88,101,242,0.18),transparent_65%)]" />
                <DiscordLogo className="pointer-events-none absolute right-8 h-40 w-40 text-white/[0.05] lg:right-12" />
              </div>
            </motion.a>
          </div>
        </section>

        {/* Closing — one more door into the same rooms */}
        <section id="standard" className="scroll-mt-32 py-14 sm:py-16 lg:py-20">
          <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:rounded-[2.5rem] md:p-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  The standard
                </span>
                <h2 className="cta-card-heading mt-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl">
                  Start on X. Stay for the room.
                </h2>
                <p className="cta-card-copy mt-4 max-w-md font-body text-base leading-relaxed">
                  Follow the public thinking first. When you want reviews, craft, and a circle
                  that reads closely — step inside.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent inline-flex items-center justify-center rounded-2xl px-6 py-3.5 font-headline text-sm font-bold tracking-tight"
                  >
                    Follow on X
                    <ArrowUpRight className="btn-icon h-4 w-4" />
                  </a>
                  <a
                    href={siteConfig.links.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-card-secondary inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 font-headline text-sm font-semibold transition-colors"
                  >
                    Enter Discord
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="grid content-center gap-4 lg:col-span-6">
                {[
                  { step: 'Step 1', title: 'Read in public', body: 'Follow @GargeyaS. Threads, opinions, build notes — see the thinking raw.' },
                  { step: 'Step 2', title: 'Bring the work', body: 'Architecture, craft, or a system under load. Real constraints beat intros.' },
                  { step: 'Step 3', title: 'Leave sharper', body: 'Reviews and high-signal chat that level up capability, not just output.' },
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
              <span className="text-slate-400 dark:text-white/40">Keep reading</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
              <Link href="/journal" className="transition-colors hover:text-accent">Journal</Link>
              <Link href="/notes" className="transition-colors hover:text-accent">Notes</Link>
              <Link href="/youtube" className="transition-colors hover:text-accent">Video essays</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
