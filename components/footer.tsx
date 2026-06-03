'use client';

import { useScroll, useTransform, motion, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Twitter, 
  Linkedin, 
  Youtube, 
  Github, 
  ArrowUp, 
  Activity 
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [statusHovered, setStatusHovered] = useState(false);
  const [latency, setLatency] = useState(12);
  
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Target the footer container so progress is relative to the bottom section of the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // CSS background-position math with backgroundSize: 300%
  // The gradient has a bright band centered at 50% of the image.
  // visible_position = -(imageWidth - 1) * bgPosX + 0.5 * imageWidth
  //                  = -2 * bgPosX + 1.5
  // For band at left edge (0):   bgPosX = 75%
  // For band at right edge (1):  bgPosX = 25%
  // For band off-left (-0.15):   bgPosX = 82.5%
  // For band off-right (1.15):   bgPosX = 17.5%
  // Sweep LEFT→RIGHT = high% → low%
  const pulseX = useTransform(scrollYProgress, [0.7, 1.0], ["80%", "26%"]);

  // Simulate dynamic server edge latency variations
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 6) + 9); // ranges from 9ms to 14ms
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;

    setSubscribing(true);
    setLogs([]);
    
    // Interactive terminal-like output syncing feed
    const steps = [
      "Initializing TLS handshake...",
      "Resolving ledger.edudojo.ai endpoint...",
      "Syncing engineering newsletter feed...",
      "Connection secure. Database synced."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
      setLogs(prev => [...prev, `> ${steps[i]}`]);
    }

    setSubscribing(false);
    setSubscribed(true);
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Flare gradient: transparent everywhere except a bright band in the center (45%-55%)
  // This band is what "sweeps" across the text as backgroundPositionX changes.
  const flareGradient = isDark 
    ? `linear-gradient(90deg, 
        transparent 0%, 
        transparent 42%, 
        rgba(16,185,129,0.3) 48%, 
        rgba(16,185,129,0.6) 50%, 
        rgba(16,185,129,0.3) 52%, 
        transparent 58%, 
        transparent 100%
      )`
    : `linear-gradient(90deg, 
        transparent 0%, 
        transparent 42%, 
        rgba(16,185,129,0.3) 48%, 
        rgba(16,185,129,0.55) 50%, 
        rgba(16,185,129,0.3) 52%, 
        transparent 58%, 
        transparent 100%
      )`;

  return (
    <footer 
      ref={containerRef} 
      className="w-full bg-white/40 dark:bg-white/[0.01] backdrop-blur-xl text-slate-800 dark:text-slate-200 pt-24 pb-24 relative overflow-hidden mt-32"
      id="footer"
    >
      {/* Decorative Blueprint/Grid using theme-derived opacity stroke color */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-outline-variant)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_75%,transparent_100%)] pointer-events-none z-0" />

      {/* 1. Symmetric 4-Column Shelf Directory Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-16 relative z-10">
        
        {/* Column 1: Ventures (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5 relative border-t border-slate-200/20 dark:border-slate-800/20 pt-8">
          {/* 100% transparent backdrop-blur readability shield (removes card color banding) */}
          <div className="readability-shield" />
          <h3 className="font-label text-[13px] md:text-sm uppercase tracking-[0.25em] font-bold text-emerald-600 dark:text-emerald-400">
            Ventures
          </h3>
          <ul className="space-y-3 font-ui text-[15px] md:text-[16px] font-normal tracking-wide text-slate-500 dark:text-slate-400">
            <li>
              <a 
                href="https://edudojo.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-accent dark:hover:text-accent transition-colors duration-300 block"
              >
                Edudojo.ai
              </a>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-650 block cursor-not-allowed text-[14px] md:text-[15px]">Architectural Intelligence</span>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-650 block cursor-not-allowed text-[14px] md:text-[15px]">Evaluation Labs</span>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-650 block cursor-not-allowed text-[14px] md:text-[15px]">Compliance Audits</span>
            </li>
          </ul>
        </div>

        {/* Column 2: Resources (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5 relative border-t border-slate-200/20 dark:border-slate-800/20 pt-8">
          <div className="readability-shield" />
          <h3 className="font-label text-[13px] md:text-sm uppercase tracking-[0.25em] font-bold text-blue-600 dark:text-blue-400">
            Resources
          </h3>
          <ul className="space-y-3 font-ui text-[15px] md:text-[16px] font-normal tracking-wide text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/blog" className="hover:text-accent dark:hover:text-accent transition-colors duration-300 block">
                Engineering Ledger
              </Link>
            </li>
            <li>
              <Link href="/youtube" className="hover:text-accent dark:hover:text-accent transition-colors duration-300 block">
                Video Deep Dives
              </Link>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-650 block cursor-not-allowed text-[14px] md:text-[15px]">System Architectures</span>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-650 block cursor-not-allowed text-[14px] md:text-[15px]">Telemetry SDK</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Company (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5 relative border-t border-slate-200/20 dark:border-slate-800/20 pt-8">
          <div className="readability-shield" />
          <h3 className="font-label text-[13px] md:text-sm uppercase tracking-[0.25em] font-bold text-indigo-600 dark:text-indigo-400">
            Company
          </h3>
          <ul className="space-y-3 font-ui text-[15px] md:text-[16px] font-normal tracking-wide text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/about" className="hover:text-accent dark:hover:text-accent transition-colors duration-300 block">
                About Biography
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-accent dark:hover:text-accent transition-colors duration-300 block">
                Community Collective
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent dark:hover:text-accent transition-colors duration-300 block">
                Contact Desk
              </Link>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-650 block cursor-not-allowed text-[14px] md:text-[15px]">Digital Strategy</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Socials (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5 relative border-t border-slate-200/20 dark:border-slate-800/20 pt-8">
          <div className="readability-shield" />
          
          <h3 className="font-label text-[13px] md:text-sm uppercase tracking-[0.25em] font-bold text-slate-800 dark:text-slate-200">
            Newsletter
          </h3>
          <p className="font-body text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Subscribe for analytical summaries of AI evaluation frameworks and design methodologies.
          </p>
          
          {!subscribed && !subscribing ? (
            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your developer email" 
                required
                className="w-full text-sm bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl px-4 h-11 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-300 shadow-inner font-mono"
              />
              <button 
                type="submit"
                className="w-full h-11 bg-slate-950 dark:bg-white hover:bg-slate-900 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-headline font-bold text-sm rounded-xl uppercase tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <div className="w-full bg-slate-950 dark:bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 space-y-1.5 shadow-inner min-h-[95px]">
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-900/40 pb-1 mb-2">
                <span>TERMINAL STATUS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              {logs.map((log, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {log}
                </motion.div>
              ))}
              {subscribed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white font-bold animate-pulse pt-1"
                >
                  ✓ Connection synced. Welcome aboard.
                </motion.div>
              )}
            </div>
          )}

          {/* Social Row positioned neatly under newsletter block */}
          <div className="flex gap-2.5 pt-1.5">
            {[
              { icon: Linkedin, href: "https://linkedin.com" },
              { icon: Twitter, href: "https://twitter.com" },
              { icon: Youtube, href: "https://youtube.com" },
              { icon: Github, href: "https://github.com" },
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-accent hover:border-accent/40 dark:hover:border-accent/40 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. Big Branding Wordmark — Two-layer technique like LangChain:
           Layer 1: Pure outline (stroke only, no fill)
           Layer 2: Animated gradient flare (fill only, no stroke)
           This prevents stroke overlap artifacts entirely. */}
      <div ref={headingRef} className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 mb-8 relative z-10 text-center 2xl:px-4">
        <div className="relative w-full flex justify-center">
          
          {/* Layer 1: Outline text — always visible, thin stroke, no fill */}
          <h1
            style={{
              WebkitTextStroke: isDark ? '1px rgba(148,163,184,0.25)' : '1px rgba(15,23,42,0.18)',
              color: 'transparent',
              letterSpacing: '0.06em',
            }}
            className="font-headline font-extrabold text-[8.4vw] sm:text-[8.7vw] md:text-[9vw] lg:text-[9.2vw] xl:text-[9.4vw] 2xl:text-[144px] leading-none uppercase select-none whitespace-nowrap text-center w-full"
          >
            Gargeya Sharma
          </h1>

          {/* Layer 2: Flare fill — animated gradient clipped to text shape, no stroke */}
          <motion.h1
            aria-hidden="true"
            style={{
              backgroundImage: flareGradient,
              backgroundPositionX: pulseX,
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.06em',
            }}
            className="font-headline font-extrabold text-[8.4vw] sm:text-[8.7vw] md:text-[9vw] lg:text-[9.2vw] xl:text-[9.4vw] 2xl:text-[144px] leading-none uppercase select-none whitespace-nowrap absolute inset-0 bg-clip-text bg-no-repeat pointer-events-none text-center w-full"
          >
            Gargeya Sharma
          </motion.h1>

        </div>
      </div>

      {/* 3. Bottom Status, Legals & Scroll Navigation Row */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 mt-6 border-t border-slate-200/10 dark:border-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm font-mono text-slate-500 relative z-10">
        
        {/* All Systems Operational live Telemetry widget */}
        <div className="flex items-center gap-2 relative">
          <div 
            className="flex items-center gap-2 cursor-pointer group w-max"
            onMouseEnter={() => setStatusHovered(true)}
            onMouseLeave={() => setStatusHovered(false)}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            <span className="text-[13px] md:text-sm text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors duration-300">
              All systems operational
            </span>
          </div>
          
          <AnimatePresence>
            {statusHovered && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-7 left-0 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-3.5 rounded-xl shadow-lg z-50 pointer-events-none"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                      Telemetry Node
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    <span className="text-slate-400 dark:text-slate-500">API Gateway:</span>
                    <span className="text-right text-emerald-500 font-bold">99.98%</span>
                    
                    <span className="text-slate-400 dark:text-slate-500">Edge Latency:</span>
                    <span className="text-right text-accent font-bold">{latency}ms</span>
                    
                    <span className="text-slate-400 dark:text-slate-500">Gateway:</span>
                    <span className="text-right font-medium">Anycast GL</span>

                    <span className="text-slate-400 dark:text-slate-500">SSL Sec:</span>
                    <span className="text-right text-blue-500 dark:text-blue-400 font-bold">TLS 1.3 SHA</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copyright and Legal links */}
        <div className="flex gap-6 items-center text-slate-400 dark:text-slate-550 font-ui text-sm">
          <Link href="/about" className="hover:text-accent dark:hover:text-accent transition-colors duration-300">
            Privacy Policy
          </Link>
          <Link href="/about" className="hover:text-accent dark:hover:text-accent transition-colors duration-300">
            Terms of Service
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>

        {/* Back-to-Top trigger */}
        <motion.button
          onClick={scrollToTop}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-accent hover:border-accent/40 dark:hover:border-accent/40 transition-all duration-300 cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4.5 h-4.5" />
        </motion.button>

      </div>
    </footer>
  );
}
