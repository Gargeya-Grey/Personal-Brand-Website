import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Rocket, ArrowUpRight, Code, Server, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Startup',
  description: 'Building sustainable AI ventures and advising startups on technical strategy.',
};

export default function StartupPage() {
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
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Venture Architecture
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              Building sustainable AI ventures.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              From zero to one, focusing on scalable node architecture and robust machine learning pipelines.
            </p>
          </motion.div>
        </section>

        {/* Projects Grid */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Project 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[400px] group border border-white/60 hover:bg-white/60 transition-all duration-500"
            >
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center">
                  <Server className="w-7 h-7 text-primary" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-outline-variant group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="mt-12">
                <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-[10px] block mb-3">Enterprise SaaS</span>
                <h3 className="text-3xl font-headline font-extrabold text-primary mb-4">Nexus Core</h3>
                <p className="text-on-surface-variant text-lg max-w-md mb-8">Distributed vector database optimized for real-time semantic search across billion-scale datasets.</p>
                <div className="flex gap-3">
                  <span className="px-4 py-1.5 bg-surface-container-low rounded-full text-xs font-medium text-primary">Rust</span>
                  <span className="px-4 py-1.5 bg-surface-container-low rounded-full text-xs font-medium text-primary">gRPC</span>
                </div>
              </div>
            </motion.div>

            {/* Project 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[400px] group border border-white/60 hover:bg-white/60 transition-all duration-500"
            >
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-outline-variant group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="mt-12">
                <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-[10px] block mb-3">Developer Tooling</span>
                <h3 className="text-3xl font-headline font-extrabold text-primary mb-4">Aero Deploy</h3>
                <p className="text-on-surface-variant text-lg max-w-md mb-8">Zero-config edge deployment platform for machine learning models with automatic quantization.</p>
                <div className="flex gap-3">
                  <span className="px-4 py-1.5 bg-surface-container-low rounded-full text-xs font-medium text-primary">Go</span>
                  <span className="px-4 py-1.5 bg-surface-container-low rounded-full text-xs font-medium text-primary">WebAssembly</span>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
