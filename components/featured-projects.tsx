'use client';

import * as motion from 'motion/react-client';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { projects } from '@/data/projects';

function ProjectLinks({ link, github }: { link?: string; github?: string }) {
  return (
    <div className="flex items-center gap-4">
      {link &&
        (link.startsWith('/') ? (
          <Link
            href={link}
            className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>Open</span>
            <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
          </Link>
        ) : (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>Launch</span>
            <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
          </a>
        ))}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link rounded-sm font-headline text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-primary/70 dark:hover:text-primary"
        >
          <span>Source</span>
          <ArrowUpRight className="btn-icon h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export function FeaturedProjects() {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-24" id="projects">
      <div className="mb-12 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-3 block font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Selected Works
          </span>
          <h2 className="font-display text-3xl font-normal tracking-[-0.02em] text-primary sm:text-4xl md:text-[2.75rem]">
            Featured Projects
          </h2>
        </div>
        <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
          A short set of systems I am building, shipping, or advising on.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {projects.map((project, idx) => (
          <motion.article
            key={project.id}
            className="board-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-[border-color,box-shadow,transform] duration-500"
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26, mass: 0.65 }}
          >
            {/* Light board: soft mint-slate strip — not a harsh black slab */}
            <div className="relative h-32 shrink-0 overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-slate-100 via-emerald-50/80 to-slate-100 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
              <div
                className="absolute inset-0 opacity-50 dark:opacity-40"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 80% at 85% 15%, rgba(5,150,105,0.16), transparent 55%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(15,23,42,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.12) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                  maskImage: 'linear-gradient(105deg, black 0%, transparent 80%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-accent/40 via-accent/15 to-transparent" />
              <div className="absolute inset-0 flex items-end justify-between p-5">
                <span className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-white/50">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  {project.category}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col bg-white p-6 md:p-7 dark:bg-transparent">
              {project.role && (
                <p className="mb-2 font-label text-[11px] text-slate-500 dark:text-on-surface-variant/75">
                  {project.role}
                </p>
              )}
              <h3 className="font-headline text-xl font-semibold tracking-tight text-slate-900 md:text-[1.35rem] dark:text-primary">
                {project.title}
              </h3>
              <p className="mt-3 line-clamp-3 flex-1 font-body text-sm leading-[1.65] text-slate-600 dark:text-on-surface-variant">
                {project.description}
              </p>

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-label text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <ProjectLinks link={project.link} github={project.github} />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
