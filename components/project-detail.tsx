import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowLeft, Play } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { WorkExplainer } from '@/components/work-explainer';
import { ProjectExperience } from '@/components/project-experience';
import type { WorkProject } from '@/data/selected-work';

export function ProjectDetail({ work }: { work: WorkProject }) {
  return (
    <div className="field-site">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main work-detail">
        <Link href="/playground" className="field-text-link">
          <ArrowLeft size={16} /> All projects
        </Link>
        <header className="work-intro">
          <p className="work-category">{work.category}</p>
          <h1>{work.title}</h1>
          <p className="work-subtitle">{work.subtitle}</p>
          <p className="field-copy">{work.description}</p>
          <div className="field-actions">
            {work.demo && (
              <Link href="#try-project" className="field-button">
                Try it here <Play size={17} />
              </Link>
            )}
            {!!work.recordings?.length && (
              <Link
                href="#watch-project"
                className={work.demo ? 'field-text-link' : 'field-button'}
              >
                Watch the demo <Play size={17} />
              </Link>
            )}
            <Link
              href={work.href}
              {...(work.href.startsWith('https:')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={work.demo || work.recordings?.length ? 'field-text-link' : 'field-button'}
            >
              {work.action} <ArrowUpRight size={18} />
            </Link>
          </div>
          {work.id === 'odicto' && (
            <a
              href="https://github.com/Gargeya-Grey/Odicto-Mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="field-text-link platform-link"
            >
              Android source & setup <ArrowUpRight size={18} />
            </a>
          )}
        </header>
        {work.id === 'edudojo' && (
          <div className="project-gate-cover">
            <Image
              src="/edudojo.png"
              alt="A path through forest gates toward the light — Edudojo cover artwork"
              fill
              sizes="(max-width: 700px) 100vw, 1200px"
            />
          </div>
        )}
        <ProjectExperience demo={work.demo} recordings={work.recordings} />
        {!work.demo && <WorkExplainer id={work.id} />}
        {work.id === 'dataclean' && (
          <section className="work-process" aria-label="How it works">
            <ol>
              {work.steps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p>How it works · a process sketch</p>
          </section>
        )}
        <div className="work-story">
          <aside>
            <h2>Built with</h2>
            <ul>
              {work.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            {work.source && (
              <a
                href={work.source}
                target="_blank"
                rel="noopener noreferrer"
                className="field-text-link"
              >
                Inspect the source <ArrowUpRight size={16} />
              </a>
            )}
          </aside>
          <div>
            {[
              ['The problem', work.purpose],
              ['A design choice', work.decision],
              ['Where it stands', work.state],
            ].map(([title, body]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </section>
            ))}

            <Link href="/playground" className="field-text-link">
              <ArrowLeft size={16} /> Explore another project
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
