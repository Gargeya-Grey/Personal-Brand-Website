'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Twitter, Linkedin, Youtube, Github, ArrowUp, AlertCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { BrandMark } from '@/components/brand-mark';

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

function PublicFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const x1 = useTransform(scrollYProgress, [0.7, 1.1], ['-100%', '100%']);
  const x2 = useTransform(scrollYProgress, [0.7, 1.1], ['0%', '200%']);

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
      className="relative z-0 mt-20 w-full overflow-x-hidden border-t border-slate-900 bg-slate-950 pb-8 pt-16 text-slate-300 sm:mt-28 sm:pb-10 sm:pt-20 lg:mt-32 lg:pb-12 lg:pt-24"
      id="footer"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(52,211,153,0.06),transparent_60%)]"
        aria-hidden="true"
      />

      <span className="sr-only">{siteConfig.name}</span>

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12">
        {/* Newsletter — same width as columns (was max-w-4xl, looked inset) */}
        <div className="mb-16 border-b border-white/[0.06] pb-14 md:mb-20 md:pb-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-md space-y-3">
              <h3 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Stay updated
              </h3>
              <p className="font-display text-2xl font-light tracking-[-0.02em] text-white sm:text-3xl">
                Notes worth opening.
              </p>
              <p className="font-body text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                High-signal writing on AI evaluation, craft, and building Edudojo — no spam.
              </p>
            </div>

            <div className="w-full max-w-md lg:max-w-lg">
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
                    <div className="flex flex-col gap-3 sm:flex-row">
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
                        className="h-12 w-full min-w-0 rounded-full border border-white/10 bg-white/[0.03] px-5 font-body text-sm text-white placeholder-slate-500 transition-colors focus:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 sm:flex-1"
                      />
                      <button
                        type="submit"
                        disabled={subscribing}
                        className="h-12 w-full shrink-0 cursor-pointer rounded-full bg-white px-6 font-headline text-sm font-bold tracking-tight text-slate-950 transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {subscribing ? 'Subscribing…' : 'Subscribe'}
                      </button>
                    </div>
                    {error && (
                      <p role="alert" className="flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                      </p>
                    )}
                  </motion.form>
                ) : (
                  <motion.div
                    key="subscribe-success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-emerald-400"
                  >
                    <div className="mb-2 flex items-center justify-between border-b border-white/5 pb-2 text-slate-500">
                      <span>STATUS</span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    </div>
                    {logs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                    <div className="pt-2 font-bold text-white">✓ You&apos;re on the list.</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-10 pb-14 text-left sm:grid-cols-2 md:grid-cols-4 md:gap-8 md:pb-16">
          <div className="space-y-4">
            <h3 className="font-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
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

          <div className="space-y-4">
            <h3 className="font-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
              Content
            </h3>
            <ul className="space-y-3 font-ui text-[15px] font-normal tracking-wide text-slate-400">
              <li>
                <Link href="/blog" className={linkClass}>
                  Blog
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

          <div className="space-y-4">
            <h3 className="font-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
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

          <div className="space-y-4">
            <h3 className="font-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
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

        {/* Bottom bar — equal columns so legal stays truly centered */}
        <div className="grid grid-cols-1 items-center gap-6 border-t border-slate-800/80 pt-8 text-sm text-slate-400 sm:grid-cols-3">
          <div className="relative flex items-center justify-center sm:justify-start">
            <button
              type="button"
              className="group flex w-max cursor-pointer items-center gap-2 font-mono"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
              <span className="text-[13px] text-slate-400 transition-colors duration-300 group-hover:text-white md:text-sm">
                Site online
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-ui text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <BrandMark size={28} onDarkChrome className="h-7 w-7" />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
            <Link
              href="/privacy"
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Terms
            </Link>
            <span className="font-mono">
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
          </div>

          <div className="flex justify-center sm:justify-end">
            <motion.button
              type="button"
              onClick={scrollToTop}
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 shadow-sm transition-all duration-300 hover:border-emerald-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Scroll to top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Wordmark — same content width as columns / bottom bar */}
        <div className="relative z-10 overflow-hidden pt-10 md:pt-14">
          <svg
            className="mx-auto h-auto w-full select-none"
            viewBox="0 0 1000 280"
            aria-hidden="true"
          >
            <defs>
              {/*
                Filled script + gradient shine wash (not stroked outlines).
                Hollow stroke on Monte Carlo splits glyph contours into
                double-lines with visible breaks — fill keeps connectors whole.
              */}
              <motion.linearGradient id="wordmark-shine" x1={x1} y1="0%" x2={x2} y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="42%" stopColor="#1e293b" />
                <stop offset="47%" stopColor="#475569" />
                <stop offset="49.5%" stopColor="#99f6e4" />
                <stop offset="50%" stopColor="#5eead4" />
                <stop offset="50.5%" stopColor="#99f6e4" />
                <stop offset="53%" stopColor="#475569" />
                <stop offset="58%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#1e293b" />
              </motion.linearGradient>
            </defs>
            {/* Base — readable without the flare */}
            <text
              x="50%"
              y="58%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#334155"
              fontSize="210"
              letterSpacing="-0.02em"
              className="font-wordmark"
              style={{
                opacity: 0.85,
                fontFeatureSettings: '"calt" 1, "liga" 1',
                fontVariantLigatures: 'common-ligatures contextual',
              }}
            >
              Gargeya
            </text>
            {/* Shine wash across solid letterforms */}
            <text
              x="50%"
              y="58%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="url(#wordmark-shine)"
              fontSize="210"
              letterSpacing="-0.02em"
              className="font-wordmark"
              style={{
                opacity: 0.95,
                fontFeatureSettings: '"calt" 1, "liga" 1',
                fontVariantLigatures: 'common-ligatures contextual',
              }}
            >
              Gargeya
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const pathname = usePathname();
  const isAtelier = pathname.startsWith('/editorial') || pathname.startsWith('/login');

  return isAtelier ? <AtelierFooter /> : <PublicFooter />;
}
