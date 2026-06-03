import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { LoginPageClient } from './login-client';

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

  // Check if Google OAuth Client Credentials are configured
  const googleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET
  );

  // Detect if running in local development mode
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen bg-surface text-primary antialiased relative selection:bg-[#D4FF00] selection:text-black flex flex-col justify-between">
      {/* Decorative Blueprint Light-Grid and Radial Lighting Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-outline-variant)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <main className="relative z-10 pt-36 flex-grow flex items-center justify-center px-6">
        <LoginPageClient 
          googleConfigured={googleConfigured} 
          isDev={isDev} 
          error={error} 
          email={email} 
          callbackUrl={callbackUrl} 
        />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
