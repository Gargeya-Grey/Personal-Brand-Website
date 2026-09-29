import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MoveUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { publications } from '@/data/research';

export const metadata: Metadata = {
  title: 'Research & publications',
  description:
    'Computer-vision research by Gargeya Sharma: surface-crack segmentation, object detection, and MSc work at Queen Mary University of London.',
  alternates: { canonical: '/research' },
};

export default function ResearchPage() {
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main research-page">
        <PageIntro
          title={
            <>
              Research & <em>publications.</em>
            </>
          }
        >
          <p>
            Before building tools with AI, I studied how machines see. Here are two coauthored
            publications in computer vision, alongside my master’s work.
          </p>
        </PageIntro>
        <div className="publication-list">
          {publications.map((paper) => (
            <article key={paper.id} id={paper.id} className="publication-row" data-reveal>
              <div className="publication-meta">
                <span>{paper.type}</span>
                <span>{paper.year}</span>
              </div>
              <div>
                <h2>
                  <a href={paper.href} target="_blank" rel="noopener noreferrer">
                    {paper.title}
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </a>
                </h2>
                <p className="publication-authors">{paper.authors}</p>
                <p>{paper.description}</p>
                <p className="publication-venue">{paper.venue}</p>
                <a
                  className="field-text-link"
                  href={paper.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Publisher & DOI <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <section className="research-invitation field-section" data-reveal>
          <div>
            <h2>A little less abstract.</h2>
            <p className="field-copy">
              One concept you can try for yourself: intersection over union. Adjust two boxes and
              see what “a good match” actually means.
            </p>
            <Link href="/playground/box-lab" className="field-button">
              Open the overlap lab <MoveUpRight size={18} />
            </Link>
          </div>
          <Link
            href="/playground/box-lab"
            className="overlap-cover"
            aria-label="Try the overlap lab"
          >
            <span className="box-reference" />
            <span className="box-prediction" />
            <span className="overlap-caption">Two boxes. How close is close enough?</span>
          </Link>
        </section>
        <section className="research-background field-section" data-reveal>
          <h2>Beyond the papers.</h2>
          <div>
            <h3>MSc Artificial Intelligence</h3>
            <p>
              Queen Mary University of London. My public academic repository collects work in
              machine learning, computer vision, statistics, and robotics.
            </p>
            <a
              href="https://github.com/Gargeya-Grey/MSc-Artificial-Intelligence"
              className="field-text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the academic work <ArrowUpRight size={16} />
            </a>
            <h3>Explaining the technical parts</h3>
            <p>
              I’ve also written tutorials on deep learning and computer vision for Analytics Vidhya.
            </p>
            <a
              href="https://www.analyticsvidhya.com/blog/author/gargeya/"
              className="field-text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the tutorials <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
