'use client';

import * as motion from 'motion/react-client';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { projects, type Project } from '@/data/projects';
import { siteConfig } from '@/lib/site-config';

const EDUDOJO_STEPS = [
  { n: '01', label: 'Draft', hint: 'Student works' },
  { n: '02', label: 'Socratic', hint: 'AI interviews' },
  { n: '03', label: 'Evaluate', hint: 'Score thinking' },
  { n: '04', label: 'Insights', hint: 'Teacher view' },
] as const;

/** Product window inspired by edudojo.ai — process over submission */
function EdudojoPreview({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative mt-5 block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_16px_36px_-18px_rgba(16,185,129,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] dark:hover:border-accent/35"
      aria-label="Open Edudojo.ai"
    >
      <div className="flex items-center gap-2 border-b border-slate-200/90 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-slate-900/80">
        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
        <div className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-white/[0.06]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span className="truncate font-mono text-[10px] text-slate-500 dark:text-white/45">
            edudojo.ai
          </span>
        </div>
      </div>

      <div className="relative p-3.5 sm:p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.08) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-label text-[9px] font-bold uppercase tracking-[0.18em] text-accent">
                Process-based assessment
              </p>
              <p className="mt-1 font-headline text-[15px] font-semibold tracking-tight text-slate-800 dark:text-white/90">
                Grade the process, not the submission
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-700 dark:text-accent">
              pilot
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            {EDUDOJO_STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`rounded-xl border px-1.5 py-2 text-center sm:px-2 ${
                  i === 1
                    ? 'border-accent/35 bg-accent/10 dark:border-accent/40 dark:bg-accent/15'
                    : 'border-slate-200/90 bg-white/90 dark:border-white/10 dark:bg-white/[0.04]'
                }`}
              >
                <p className="font-mono text-[9px] font-bold text-slate-400 dark:text-white/35">
                  {step.n}
                </p>
                <p className="mt-0.5 font-label text-[9px] font-bold uppercase tracking-wide text-slate-700 dark:text-white/80 sm:text-[10px]">
                  {step.label}
                </p>
                <p className="mt-0.5 hidden font-body text-[9px] text-slate-400 dark:text-white/40 sm:block">
                  {step.hint}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500 dark:bg-white/10 dark:text-white/45">
              Raw Draft
            </span>
            <span className="text-[10px] text-slate-300 dark:text-white/25">→</span>
            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-700 dark:text-accent">
              Socratic Polish
            </span>
            <span className="text-[10px] text-slate-300 dark:text-white/25">→</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500 dark:bg-white/10 dark:text-white/45">
              Verified
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

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

function ProjectTitle({
  project,
  featured,
}: {
  project: Project;
  featured?: boolean;
}) {
  const className = featured
    ? 'group/title inline-flex items-center gap-2 font-headline text-3xl font-semibold tracking-tight text-white transition-colors hover:text-accent sm:text-[2.15rem]'
    : 'inline-flex font-headline text-xl font-semibold tracking-tight text-slate-900 transition-colors hover:text-accent md:text-[1.35rem] dark:text-primary dark:hover:text-accent';

  const content =
    project.link?.startsWith('http') ? (
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          featured
            ? 'focus-visible:ring-offset-transparent'
            : 'rounded-sm focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950'
        }`}
      >
        <span>{project.title}</span>
        {featured && (
          <ArrowUpRight className="h-5 w-5 shrink-0 opacity-70 transition-transform duration-300 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 group-hover/title:opacity-100" />
        )}
      </a>
    ) : project.link?.startsWith('/') ? (
      <Link href={project.link} className={`${className} rounded-sm`}>
        {project.title}
      </Link>
    ) : (
      <span className={className}>{project.title}</span>
    );

  return <h3 className="m-0">{content}</h3>;
}

function ProjectCard({
  project,
  index,
  featured = false,
}: {
  project: Project;
  index: number;
  featured?: boolean;
}) {
  const tagLine = project.tags.slice(0, featured ? 4 : 3).join(' · ');
  const edudojoHref = project.link || siteConfig.links.edudojo;

  return (
    <motion.article
      className="board-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-[border-color,box-shadow,transform] duration-500"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26, mass: 0.65 }}
    >
      <div
        className={`relative flex shrink-0 flex-col justify-between overflow-hidden border-b border-black/10 dark:border-white/10 ${
          featured ? 'min-h-[13.5rem] sm:min-h-[16.5rem]' : 'min-h-[8.5rem]'
        }`}
        style={{ background: project.gradient }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: featured ? '36px 36px' : '26px 26px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/35 via-white/10 to-transparent" />

        <div className="relative z-10 flex items-start justify-between gap-3 p-5 sm:p-6">
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="rounded-full border border-white/25 bg-black/30 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {project.category}
          </span>
        </div>

        <div className={`relative z-10 p-5 pt-0 sm:p-6 sm:pt-0 ${featured ? 'pb-6 sm:pb-7' : ''}`}>
          {featured && (
            <>
              {project.role && (
                <p className="mb-2 font-label text-[11px] text-white/65">{project.role}</p>
              )}
              <ProjectTitle project={project} featured />
            </>
          )}
          {!featured && (
            <p className="font-label text-[11px] text-white/65">{project.role}</p>
          )}
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col bg-white dark:bg-transparent ${
          featured ? 'p-7 md:p-8' : 'p-6 md:p-7'
        }`}
      >
        {!featured && <ProjectTitle project={project} />}

        <p
          className={`font-body leading-[1.7] text-slate-600 dark:text-on-surface-variant ${
            featured
              ? 'text-[15px] md:text-base'
              : 'mt-2.5 text-sm line-clamp-3'
          }`}
        >
          {project.description}
        </p>

        {featured ? (
          <EdudojoPreview href={edudojoHref} />
        ) : (
          <p className="mt-5 font-label text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
            {tagLine}
          </p>
        )}

        <div className="mt-auto border-t border-slate-200 pt-5 dark:border-white/10">
          {featured && (
            <p className="mb-3 font-label text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
              {tagLine}
            </p>
          )}
          <ProjectLinks link={project.link} github={project.github} />
        </div>
      </div>
    </motion.article>
  );
}

export function FeaturedProjects() {
  if (!projects || projects.length === 0) return null;

  const [featured, ...rest] = projects;

  return (
    <section className="py-16 sm:py-20 lg:py-24" id="projects">
      <div className="mb-12 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-3 block font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Selected Works
          </span>
          <h2 className="font-display text-3xl font-light tracking-[-0.02em] text-primary sm:text-4xl md:text-[2.75rem]">
            Featured Projects
          </h2>
        </div>
        <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
          What I&apos;m building, shipping, and advising on — with Edudojo at the center.
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="flex lg:col-span-7 lg:row-span-2">
          <ProjectCard project={featured} index={0} featured />
        </div>
        {rest.map((project, idx) => (
          <div key={project.id} className="flex lg:col-span-5">
            <ProjectCard project={project} index={idx + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
