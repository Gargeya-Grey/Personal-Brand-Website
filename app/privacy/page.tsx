import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How sgargeya.com handles contact form data, analytics, and privacy for Gargeya Sharma’s personal site.',
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
            If you use the contact form or Notes signup, we collect the details you submit
            (name, email, message content, and for Notes an IANA timezone from your browser)
            solely to respond or send the weekly letter. We do not sell personal data.
            You can unsubscribe from any letter.
          </p>
          <h2 className="text-xl font-headline font-bold text-primary pt-4">Notes read time</h2>
          <p>
            The public archive at /notes records how long a tab stays visible, using a random
            session id in your browser. It is not tied to your email. This is how we measure
            whether a letter was actually read.
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
          <p className="text-sm opacity-70 pt-8">Last updated: August 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
