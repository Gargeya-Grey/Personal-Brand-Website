import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { ArrowRight, ArrowUpRight, Rocket, Users, BookOpen, PlayCircle, User, ScanLine } from 'lucide-react';
import { FeaturedProjects } from '@/components/featured-projects';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-28 sm:px-6 sm:pt-32 lg:px-10 xl:px-12"
      >
        {/* Hero — copy + media card */}
        <section className="relative grid min-h-[min(88svh,860px)] grid-cols-1 items-center gap-12 overflow-x-clip py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="pointer-events-none absolute -right-40 top-8 hidden h-[42rem] w-[42rem] rounded-full border border-accent/15 lg:block" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 top-28 hidden h-[30rem] w-[30rem] rounded-full border border-white/10 lg:block" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 space-y-8 lg:col-span-7"
          >
            <div className="flex items-center gap-3 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                <ScanLine className="h-3.5 w-3.5" />
              </span>
              <span>Digital existence / 001</span>
            </div>

            <h1 className="flex min-w-0 max-w-full flex-col gap-3 font-display text-[clamp(2.75rem,6.8vw,4.85rem)] font-medium leading-[1.08] tracking-[-0.02em] text-primary sm:gap-4">
              <span className="block">
                Architecting{' '}
                <span className="text-accent">Intelligence.</span>
              </span>
              <span className="block">
                Curating <span className="text-accent">ART.</span>
              </span>
            </h1>

            <p className="max-w-xl pt-2 font-body text-lg leading-[1.65] text-on-surface-variant md:text-xl">
              Founder{' '}
              <a
                href="https://edudojo.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                @ Edudojo.ai
              </a>
              <br />
              Building intelligent systems for evaluation, education, and the human side of making.
            </p>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Link
                href="https://edudojo.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-extrabold tracking-tight"
              >
                Explore Edudojo <ArrowUpRight className="btn-icon h-4 w-4" />
              </Link>
              <Link
                href="/blog"
                className="btn-ghost h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-bold tracking-tight"
              >
                Read the journal <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
              <span className="h-px w-8 bg-accent/60" />
              <span>Systems / Stories / Experiments</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 lg:col-span-5"
          >
            <div className="relative ml-auto h-[400px] w-full max-w-[520px] md:h-[500px]">
              <div className="absolute -right-3 top-8 hidden h-28 w-3 rounded-full border border-accent/30 bg-accent/10 lg:block" aria-hidden="true" />
              <div className="relative h-full overflow-hidden rounded-[1.4rem] border border-white/15 bg-slate-950 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)]">
                <Image
                  src="/profile.webp"
                  alt="Gargeya Sharma"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 520px"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                  quality={82}
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoQABAAA4BaJQBOj+AC3/pHL/0kAAD9IZEXT+erWYGdY0DVhO4CgwBJIzKs48DW2vVvXqUgqIC1a+1wAAA="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent dark:from-[#0B1220]/90" />
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between font-label text-[9px] font-bold uppercase tracking-[0.22em] text-white/60">
                  <span>Field note / 001</span>
                  <span className="flex items-center gap-2">
                    <i className="h-1.5 w-1.5 rounded-full bg-accent" /> Live
                  </span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="font-headline text-xl font-bold text-white">Gargeya Sharma</p>
                  <p className="mt-1 font-label text-sm tracking-wide text-white/80">
                    Founder &amp; Lead Architect
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid Section */}
        <section className="relative py-16 sm:py-20 lg:py-24" id="startup">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">The work branches out</span>
              <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-primary sm:text-4xl md:text-[2.75rem]">
                Choose a point of entry.
              </h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">A venture, a community, a journal, and a visual log—one system for building in public.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {/* Startup Card */}
            <Link
              href="https://edudojo.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="block md:col-span-2"
            >
              <motion.div
                className="board-card group relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-soft p-6 sm:p-8 md:min-h-[300px] md:p-10"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.7 }}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                    <Rocket className="h-6 w-6 text-accent" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-accent" />
                </div>
                <div className="relative z-10 mt-10">
                  <span className="mb-2 block font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    Live Venture
                  </span>
                  <h3 className="mb-3 font-headline text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-primary">
                    Edudojo.ai
                  </h3>
                  <p className="max-w-xl font-body text-base leading-relaxed text-slate-600 md:text-lg dark:text-on-surface-variant">
                    AI-driven redesign for evaluation, assessment, and education. Architecting
                    intelligence in learning paradigms from zero to one.
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Community Card */}
            <Link href="/community" className="block">
              <motion.div
                className="board-card-ink group flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-soft p-6 sm:p-8 md:min-h-[300px] md:p-10"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.7 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div className="mt-10">
                  <h3 className="mb-2 font-headline text-2xl font-semibold tracking-tight text-white">
                    Community
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-white/65">
                    Building a collaborative community to upskill infinitely toward top 1% global
                    standards.
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Blog Card */}
            <Link href="/blog" className="block">
              <motion.div
                className="board-card group flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-soft p-6 sm:p-8 md:min-h-[280px] md:p-10"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.7 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <div className="mt-10">
                  <h3 className="mb-2 font-headline text-2xl font-semibold tracking-tight text-slate-900 dark:text-primary">
                    Blog
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-slate-600 dark:text-on-surface-variant">
                    Personal notes, opinions, and whatever else I find worth writing down.
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* YouTube Card */}
            <Link href="/youtube" className="block md:col-span-2">
              <motion.div
                className="board-card group flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-soft p-6 sm:p-8 md:min-h-[280px] md:p-10"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.7 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                    <PlayCircle className="h-6 w-6 text-accent" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-accent" />
                </div>
                <div className="mt-10">
                  <h3 className="mb-3 font-headline text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-primary">
                    YouTube
                  </h3>
                  <p className="max-w-md font-body text-base leading-relaxed text-slate-600 md:text-lg dark:text-on-surface-variant">
                    Visualizing complex systems through video essays and technical deep dives.
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* About Card */}
            <Link href="/about" className="block md:col-span-3">
              <motion.div
                className="board-card-ink group relative flex h-full min-h-[140px] flex-col justify-between gap-8 overflow-hidden rounded-soft p-6 sm:p-8 md:flex-row md:items-center md:gap-12 md:p-10"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.7 }}
              >
                <div className="relative z-10 flex flex-col items-center gap-5 sm:flex-row">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight text-white">
                      About Gargeya
                    </h3>
                    <p className="mt-1 font-body text-sm leading-relaxed text-white/65">
                      Engineering the future. Lead Architect & Strategist focusing on Soft Minimalism.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex justify-center md:justify-end">
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 font-label text-xs uppercase tracking-widest text-accent transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-slate-950">
                    View Biography →
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>


        {/* Featured Projects */}
        <FeaturedProjects />

        <section className="py-20 md:py-32" id="collaborate">
          <div className="cta-card-gradient relative z-10 overflow-hidden rounded-3xl px-5 py-12 text-center sm:p-12 md:rounded-[2.5rem] md:p-20 lg:p-24">
            <div className="relative z-10 mx-auto max-w-3xl space-y-7 md:space-y-9">
              <h2 className="font-display text-3xl font-light leading-[1.15] tracking-[-0.02em] text-white sm:text-5xl md:text-[3.25rem]">
                Ready to build something meaningful?
              </h2>
              <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-white/72 sm:text-lg">
                Whether it&apos;s an architectural audit, AI implementation strategy, or a new venture
                partnership—let&apos;s discuss the technical roadmap.
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
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/25 bg-white/[0.04] px-6 py-4 text-center font-headline text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/[0.08] active:scale-[0.98] sm:w-auto md:px-10 md:py-5 md:text-lg"
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
