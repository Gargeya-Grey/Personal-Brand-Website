import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PlayCircle, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'YouTube',
  description: 'Visualizing complex systems through video essays and technical deep dives.',
};

export default function YouTubePage() {
  const videos = [
    {
      title: "Building a Vector Database from Scratch in Rust",
      views: "1.2M views",
      date: "2 weeks ago",
      thumbnail: "https://picsum.photos/seed/rust/800/450"
    },
    {
      title: "The Truth About Autonomous Agents",
      views: "850K views",
      date: "1 month ago",
      thumbnail: "https://picsum.photos/seed/agents/800/450"
    },
    {
      title: "System Design Interview: Distributed Cache",
      views: "2.1M views",
      date: "3 months ago",
      thumbnail: "https://picsum.photos/seed/cache/800/450"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        
        {/* Header */}
        <section className="py-20 md:py-32 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-8">
              <PlayCircle className="w-8 h-8 text-primary" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Video Essays
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              Visualizing complex systems.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              Deep dives into software architecture, machine learning, and the engineering mindset.
            </p>
          </motion.div>
        </section>

        {/* Video Grid */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer bg-white/40 backdrop-blur-xl p-6 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 hover:bg-white/60 transition-all duration-500"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 shadow-ambient">
                  <Image 
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-headline font-bold text-primary mb-2 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant font-label">
                  <span>{video.views}</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                  <span>{video.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
