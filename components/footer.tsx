'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Twitter, 
  Linkedin, 
  Youtube, 
  Github, 
  ArrowUp
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
  const { theme } = useTheme();

  // Scroll scrollYProgress relative to the footer element itself
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Map scroll progress to sweep the highlight across the wordmark stroke
  const x1 = useTransform(scrollYProgress, [0.70, 1.10], ["-100%", "100%"]);
  const x2 = useTransform(scrollYProgress, [0.70, 1.10], ["0%", "200%"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 6) + 9);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;

    setSubscribing(true);
    setLogs([]);
    
    const steps = [
      "Initializing TLS handshake...",
      "Resolving ledger endpoint...",
      "Syncing newsletter feed...",
      "Connection secure. Synced."
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

  return (
    <footer 
      ref={containerRef} 
      className="w-full bg-slate-950 text-slate-300 pt-24 pb-12 relative z-0 overflow-x-auto mt-32 border-t border-slate-900"
      id="footer"
    >
      {/* Background blueprint grid - 0.015 opacity */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_75%,transparent_100%)] pointer-events-none -z-10" />

      {/* Soft radial background glow centered behind CTA */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.08),rgba(16,185,129,0.02)_40%,transparent_70%)] pointer-events-none -z-10" />

      {/* Screen Reader Accessible Fallback */}
      <span className="sr-only">Gargeya</span>

      {/* Foreground Interactive Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12">
        
        {/* 1. Floating Newsletter CTA (Centered Focal Point) */}
        <div className="max-w-4xl mx-auto relative mb-20 md:mb-28">
          {/* Card Border glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)] blur-2xl -z-10 pointer-events-none" />
          
          {/* The Solid Elevated Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 md:p-8 lg:p-10 shadow-2xl relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
              <div className="space-y-2 max-w-md">
                <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
                  Stay Updated
                </h3>
                <p className="font-body text-[14px] text-slate-400 leading-relaxed">
                  Subscribe for analytical summaries of AI evaluation frameworks and design methodologies.
                </p>
              </div>
              
              <div className="flex-1 max-w-md w-full">
                <AnimatePresence mode="wait">
                  {!subscribed ? (
                    <motion.form 
                      key="subscribe-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubscribe} 
                      className="w-full flex flex-col sm:flex-row gap-4"
                    >
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={subscribing}
                        placeholder="Your developer email" 
                        required
                        className="w-full sm:flex-1 min-w-0 sm:min-w-[50%] h-14 text-sm font-body bg-slate-950 text-white placeholder-slate-500 border-2 border-slate-800 rounded-xl px-4 focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all duration-300 shadow-inner focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
                      />
                      <button 
                        type="submit"
                        disabled={subscribing}
                        className="h-14 px-6 w-full sm:w-auto shrink-0 bg-white hover:bg-slate-200 text-slate-950 font-headline font-bold text-sm rounded-xl uppercase tracking-wider border-2 border-slate-900 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
                      >
                        {subscribing ? "Subscribing..." : "Subscribe"}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="subscribe-success"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 space-y-1.5 shadow-inner mt-3 sm:mt-0"
                    >
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
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white font-bold animate-pulse pt-1"
                      >
                        ✓ Connection synced. Welcome aboard.
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Deconstructed, Breathable Link Columns (4-Column Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-16 text-left">
          
          {/* Column 1: Projects */}
          <div className="h-full flex flex-col justify-start space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Projects
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <a href="https://edudojo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  Edudojo.ai
                </a>
              </li>
              <li>
                <Link href="/projects/agent-frameworks" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  Agent Frameworks
                </Link>
              </li>
              <li>
                <Link href="/projects/open-source" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  Open Source
                </Link>
              </li>
              <li>
                <Link href="/projects/ui-ux" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  UI/UX Concepts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Content */}
          <div className="h-full flex flex-col justify-start space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Content
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <Link href="/blog" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  The Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/youtube" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  YouTube Series
                </Link>
              </li>
              <li>
                <Link href="/specs" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  Technical Specs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="h-full flex flex-col justify-start space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Connect
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <Link href="/about" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  About Gargeya
                </Link>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max">
                  Contact Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Presence / Socials */}
          <div className="h-full flex flex-col justify-start space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Presence
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 flex items-center gap-3 w-max">
                  <Linkedin width={20} height={20} className="flex-none w-[20px] h-[20px] text-slate-400" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 flex items-center gap-3 w-max">
                  <Twitter width={20} height={20} className="flex-none w-[20px] h-[20px] text-slate-400" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 flex items-center gap-3 w-max">
                  <Youtube width={20} height={20} className="flex-none w-[20px] h-[20px] text-slate-400" />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 flex items-center gap-3 w-max">
                  <Github width={20} height={20} className="flex-none w-[20px] h-[20px] text-slate-400" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. Bottom Status & Legals */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6 text-sm font-mono text-slate-400">
          
          {/* Telemetry widget */}
          <div className="flex items-center gap-2 relative">
            <div 
              className="flex items-center gap-2 cursor-pointer group w-max"
              onMouseEnter={() => setStatusHovered(true)}
              onMouseLeave={() => setStatusHovered(false)}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="text-[13px] md:text-sm text-slate-400 group-hover:text-white transition-colors duration-300">
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
                  className="absolute bottom-7 left-0 w-60 bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-lg z-50 pointer-events-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                        Telemetry Node
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-300 font-mono">
                      <span className="text-slate-400">API Gateway:</span>
                      <span className="text-right text-emerald-500 font-bold">99.98%</span>
                      
                      <span className="text-slate-400">Edge Latency:</span>
                      <span className="text-right text-white font-bold">{latency}ms</span>
                      
                      <span className="text-slate-400">Gateway:</span>
                      <span className="text-right font-medium">Anycast GL</span>

                      <span className="text-slate-400">SSL Sec:</span>
                      <span className="text-right text-blue-400 font-bold">TLS 1.3 SHA</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Copyright and Legal links */}
          <div className="flex flex-wrap justify-center gap-6 items-center text-slate-400 font-ui text-sm">
            <Link href="/privacy" className="hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <span>© {new Date().getFullYear()}</span>
          </div>

          {/* Back-to-Top trigger */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all duration-300 cursor-pointer"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4.5 h-4.5" />
          </motion.button>

        </div>

      </div>

      {/* 3. Big Branding Wordmark - Decoupled Flow, Positioned under foreground content */}
      <div className="relative z-10 w-full flex justify-center py-10 md:py-16 overflow-hidden">
        <svg className="w-full h-auto select-none max-w-7xl mx-auto px-6" viewBox="0 0 1000 240" aria-hidden="true">
          <defs>
            <motion.linearGradient id="wordmark-shine" x1={x1} y1="0%" x2={x2} y2="0%">
              <stop offset="0%" stopColor="rgba(148, 163, 184, 0.12)" />
              <stop offset="42%" stopColor="rgba(148, 163, 184, 0.12)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.85)" />
              <stop offset="58%" stopColor="rgba(148, 163, 184, 0.12)" />
              <stop offset="100%" stopColor="rgba(148, 163, 184, 0.12)" />
            </motion.linearGradient>
          </defs>
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#020617"
            stroke="url(#wordmark-shine)"
            strokeWidth="2.4"
            paintOrder="stroke fill"
            className="font-headline font-extrabold text-[168px] tracking-[0.06em] uppercase"
          >
            Gargeya
          </text>
        </svg>
      </div>
    </footer>
  );
}
