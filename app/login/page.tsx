import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { LoginPageClient } from './login-client';

export const metadata: Metadata = {
  title: 'Editorial Sign-in',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    email?: string;
    callbackUrl?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error || null;
  const email = resolvedSearchParams.email || null;
  const callbackUrl = resolvedSearchParams.callbackUrl || '/editorial';

  const googleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="atelier-root min-h-screen relative flex flex-col justify-between antialiased">
      <div className="atelier-glow pointer-events-none absolute inset-0 z-0" aria-hidden />
      <Navigation />
      <main className="relative z-10 pt-32 sm:pt-36 pb-20 flex-grow flex items-center justify-center px-6">
        <LoginPageClient
          googleConfigured={googleConfigured}
          isDev={isDev}
          error={error}
          email={email}
          callbackUrl={callbackUrl}
        />
      </main>
      <Footer />
    </div>
  );
}
