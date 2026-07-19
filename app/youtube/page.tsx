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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />

      <main className="flex-grow pt-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full relative z-10">
        <section className="py-20 md:py-32 max-w-4xl">
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
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              Field notes from the <span className="text-accent">road</span>
              <span className="text-on-surface-variant/50">.</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
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

        <section className="py-24 border-t border-outline-variant/10">
          <YoutubeGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}
