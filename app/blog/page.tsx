import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights on engineering, strategy, and the architecture of intelligent systems.',
};

export default function BlogPage() {
  const posts = [
    {
      title: "The Architecture of Autonomous Agents",
      date: "Mar 12, 2026",
      category: "Engineering",
      excerpt: "Exploring the protocol design and state management required for multi-agent systems to communicate effectively without human intervention."
    },
    {
      title: "Scaling Vector Databases for Semantic Search",
      date: "Feb 28, 2026",
      category: "Infrastructure",
      excerpt: "A deep dive into indexing techniques, quantization, and memory management when dealing with billion-scale embedding datasets."
    },
    {
      title: "Mental Models for Technical Founders",
      date: "Jan 15, 2026",
      category: "Strategy",
      excerpt: "Transitioning from an engineering mindset to a product mindset requires unlearning optimization and embracing iteration."
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
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Editorial
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              Insights on engineering and strategy.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              Long-form essays on system design, machine learning, and the mental models required to build enduring technology.
            </p>
          </motion.div>
        </section>

        {/* Blog Posts List */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="flex flex-col gap-12 max-w-4xl">
            {posts.map((post, index) => (
              <motion.article 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 hover:bg-white/70 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-[background-color,border-color,box-shadow] duration-300"
              >
                <Link href="#" className="block">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-[10px]">{post.category}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                    <span className="font-label text-on-surface-variant text-xs">{post.date}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                    {post.title}
                  </h2>
                  <p className="text-lg text-on-surface-variant leading-relaxed mb-6 max-w-2xl">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-headline font-bold text-sm group-hover:text-accent transition-colors duration-300">
                    Read Essay <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
