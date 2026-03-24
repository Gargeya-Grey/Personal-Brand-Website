import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';

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
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="antialiased selection:bg-accent/30 relative min-h-screen" suppressHydrationWarning>
        {/* Ambient Background Elements for Glassmorphism */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-primary/5 blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-accent/5 blur-[150px]"></div>
        </div>
        
        {children}
      </body>
    </html>
  );
}
