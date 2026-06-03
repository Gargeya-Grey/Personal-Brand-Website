import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { InteractiveBackground } from '@/components/interactive-background';

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
  title: {
    template: '%s | Gargeya Sharma',
    default: 'Gargeya Sharma | The Engineering Editorial',
  },
  description: 'Architecting the next generation of intelligent systems. Lead Architect, Engineer, and Strategist focusing on Soft Minimalism and scalable architectures.',
  keywords: ['Gargeya Sharma', 'Software Engineer', 'Lead Architect', 'AI Implementation', 'Systems Architecture', 'Soft Minimalism', 'Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'Gargeya Sharma' }],
  creator: 'Gargeya Sharma',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gargeyasharma.com',
    title: 'Gargeya Sharma | The Engineering Editorial',
    description: 'Architecting the next generation of intelligent systems. Lead Architect, Engineer, and Strategist focusing on Soft Minimalism and scalable architectures.',
    siteName: 'Gargeya Sharma',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gargeya Sharma | The Engineering Editorial',
    description: 'Architecting the next generation of intelligent systems. Lead Architect, Engineer, and Strategist focusing on Soft Minimalism and scalable architectures.',
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
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Stack+Sans+Text:wght@200..700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        ` }} />
      </head>
      <body className="antialiased selection:bg-accent/30 relative min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          {/* Global Interactive Canvas Background */}
          <InteractiveBackground />


          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

