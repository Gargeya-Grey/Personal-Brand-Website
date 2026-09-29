import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { FieldMotion } from '@/components/field-notes';
import { siteConfig } from '@/lib/site-config';
import { WorkVisual } from '@/components/work-visual';
import { EdudojoMark } from '@/components/edudojo-mark';
import { allWork, selectedWork } from '@/data/selected-work';
import { publications } from '@/data/research';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import './home-writing.css';

export const revalidate = 60;
export const metadata: Metadata = {
  title: {
    absolute: 'Gargeya Sharma — Building, writing & following curiosity',
  },
  description:
    'The personal corner of Gargeya Sharma. Building Edudojo, writing about learning and AI, and making small things you can play with.',
  alternates: { canonical: '/' },
};

export default async function Home() {
  const articles = (await getPublishedArticlesLite())
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3);
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main home-main">
        <section className="personal-cover">
          <div className="cover-layout">
            <div className="cover-copy">
              <p className="cover-hello">
                <span className="status-dot" /> Hello, I’m Gargeya.
              </p>
              <h1>
                I build tools
                <br />
                for how we <em>think.</em>
              </h1>
              <p className="cover-description">
                I’m building{' '}
                <a href={siteConfig.links.edudojo} target="_blank" rel="noopener noreferrer">
                  Edudojo ↗
                </a>
                , an AI learning workspace. I also make tools to capture thoughts, keep useful
                context, and explore a question through code.
              </p>
              <div className="field-actions">
                <Link href="#currently" className="field-button">
                  Explore my work <ArrowUpRight size={17} />
                </Link>
                <Link href="/about" className="field-text-link">
                  About me <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="cover-objects">
              <Link href="/about" className="portrait-note" aria-label="Meet Gargeya">
                <div className="portrait-photo">
                  <Image
                    src="/profile.webp"
                    alt="Gargeya Sharma"
                    fill
                    sizes="(max-width: 700px) 72px, 380px"
                    priority
                  />
                </div>
                <div className="portrait-caption">
                  <span>Gargeya Sharma</span>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section id="currently" className="field-section selected-work" data-reveal>
          <div className="section-title-row">
            <h2>Selected work</h2>
            <p>Learning, voice, and memory. Software that gives your ideas somewhere to go.</p>
          </div>
          <div className="work-collection">
            {selectedWork.map((work) => (
              <article key={work.id} className={'work-feature feature-' + work.id}>
                <Link
                  href={'/playground/' + work.id}
                  className="work-feature-art"
                  aria-label={'Explore ' + work.title}
                >
                  <WorkVisual cover={work.cover} />
                </Link>
                <div className="work-feature-copy">
                  {work.id === 'edudojo' && <EdudojoMark className="edudojo-watermark" />}
                  <span className="work-category">{work.category}</span>
                  <h3>
                    <Link href={'/playground/' + work.id}>{work.title}</Link>
                  </h3>
                  <p>{work.description}</p>
                  <div className="field-actions">
                    <Link href={'/playground/' + work.id} className="field-text-link">
                      {work.id === 'odicto' ? 'Meet both apps' : 'Explore the project'}{' '}
                      <ArrowUpRight size={18} />
                    </Link>
                    {work.id === 'edudojo' && (
                      <a
                        href={work.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="field-text-link"
                      >
                        Visit Edudojo <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="field-section" data-reveal>
          <div className="field-section-heading">
            <Link href="/playground" className="field-text-link">
              All the experiments <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="section-title-row">
            <h2>Small things to try</h2>
            <p>Two small experiments you can try right here. No installation or account needed.</p>
          </div>
          <div className="play-preview-grid">
            <Link href="/playground/idea-mixer" className="experiment-preview">
              <WorkVisual cover={allWork.find((work) => work.id === 'idea-mixer')!.cover} />
              <div className="preview-caption">
                <div>
                  <h3>Idea mixer</h3>
                  <p>Pair an audience with a constraint. Find something worth making.</p>
                </div>
                <ArrowUpRight size={24} />
              </div>
            </Link>
            <Link href="/playground/box-lab" className="experiment-preview">
              <WorkVisual cover={allWork.find((work) => work.id === 'box-lab')!.cover} />
              <div className="preview-caption">
                <div>
                  <h3>The overlap lab</h3>
                  <p>See how computer vision measures a match.</p>
                </div>
                <ArrowUpRight size={24} />
              </div>
            </Link>
          </div>
        </section>

        <section className="research-teaser field-section" data-reveal>
          <div>
            <h2>Before these tools, computer vision.</h2>
            <p className="field-copy">
              I started with problems in computer vision: finding objects and segmenting cracks in
              surfaces. These publications are part of that earlier work.
            </p>
            <Link href="/research" className="field-text-link">
              Research & publications <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="research-teaser-list">
            {publications.map((paper) => (
              <Link href={'/research#' + paper.id} key={paper.id}>
                <span className="work-category">
                  {paper.type} · {paper.year}
                </span>
                <h3>{paper.title}</h3>
                <span className="field-text-link">
                  Publication details <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="field-section home-journal"
          aria-labelledby="home-journal-title"
          data-reveal
        >
          <header className="home-journal-heading">
            <h2 id="home-journal-title">From the journal.</h2>
            <Link className="field-text-link" href="/journal">
              Explore the journal <ArrowUpRight size={16} />
            </Link>
          </header>
          <div className="home-journal-grid">
            {articles.length ? (
              articles.map((article) => (
                <Link
                  key={article.id}
                  href={'/journal/' + article.slug}
                  className="home-journal-story"
                >
                  {article.coverImage && (
                    <div className="home-journal-cover">
                      <Image
                        src={article.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, (max-width: 1399px) 29vw, 420px"
                      />
                    </div>
                  )}
                  <div className="home-journal-story-copy">
                    <p className="home-journal-category">
                      {article.categories.slice(0, 2).join(' / ') || 'Essay'}
                    </p>
                    <h3>{article.title}</h3>
                    <p className="home-journal-excerpt">{article.excerpt}</p>
                  </div>
                  <span className="home-journal-read">
                    Read the story <ArrowUpRight size={18} />
                  </span>
                </Link>
              ))
            ) : (
              <Link href="/journal" className="home-journal-story home-journal-empty">
                <div>
                  <p className="field-label">The journal</p>
                  <h3>Follow a thought a little further.</h3>
                  <p>Essays and build notes, collected in one place.</p>
                </div>
                <ArrowUpRight size={20} />
              </Link>
            )}
          </div>
          <Link href="/notes" className="home-journal-letter">
            <h3>Notes, on Sunday.</h3>
            <p>One idea on learning, AI, and being human. A little room to think.</p>
            <span>
              Read a letter <ArrowUpRight size={18} />
            </span>
          </Link>
        </section>
        <section className="elsewhere-spread field-section" data-reveal>
          <div>
            <h2>Away from the editor.</h2>
          </div>
          <div className="elsewhere-links">
            <Link href="/youtube" className="home-film-link">
              <div className="home-film-image">
                <Image
                  src="https://img.youtube.com/vi/bUk92KXUh1M/hqdefault.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 700px) 90vw, 560px"
                />
                <span>
                  <Play size={24} fill="currentColor" />
                </span>
              </div>
              <span>
                <strong>Watch the films</strong>
                <small>Start in Japan. Tokyo, Osaka, and a day in Nara.</small>
              </span>
              <ArrowUpRight size={20} />
            </Link>
            <Link href="/community">
              <span className="social-at">@</span>
              <span>
                <strong>Find me online</strong>
                <small>Build notes on GitHub. Conversations on X and LinkedIn.</small>
              </span>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
