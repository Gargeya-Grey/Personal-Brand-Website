import { Metadata } from 'next';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { Terminal, Code, Cpu, Network } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about Gargeya Sharma, Lead Architect and Engineer specializing in scalable systems and AI.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        
        {/* Header */}
        <section className="py-20 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-8">
              <Terminal className="w-8 h-8 text-primary" />
            </div>
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              About Me
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
              Engineering the future.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              I am a Lead Architect and Engineer specializing in distributed systems, machine learning pipelines, and venture architecture.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative h-[400px] md:h-[600px] rounded-soft overflow-hidden shadow-ambient"
          >
            <Image 
              src="https://picsum.photos/seed/gargeya/800/1000"
              alt="Gargeya Sharma"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
              priority
            />
          </motion.div>
        </section>

        {/* Philosophy */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="max-w-4xl space-y-12">
            <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Philosophy</h2>
            
            <div className="space-y-8 text-lg text-on-surface-variant leading-relaxed">
              <p>
                My approach to engineering is rooted in &quot;Soft Minimalism&quot;—the idea that complex systems should feel intuitive, breathable, and fluid. I believe that the best code is the code you don&apos;t have to write, and the best architecture is the one that gets out of the way.
              </p>
              <p>
                Over the past decade, I&apos;ve built everything from high-frequency trading engines to billion-scale vector databases. The common thread? A relentless focus on fundamentals, mechanical sympathy, and understanding the problem domain deeply before writing a single line of code.
              </p>
              <p>
                Currently, I spend my time advising startups on technical strategy, contributing to open-source, and exploring the intersection of autonomous agents and distributed consensus.
              </p>
            </div>
          </div>
        </section>

        {/* Core Competencies */}
        <section className="py-24 border-t border-outline-variant/20">
          <div className="mb-16">
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block mb-4">Expertise</span>
            <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Core Competencies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Code, title: "Systems Engineering", desc: "Rust, Go, C++. Building high-performance, concurrent systems with predictable latency." },
              { icon: Cpu, title: "Machine Learning", desc: "PyTorch, ONNX, TensorRT. Optimizing models for inference at the edge and in the cloud." },
              { icon: Network, title: "Distributed Systems", desc: "Kafka, Kubernetes, gRPC. Designing resilient architectures that scale horizontally." }
            ].map((item, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-8 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col gap-6 hover:bg-white/60 transition-all duration-500">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-xl text-primary mb-2">{item.title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
