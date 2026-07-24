import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How this personal site handles contact and analytics data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-grow px-4 pb-20 pt-32 sm:px-6 sm:pb-24 md:px-10">
        <h1 className="mb-8 font-display text-3xl font-medium tracking-[-0.02em] text-primary sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-on-surface-variant font-body leading-relaxed">
          <p>
            This site ({siteConfig.url}) is operated by {siteConfig.name}. It is a personal brand
            and editorial property.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Information you provide</h2>
          <p>
            If you use the contact form or newsletter signup, we collect the details you submit
            (name, email, message content) solely to respond or send occasional high-signal updates.
            We do not sell personal data.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Technical data</h2>
          <p>
            Standard server logs and hosting provider telemetry may include IP address, user agent,
            and request paths for security and reliability.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Contact</h2>
          <p>
            Questions:{' '}
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
