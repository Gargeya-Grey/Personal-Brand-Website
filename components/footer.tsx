'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { NewsletterSignup } from '@/components/newsletter-signup';

export function Footer() {
  const pathname = usePathname();
  const privatePage = ['/editorial', '/ledger', '/login'].some((path) => pathname.startsWith(path));
  if (privatePage)
    return (
      <footer className="workspace-footer">
        <span>Gargeya / Private workspace</span>
        <div>
          <Link href="/">Public site ↗</Link>
          <Link href="/editorial">Editorial</Link>
          <Link href="/ledger">Ledger</Link>
          {!pathname.startsWith('/login') && <a href="/api/auth/logout">Sign out</a>}
        </div>
      </footer>
    );
  return (
    <footer className="field-footer" id="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <h2>
              A note on <em>Sunday.</em>
            </h2>
            <p>
              One idea on learning, AI, and being human.
              <br />
              Delivered Sunday evening, your time.
            </p>
          </div>
          <div className="footer-signup">
            <NewsletterSignup source="footer" variant="light" />
            <Link href="/notes" className="field-text-link">
              Read a letter first <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="footer-directory">
          <div>
            <p className="field-label">Explore</p>
            <Link href="/about">About me</Link>
            <Link href="/playground">Playground</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/youtube">Videos</Link>
          </div>
          <div>
            <p className="field-label">Elsewhere</p>
            {[
              ['X / Twitter', siteConfig.links.twitter],
              ['GitHub', siteConfig.links.github],
              ['LinkedIn', siteConfig.links.linkedin],
              ['YouTube', siteConfig.links.youtube],
            ].map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer">
                {name} ↗
              </a>
            ))}
          </div>
          <div>
            <p className="field-label">Say hello</p>
            <Link href="/contact">Let’s make something ↗</Link>
            <a href={'mailto:' + siteConfig.email}>{siteConfig.email}</a>
            <a href={siteConfig.links.cv} target="_blank" rel="noopener noreferrer">
              The formal CV ↗
            </a>
          </div>
          <button
            type="button"
            className="back-top"
            aria-label="Back to top"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'auto'
                  : 'smooth',
              })
            }
          >
            <ArrowUp size={22} />
          </button>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          Gargeya<span>↗</span>
        </div>
        <div className="footer-colophon">
          <span>© {new Date().getFullYear()} Gargeya Sharma · Made with curiosity.</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/editorial" prefetch={false}>
              Editorial ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
