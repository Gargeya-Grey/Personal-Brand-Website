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
      
      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-6 md:px-12 pt-32 pb-24">
        
        {/* Section 1: Hero (Editorial Focus) */}
        <section className="min-h-[80vh] flex flex-col justify-center items-start py-12 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl space-y-8"
          >
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Founder & Mentor
            </span>
            <h1 className="font-headline text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold tracking-[-0.04em] text-primary leading-[1.02]">
              Architecting the <br /> <span className="text-accent">next</span> generation.
            </h1>
            
            <div className="relative pt-6 max-w-3xl">
              <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-accent/30" />
              <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed pl-8">
                I empower students, clients, and engineering teams to build intelligent systems rooted in mechanical sympathy and quiet authority.
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

              <h2 className="relative z-10 mb-6 font-display text-3xl font-normal tracking-[-0.02em] text-primary md:text-4xl">
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
              className="board-card group relative overflow-hidden rounded-soft border-l-4 border-l-accent px-8 py-16 md:px-14 md:py-24"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />

              <h2 className="relative z-10 mb-10 flex items-center gap-4 font-display text-3xl font-normal tracking-[-0.02em] text-primary md:text-4xl">
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

        {/* Section 4: The Invitation */}
        <section
          ref={invitationRef}
          className="relative flex flex-col items-center justify-center py-24 text-center md:py-36"
        >
          <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6 md:space-y-12">
            {/* Outlined type — sized in SVG units so it never clips the frame */}
            <div className="relative z-10 w-full select-none pointer-events-none" aria-hidden="true">
              <svg
                className="mx-auto h-auto w-full max-w-5xl text-primary"
                viewBox="0 0 1000 200"
                preserveAspectRatio="xMidYMid meet"
                role="img"
              >
                <title>Let&apos;s build together</title>
                <defs>
                  <motion.linearGradient id="invitation-shine" x1={x1} y1="0%" x2={x2} y2="0%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.42" />
                    <stop offset="40%" stopColor="currentColor" stopOpacity="0.42" />
                    <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="1" />
                    <stop offset="60%" stopColor="currentColor" stopOpacity="0.42" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.42" />
                  </motion.linearGradient>
                </defs>
                {/* Two lines = clean fit at every breakpoint */}
                <text
                  x="500"
                  y="78"
                  textAnchor="middle"
                  fill="var(--color-surface)"
                  stroke="url(#invitation-shine)"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: 72,
                    letterSpacing: 6,
                  }}
                >
                  LET&apos;S BUILD
                </text>
                <text
                  x="500"
                  y="158"
                  textAnchor="middle"
                  fill="var(--color-surface)"
                  stroke="url(#invitation-shine)"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: 72,
                    letterSpacing: 8,
                  }}
                >
                  TOGETHER
                </text>
              </svg>
            </div>

            <motion.div
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/contact"
                className="btn-accent inline-flex items-center justify-center gap-3 rounded-full px-10 py-5 font-headline text-sm font-bold uppercase tracking-widest"
              >
                Start a conversation <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
