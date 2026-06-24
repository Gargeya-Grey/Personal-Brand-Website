'use client';

import * as motion from 'motion/react-client';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { projects } from '@/data/projects';

export function FeaturedProjects() {
  if (!projects || projects.length === 0) {
    return null;
  }

  const renderLayout = () => {
    // 1 Project Layout
    if (projects.length === 1) {
      const project = projects[0];
      return (
        <motion.div 
          className="bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-10 rounded-[3rem] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[border-color,box-shadow] duration-300 ease-out relative overflow-hidden"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          {/* Grainy Noise Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.09] mix-blend-overlay z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">{project.category}</span>
              <h3 className="text-3xl md:text-4xl font-headline font-[580] dark:font-[480] text-primary">{project.title}</h3>
              {project.role && <p className="text-sm font-label text-[#10B981] font-semibold">{project.role}</p>}
              <p className="text-on-surface-variant font-body text-base leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {project.tags.map(t => (
                  <span key={t} className="text-xs font-label bg-accent/10 dark:bg-white/5 text-primary border border-accent/20 dark:border-white/10 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 bg-primary dark:bg-accent text-white dark:text-slate-950 px-5 py-2.5 rounded-full font-headline font-bold text-xs tracking-tight transition-all duration-300 hover:bg-[#10B981] dark:hover:bg-accent/90">
                    <span>Launch Project</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-transparent border border-outline-variant/30 hover:bg-white/5 dark:hover:bg-white/5 text-primary px-5 py-2.5 rounded-full font-headline font-bold text-xs tracking-tight transition-all">
                    <span>View Source</span>
                  </a>
                )}
              </div>
            </div>
            <div className="lg:col-span-7 relative h-[350px] md:h-[450px] rounded-soft overflow-hidden shadow-ambient border border-white/5">
              <Image 
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>
      );
    }

    // 2 Projects Layout
    if (projects.length === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-12">
          {projects.map((project, idx) => {
            const isOffset = idx === 1;
            return (
              <motion.div
                key={project.id}
                className={`bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[border-color,box-shadow,transform] duration-300 ease-out relative overflow-hidden flex flex-col justify-between ${
                  isOffset ? 'md:translate-y-8' : ''
                }`}
                whileHover={{ y: isOffset ? 28 : -4 }}
                transition={{ duration: 0.3 }}
              >
                {/* Grainy Noise Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.09] mix-blend-overlay z-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                  }}
                />
                
                <div className="relative z-10 space-y-6">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm bg-black border border-white/5">
                    <Image 
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-[10px]">{project.category}</span>
                      {project.role && <span className="text-[10px] font-label text-on-surface-variant/80">{project.role}</span>}
                    </div>
                    <h3 className="text-2xl font-headline font-[580] dark:font-[480] text-primary">{project.title}</h3>
                    <p className="text-on-surface-variant font-body text-sm leading-relaxed line-clamp-3">{project.description}</p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                  <div className="flex gap-1.5 flex-wrap">
                    {project.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] font-label bg-accent/5 dark:bg-white/5 text-primary px-2.5 py-0.5 rounded-full border border-accent/10 dark:border-white/5">{t}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs font-headline font-bold text-accent hover:underline flex items-center gap-1">
                        <span>Demo</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-xs font-headline font-bold text-primary hover:underline">
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      );
    }

    // 3+ Projects Bento Layout
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, idx) => {
          const isFeatured = idx === 0;
          return (
            <motion.div
              key={project.id}
              className={`bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-8 rounded-[2.5rem] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] transition-[border-color,box-shadow] duration-300 ease-out relative overflow-hidden flex flex-col justify-between ${
                isFeatured ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              {/* Grainy Noise Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.09] mix-blend-overlay z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className={`relative z-10 flex flex-col gap-6 ${isFeatured ? 'lg:flex-row lg:items-center' : ''}`}>
                <div className={`relative aspect-video rounded-2xl overflow-hidden shadow-sm bg-black border border-white/5 shrink-0 ${
                  isFeatured ? 'lg:w-[45%] lg:aspect-[4/3]' : 'w-full'
                }`}>
                  <Image 
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-3 flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-[10px]">{project.category}</span>
                    {project.role && <span className="text-[10px] font-label text-on-surface-variant/80">{project.role}</span>}
                  </div>
                  <h3 className={`${isFeatured ? 'text-3xl' : 'text-2xl'} font-headline font-[580] dark:font-[480] text-primary`}>{project.title}</h3>
                  <p className="text-on-surface-variant font-body text-sm leading-relaxed">{project.description}</p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                <div className="flex gap-1.5 flex-wrap">
                  {project.tags.slice(0, isFeatured ? 4 : 3).map(t => (
                    <span key={t} className="text-[10px] font-label bg-accent/5 dark:bg-white/5 text-primary px-2.5 py-0.5 rounded-full border border-accent/10 dark:border-white/5">{t}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs font-headline font-bold text-accent hover:underline flex items-center gap-1">
                      <span>Demo</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-xs font-headline font-bold text-primary hover:underline">
                      Source
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-24" id="projects">
      <div className="mb-16">
        <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block mb-4">Selected Works</span>
        <h2 className="text-4xl font-headline font-[580] dark:font-[480] text-primary tracking-tight">Featured Projects</h2>
      </div>

      {renderLayout()}
    </section>
  );
}
