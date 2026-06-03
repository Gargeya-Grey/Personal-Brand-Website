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
  callbackUrl 
}: LoginPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Redirect to login api handler
    window.location.href = `/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  const handleMockLogin = async () => {
    setMockLoading(true);
    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
      });
      if (response.ok) {
        // Redirect to callbackUrl
        router.push(callbackUrl);
        router.refresh();
      } else {
        alert('Failed to sign in with developer credentials');
        setMockLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred during mock login');
      setMockLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="liquid-glass border border-accent/20 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] relative overflow-hidden backdrop-blur-2xl">
        {/* Glow overlay */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-8 relative z-10">
          {/* Header Identity */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-[#10B981]">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Secured Console
            </h1>
            <p className="font-body text-sm text-slate-500 dark:text-white/60">
              Access is restricted to authorized credentials.
            </p>
          </div>

          {/* Access Denied / Error Panels */}
          {error && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-xs space-y-2">
              <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 font-headline font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Authentication Error</span>
              </div>
              <p className="text-slate-600 dark:text-white/70 leading-relaxed font-body">
                {error === 'AccessDenied' 
                  ? `Access is denied for email "${email}". This console is restricted only to Gargeya Sharma.`
                  : 'An error occurred during authentication. Please check your credentials and try again.'}
              </p>
            </div>
          )}

          {/* Primary Action Button: Google Sign In */}
          <div className="space-y-4">
            {googleConfigured ? (
              <button
                onClick={handleGoogleLogin}
                disabled={loading || mockLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-headline font-bold text-sm h-12 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-3 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-xs space-y-2">
                <div className="flex items-start gap-2.5 text-yellow-600 dark:text-yellow-400 font-headline font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>OAuth Keys Missing</span>
                </div>
                <p className="text-slate-600 dark:text-white/70 leading-relaxed font-body">
                  Google Client credentials are not defined in `.env` environment variables. Complete the Google Cloud Console setup to enable OAuth.
                </p>
              </div>
            )}

            {/* Development Mock Bypass (Strictly blocked in production) */}
            {!googleConfigured && isDev && (
              <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 space-y-4">
                <div className="text-center">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5">
                    DEVELOPMENT BYPASS ACTIVE
                  </span>
                </div>
                <button
                  onClick={handleMockLogin}
                  disabled={mockLoading || loading}
                  className="w-full bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 text-slate-800 dark:text-white font-headline font-bold text-sm h-12 rounded-xl transition-all active:scale-98 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {mockLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Use Mock Developer Login</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
