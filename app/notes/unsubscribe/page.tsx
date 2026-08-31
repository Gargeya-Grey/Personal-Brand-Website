import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { UnsubscribeClient } from './unsubscribe-client';
import { verifyUnsubscribeToken } from '@/lib/newsletter-unsubscribe';

export const metadata: Metadata = {
  title: 'Unsubscribe from Notes',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const params = await searchParams;
  const email = String(params.email || '').trim().toLowerCase();
  const token = String(params.token || '').trim();
  const valid = Boolean(email && token && verifyUnsubscribeToken(email, token));

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main
        id="page-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-xl flex-grow px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32"
      >
        <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">Notes</p>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.02em] text-primary sm:text-4xl">
          Unsubscribe
        </h1>
        <div className="mt-8 rounded-[2rem] border border-slate-200/60 bg-white/75 p-6 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/65">
          {valid ? (
            <UnsubscribeClient email={email} token={token} />
          ) : (
            <p className="font-body leading-relaxed text-on-surface-variant">
              This unsubscribe link is missing or expired. Use the link from a Notes email, or write to me and I will take you off the list.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
