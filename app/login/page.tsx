import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { LoginPageClient } from './login-client';
import { requireAllowedSession, sanitizeRedirect } from '@/lib/auth';

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
  const callbackUrl = sanitizeRedirect(resolvedSearchParams.callbackUrl || '/editorial');

  // Already signed in → go straight to editorial / requested workspace
  const cookieStore = await cookies();
  const session = await requireAllowedSession(cookieStore.get('auth_session')?.value);
  if (session && !error) {
    redirect(callbackUrl);
  }

  const googleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="atelier-root min-h-screen relative flex flex-col justify-between antialiased">
      <div className="atelier-glow pointer-events-none absolute inset-0 z-0" aria-hidden />
      <Navigation />
      <main id="page-main" tabIndex={-1} className="relative z-10 pt-32 sm:pt-36 pb-20 flex-grow flex items-center justify-center px-4 sm:px-6">
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
