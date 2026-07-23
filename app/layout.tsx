import type { Metadata, Viewport } from 'next';
import { Manrope, MonteCarlo } from 'next/font/google';
import Script from 'next/script';
import '@fontsource/stack-sans-notch/300.css';
import '@fontsource/stack-sans-notch/500.css';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { InteractiveBackgroundLazy } from '@/components/interactive-background-lazy';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const themeInitScript = `
try {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
} catch (_) {}
`;

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

/** Footer wordmark — formal script with stroked outline + shoulder shine */
const monteCarlo = MonteCarlo({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-wordmark',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://gargeyasharma.com'),
  title: {
    template: '%s | Gargeya Sharma',
    default: 'Gargeya Sharma | The Engineering Editorial',
  },
  description:
    'Architecting intelligence for evaluation & education. Founder @ Edudojo.ai — Lead Architect, engineer, and mentor building with soft minimalism.',
  keywords: [
    'Gargeya Sharma',
    'Edudojo',
    'AI Education',
    'Lead Architect',
    'Systems Architecture',
    'Soft Minimalism',
    'Founder',
  ],
  authors: [{ name: 'Gargeya Sharma' }],
  creator: 'Gargeya Sharma',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gargeyasharma.com',
    title: 'Gargeya Sharma | The Engineering Editorial',
    description:
      'Architecting intelligence for evaluation & education. Founder @ Edudojo.ai.',
    siteName: 'Gargeya Sharma',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gargeya Sharma | The Engineering Editorial',
    description:
      'Architecting intelligence for evaluation & education. Founder @ Edudojo.ai.',
    creator: '@GargeyaS',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7faf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${monteCarlo.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased selection:bg-accent/30 relative min-h-screen" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <a
            href="#page-main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-[max(1rem,env(safe-area-inset-top))] focus:left-[max(1rem,env(safe-area-inset-left))] focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-accent focus:text-slate-950 focus:font-headline focus:font-bold focus:text-sm"
          >
            Skip to content
          </a>
          {/* Layered atmosphere: CSS mesh + grain + interactive canvas */}
          <div className="site-atmosphere" aria-hidden="true" />
          <InteractiveBackgroundLazy />
          <div className="site-grain" aria-hidden="true" />
          <div className="relative z-0">{children}</div>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

