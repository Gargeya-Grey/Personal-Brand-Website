import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Literata, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import './field.css';
import './work.css';
import './project-media.css';
import './index-list.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { getDefaultShareImage, getSiteOrigin, siteConfig } from '@/lib/site-config';
import { clampMetaDescription } from '@/lib/meta';
import { getSiteJsonLdGraph, serializeJsonLd } from '@/lib/structured-data';

const themeInitScript = `
try {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
} catch (_) {}
`;

// Same type family as Edudojo. Instrument Sans carries headings, text and UI. Literata is for a
// person's long writing (journal and Notes). IBM Plex Mono marks real data only: dates, versions, steps.
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-literata',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});
const origin = getSiteOrigin();
const shareImage = getDefaultShareImage();
const rootDescription = clampMetaDescription(siteConfig.description);

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.title,
  },
  description: rootDescription,
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
    description: rootDescription,
    siteName: siteConfig.name,
    images: [shareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: rootDescription,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [
      {
        url: shareImage.url,
        alt: shareImage.alt,
        width: shareImage.width,
        height: shareImage.height,
      },
    ],
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
    { media: '(prefers-color-scheme: light)', color: '#f6f7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1412' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = getSiteJsonLdGraph();

  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${literata.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased selection:bg-accent/30 relative min-h-screen"
        suppressHydrationWarning
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <ThemeProvider>
          <a
            href="#page-main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-[max(1rem,env(safe-area-inset-top))] focus:left-[max(1rem,env(safe-area-inset-left))] focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-accent focus:text-slate-950 focus:font-headline focus:font-bold focus:text-sm"
          >
            Skip to content
          </a>
          <div className="relative z-0">{children}</div>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
