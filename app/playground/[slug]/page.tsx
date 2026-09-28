import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { WorkExplainer } from '@/components/work-explainer';
import { allWork } from '@/data/selected-work';

export const dynamicParams = false;
export function generateStaticParams() {
  return allWork.map(({ id }) => ({ slug: id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = allWork.find((entry) => entry.id === slug);
  if (!work) return {};
  return {
    title: work.title + ' · Playground',
    description: work.description,
    alternates: { canonical: '/playground/' + slug },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = allWork.find((entry) => entry.id === slug);
  if (!work) notFound();
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
          <a href={work.href} target="_blank" rel="noopener noreferrer" className="field-button">
            {work.action} <ArrowUpRight size={18} />
          </a>
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
        <WorkExplainer id={work.id} />
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
