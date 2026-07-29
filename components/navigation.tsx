'use client';

import { Menu, X, BookOpen, AtSign } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef, type ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { ThemeToggle } from '@/components/theme-provider';
import { siteConfig } from '@/lib/site-config';

type NavLink = {
  name: string;
  path: string;
  external?: boolean;
  key: string;
  icon?: ReactNode;
  shortName?: string;
};

function NavigationBar({ workspaceParam }: { workspaceParam: string | null }) {
  const pathname = usePathname();
  const isAtelier = pathname.startsWith('/editorial') || pathname.startsWith('/login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /** Optional full-bleed dark hero — only active when #home-hero exists */
  const [overDarkHero, setOverDarkHero] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const linksList: NavLink[] = isAtelier
    ? [
        {
          name: 'Blog CMS',
          shortName: 'Blog',
          path: '/editorial',
          key: 'blog',
          icon: <BookOpen className="h-3.5 w-3.5" strokeWidth={2.25} />,
        },
        {
          name: 'X To-Do',
          shortName: 'X',
          path: '/editorial?workspace=x',
          key: 'x',
          icon: <AtSign className="h-3.5 w-3.5" strokeWidth={2.25} />,
        },
        { name: 'Public site', shortName: 'Public', path: '/', key: 'public' },
      ]
    : [
        { name: 'Startup', path: siteConfig.links.edudojo, external: true, key: 'startup' },
        { name: 'Community', path: '/community', key: 'community' },
        { name: 'Blog', path: '/blog', key: 'blog' },
        { name: 'YouTube', path: '/youtube', key: 'youtube' },
        { name: 'About', path: '/about', key: 'about' },
        { name: 'CV', path: siteConfig.links.cv, external: true, key: 'cv' },
      ];

  useEffect(() => {
    if (isAtelier || pathname !== '/') {
      setOverDarkHero(false);
      return;
    }

    const hero = document.getElementById('home-hero');
    if (!hero) {
      setOverDarkHero(false);
      return;
    }

    const update = () => {
      const { bottom } = hero.getBoundingClientRect();
      setOverDarkHero(bottom > 96);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname, isAtelier]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && menuRef.current) {
        const focusable = Array.from(
          menuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const forceDarkNav = !isAtelier && overDarkHero;

  // Glass chrome — dark while over the wave hero, then theme-aware
  const navShell = isAtelier
    ? 'border-[var(--atelier-line)] bg-[var(--atelier-card)]/90 shadow-[var(--atelier-shadow-sm)] backdrop-blur-xl'
    : forceDarkNav
      ? 'border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_2px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl'
      : 'border-white/60 bg-white/65 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_2px_1px_rgba(255,255,255,0.15)]';

  const logoText = isAtelier
    ? 'text-[var(--atelier-ink)] group-hover:text-[var(--atelier-gold)]'
    : forceDarkNav
      ? 'text-white group-hover:text-accent'
      : 'text-primary group-hover:text-accent';

  const linkRail = isAtelier
    ? 'border-[var(--atelier-line)] bg-[var(--atelier-paper)]/70'
    : forceDarkNav
      ? 'border-white/10 bg-white/[0.01] shadow-inner'
      : 'border-white/50 bg-white/50 shadow-inner dark:border-white/10 dark:bg-white/[0.01]';

  const mobilePanel = isAtelier
    ? 'border-[var(--atelier-line)] bg-[var(--atelier-card)]/98 shadow-[var(--atelier-shadow)]'
    : forceDarkNav
      ? 'border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-xl'
      : 'border-white/60 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95';

  const mobileBtn = isAtelier
    ? 'border-[var(--atelier-line)] bg-[var(--atelier-card)] text-[var(--atelier-ink)] hover:text-[var(--atelier-gold)]'
    : forceDarkNav
      ? 'border-white/10 bg-white/15 text-white/80'
      : 'border-white/60 bg-white/80 text-slate-700 shadow-sm hover:text-accent dark:border-white/10 dark:bg-white/15 dark:text-white/80';

  const publicLinkIdle = forceDarkNav
    ? 'border-transparent text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
    : 'border-transparent text-on-surface-variant hover:border-white/80 hover:bg-white/70 hover:text-primary hover:shadow-sm dark:hover:border-white/20 dark:hover:bg-white/10';

  const publicMobileIdle = forceDarkNav
    ? 'border-transparent text-white/70 hover:bg-white/5'
    : 'border-transparent text-slate-600 hover:bg-slate-50 dark:text-white/70 dark:hover:bg-white/5';

  const onX = workspaceParam === 'x' || workspaceParam === 'todo' || workspaceParam === 'x-todo';

  const isLinkActive = (link: NavLink) => {
    if (isAtelier) {
      if (link.key === 'x') return pathname.startsWith('/editorial') && onX;
      if (link.key === 'blog') return pathname.startsWith('/editorial') && !onX;
      return pathname === link.path;
    }
    return (
      !link.external &&
      (pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path)))
    );
  };

  const atelierActive =
    'border-transparent bg-[var(--atelier-ink)] text-[var(--atelier-card)] shadow-md';
  const atelierIdle =
    'border-transparent text-[var(--atelier-faint)] hover:bg-[var(--atelier-paper)] hover:text-[var(--atelier-ink)]';

  return (
    <div
      className={`safe-nav-inset pointer-events-none fixed right-0 left-0 z-50 flex flex-col items-center ${
        isAtelier ? 'atelier-chrome' : ''
      }`}
    >
      <nav
        className={`pointer-events-auto isolate flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border px-3 py-2.5 transition-[background-color,border-color,box-shadow,color] duration-300 sm:px-4 sm:py-3 ${navShell}`}
        aria-label="Primary"
      >
        <Link
          href={isAtelier ? '/editorial' : '/'}
          className="group flex shrink-0 items-center gap-2 px-1 sm:gap-3 sm:px-2"
        >
          <BrandMark
            size={32}
            priority
            variant={isAtelier ? 'onLight' : 'auto'}
            onDarkChrome={forceDarkNav}
            className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`font-headline text-base font-extrabold tracking-[-0.04em] transition-colors duration-300 sm:text-lg ${
              isAtelier ? 'hidden min-[380px]:inline' : ''
            } ${logoText}`}
          >
            {isAtelier ? 'Atelier' : siteConfig.shortName}
          </span>
        </Link>

        {/* Desktop / tablet link rail */}
        <div
          className={`hidden min-w-0 items-center gap-0.5 rounded-full border p-1 shadow-inner ${
            isAtelier ? 'sm:flex' : 'md:flex'
          } ${linkRail}`}
        >
          {linksList.map((link) => {
            const isActive = isLinkActive(link);

            return (
              <Link
                key={link.key || link.name}
                href={link.path}
                scroll={!isAtelier}
                prefetch={isAtelier ? false : undefined}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-headline text-sm font-semibold tracking-tight transition-all duration-300 md:px-5 ${
                  isAtelier
                    ? isActive
                      ? atelierActive
                      : atelierIdle
                    : isActive
                      ? 'border-accent/20 bg-accent/10 text-accent shadow-sm'
                      : publicLinkIdle
                }`}
              >
                {link.icon}
                <span className="md:hidden">{link.shortName ?? link.name}</span>
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Phone: compact Blog / X switcher (atelier only) */}
        {isAtelier && (
          <div
            className={`flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full border p-1 shadow-inner sm:hidden ${linkRail}`}
            role="navigation"
            aria-label="Workspace"
          >
            {linksList
              .filter((link) => link.key === 'blog' || link.key === 'x')
              .map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <Link
                    key={link.key}
                    href={link.path}
                    scroll={false}
                    prefetch={false}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 font-headline text-sm font-semibold tracking-tight transition-all duration-300 ${
                      isActive ? atelierActive : atelierIdle
                    }`}
                  >
                    {link.icon}
                    {link.shortName ?? link.name}
                  </Link>
                );
              })}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <ThemeToggle inverted={forceDarkNav} />
          {!isAtelier && (
            <Link
              href="/contact"
              className={
                forceDarkNav
                  ? 'hidden rounded-full border border-white/80 bg-white px-6 py-2.5 text-center font-headline text-sm font-semibold tracking-tight text-slate-950 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] transition-all hover:bg-white/90 active:scale-95 lg:inline-block'
                  : 'hidden rounded-full border border-accent/20 bg-accent px-6 py-2.5 text-center font-headline text-sm font-bold tracking-tight text-slate-950 shadow-md transition-all hover:bg-accent/90 hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-95 lg:inline-block'
              }
            >
              Contact
            </Link>
          )}
          {isAtelier && (
            <Link
              href="/api/auth/logout"
              className="hidden items-center rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/80 px-4 py-2 font-headline text-sm font-semibold text-[var(--atelier-muted)] transition-colors hover:text-[var(--atelier-ink)] md:inline-flex"
            >
              Sign out
            </Link>
          )}

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--atelier-gold)] ${
              isAtelier ? 'sm:hidden' : 'md:hidden'
            } ${mobileBtn}`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className={`pointer-events-auto fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[2px] ${
              isAtelier ? 'sm:hidden' : 'md:hidden'
            }`}
            onClick={() => {
              setMobileMenuOpen(false);
              buttonRef.current?.focus();
            }}
            aria-label="Close navigation menu"
            tabIndex={-1}
          />
          <div
            id="mobile-nav-panel"
            ref={menuRef}
            className={`pointer-events-auto absolute top-20 right-3 left-3 z-40 animate-in rounded-3xl border p-4 duration-200 fade-in slide-in-from-top-4 sm:right-4 sm:left-4 ${
              isAtelier ? 'sm:hidden' : 'md:hidden'
            } ${mobilePanel}`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
          <div className="flex flex-col gap-2">
            {linksList.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  scroll={!isAtelier}
                  prefetch={isAtelier ? false : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-headline text-sm font-semibold tracking-tight transition-all ${
                    isAtelier
                      ? isActive
                        ? atelierActive
                        : 'border-transparent text-[var(--atelier-ink)] hover:bg-[var(--atelier-paper)]'
                      : isActive
                        ? 'border-accent/20 bg-accent/10 text-accent'
                        : publicMobileIdle
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
            {isAtelier ? (
              <Link
                href="/api/auth/logout"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full rounded-2xl border border-[var(--atelier-line)] py-3 text-center font-headline text-sm font-bold text-[var(--atelier-muted)]"
              >
                Sign out
              </Link>
            ) : (
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={
                  forceDarkNav
                    ? 'mt-2 w-full rounded-2xl border border-white/80 bg-white py-3 text-center font-headline text-sm font-semibold tracking-tight text-slate-950'
                    : 'btn-accent mt-2 w-full rounded-2xl py-3 text-center font-headline text-sm font-bold tracking-tight'
                }
              >
                Contact
              </Link>
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavigationWithParams() {
  const searchParams = useSearchParams();
  return <NavigationBar workspaceParam={searchParams.get('workspace')} />;
}

export function Navigation() {
  return (
    <Suspense fallback={<NavigationBar workspaceParam={null} />}>
      <NavigationWithParams />
    </Suspense>
  );
}
