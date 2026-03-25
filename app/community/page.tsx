import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Users, MessageSquare, Globe, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Join a global network of 10,000+ engineers building the future of software.',
};

export default function CommunityPage() {
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
            <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-8">
              <Users className="w-8 h-8 text-white" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Global Network
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              A collective of 10,000+ engineers.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              Redefining the future through open-source collaboration, mentorship, and high-signal technical discussions.
            </p>
          </motion.div>
        </section>

        {/* Community Stats */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 hover:bg-white/70 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-[background-color,border-color,box-shadow] duration-300">
              <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="text-5xl font-headline font-extrabold text-primary mb-2">120+</div>
              <div className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold">Countries</div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 hover:bg-white/70 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-[background-color,border-color,box-shadow] duration-300">
              <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="text-5xl font-headline font-extrabold text-primary mb-2">50k+</div>
              <div className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold">Monthly Messages</div>
            </div>

            <div className="bg-primary-container/80 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/10 group cursor-pointer relative overflow-hidden hover:bg-primary-container hover:border-white/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-[background-color,border-color,box-shadow] duration-300">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-accent/20 blur-[60px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-white/50 group-hover:text-accent transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-3xl font-headline font-extrabold text-white mb-2">Join Discord</h3>
                  <p className="text-white/70 text-sm">Get access to private channels, code reviews, and exclusive events.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
