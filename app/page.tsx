import Image from 'next/image';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { ArrowUpRight, Rocket, Users, BookOpen, PlayCircle, Database, Network, Cpu, User } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { TerminalCard } from '@/components/terminal-card';
import { Footer } from '@/components/footer';
import profileImage from '@/src/assets/images/regenerated_image_1778002356085.png';
import { InteractiveBackground } from '@/components/interactive-background';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <InteractiveBackground />
      <Navigation />
      
      <main className="flex-grow pt-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        
        {/* Hero Section - Asymmetrical */}
        <section className="py-20 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
              Digital Existence
            </span>
            <h1 className="font-headline text-5xl sm:text-6xl md:text-[5.5rem] font-extrabold tracking-[-0.04em] text-primary leading-[0.95] flex flex-col gap-4">
              <span>Architecting <span className="text-[#10B981]">Intelligence</span><span className="text-accent">.</span></span>
              <span>Curating <span className="text-[#10B981]">ART</span><span className="text-accent">.</span></span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl pt-4">
              Founder <a href="https://edudojo.ai" target="_blank" rel="noopener noreferrer" className="font-bold text-[#10B981] hover:underline">@ Edudojo.ai</a><br />
              AI redesign for Evaluation &amp; Education
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative h-[400px] md:h-[500px] rounded-soft overflow-hidden shadow-ambient"
          >
            <Image 
              src={profileImage}
              alt="Gargeya Sharma"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white font-headline font-bold text-xl">Gargeya Sharma</p>
              <p className="text-white/80 font-label text-sm tracking-widest uppercase mt-1">Lead Architect</p>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid Section */}
        <section className="py-24" id="startup">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Startup Card */}
            <Link 
              href="https://edudojo.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="md:col-span-2 block"
            >
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[320px] group border border-white/60 h-full hover:bg-white/70 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-[background-color,border-color,box-shadow] duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-primary" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-outline-variant group-hover:text-accent transition-colors duration-300" />
                </div>
                <div className="mt-12">
                  <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block mb-2">Live Venture</span>
                  <h3 className="text-3xl font-headline font-extrabold text-primary mb-3">Edudojo.ai</h3>
                  <p className="text-on-surface-variant text-lg max-w-xl">AI-driven redesign for evaluation, assessment, and education. Architecting intelligence in learning paradigms from zero to one.</p>
                </div>
              </motion.div>
            </Link>

            {/* Community Card */}
            <Link href="/community" className="block">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-primary-container/80 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[320px] group h-full border border-white/10 hover:bg-primary-container hover:border-white/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-[background-color,border-color,box-shadow] duration-300"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <div className="mt-12">
                  <h3 className="text-2xl font-headline font-bold text-white mb-2">Community</h3>
                  <p className="text-white/60 text-sm">A collective of 10,000+ engineers redefining the future.</p>
                </div>
              </motion.div>
            </Link>

            {/* Blog Card */}
            <Link href="/blog" className="block">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white/30 backdrop-blur-md p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[320px] group border border-white/50 h-full hover:bg-white/60 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-[background-color,border-color,box-shadow] duration-300"
              >
                <div className="w-14 h-14 bg-surface-container-lowest rounded-2xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <div className="mt-12">
                  <h3 className="text-2xl font-headline font-bold text-primary mb-2">Blog</h3>
                  <p className="text-on-surface-variant text-sm">Insights on engineering, strategy, and mental models.</p>
                </div>
              </motion.div>
            </Link>

            {/* Terminal Card */}
            <div className="md:col-span-2 min-h-[320px]">
              <TerminalCard />
            </div>

            {/* YouTube Card */}
            <Link href="/youtube" className="md:col-span-2 block">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white/40 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[320px] group border border-white/60 h-full hover:bg-white/70 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-[background-color,border-color,box-shadow] duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center">
                    <PlayCircle className="w-7 h-7 text-primary" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-outline-variant group-hover:text-accent transition-colors duration-300" />
                </div>
                <div className="mt-12">
                  <h3 className="text-3xl font-headline font-extrabold text-primary mb-3">YouTube</h3>
                  <p className="text-on-surface-variant text-lg max-w-md">Visualizing complex systems through video essays and technical deep dives.</p>
                </div>
              </motion.div>
            </Link>

            {/* About Card */}
            <Link href="/about" className="block">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-primary-container/80 backdrop-blur-xl p-10 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[320px] group h-full border border-white/10 hover:bg-primary-container hover:border-white/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-[background-color,border-color,box-shadow] duration-300"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <User className="w-7 h-7 text-accent" />
                </div>
                <div className="mt-12">
                  <h3 className="text-2xl font-headline font-bold text-white mb-2">About</h3>
                  <p className="text-white/60 text-sm">Engineering the future. Lead Architect & Strategist.</p>
                </div>
              </motion.div>
            </Link>

          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-32 bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] -mx-6 md:-mx-12 px-6 md:px-12 rounded-[3rem] my-12" id="community">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-screen-2xl mx-auto">
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight mb-4">Architecture of a Modern Mind</h2>
                <p className="text-xl text-on-surface-variant leading-relaxed">
                  Optimization through focused engineering cycles. I specialize in bridge-building: connecting the rigid complexity of machine learning with the fluid agility of venture capital.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-12 pt-8">
                <div className="border-l-2 border-accent pl-6">
                  <div className="text-5xl font-headline font-extrabold text-primary mb-2">12+</div>
                  <div className="text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold">Active Projects</div>
                </div>
                <div className="border-l-2 border-accent pl-6">
                  <div className="text-5xl font-headline font-extrabold text-primary mb-2">95%</div>
                  <div className="text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold">Efficiency</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[600px] rounded-soft overflow-hidden shadow-ambient">
              <Image 
                src="https://picsum.photos/seed/gargeya2/400/400"
                alt="Workspace"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="py-32" id="blog">
          <div className="mb-16">
            <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block mb-4">The Engine Room</span>
            <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Technical Stack</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "Edge Deployment", desc: "Optimizing weights for ONNX and CoreML architectures." },
              { icon: Database, title: "Vector Storage", desc: "Advanced indexing techniques for billion-scale retrieval." },
              { icon: Network, title: "Multi-Agent Systems", desc: "Protocol design for autonomous agent communication." }
            ].map((item, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-8 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col gap-6 hover:bg-white/70 hover:border-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 ease-out">
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

        {/* CTA Section */}
        <section className="py-20 md:py-32" id="youtube">
          <div className="bg-primary-container/80 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[3rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8 md:space-y-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-headline font-extrabold tracking-tighter text-white leading-[1.1]">
                Ready to build something meaningful?
              </h2>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                Whether it&apos;s an architectural audit, AI implementation strategy, or a new venture partnership—let&apos;s discuss the technical roadmap.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link 
                  href="/contact" 
                  className="bg-accent text-primary px-6 py-4 md:px-10 md:py-5 rounded-[0.25rem] font-headline font-extrabold text-base md:text-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto inline-block text-center"
                >
                  Consult on AI Projects
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-6 py-4 md:px-10 md:py-5 rounded-[0.25rem] font-headline font-extrabold text-base md:text-lg transition-all active:scale-95 w-full sm:w-auto inline-block text-center"
                >
                  Work with me
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
