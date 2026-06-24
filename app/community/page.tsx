import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Users, MessageSquare, Globe, ArrowUpRight, TrendingUp, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Building an elite global network of top 1% engineers pushing the absolute limits of software craft.',
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
              An elite collective of <br /> <span className="text-[#10B981]">top 1%</span> engineers.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              Building a high-signal network of systems architects, machine learning researchers, and builders pushing the absolute limits of software craft.
            </p>
          </motion.div>
        </section>

        {/* Community Stats */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <motion.div
              className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-10 rounded-soft border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:bg-white/85 dark:hover:bg-white/10 hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[background-color,border-color,box-shadow] duration-300 ease-out flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="w-12 h-12 bg-surface-container-low dark:bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div className="text-5xl font-headline font-extrabold text-primary mb-2">∞</div>
                <div className="text-xs font-label uppercase tracking-[0.2em] text-[#10B981] font-bold mb-4">Infinite Growth</div>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Level up your engineering capabilities through collaborative mentorship, codebase audits, and deep architectural reviews.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-10 rounded-soft border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:bg-white/85 dark:hover:bg-white/10 hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[background-color,border-color,box-shadow] duration-300 ease-out flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="w-12 h-12 bg-surface-container-low dark:bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div className="text-5xl font-headline font-extrabold text-primary mb-2">Top 1%</div>
                <div className="text-xs font-label uppercase tracking-[0.2em] text-[#10B981] font-bold mb-4">Target Caliber</div>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  We nurture and refine your software craft, aiming to elevate you into the elite top 1% of global engineering talent.
                </p>
              </div>
            </motion.div>

            <motion.a 
              href="https://discord.gg" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="discord-card-gradient backdrop-blur-xl p-10 rounded-soft border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] relative overflow-hidden hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[background-color,border-color,box-shadow] duration-300 ease-out block cursor-pointer group"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.a>

          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
