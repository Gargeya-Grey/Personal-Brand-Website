'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { projects } from '@/data/projects';
import { siteConfig } from '@/lib/site-config';
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BookOpen,
  ChevronDown,
  Compass,
  Cpu,
  Eye,
  Feather,
  FileText,
  FlaskConical,
  Github,
  Hammer,
  Layers,
  Linkedin,
  Mail,
  PenLine,
  Youtube,
} from 'lucide-react';

const SECTION_NAV = [
  { label: 'Thesis', href: '#thesis' },
  { label: 'Now', href: '#now' },
  { label: 'Principles', href: '#principles' },
  { label: 'Work', href: '#work' },
  { label: 'Beliefs', href: '#beliefs' },
  { label: 'Contact', href: '#connect' },
] as const;

const THESIS_PILLARS = [
  {
    kicker: 'Broad thesis',
    title: 'Output is cheap. The mind takes work.',
    body: 'As AI makes production easier, assessment has to get better at seeing reasoning, effort, growth, and judgment.',
  },
  {
    kicker: 'Narrow wedge',
    title: 'Education first, for 90 days at a time.',
    body: 'Learning is the beachhead. Hiring, work, and other judged systems are comparisons, not separate niches.',
  },
  {
    kicker: 'Specific proof',
    title: 'Value the process, not just the output.',
    body: 'Edudojo instruments the learning loop: drafts, decisions, revisions, and a short defense — not just polish.',
  },
] as const;

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Process over output',
    body: 'A correct answer tells you what someone produced. It does not necessarily tell you what they understood. I design for drafts, decisions, revisions, and defense.',
  },
  {
    icon: Cpu,
    title: 'Mechanical sympathy',
    body: 'Software has to respect the machine it runs on and the human it serves: latency budgets, feedback timing, trust in the scorer, and the politics of grades.',
  },
  {
    icon: Feather,
    title: 'Soft minimalism',
    body: 'Fewer layers, clearer thought. Strip abstraction until the structure shows, then let space, type, and one accent do the work.',
  },
  {
    icon: FlaskConical,
    title: 'Inspectable thinking',
    body: 'Build in public. Make the reasoning checkable: strict schemas, shadow evaluation, human override with an audit trail.',
  },
] as const;

const BELIEFS = [
  {
    n: '01',
    belief: 'A student can submit work they cannot explain.',
    implication: 'That is a failure of evidence, not only a failure of honesty. Fix what you score.',
  },
  {
    n: '02',
    belief: 'Help only helps when friction stays in the picture.',
    implication: 'Practice, retrieval, and defense keep the person in the loop. Otherwise you grade the tool.',
  },
  {
    n: '03',
    belief: 'Proxies replace judgment quietly.',
    implication: 'Homework scores, chat fluency, polished finals — each looks like learning until you ask for a redo.',
  },
  {
    n: '04',
    belief: 'One strong idea beats five slogans.',
    implication: 'One original a day, a few grounded replies, twice-a-week build proof. Then leave the feed.',
  },
] as const;

const WRITING_DOORS = [
  {
    title: 'Journal',
    blurb: 'Thesis posts, build logs, craft notes.',
    href: '/journal',
  },
  {
    title: 'Notes',
    blurb: 'One argument every Sunday evening.',
    href: '/notes',
  },
  {
    title: 'Video essays',
    blurb: 'Travel, process, systems on camera.',
    href: '/youtube',
  },
] as const;

const PRESENCE = [
  {
    icon: AtSign,
    label: 'X / Twitter',
    handle: '@GargeyaS',
    blurb: 'Day-to-day writing and replies.',
    href: siteConfig.links.twitter,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    handle: 'Gargeya Sharma',
    blurb: 'Founder and advisory presence.',
    href: siteConfig.links.linkedin,
  },
  {
    icon: Github,
    label: 'GitHub',
    handle: 'Gargeya-Grey',
    blurb: 'This site and open work.',
    href: siteConfig.links.github,
  },
  {
    icon: Youtube,
    label: 'YouTube',
    handle: '@GargeyaS',
    blurb: 'Field notes from the road.',
    href: siteConfig.links.youtube,
  },
  {
    icon: FileText,
    label: 'CV',
    handle: 'cv.sgargeya.com',
    blurb: 'Full record, one page.',
    href: siteConfig.links.cv,
  },
  {
    icon: Mail,
    label: 'Email',
    handle: siteConfig.email,
    blurb: 'Replies in a day or two.',
    href: `mailto:${siteConfig.email}`,
  },
] as const;

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
};

