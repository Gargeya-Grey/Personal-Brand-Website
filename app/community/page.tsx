import { Metadata } from 'next';
import Image from 'next/image';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Users, ArrowUpRight, TrendingUp, Award } from 'lucide-react';
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

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-28 sm:px-6 sm:pt-32 lg:px-10 xl:px-12"
      >
        {/* Header */}
        <section className="max-w-4xl py-12 sm:py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container">
              <Users className="h-8 w-8 text-white" />
            </div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent block">
              Global Network
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-primary">
              A builder community for <br /> <span className="text-accent">high-signal work</span>.
            </h1>
            <p className="max-w-2xl pt-2 font-body text-lg leading-relaxed text-on-surface-variant sm:text-xl md:pt-4 md:text-2xl">
              High-signal builders, systems people, and curious minds. Start with my public writing
              on X — then join Discord when you want the room.
            </p>
          </motion.div>
        </section>

        {/* Primary CTAs — X first (public door), Discord second (private room) */}
        <section className="border-t border-outline-variant/20 py-16 sm:py-20">
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
              className="x-presence-card group relative grid cursor-pointer overflow-hidden rounded-soft border border-white/10 md:grid-cols-12"
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
              className="discord-room-card group relative grid cursor-pointer overflow-hidden rounded-soft border border-white/10 md:grid-cols-12"
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

        {/* Community Stats */}
        <section className="border-t border-outline-variant/20 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <motion.div
              className="board-card flex flex-col justify-between rounded-soft p-6 sm:p-8 lg:p-10"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low dark:bg-white/5">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div className="mb-2 font-headline text-4xl font-extrabold text-primary lg:text-5xl">
                  Deep reviews
                </div>
                <div className="mb-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  What you get
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Level up your engineering capabilities through collaborative mentorship, codebase
                  audits, and deep architectural reviews.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="board-card flex flex-col justify-between rounded-soft p-6 sm:p-8 lg:p-10"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low dark:bg-white/5">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div className="mb-2 font-headline text-4xl font-extrabold text-primary lg:text-5xl">
                  Craft &amp; scale
                </div>
                <div className="mb-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  The standard
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  We nurture and refine your software craft, aiming to elevate you into the elite
                  top 1% of global engineering talent.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
