import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Users, ArrowUpRight, TrendingUp, Award } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Building an elite global network of top 1% engineers pushing the absolute limits of software craft.',
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-28 sm:px-6 sm:pt-32 lg:px-10 xl:px-12">
        
        {/* Header */}
        <section className="max-w-4xl py-12 sm:py-20 md:py-28">
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
            <h1 className="font-headline text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-primary">
              An elite collective of <br /> <span className="text-accent">top 1%</span> engineers.
            </h1>
            <p className="max-w-2xl pt-2 font-body text-lg leading-relaxed text-on-surface-variant sm:text-xl md:pt-4 md:text-2xl">
              Building a high-signal network of systems architects, machine learning researchers, and builders pushing the absolute limits of software craft.
            </p>
          </motion.div>
        </section>

        {/* Community Stats */}
        <section className="border-t border-outline-variant/20 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            
            <motion.div
              className="board-card flex flex-col justify-between rounded-soft p-6 sm:p-8 lg:p-10"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low dark:bg-white/5">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div className="mb-2 font-headline text-5xl font-extrabold text-primary">∞</div>
                <div className="mb-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Infinite Growth
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Level up your engineering capabilities through collaborative mentorship, codebase
                  audits, and deep architectural reviews.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="board-card flex flex-col justify-between rounded-soft p-6 sm:p-8 lg:p-10"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low dark:bg-white/5">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div className="mb-2 font-headline text-4xl font-extrabold text-primary lg:text-5xl">Top 1%</div>
                <div className="mb-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Target Caliber
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  We nurture and refine your software craft, aiming to elevate you into the elite
                  top 1% of global engineering talent.
                </p>
              </div>
            </motion.div>

            <motion.a
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="discord-card-gradient group relative block cursor-pointer overflow-hidden rounded-soft border border-white/10 p-6 transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent/40 sm:p-8 lg:p-10"
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
                  <p className="text-white/70 text-sm">Private channels, architecture reviews, and high-signal builder chat.</p>
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
