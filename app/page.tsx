import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { FeaturedProjects } from '@/components/featured-projects';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';
import { clampMetaDescription } from '@/lib/meta';

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: clampMetaDescription(siteConfig.description),
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-24 sm:px-6 sm:pt-28 lg:px-10 xl:px-12"
      >
        {/* Hero — a founder's working cover */}
        <section
          id="home-hero"
          className="home-hero relative isolate grid min-h-[min(78svh,760px)] grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12 lg:px-14 lg:py-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 space-y-7 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-7"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600/80 dark:text-white/55">
              <span>Start here</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
              <span className="text-accent">Edudojo · writing · advisory</span>
            </div>

            <div className="max-w-2xl">
              <p className="mb-4 font-label text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                Gargeya Sharma — founder @ Edudojo.ai
              </p>
              <h1 className="flex min-w-0 max-w-full flex-col gap-2 font-display text-[clamp(2.8rem,7.2vw,5.35rem)] font-medium leading-[0.98] tracking-[-0.045em] text-primary dark:text-white sm:gap-3">
                <span className="block">
                  Architecting <span className="text-accent">Intelligence.</span>
                </span>
                <span className="block text-primary/85 dark:text-white/85">
                  Curating <span className="text-accent">ART.</span>
                </span>
              </h1>
            </div>

            <p className="max-w-xl font-body text-[1.05rem] leading-[1.65] text-on-surface-variant dark:text-white/70 sm:text-lg">
              I build student-centred learning systems that value process over output — starting with Edudojo.ai,
              where AI challenges students to question, create, connect ideas, and verify what they make.
            </p>

            <div className="grid max-w-xl grid-cols-2 gap-5 border-t border-slate-900/[0.12] pt-5 dark:border-white/15">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Live
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Edudojo pilot
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Weekly
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Notes, Sunday
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Link
                href="https://edudojo.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-extrabold tracking-tight"
              >
                Explore Edudojo <ArrowUpRight className="btn-icon h-4 w-4" />
              </Link>
              <Link
                href="/journal"
                className="home-hero-secondary h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-bold tracking-tight"
              >
                Read the journal <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-5"
          >
            <div className="ml-auto w-full max-w-[520px] space-y-4">
              {/* Live proof — the venture, not the face. Lightweight: no hero image, so LCP stays text. */}
              <a
                href={siteConfig.links.edudojo}
                target="_blank"
                rel="noopener noreferrer"
                className="home-room home-room-build group block rounded-[1.5rem] p-5 sm:p-6"
                aria-label="Open Edudojo.ai — live venture"
              >
                <Image
                  src="/Mark-dark.svg"
                  alt=""
                  aria-hidden="true"
                  width={320}
                  height={256}
                  sizes="320px"
                  draggable={false}
                  className="pointer-events-none absolute right-4 top-1/2 z-0 hidden h-44 w-auto -translate-y-1/2 select-none opacity-[0.05] transition-transform duration-700 ease-out group-hover:scale-105 sm:block"
                />
                <div className="relative z-10 flex items-center justify-between font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                  <span>Live venture</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Pilot
                  </span>
                </div>
                <div className="relative z-10 mt-5">
                  <p className="font-headline text-xl font-bold text-white sm:text-2xl">
                    Edudojo.ai
                  </p>
                  <p className="mt-1 font-body text-sm text-white/65">
                    Value the process, not just the output.
                  </p>
                </div>
                <div className="relative z-10 mt-4 grid grid-cols-4 gap-1.5">
                  {[
                    { n: '01', label: 'Create' },
                    { n: '02', label: 'Question' },
                    { n: '03', label: 'Journal' },
                    { n: '04', label: 'Feedback' },
                  ].map((step, i) => (
                    <div
                      key={step.n}
                      className={`rounded-xl border px-1 py-2 text-center ${
                        i === 1
                          ? 'border-accent/40 bg-accent/15'
                          : 'border-white/10 bg-white/[0.04]'
                      }`}
                    >
                      <p className="font-mono text-[10px] font-bold text-white/35">{step.n}</p>
                      <p className="mt-0.5 font-label text-[10px] font-bold uppercase tracking-wide text-white/80">
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="relative z-10 mt-4 flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                  Explore the live venture <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </a>

              {/* Writing proof — two doors, one row */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/notes"
                  className="home-room-light home-room group flex min-h-[120px] flex-col justify-between rounded-2xl p-4 sm:p-5"
                >
                  <span className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-white/45">
                    Sunday
                  </span>
                  <span>
                    <span className="block font-headline text-base font-bold text-primary">
                      Notes
                    </span>
                    <span className="mt-0.5 block font-body text-[13px] text-on-surface-variant">
                      One argument a week.
                    </span>
                  </span>
                </Link>
                <Link
                  href="/journal"
                  className="home-room-light home-room group flex min-h-[120px] flex-col justify-between rounded-2xl p-4 sm:p-5"
                >
                  <span className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-white/45">
                    Essays
                  </span>
                  <span>
                    <span className="block font-headline text-base font-bold text-primary">
                      Journal
                    </span>
                    <span className="mt-0.5 block font-body text-[13px] text-on-surface-variant">
                      Thesis + build logs.
                    </span>
                  </span>
                </Link>
              </div>

              {/* Person, shrunk to a byline — the full portrait lives on /about */}
              <Link
                href="/about"
                className="group flex items-center gap-3 rounded-2xl border border-slate-900/[0.08] bg-white/60 px-4 py-3 backdrop-blur-sm transition-colors hover:border-accent/40 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <Image
                  src="/profile.webp"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
                <span className="min-w-0 flex-1 font-body text-[13px] text-on-surface-variant">
                  <span className="font-semibold text-primary dark:text-white">Gargeya Sharma</span>
                  {' — '}why this work exists
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            </div>
          </motion.div>

          <a
            href="#index"
            className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-primary dark:text-white/45 dark:hover:text-white lg:inline-flex"
            aria-label="Scroll to the working index"
          >
            View the work <ChevronDown className="scroll-hint h-3.5 w-3.5" />
          </a>
        </section>

        {/* Working index — route visitors by intent */}
        <section className="relative py-20 sm:py-24 lg:py-28" id="index">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                A working index
              </span>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-light leading-[1.08] tracking-[-0.035em] text-primary sm:text-4xl md:text-[3rem]">
                Where do you want to go?
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
              Three doors into the same work: build with me, read with me, or work with me.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <Link
              href="https://edudojo.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="home-room home-room-build group flex min-h-[390px] flex-col justify-between rounded-[1.75rem] p-6 sm:min-h-[430px] sm:p-9 lg:col-span-7 lg:p-11"
            >
              <Image
                src="/Mark-dark.svg"
                alt=""
                aria-hidden="true"
                width={300}
                height={240}
                sizes="300px"
                loading="lazy"
                draggable={false}
                className="pointer-events-none absolute right-6 top-1/2 z-0 hidden h-60 w-auto -translate-y-1/2 select-none opacity-10 transition-transform duration-700 ease-out group-hover:scale-105 sm:block sm:h-72"
              />
              <div className="relative z-10 flex items-center justify-between font-label text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                <span>01 / Build</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <div className="relative z-10 mt-10 max-w-xl sm:mt-14">
                <p className="mb-3 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Edudojo.ai / live venture
                </p>
                <h3 className="max-w-sm font-headline text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                  Value the process,
                  <span className="block">not just the output.</span>
                </h3>
                <p className="mt-4 max-w-md font-body text-base leading-[1.7] text-white/65 sm:text-lg">
                  A student-centred learning loop: process journals show how work develops, so teachers can give feedback that actually helps.
                </p>
              </div>
              <div className="relative z-10 mt-10 flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                Explore the live venture <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>

            <div className="grid gap-5 lg:col-span-5">
              <Link
                href="/journal"
                className="home-room home-room-light group flex min-h-[220px] flex-col justify-between rounded-[1.75rem] p-6 sm:p-8"
              >
                <div className="flex items-center justify-between font-label text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/45">
                  <span>02 / Think</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-semibold tracking-[-0.025em] text-primary sm:text-3xl">
                    Journal + weekly letter
                  </h3>
                  <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-on-surface-variant">
                    Thesis posts, build logs, and notes on education, AI, and becoming capable.
                  </p>
                </div>
              </Link>

              <Link
                href="/contact"
                className="home-room home-room-light group flex min-h-[220px] flex-col justify-between rounded-[1.75rem] p-6 sm:p-8"
              >
                <div className="flex items-center justify-between font-label text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/45">
                  <span>03 / Work together</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-semibold tracking-[-0.025em] text-primary sm:text-3xl">
                    Advisory + mentorship
                  </h3>
                  <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-on-surface-variant">
                    Architecture, AI strategy, and a clear next step for founders and builders.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
            <span className="text-slate-400 dark:text-white/40">More rooms</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
            <Link href="/community" className="transition-colors hover:text-accent">Community</Link>
            <Link href="/youtube" className="transition-colors hover:text-accent">Video essays</Link>
            <Link href="/about" className="transition-colors hover:text-accent">About Gargeya</Link>
          </div>
        </section>


        {/* Featured Projects */}
        <FeaturedProjects />

        <section className="py-20 md:py-32" id="collaborate">
          <div className="cta-card-gradient relative z-10 overflow-hidden rounded-3xl px-5 py-12 text-center sm:p-12 md:rounded-[2.5rem] md:p-20 lg:p-24">
            <div className="relative z-10 mx-auto max-w-3xl space-y-7 md:space-y-9">
              <h2 className="cta-card-heading font-display text-3xl font-light leading-[1.15] tracking-[-0.02em] sm:text-5xl md:text-[3.25rem]">
                Ready to build something meaningful?
              </h2>
              <p className="cta-card-copy mx-auto max-w-2xl font-body text-base leading-relaxed sm:text-lg">
                Whether you&apos;re building with AI, thinking through learning and growth, or just want
                a good conversation about ideas&mdash;my inbox is open.
              </p>

              <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:gap-4">
                <Link
                  href="/contact"
                  className="btn-accent inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-center font-headline text-base font-bold sm:w-auto md:px-10 md:py-5 md:text-lg"
                >
                  Start a conversation
                </Link>
                <Link
                  href="https://edudojo.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-card-secondary inline-flex w-full items-center justify-center rounded-xl border px-6 py-4 text-center font-headline text-base font-semibold transition-[border-color,background-color,transform] duration-300 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none sm:w-auto md:px-10 md:py-5 md:text-lg"
                >
                  Explore Edudojo.ai
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
