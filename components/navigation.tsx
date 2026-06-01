'use client';

import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full px-4 py-3 w-full max-w-5xl transition-all duration-500">
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center border border-white/80 shadow-sm group-hover:scale-105 transition-all duration-300">
            <Terminal className="w-4 h-4 text-accent" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-[-0.04em] text-primary font-headline group-hover:text-accent transition-colors duration-300">
            GS.
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1 bg-white/30 p-1.5 rounded-full border border-white/50 shadow-inner">
          {[
            { name: 'Startup', path: 'https://edudojo.ai', external: true },
            { name: 'Community', path: '/community' },
            { name: 'Blog', path: '/blog' },
            { name: 'YouTube', path: '/youtube' },
            { name: 'About', path: '/about' }
          ].map((link) => {
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
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/70 hover:backdrop-blur-md hover:shadow-sm hover:border-white/80 border-transparent'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/contact" 
            className="bg-primary/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-headline font-bold text-sm tracking-tight hover:bg-primary hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-95 transition-all shadow-md border border-primary/20 inline-block text-center"
          >
            Contact
          </Link>
        </div>
      </nav>
    </div>
  );
}
