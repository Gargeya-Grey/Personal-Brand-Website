'use client';

import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Shield, Sparkles, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginPageClientProps {
  googleConfigured: boolean;
  isDev: boolean;
  error: string | null;
  email: string | null;
  callbackUrl: string;
}

export function LoginPageClient({
  googleConfigured,
  isDev,
  error,
  email,
  callbackUrl,
}: LoginPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = `/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  const handleMockLogin = async () => {
    setMockLoading(true);
    try {
      const response = await fetch('/api/auth/mock-login', { method: 'POST' });
      if (response.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        alert('Failed to sign in with developer credentials');
        setMockLoading(false);
      }
    } catch {
      alert('Network error during mock login');
      setMockLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="atelier-card-lg p-8 sm:p-10 relative overflow-hidden">
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full opacity-50 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--atelier-gold-soft), transparent 70%)' }}
        />
        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-[1.25rem] bg-[var(--atelier-gold-soft)] border border-[var(--atelier-gold)]/25 flex items-center justify-center text-[var(--atelier-gold)]">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--atelier-gold)]">
              Atelier access
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--atelier-ink)]">
              Sign in
            </h1>
            <p className="text-sm text-[var(--atelier-muted)] leading-relaxed max-w-xs mx-auto">
              Private editorial console — authorized curators only.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 flex gap-3 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Access denied</p>
                <p className="mt-0.5 opacity-90">
                  {error === 'unauthorized'
                    ? email
                      ? `${email} is not on the allowlist.`
                      : 'Your account is not authorized.'
                    : error}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {googleConfigured ? (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="atelier-btn atelier-btn-primary w-full h-12 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue with Google <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <p className="text-center text-sm text-[var(--atelier-muted)]">
                Google OAuth is not configured for this environment.
              </p>
            )}

            {isDev && (
              <button
                type="button"
                onClick={handleMockLogin}
                disabled={mockLoading}
                className="atelier-btn atelier-btn-ghost w-full h-12 disabled:opacity-50"
              >
                {mockLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[var(--atelier-gold)]" />
                    Dev mock login
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
