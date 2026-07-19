import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How this personal site handles contact and analytics data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-32 px-6 md:px-12 max-w-3xl mx-auto w-full pb-24">
        <h1 className="font-headline text-4xl font-extrabold text-primary mb-8 tracking-tight">
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
