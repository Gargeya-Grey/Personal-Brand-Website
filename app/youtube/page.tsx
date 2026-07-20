import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PlayCircle } from 'lucide-react';
import { YoutubeGrid } from '@/components/youtube-grid';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'YouTube',
  description:
    'Travel essays, process, and the human side of building — plus systems thinking when the camera is on architecture.',
};

export default function YouTubePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <Navigation />

      <main id="page-main" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-28 sm:px-6 sm:pt-32 lg:px-10 xl:px-12">
        <section className="max-w-4xl py-12 sm:py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="board-card flex h-16 w-16 items-center justify-center rounded-2xl">
              <PlayCircle className="h-8 w-8 text-accent" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Video journal
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-primary">
              Field notes from the <span className="text-accent">road</span>
              <span className="text-on-surface-variant/50">.</span>
            </h1>
            <p className="max-w-2xl pt-2 font-body text-lg leading-relaxed text-on-surface-variant sm:text-xl md:pt-4 md:text-2xl">
              Long-form travel and process vlogs — the texture behind the systems work. Subscribe on{' '}
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold hover:underline"
              >
                YouTube
              </a>{' '}
              for new episodes.
            </p>
          </motion.div>
        </section>

        <section className="border-t border-outline-variant/10 py-16 sm:py-20 lg:py-24">
          <YoutubeGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}
