'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Twitter, Linkedin, Youtube, Github, ArrowUp, AlertCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const linkClass =
  'hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors duration-300 block w-max';

function AtelierFooter() {
  return (
    <footer
      className="w-full mt-16 sm:mt-24 border-t border-[var(--atelier-line)] bg-[color-mix(in_srgb,var(--atelier-paper)_55%,transparent)]"
      id="footer"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="font-headline text-sm font-bold text-[var(--atelier-ink)] tracking-tight">
            Private atelier
          </p>
          <p className="text-sm text-[var(--atelier-muted)] max-w-sm leading-relaxed">
            Editorial CMS & X To-Do — warm workspace chrome, separate from the public site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[var(--atelier-muted)]">
          <Link href="/" className="hover:text-[var(--atelier-gold)] transition-colors">
            Public site
          </Link>
          <Link href="/editorial" className="hover:text-[var(--atelier-gold)] transition-colors">
            Blog CMS
          </Link>
          <Link
            href="/editorial?workspace=x"
            className="hover:text-[var(--atelier-gold)] transition-colors"
          >
            X To-Do
          </Link>
          <Link
            href="/api/auth/logout"
            className="hover:text-[var(--atelier-ink)] transition-colors"
          >
            Sign out
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--atelier-line)]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex flex-wrap justify-between gap-3 text-xs text-[var(--atelier-faint)] font-mono">
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>
          <span className="text-[var(--atelier-gold)]/80">Google OAuth · private</span>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const pathname = usePathname();
  const isAtelier = pathname.startsWith('/editorial') || pathname.startsWith('/login');

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [statusHovered, setStatusHovered] = useState(false);
  const [latency, setLatency] = useState(12);

  const containerRef = useRef<HTMLElement>(null);

  if (isAtelier) {
    return <AtelierFooter />;
  }

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const x1 = useTransform(scrollYProgress, [0.7, 1.1], ['-100%', '100%']);
  const x2 = useTransform(scrollYProgress, [0.7, 1.1], ['0%', '200%']);

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
    setError('');
    setLogs(['> Validating address…']);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Subscription failed. Try again or email me directly.');
        setLogs([]);
        setSubscribing(false);
        return;
      }

      if (data.delivery === 'local') {
        setError(
          data.message ||
            'Saved only on this machine. Fix RESEND_API_KEY so contacts reach Resend.'
        );
        setLogs([]);
        setSubscribing(false);
        return;
      }

      setLogs((prev) => [...prev, '> Ledger updated.', `> Delivery: ${data.delivery || 'ok'}`]);
      setSubscribed(true);
      setEmail('');
    } catch {
      setError('Network error. Please try again shortly.');
      setLogs([]);
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer
      ref={containerRef}
      className="w-full bg-slate-950 text-slate-300 pt-24 pb-12 relative z-0 overflow-x-hidden mt-32 border-t border-slate-900"
      id="footer"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_75%,transparent_100%)] pointer-events-none -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(52,211,153,0.05),transparent_55%)]" />

      <span className="sr-only">{siteConfig.name}</span>

      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12">
        {/* Newsletter */}
        <div className="max-w-4xl mx-auto relative mb-20 md:mb-28">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08),transparent_70%)] blur-2xl" />
          <div className="bg-slate-900 border border-slate-800/80 hover:border-emerald-500/20 rounded-2xl p-6 md:p-8 lg:p-10 shadow-2xl relative transition-colors duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
              <div className="space-y-2 md:w-[40%] md:max-w-md">
                <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
                  Stay Updated
                </h3>
                <p className="font-body text-[14px] text-slate-400 leading-relaxed">
                  High-signal notes on AI evaluation, systems craft, and building Edudojo — no spam.
                </p>
              </div>

              <div className="w-full md:w-[55%] md:max-w-lg">
                <AnimatePresence mode="wait">
                  {!subscribed ? (
                    <motion.form
                      key="subscribe-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubscribe}
                      className="w-full space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label htmlFor="footer-email" className="sr-only">
                          Email for newsletter
                        </label>
                        <input
                          id="footer-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={subscribing}
                          placeholder="Your email"
                          required
                          autoComplete="email"
                          className="w-full sm:flex-1 min-w-0 h-14 text-sm font-body bg-slate-950 text-white placeholder-slate-400 border-2 border-slate-800 rounded-xl px-4 focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all duration-300 shadow-inner focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        />
                        <button
                          type="submit"
                          disabled={subscribing}
                          className="h-14 px-6 w-full sm:w-auto shrink-0 bg-white hover:bg-slate-50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] text-slate-950 font-headline font-bold text-sm rounded-xl uppercase tracking-wider border-2 border-transparent hover:border-emerald-400 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          {subscribing ? 'Subscribing…' : 'Subscribe'}
                        </button>
                      </div>
                      {error && (
                        <p role="alert" className="text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {error}
                        </p>
                      )}
                    </motion.form>
                  ) : (
                    <motion.div
                      key="subscribe-success"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400 space-y-1.5 shadow-inner"
                    >
                      <div className="flex justify-between items-center text-slate-500 border-b border-slate-900/40 pb-1 mb-2">
                        <span>TERMINAL STATUS</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      {logs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                      <div className="text-white font-bold pt-1">✓ You&apos;re on the list.</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-16 text-left">
          <div className="space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Projects
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <a
                  href={siteConfig.links.edudojo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Edudojo.ai
                </a>
              </li>
              <li>
                <Link href="/#projects" className={linkClass}>
                  Featured Work
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Open Source
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Content
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <Link href="/blog" className={linkClass}>
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/youtube" className={linkClass}>
                  YouTube
                </Link>
              </li>
              <li>
                <Link href="/community" className={linkClass}>
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Connect
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <Link href="/about" className={linkClass}>
                  About Gargeya
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="font-label text-xs uppercase tracking-widest font-bold text-slate-200">
              Presence
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} flex items-center gap-3`}
                >
                  <Linkedin width={20} height={20} className="text-slate-400" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} flex items-center gap-3`}
                >
                  <Twitter width={20} height={20} className="text-slate-400" />
                  <span>X / Twitter</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} flex items-center gap-3`}
                >
                  <Youtube width={20} height={20} className="text-slate-400" />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} flex items-center gap-3`}
                >
                  <Github width={20} height={20} className="text-slate-400" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6 text-sm font-mono text-slate-400">
          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer group w-max"
              onMouseEnter={() => setStatusHovered(true)}
              onMouseLeave={() => setStatusHovered(false)}
              onFocus={() => setStatusHovered(true)}
              onBlur={() => setStatusHovered(false)}
              aria-describedby="telemetry-panel"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="text-[13px] md:text-sm text-slate-400 group-hover:text-white transition-colors duration-300">
                All systems operational
              </span>
            </button>

            <AnimatePresence>
              {statusHovered && (
                <motion.div
                  id="telemetry-panel"
                  role="tooltip"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute bottom-7 left-0 w-60 bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-lg z-50 pointer-events-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Edge status
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-300 font-mono">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="text-right text-emerald-500 font-bold">99.9%</span>
                      <span className="text-slate-400">Latency:</span>
                      <span className="text-right text-white font-bold">{latency}ms</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap justify-center gap-6 items-center text-slate-400 font-ui text-sm">
            <Link
              href="/privacy"
              className="hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-sm transition-colors"
            >
              Terms
            </Link>
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
          </div>

          <motion.button
            type="button"
            onClick={scrollToTop}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all duration-300 cursor-pointer"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 w-full flex justify-center py-10 md:py-16 overflow-hidden">
        <svg
          className="w-full h-auto select-none max-w-7xl mx-auto px-6"
          viewBox="0 0 1000 240"
          aria-hidden="true"
        >
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
