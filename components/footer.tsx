'use client';

import { useScroll, useTransform, motion } from 'motion/react';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Twitter, Linkedin, Youtube, Github } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Slide gradient position smoothly across horizontal letters on viewport scrolling
  const pulseX = useTransform(scrollYProgress, [0, 1], ["100%", "-100%"]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const backgroundGradient = `linear-gradient(120deg, 
    rgba(255,255,255,0.06) 0%, 
    rgba(255,255,255,0.06) 35%, 
    rgba(16,185,129,0.7) 48%, 
    rgba(59,130,246,0.7) 52%, 
    rgba(255,255,255,0.06) 65%, 
    rgba(255,255,255,0.06) 100%
  )`;

  return (
    <footer 
      ref={containerRef} 
      className="w-full bg-[#03060d] text-white border-t border-slate-900 pt-24 pb-12 relative overflow-hidden mt-32"
      id="footer"
    >
      {/* Decorative Blueprint or Radial Overlays for tech elegance */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_75%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* 1. Header CTA Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20 relative z-10">
        {/* Subtle decorative wireframes mimicking Image 1 */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent flex justify-center items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute left-[20%] shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute right-[20%] shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
        </div>

        <div className="pt-12 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight text-white">
            See what your agent is really doing
          </h2>
          <p className="font-body text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Continuous evaluation, pipeline telemetry integrations, and deep autonomous audit logs keeping your system architecture solid.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              href="/blog" 
              className="px-6 py-3 bg-white hover:bg-slate-100 text-black font-headline font-bold text-sm rounded-xl transition-all duration-300 shadow-md active:scale-95"
            >
              Read the Ledger
            </Link>
            <Link 
              href="/contact" 
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-headline font-bold text-sm rounded-xl border border-slate-800 transition-all duration-300 active:scale-95"
            >
              Get a Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative horizontal splitter */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 my-12 relative z-10">
        <div className="h-[1px] bg-slate-900/80 relative">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-500" />
          <div className="absolute top-1/2 left-2/4 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* 2. Directory Columns section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-16 pb-20 border-b border-slate-900 relative z-10">
        
        {/* Column 1: Ventures (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-emerald-500">
            Ventures
          </h3>
          <ul className="space-y-3 font-body text-sm text-slate-400">
            <li>
              <a 
                href="https://edudojo.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-200 block"
              >
                Edudojo.ai
              </a>
            </li>
            <li>
              <span className="text-slate-600 block cursor-not-allowed">Architectural Intelligence</span>
            </li>
            <li>
              <span className="text-slate-600 block cursor-not-allowed">Evaluation Labs</span>
            </li>
            <li>
              <span className="text-slate-600 block cursor-not-allowed">Structured Compliance</span>
            </li>
          </ul>
        </div>

        {/* Column 2: Resources (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-blue-500">
            Resources
          </h3>
          <ul className="space-y-3 font-body text-sm text-slate-400">
            <li>
              <Link href="/blog" className="hover:text-white transition-colors duration-200 block">
                Engineering Ledger
              </Link>
            </li>
            <li>
              <Link href="/youtube" className="hover:text-white transition-colors duration-200 block">
                Video Deep Dives
              </Link>
            </li>
            <li>
              <span className="text-slate-600 block cursor-not-allowed">System Architecture</span>
            </li>
            <li>
              <span className="text-slate-600 block cursor-not-allowed">Telemetry Analytics</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Company / Identity (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-indigo-400">
            Identity
          </h3>
          <ul className="space-y-3 font-body text-sm text-slate-400">
            <li>
              <Link href="/about" className="hover:text-white transition-colors duration-200 block">
                About Biography
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-white transition-colors duration-200 block">
                Community Collective
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors duration-200 block">
                Contact Desk
              </Link>
            </li>
            <li>
              <span className="text-slate-600 block cursor-not-allowed">Digital Strategy</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter + Socials (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white">
            Newsletter
          </h3>
          <p className="font-body text-xs text-slate-400 leading-relaxed">
            Sign up for our newsletter to stay up to date. Get analytical distributions of autonomous pipeline architectures.
          </p>
          
          <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email" 
                required
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-4 h-10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
              />
            </div>
            {subscribed ? (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse pt-1">
                ✓ Successfully registered! Thank you.
              </p>
            ) : (
              <button 
                type="submit"
                className="w-full h-10 bg-white hover:bg-slate-100 text-black font-headline font-bold text-xs rounded-lg uppercase tracking-wider transition-all duration-300 active:scale-[0.98]"
              >
                Subscribe
              </button>
            )}
          </form>

          {/* Social Icons row */}
          <div className="flex gap-4 pt-4 text-slate-500">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors duration-200">
              <Linkedin className="w-4.5 h-4.5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors duration-200">
              <Twitter className="w-4.5 h-4.5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors duration-200">
              <Youtube className="w-4.5 h-4.5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors duration-200">
              <Github className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

      </div>

      {/* 3. Large Branding Title with scroll shine (Matching 'LangChain' outline style from Image) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 text-center select-none overflow-hidden relative">
        <motion.h1
          style={{
            backgroundImage: backgroundGradient,
            backgroundPositionX: pulseX,
            backgroundSize: '250% 100%',
          }}
          className="font-headline font-black text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[7.5rem] tracking-tighter leading-none text-transparent uppercase bg-clip-text [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] bg-no-repeat transition-all duration-75 block origin-center"
        >
          Gargeya Sharma
        </motion.h1>
      </div>

      {/* 4. Bottom Metadata Row */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span>All systems operational</span>
        </div>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/about" className="hover:text-white transition-colors duration-200">
            Terms of Service
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
