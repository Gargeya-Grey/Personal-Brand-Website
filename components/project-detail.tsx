import { WorkVisual } from '@/components/work-visual';
import Link from 'next/link';
import { ArrowUpRight, ArrowLeft, Play } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { WorkExplainer } from '@/components/work-explainer';
import { ProjectExperience } from '@/components/project-experience';
import { DotGlyph } from '@/components/dot-glyph';
import type { GlyphName } from '@/lib/stipple';
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
            <Link href="/playground/odicto-mobile" className="field-text-link platform-link">
              Odicto Mobile, for Android <ArrowUpRight size={18} />
            </Link>
          )}
        </header>
        <div className="project-detail-cover">
          {/* An owner-approved image keeps its place. Otherwise the project is named in the site's own
              dot language until a real demo recording exists (shown below in its own section). */}
          {work.cover.kind === 'image' ? (
            <WorkVisual cover={work.cover} />
          ) : (
            <div className="project-plate glyph-host">
              <DotGlyph name={work.id as GlyphName} size={240} />
              <span className="project-plate-caption">{work.cover.label}</span>
              <span className="project-plate-caption project-plate-detail">{work.cover.detail}</span>
            </div>
          )}
        </div>
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
