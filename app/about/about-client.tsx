'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ArrowRight, Sparkles, Network, ChevronDown } from 'lucide-react';

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
              Architecting the <br /> next generation.
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 w-full max-w-3xl ml-auto relative z-10"
          >
            <motion.div 
              className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-8 md:p-14 rounded-soft border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] relative group hover:bg-white/85 dark:hover:bg-white/10 hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[background-color,border-color,box-shadow] duration-300 overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Textured Grainy Glass Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.09] mix-blend-overlay z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="readability-shield" />
              
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-8 transition-all duration-300 ease-out group-hover:bg-accent group-hover:text-[#0F172A] relative z-10">
                <Network className="w-7 h-7 text-accent group-hover:text-[#0F172A] transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-6 relative z-10">
                Inspiring Collaboration
              </h2>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed relative z-10">
                As a founder and mentor, my mission is to demystify complex architectures. I work closely with students and clients to transform abstract AI concepts into robust, scalable realities. It’s not just about writing code; it’s about shaping the way we think about systems and the future we are building together.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Topographic contour field — organic nested ellipses following the staggered card diagonal */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="topo-blur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* Contour cluster A — upper-right, echoing card 1 position */}
          <ellipse cx="620" cy="180" rx="60"  ry="28"  transform="rotate(-18 620 180)" stroke="#10B981" strokeWidth="1"   opacity="0.55" filter="url(#topo-blur)" />
          <ellipse cx="620" cy="180" rx="100" ry="48"  transform="rotate(-18 620 180)" stroke="#10B981" strokeWidth="0.8" opacity="0.35" filter="url(#topo-blur)" />
          <ellipse cx="620" cy="180" rx="145" ry="70"  transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.7" opacity="0.25" />
          <ellipse cx="620" cy="180" rx="195" ry="94"  transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.6" opacity="0.18" />
          <ellipse cx="620" cy="180" rx="250" ry="120" transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.5" opacity="0.13" />
          <ellipse cx="620" cy="180" rx="310" ry="148" transform="rotate(-18 620 180)" stroke="#94a3b8" strokeWidth="0.4" opacity="0.09" />

          {/* Contour cluster B — lower-left, echoing card 2 position */}
          <ellipse cx="380" cy="440" rx="70"  ry="30"  transform="rotate(-18 380 440)" stroke="#10B981" strokeWidth="1"   opacity="0.45" filter="url(#topo-blur)" />
          <ellipse cx="380" cy="440" rx="115" ry="52"  transform="rotate(-18 380 440)" stroke="#10B981" strokeWidth="0.8" opacity="0.30" filter="url(#topo-blur)" />
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-10 w-full max-w-5xl mr-auto relative z-10"
          >
            <motion.div 
              className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl px-8 md:px-14 py-16 md:py-24 rounded-soft border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] relative group hover:bg-white/85 dark:hover:bg-white/10 hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[background-color,border-color,box-shadow] duration-300 border-l-4 border-l-accent overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Textured Grainy Glass Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.09] mix-blend-overlay z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="readability-shield" />
              
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-10 flex items-center gap-4 relative z-10">
                <Sparkles className="w-8 h-8 text-accent animate-pulse" /> The Engineering Philosophy
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
          className="py-24 md:py-36 flex flex-col justify-center items-center text-center relative overflow-hidden"
        >
          <div className="w-full max-w-5xl mx-auto space-y-12">
            
            {/* SVG Outlined Typography with Scroll Sweep */}
            <div className="relative z-10 w-full overflow-hidden select-none pointer-events-none">
              <svg className="w-full h-auto px-4 text-primary" viewBox="0 0 1200 200" aria-hidden="true">
                <defs>
                  <motion.linearGradient id="invitation-shine" x1={x1} y1="0%" x2={x2} y2="0%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                    <stop offset="42%" stopColor="currentColor" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="1" />
                    <stop offset="58%" stopColor="currentColor" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
                  </motion.linearGradient>
                </defs>
                <text
                  x="50%"
                  y="55%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="var(--color-surface)"
                  stroke="url(#invitation-shine)"
                  strokeWidth="2.5"
                  paintOrder="stroke fill"
                  className="font-headline font-extrabold text-[72px] sm:text-[100px] md:text-[120px] uppercase tracking-tight"
                >
                  Let's build together
                </text>
              </svg>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-accent text-[#0F172A] rounded-full font-headline font-extrabold uppercase tracking-widest text-sm transition-all duration-300 hover:scale-105 shadow-2xl shadow-accent/20 hover:shadow-accent/40 active:scale-95"
              >
                Start a conversation <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
