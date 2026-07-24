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
import { getSiteOrigin, siteConfig } from '@/lib/site-config';
import { getSiteJsonLdGraph } from '@/lib/structured-data';

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

const origin = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.title,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: origin }],
  creator: siteConfig.name,
  alternates: {
    types: {
      'application/rss+xml': `${origin}/feed.xml`,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: origin,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
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
  const jsonLd = getSiteJsonLdGraph();

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
