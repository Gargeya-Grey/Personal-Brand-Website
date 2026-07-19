import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using this personal brand website.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-grow px-4 pb-20 pt-32 sm:px-6 sm:pb-24 md:px-10">
        <h1 className="mb-8 font-headline text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Terms of Service
        </h1>
        <div className="space-y-6 text-on-surface-variant font-body leading-relaxed">
          <p>
            Content on this site is provided for informational and educational purposes by{' '}
            {siteConfig.name}. Product offerings (including Edudojo.ai) are governed by their own
            terms where applicable.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Intellectual property</h2>
          <p>
            Articles, design, and branding are owned by {siteConfig.name} unless otherwise noted.
            You may link to public pages; please do not scrape or republish full essays without
            permission.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Disclaimer</h2>
          <p>
            Opinions are personal. Technical content may become outdated. No warranty is implied for
            fitness of advice to your production systems.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Contact</h2>
          <p>
            <a className="text-accent font-semibold hover:underline" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </p>
          <p className="text-sm opacity-70 pt-8">Last updated: July 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