function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs font-bold text-accent">{index}</span>
      <span className="h-px w-8 bg-accent/40" aria-hidden="true" />
      <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
        {label}
      </span>
    </div>
  );
}

export default function AboutClient() {
  const invitationRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: invitationRef,
    offset: ['start end', 'end 20%'],
  });

  const x1 = useTransform(scrollYProgress, [0.1, 0.9], ['-100%', '100%']);
  const x2 = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '200%']);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-10 xl:px-12"
      >
        {/* Hero — founder working cover, not a slogan card */}
        <section className="home-hero relative isolate grid min-h-[min(78svh,760px)] grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-10 sm:px-8 md:px-10 lg:grid-cols-12 lg:gap-12 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 space-y-7 lg:col-span-7"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600/80 dark:text-white/55">
              <span>Gargeya Sharma</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
              <span className="text-accent">Founder @ Edudojo.ai</span>
            </div>

            <div className="max-w-2xl">
              <p className="mb-4 font-label text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                About — in one line
              </p>
              <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.9rem)] font-medium leading-[0.98] tracking-[-0.045em] text-primary dark:text-white">
                Output is cheap.
                <span className="block text-accent">The mind takes work.</span>
              </h1>
            </div>

            <p className="max-w-xl font-body text-[1.05rem] leading-[1.65] text-on-surface-variant dark:text-white/70 sm:text-lg">
              I&apos;m Gargeya — Founder &amp; Architect at Edudojo.ai. I build evaluation
              systems that make human capability visible, starting with education: value the
              process, not just the output.
            </p>

            <div className="flex flex-wrap gap-2">
              {['Process > polish', 'Capability > fluency', 'Judgment > proxies'].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-slate-900/10 bg-white/60 px-3.5 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/75"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="grid max-w-xl grid-cols-2 gap-5 border-t border-slate-900/[0.12] pt-5 dark:border-white/15">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Building now
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Edudojo pilot
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Writing
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Notes, every Sunday
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="btn-hero h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-extrabold tracking-tight"
              >
                Start a conversation <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
              <Link
                href="#work"
                className="home-hero-secondary h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-bold tracking-tight"
              >
                See the proof <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 lg:col-span-5"
          >
            <div className="ml-auto w-full max-w-[520px]">
              <div className="home-hero-photo relative aspect-[5/4] overflow-hidden rounded-[1.5rem] sm:aspect-[4/5]">
                <Image
                  src="/profile.webp"
                  alt="Gargeya Sharma"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 520px"
                  className="object-cover object-[center_28%]"
                  priority
                  fetchPriority="high"
                  quality={82}
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoQABAAA4BaJQBOj+AC3/pHL/0kAAD9IZEXT+erWYGdY0DVhO4CgwBJIzKs48DW2vVvXqUgqIC1a+1wAAA="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/10 to-transparent" />
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:left-6 sm:right-6 sm:top-6 sm:text-[11px]">
                  <span>Founder / Architect</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> In the work
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="font-headline text-xl font-bold text-white sm:text-2xl">
                    Gargeya Sharma
                  </p>
                  <p className="mt-1 font-label text-xs tracking-[0.08em] text-white/75 sm:text-sm">
                    Edudojo.ai · evaluation for learning
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-900/[0.12] pt-3 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600/80 dark:border-white/15 dark:text-white/45">
                <span>Value the process</span>
                <span>Remote · Global</span>
              </div>
            </div>
          </motion.div>

          <a
            href="#thesis"
            className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-primary dark:text-white/45 dark:hover:text-white lg:inline-flex"
            aria-label="Scroll to thesis"
          >
            The thesis <ChevronDown className="scroll-hint h-3.5 w-3.5" />
          </a>
        </section>

        {/* Sticky index — makes a long page feel navigable */}
        <nav
          aria-label="About sections"
          className="sticky top-24 z-30 mt-8 flex items-center gap-1 overflow-x-auto scrollbar-none rounded-full border border-white/50 bg-white/55 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"
        >
          <span className="hidden shrink-0 px-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 md:inline">
            On this page
          </span>
          {SECTION_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-4 py-2 font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:bg-accent/10 hover:text-primary dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* 01 Thesis — the idea that makes everything else matter */}
        <section id="thesis" className="scroll-mt-32 py-16 sm:py-20 lg:py-24">
          <motion.div {...reveal} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Eyebrow index="01" label="Thesis" />
            <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <h2 className="font-display text-3xl font-light leading-[1.08] tracking-[-0.035em] text-primary sm:text-4xl md:text-[3rem]">
                  Make human capability visible.
                </h2>
                <p className="mt-5 max-w-md font-body text-base leading-relaxed text-on-surface-variant sm:text-lg">
                  Output is easy to fake. Reasoning, effort, growth, and judgment are not —
                  if you instrument for them. That is the whole bet behind Edudojo, the
                  journal, and the Sunday letter.
                </p>
                <Link
                  href="https://edudojo.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link mt-6 rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>Where the thesis ships</span>
                  <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7 lg:gap-5">
                {THESIS_PILLARS.map((pillar) => (
                  <article
                    key={pillar.kicker}
                    className="board-card flex flex-col rounded-[1.5rem] p-6"
                  >
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                      {pillar.kicker}
                    </p>
                    <h3 className="mt-3 font-headline text-lg font-bold leading-snug tracking-tight text-primary">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
                      {pillar.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* 02 Now — concrete, dated, alive */}
        <section id="now" className="scroll-mt-32 border-t border-slate-900/[0.08] py-16 dark:border-white/10 sm:py-20 lg:py-24">
          <motion.div {...reveal} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow index="02" label="Now" />
                <h2 className="mt-4 font-display text-3xl font-light tracking-[-0.02em] text-primary sm:text-4xl">
                  What I&apos;m doing now.
                </h2>
              </div>
              <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
                Three doors into the same work: build the venture, write in public, advise
                serious builders.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
              <a
                href={siteConfig.links.edudojo}
                target="_blank"
                rel="noopener noreferrer"
                className="home-room home-room-build group flex min-h-[360px] flex-col justify-between rounded-[1.75rem] p-6 sm:p-9 lg:col-span-7 lg:p-11"
              >
                <div className="relative z-10 flex items-center justify-between font-label text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                  <span className="flex items-center gap-2">
                    <Hammer className="h-4 w-4" /> Building
                  </span>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <div className="relative z-10 mt-16 max-w-xl">
                  <p className="mb-3 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    Edudojo.ai / live venture
                  </p>
                  <h3 className="font-headline text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    Value the process, not just the output.
                  </h3>
                  <p className="mt-4 max-w-lg font-body text-base leading-[1.7] text-white/65 sm:text-lg">
                    A student-centred loop: process journals show how work develops, AI
                    challenges instead of completing, teachers give feedback that lands.
                  </p>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap gap-2">
                  {['Process journal', 'Socratic AI', 'Teacher view'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-white/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>

              <div className="grid gap-5 lg:col-span-5">
                <Link
                  href="/notes"
                  className="home-room home-room-light group flex min-h-[220px] flex-col justify-between rounded-[1.75rem] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between font-label text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/45">
                    <span className="flex items-center gap-2">
                      <PenLine className="h-4 w-4" /> Writing
                    </span>
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-semibold tracking-[-0.025em] text-primary sm:text-[1.7rem]">
                      Notes + journal + X
                    </h3>
                    <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-on-surface-variant">
                      One Sunday argument, thesis essays, and daily thinking on X as
                      @GargeyaS. No news dumps.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/contact"
                  className="home-room home-room-light group flex min-h-[220px] flex-col justify-between rounded-[1.75rem] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between font-label text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/45">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Advising
                    </span>
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-semibold tracking-[-0.025em] text-primary sm:text-[1.7rem]">
                      Mentorship + AI strategy
                    </h3>
                    <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-on-surface-variant">
                      Architecture reviews and a clear next step for founders shipping AI.
                      Bring a real constraint.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 03 Principles — how the work gets made */}
        <section id="principles" className="scroll-mt-32 border-t border-slate-900/[0.08] py-16 dark:border-white/10 sm:py-20 lg:py-24">
          <motion.div {...reveal} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Eyebrow index="03" label="How I build" />
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-2xl font-display text-3xl font-light tracking-[-0.02em] text-primary sm:text-4xl">
                Quiet systems, honest signals.
              </h2>
              <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant lg:text-right">
                Four rules I return to whether I&apos;m architecting Edudojo, writing an
                essay, or reviewing your system.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <article
                  key={principle.title}
                  className="board-card group rounded-[1.75rem] p-7 sm:p-8"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-white">
                    <principle.icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                  </div>
                  <h3 className="font-headline text-xl font-bold tracking-tight text-primary sm:text-2xl">
                    {principle.title}
                  </h3>
                  <p className="mt-3 font-body text-[15px] leading-relaxed text-on-surface-variant">
                    {principle.body}
                  </p>
                </article>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 04 Proof — so the page never feels empty */}
        <section id="work" className="scroll-mt-32 border-t border-slate-900/[0.08] py-16 dark:border-white/10 sm:py-20 lg:py-24">
          <motion.div {...reveal} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Eyebrow index="04" label="Proof" />
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-3xl font-light tracking-[-0.02em] text-primary sm:text-4xl">
                The work so far.
              </h2>
              <Link
                href="/#projects"
                className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Full project index</span>
                <ArrowRight className="btn-icon h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  data-project-card
                  className="board-card group flex h-full flex-col overflow-hidden rounded-[1.75rem]"
                >
                  <div
                    className="relative flex min-h-[12rem] flex-col justify-between overflow-hidden border-b border-black/10 p-5 dark:border-white/10"
                    style={{ background: project.gradient }}
                  >
                    {project.image ? (
                      <>
                        <Image
                          src={project.image}
                          alt={`${project.title} cover`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="project-card-image object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-slate-950/[0.04]" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                      </>
                    ) : (
                      <>
                        <div
                          className="pointer-events-none absolute inset-0 opacity-[0.28]"
                          style={{
                            backgroundImage:
                              'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
                            backgroundSize: '26px 26px',
                          }}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />
                      </>
                    )}
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <span className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                        {project.role}
                      </span>
                      <span className="hidden rounded-full border border-white/25 bg-black/30 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:inline-flex">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="relative z-10 font-headline text-xl font-semibold tracking-tight text-white">
                      {project.title}
                    </h3>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-body text-sm leading-[1.7] text-slate-600 dark:text-on-surface-variant">
                      {project.description}
                    </p>
                    <p className="mt-4 font-label text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
                      {project.tags.slice(0, 3).join(' · ')}
                    </p>
                    <div className="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
                      {project.link?.startsWith('/') ? (
                        <Link
                          href={project.link}
                          className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
                        </Link>
                      ) : project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span>Launch</span>
                          <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
                        </a>
                      ) : project.github ? (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span>Source</span>
                          <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {WRITING_DOORS.map((door) => (
                <Link
                  key={door.title}
                  href={door.href}
                  className="hover-card group flex items-center justify-between rounded-2xl bg-white px-5 py-4 dark:bg-white/[0.03]"
                >
                  <span>
                    <span className="block font-headline text-base font-bold text-primary">
                      {door.title}
                    </span>
                    <span className="mt-0.5 block font-body text-sm text-on-surface-variant">
                      {door.blurb}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 05 Beliefs — editorial list, modern and scannable */}
        <section id="beliefs" className="scroll-mt-32 border-t border-slate-900/[0.08] py-16 dark:border-white/10 sm:py-20 lg:py-24">
          <motion.div {...reveal} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <Eyebrow index="05" label="Beliefs" />
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-light tracking-[-0.02em] text-primary sm:text-4xl">
              Short version of what I believe.
            </h2>

            <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-slate-900/[0.08] dark:border-white/10">
              {BELIEFS.map((item, i) => (
                <div
                  key={item.n}
                  className={`group grid gap-3 bg-white p-6 transition-colors duration-300 hover:bg-accent/[0.06] dark:bg-white/[0.02] dark:hover:bg-accent/[0.08] sm:grid-cols-12 sm:gap-6 sm:p-8 ${
                    i !== BELIEFS.length - 1
                      ? 'border-b border-slate-900/[0.08] dark:border-white/10'
                      : ''
                  }`}
                >
                  <span className="font-mono text-sm font-bold text-accent sm:col-span-2 sm:text-base">
                    {item.n}
                  </span>
                  <div className="sm:col-span-10">
                    <p className="font-headline text-lg font-bold leading-snug tracking-tight text-primary sm:text-xl">
                      {item.belief}
                    </p>
                    <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-on-surface-variant sm:text-[15px]">
                      {item.implication}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 flex items-start gap-2 font-body text-sm text-on-surface-variant">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Longer versions live in the journal and the Sunday letter — with evidence,
              not just positions.
            </p>
          </motion.div>
        </section>

        {/* 06 Work together — concrete next step */}
        <section id="connect" className="scroll-mt-32 border-t border-slate-900/[0.08] py-16 dark:border-white/10 sm:py-20 lg:py-24">
          <motion.div {...reveal} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:rounded-[2.5rem] md:p-14">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-5">
                  <Eyebrow index="06" label="Work together" />
                  <h2 className="cta-card-heading mt-4 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl">
                    Bring a real constraint.
                  </h2>
                  <p className="cta-card-copy mt-4 max-w-md font-body text-base leading-relaxed">
                    Mentorship, AI advising, or a serious build. If the work matters,
                    I&apos;m one careful email away — replies land in a day or two.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/contact"
                      className="btn-accent inline-flex items-center justify-center rounded-2xl px-6 py-3.5 font-headline text-sm font-bold tracking-tight"
                    >
                      Start a conversation
                      <ArrowRight className="btn-icon h-4 w-4" />
                    </Link>
                    <a
                      href={siteConfig.links.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-card-secondary inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 font-headline text-sm font-semibold transition-colors"
                    >
                      Read the CV
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-6 flex items-center gap-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {siteConfig.locationLabel} · {siteConfig.email}
                  </p>
                </div>
                <ol className="space-y-4 lg:col-span-7">
                  {[
                    {
                      icon: BookOpen,
                      step: 'Step 1',
                      title: 'Read one letter',
                      body: 'Start with Notes or the journal. If the thesis resonates, we will work well together.',
                    },
                    {
                      icon: Hammer,
                      step: 'Step 2',
                      title: 'Bring the constraint',
                      body: 'What are you building, who is it for, and where is it stuck? Real context beats a pitch deck.',
                    },
                    {
                      icon: Compass,
                      step: 'Step 3',
                      title: 'Leave with a next step',
                      body: 'Architecture direction, evaluation plan, or mentorship focus — something you can act on that week.',
                    },
                  ].map((row) => (
                    <li
                      key={row.title}
                      className="flex gap-4 rounded-2xl border border-slate-900/[0.08] bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <row.icon className="h-5 w-5" />
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
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Presence — where the thinking already lives */}
            <div className="mt-12">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="font-headline text-xl font-bold tracking-tight text-primary sm:text-2xl">
                  Find me where I already write.
                </h3>
                <p className="font-body text-sm text-on-surface-variant">
                  Six doors, same person.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PRESENCE.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="hover-card group flex items-center gap-4 rounded-2xl bg-white p-5 dark:bg-white/[0.03]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary dark:bg-white/[0.06] dark:text-white">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-headline text-sm font-bold text-primary">
                        {item.label}
                      </span>
                      <span className="block truncate font-body text-sm text-on-surface-variant">
                        {item.handle}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent dark:text-white/30" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Closing invitation — centered finale, mint flare kept */}
        <section ref={invitationRef} className="relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-4 text-center sm:px-6"
          >
            <div className="mb-10 flex items-center gap-4">
              <span className="h-px w-8 bg-accent/50 sm:w-12" />
              <p className="font-label text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
                Open invitation
              </p>
              <span className="h-px w-8 bg-accent/50 sm:w-12" />
            </div>

            <h2 className="sr-only">Let&apos;s build together</h2>

            <div className="w-full select-none text-primary" aria-hidden="true">
              <svg
                className="mx-auto h-auto w-full"
                viewBox="0 0 720 200"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <motion.linearGradient id="invitation-shine" x1={x1} y1="0%" x2={x2} y2="0%">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="40%" stopColor="currentColor" />
                    <stop offset="47%" stopColor="var(--color-accent)" />
                    <stop offset="50%" stopColor="var(--color-accent)" />
                    <stop offset="53%" stopColor="var(--color-accent)" />
                    <stop offset="60%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" />
                  </motion.linearGradient>
                </defs>
                <text
                  x="360"
                  y="78"
                  textAnchor="middle"
                  fill="url(#invitation-shine)"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: 78,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Let&apos;s build
                </text>
                <text
                  x="360"
                  y="168"
                  textAnchor="middle"
                  fill="url(#invitation-shine)"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: 78,
                    letterSpacing: '-0.03em',
                  }}
                >
                  together.
                </text>
              </svg>
            </div>

            <p className="mt-8 max-w-sm font-body text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
              Mentorship. AI advising. A serious build.
              <span className="mt-1 block text-primary/80 dark:text-primary/70">
                If the work matters — let&apos;s talk.
              </span>
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="btn-accent inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 font-headline text-sm font-bold tracking-tight shadow-[0_12px_40px_-12px_rgba(16,185,129,0.55)]"
              >
                Start a conversation
                <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
              <Link
                href="/notes"
                className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-headline text-sm font-bold tracking-tight"
              >
                Read Notes first
              </Link>
            </div>

            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/70">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Process journals
              </span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/50" />
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Evaluation graphs
              </span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/50" />
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Quiet interfaces
              </span>
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
