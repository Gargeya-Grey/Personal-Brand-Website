import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAllowedSession } from '@/lib/auth';
import { publicLedgerSettings } from '@/lib/ledger-settings';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { LedgerClient } from '@/components/ledger/ledger-client';

export const metadata: Metadata = {
  title: 'Finance Ledger',
  robots: { index: false, follow: false },
};

export default async function LedgerPage() {
  const cookieStore = await cookies();
  const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
  if (!user) {
    redirect('/login?callbackUrl=/ledger');
  }

  const settings = await publicLedgerSettings(user.email);

  return (
    <div className="atelier-root min-h-screen relative flex flex-col justify-between antialiased">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="relative z-10 flex-grow pt-24 sm:pt-28 pb-16">
        <LedgerClient user={user} initialSettings={settings} />
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = 'force-dynamic';
