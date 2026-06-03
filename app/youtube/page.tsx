import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PlayCircle } from 'lucide-react';
import { YoutubeGrid } from '@/components/youtube-grid';

export const metadata: Metadata = {
  title: 'YouTube Broadcasts',
  description: 'Visualizing complex systems, machine learning architectures, and venture software dynamics.',
};

export default function YouTubePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />
      
      <main className="flex-grow pt-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full relative z-10 animate-fade-in">
        
        {/* Header Section */}
        <section className="py-20 md:py-32 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="w-16 h-16 bg-white/65 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/60 dark:border-white/20 shadow-sm">
              <PlayCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Dynamic Visual Broadcasts
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              Visualizing complex <span className="text-[#10B981]">systems</span><span className="text-secondary">.</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              Step into the engine room. High-fidelity architectural deconstructions, research telemetry, and structural designs made accessible.
            </p>
          </motion.div>
        </section>

        {/* Dynamic Video Section */}
        <section className="py-24 border-t border-outline-variant/10">
          <YoutubeGrid />
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
