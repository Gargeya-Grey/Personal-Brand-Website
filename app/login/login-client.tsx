'use client';

import { useState } from 'react';
import * as motion from 'motion/react-client';
import { useReducedMotion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
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
  const reduceMotion = useReducedMotion();

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
    <div className="atelier-page">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-[26rem]"
      >
        <div className="atelier-meta">
          <span>Private</span>
          <span>Atelier</span>
        </div>

        <h1 className="mt-5 mb-0 max-w-[14ch] text-balance font-medium leading-[1.04] tracking-[-0.04em] [font-size:clamp(2.4rem,7vw,3.25rem)]">
          Sign in. <em>Private editorial console.</em>
        </h1>
        <p className="atelier-lead mt-5!">Authorized curators only.</p>

        <div className="mt-10 grid gap-3">
          {error && (
            <div className="atelier-notice" data-tone="warn" role="alert">
              <div>
                <strong className="font-semibold">Access denied</strong>
                <p className="m-0 mt-0.5 break-words">
                  {error === 'unauthorized'
                    ? email
                      ? `${email} is not on the allowlist.`
                      : 'Your account is not authorized.'
                    : error}
                </p>
              </div>
            </div>
          )}

          {googleConfigured ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="atelier-btn atelier-btn-primary w-full h-11!"
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
            <p className="atelier-notice m-0">Google OAuth is not configured for this environment.</p>
          )}

          {isDev && (
            <button
              type="button"
              onClick={handleMockLogin}
              disabled={mockLoading}
              className="atelier-btn atelier-btn-line w-full h-11!"
            >
              {mockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dev mock login'}
            </button>
          )}
        </div>

        <p className="mt-12 mb-0 border-t border-[var(--rule)] pt-5 text-sm leading-relaxed text-[var(--ink-2)]">
          One console for the blog, Notes, X To-Do and the finance ledger.
        </p>
      </motion.div>
    </div>
  );
}
