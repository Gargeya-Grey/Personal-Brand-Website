import type { Metadata } from 'next';
import { Instrument_Serif, Manrope, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { InteractiveBackground } from '@/components/interactive-background';
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

/** Editorial display — large titles only (pairs with sans UI) */
const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    creator: '@gargeyasharma',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${manrope.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Stack+Sans+Text:wght@200..700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-accent/30 relative min-h-screen" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-accent focus:text-slate-950 focus:font-headline focus:font-bold focus:text-sm"
          >
            Skip to content
          </a>
          {/* Layered atmosphere: CSS mesh + grain + interactive canvas */}
          <div className="site-atmosphere" aria-hidden="true" />
          <InteractiveBackground />
          <div className="site-grain" aria-hidden="true" />
          <div id="main-content" className="relative z-0">{children}</div>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

