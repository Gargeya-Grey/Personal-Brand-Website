'use client';

import { Terminal, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-provider';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linksList = [
    { name: 'Startup', path: 'https://edudojo.ai', external: true },
    { name: 'Community', path: '/community' },
    { name: 'Blog', path: '/blog' },
    { name: 'YouTube', path: '/youtube' },
    { name: 'About', path: '/about' }
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] rounded-full px-4 py-3 w-full max-w-5xl transition-all duration-500">
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="w-8 h-8 bg-white/80 dark:bg-white/10 rounded-full flex items-center justify-center border border-white/80 dark:border-white/20 shadow-sm group-hover:scale-105 transition-all duration-300">
            <Terminal className="w-4 h-4 text-accent" strokeWidth={2.5} />
          </div>
          <span className="font-headline text-lg font-extrabold tracking-[-0.04em] text-primary group-hover:text-accent transition-colors duration-300">
            GS.
          </span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-white/[0.01] p-1.5 rounded-full border border-white/50 dark:border-white/10 shadow-inner">
          {linksList.map((link) => {
            const isActive = !link.external && (pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path)));
            return (
              <Link 
                key={link.name} 
                href={link.path} 
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`px-5 py-2 rounded-full font-medium font-headline text-sm tracking-tight transition-all duration-300 border ${
                  isActive 
                    ? 'bg-accent/10 text-accent border-accent/20 shadow-sm backdrop-blur-md' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/70 dark:hover:bg-white/10 hover:backdrop-blur-md hover:shadow-sm hover:border-white/80 dark:hover:border-white/20 border-transparent'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link 
            href="/contact" 
            className="hidden sm:inline-block bg-accent text-slate-950 px-6 py-2.5 rounded-full font-headline font-bold text-sm tracking-tight hover:bg-accent/90 hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-95 transition-all shadow-md border border-accent/20 text-center"
          >
            Contact
          </Link>
          
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden pointer-events-auto flex items-center justify-center w-9 h-9 rounded-full border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/15 text-slate-700 dark:text-white/80 hover:text-accent focus:outline-none shadow-sm transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-4 shadow-xl z-40 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto md:hidden">
          <div className="flex flex-col gap-2">
            {linksList.map((link) => {
              const isActive = !link.external && (pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path)));
              return (
                <Link 
                  key={link.name} 
                  href={link.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={`px-4 py-3 rounded-2xl font-semibold font-headline text-sm tracking-tight transition-all border ${
                    isActive 
                      ? 'bg-accent/10 text-accent border-accent/20' 
                      : 'text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link 
              href="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 bg-accent text-slate-950 w-full py-3 rounded-2xl font-headline font-bold text-sm tracking-tight text-center"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
