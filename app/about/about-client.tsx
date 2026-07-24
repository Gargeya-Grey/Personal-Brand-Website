'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ArrowRight, Network, ChevronDown, Sparkles } from 'lucide-react';

export default function AboutClient() {
  const invitationRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: invitationRef,
    offset: ["start end", "end 20%"]
  });

  // Animate gradient shine x1 and x2 based on invitation scroll progress
  const x1 = useTransform(scrollYProgress, [0.1, 0.9], ["-100%", "100%"]);
  const x2 = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "200%"]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Navigation />
      
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-10 xl:px-12">
        
        {/* Section 1: Hero (Editorial Focus) */}
        <section className="relative flex flex-col items-start justify-center py-12 sm:min-h-[72svh] md:py-20 lg:min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl space-y-8"
          >
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Gargeya Sharma · Founder & Mentor
            </span>
            <h1 className="font-display text-[clamp(2.75rem,10vw,5.5rem)] font-medium tracking-[-0.02em] text-primary leading-[1.02]">
              Architecting the <br /> <span className="text-accent">next</span> generation.
            </h1>
            
            <div className="relative pt-6 max-w-3xl">
              <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-accent/30" />
              <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed pl-8">
                I&apos;m Gargeya Sharma — Founder &amp; Architect at Edudojo.ai. I empower students, clients, and engineering teams to build intelligent systems rooted in mechanical sympathy and quiet authority.
              </p>
            </div>
          </motion.div>

          {/* Floating Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-on-surface-variant/40"
          >
            <span className="text-[10px] font-label uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </motion.div>
        </section>

        {/* Sections 2 + 3 in a relative wrapper for ambient background decoration */}
        <div className="relative">

        {/* Section 2: The Journey / Inspiring Collaboration */}
        <section className="py-24 md:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="hidden lg:block lg:col-span-4" />
          
          <motion.div
            initial={{ y: 36 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 ml-auto w-full max-w-3xl lg:col-span-8"
          >
            <motion.div
              className="board-card group relative overflow-hidden rounded-soft p-8 md:p-14"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative z-10 mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 transition-all duration-300 ease-out group-hover:bg-accent group-hover:text-[#0F172A]">
                <Network className="h-7 w-7 text-accent transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:text-[#0F172A]" />
              </div>

              <h2 className="relative z-10 mb-6 font-display text-3xl font-light tracking-[-0.02em] text-primary md:text-4xl">
                Inspiring Collaboration
              </h2>
              <p className="relative z-10 font-body text-lg leading-relaxed text-on-surface-variant">
                As a founder and mentor, my mission is to demystify complex architectures. I work closely
                with students and clients to transform abstract AI concepts into robust, scalable
                realities. It’s not just about writing code; it’s about shaping the way we think about
                systems and the future we are building together.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Topographic contours — fade in after cards so entrance never looks accidental */}
        <svg
          className="topo-field pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
          viewBox="0 0 1000 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <filter id="topo-blur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* Contour cluster A — upper-right, echoing card 1 position */}
          <ellipse cx="620" cy="180" rx="60"  ry="28"  transform="rotate(-18 620 180)" stroke="var(--color-accent)" strokeWidth="1"   opacity="0.55" filter="url(#topo-blur)" />
          <ellipse cx="620" cy="180" rx="100" ry="48"  transform="rotate(-18 620 180)" stroke="var(--color-accent)" strokeWidth="0.8" opacity="0.35" filter="url(#topo-blur)" />
          <ellipse cx="620" cy="180" rx="145" ry="70"  transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.7" opacity="0.25" />
          <ellipse cx="620" cy="180" rx="195" ry="94"  transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.6" opacity="0.18" />
          <ellipse cx="620" cy="180" rx="250" ry="120" transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.5" opacity="0.13" />
          <ellipse cx="620" cy="180" rx="310" ry="148" transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.4" opacity="0.09" />

          {/* Contour cluster B — lower-left, echoing card 2 position */}
          <ellipse cx="380" cy="440" rx="70"  ry="30"  transform="rotate(-18 380 440)" stroke="var(--color-accent)" strokeWidth="1"   opacity="0.45" filter="url(#topo-blur)" />
          <ellipse cx="380" cy="440" rx="115" ry="52"  transform="rotate(-18 380 440)" stroke="var(--color-accent)" strokeWidth="0.8" opacity="0.30" filter="url(#topo-blur)" />
          <ellipse cx="380" cy="440" rx="165" ry="76"  transform="rotate(-18 380 440)" stroke="#94a3b8" strokeWidth="0.7" opacity="0.22" />
          <ellipse cx="380" cy="440" rx="220" ry="102" transform="rotate(-18 380 440)" stroke="#94a3b8" strokeWidth="0.6" opacity="0.15" />
          <ellipse cx="380" cy="440" rx="280" ry="130" transform="rotate(-18 380 440)" stroke="#94a3b8" strokeWidth="0.5" opacity="0.10" />
          <ellipse cx="380" cy="440" rx="345" ry="160" transform="rotate(-18 380 440)" stroke="#94a3b8" strokeWidth="0.4" opacity="0.07" />

          {/* Shared mid-field contour — large ring that overlaps both clusters */}
          <ellipse cx="500" cy="310" rx="340" ry="155" transform="rotate(-18 500 310)" stroke="#94a3b8" strokeWidth="0.5" opacity="0.10" />
          <ellipse cx="500" cy="310" rx="430" ry="195" transform="rotate(-18 500 310)" stroke="#94a3b8" strokeWidth="0.4" opacity="0.07" />
        </svg>

        {/* Section 3: The Craft (Engineering Philosophy) */}
        <section className="py-24 md:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <motion.div
            initial={{ y: 36 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mr-auto w-full max-w-5xl lg:col-span-10"
          >
            <motion.div
              className="board-card group relative overflow-hidden rounded-soft border-l-4 border-l-accent px-5 py-12 sm:px-8 sm:py-16 md:px-14 md:py-24"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />

              <h2 className="relative z-10 mb-10 flex items-center gap-4 font-display text-3xl font-light tracking-[-0.02em] text-primary md:text-4xl">
                <Sparkles className="h-8 w-8 text-accent" /> The Engineering Philosophy
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative z-10">
                {/* Modern Vertical Divider Line */}
                <div className="hidden md:block absolute left-1/2 top-[30%] bottom-[30%] w-[4px] bg-accent/20 -translate-x-1/2" />
                
                <div className="space-y-3 pr-0 md:pr-8">
                  <h3 className="font-bold text-primary text-xl md:text-2xl font-headline">Soft Minimalism</h3>
                  <p className="font-body text-base text-on-surface-variant leading-relaxed">
                    We reject unnecessary layers. By minimizing abstraction, we expose the structural integrity of our systems, allowing for clearer thought, faster execution, and more elegant products.
                  </p>
                </div>
                
                <div className="space-y-3 pl-0 md:pl-8">
                  <h3 className="font-bold text-primary text-xl md:text-2xl font-headline">Mechanical Sympathy</h3>
                  <p className="font-body text-base text-on-surface-variant leading-relaxed">
                    Hardware is not an afterthought. We align our software layouts with the underlying hardware behaviors to produce stable, high-performance environments that scale effortlessly.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <div className="hidden lg:block lg:col-span-2" />
        </section>

        </div>{/* end relative wrapper */}

        {/* Section 4: Closing invitation — centered finale, mint flare kept */}
        <section
          ref={invitationRef}
          className="relative py-28 md:py-36"
        >
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

            <Link
              href="/contact"
              className="btn-accent mt-10 inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 font-headline text-sm font-bold tracking-tight shadow-[0_12px_40px_-12px_rgba(16,185,129,0.55)]"
            >
              Start a conversation
              <ArrowRight className="btn-icon h-4 w-4" />
            </Link>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
