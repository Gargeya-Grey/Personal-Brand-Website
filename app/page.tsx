import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { CuriosityMark, FieldMotion } from '@/components/field-notes';
import { siteConfig } from '@/lib/site-config';
import { getPublishedArticlesLite } from '@/lib/blog-service';

export const revalidate = 60;
export const metadata: Metadata = {
  title: { absolute: 'Gargeya Sharma — Building, writing & following curiosity' },
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
      <main id="page-main" tabIndex={-1} className="field-main">
        <section className="personal-cover">
          <div className="cover-layout">
            <div className="cover-copy">
              <p className="cover-hello">
                <span className="status-dot" /> Hello, I’m Gargeya.
              </p>
              <h1>
                Learning, AI,
                <br />
                and things
                <br />I <em>make.</em>
              </h1>
              <p className="cover-description">
                I’m building{' '}
                <a href={siteConfig.links.edudojo} target="_blank" rel="noopener noreferrer">
                  Edudojo ↗
                </a>
                , where AI challenges students to think. This is also home to my essays, small apps,
                and travel films.
              </p>
              <div className="field-actions">
                <Link href="/playground" className="field-button">
                  Explore the playground <ArrowUpRight size={17} />
                </Link>
                <Link href="/about" className="field-text-link">
                  A little about me <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="cover-objects">
              <CuriosityMark />
              <Link href="/about" className="portrait-note" aria-label="Meet Gargeya">
                <div className="portrait-photo">
                  <Image
                    src="/profile.webp"
                    alt="Gargeya Sharma"
                    fill
                    sizes="(max-width: 700px) 75vw, 380px"
                    priority
                  />
                </div>
                <div className="portrait-caption">
                  <span>The person behind the tabs.</span>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
              <Link href="/playground/idea-mixer" className="desk-note">
                <span>
                  What happens
                  <br />
                  if you mix <em>these?</em>
                </span>
                <span className="desk-note-bottom">
                  Try the idea mixer <ArrowUpRight size={18} />
                </span>
              </Link>
            </div>
          </div>
          <div className="cover-bottom">
            <a href="#currently" className="field-text-link">
              Take a look around <ArrowDown size={16} />
            </a>
          </div>
        </section>

        <section id="currently" className="field-section" data-reveal>
          <div className="venture-spread">
            <div className="venture-copy">
              <span className="field-chip">
                <span className="status-dot" /> Building Edudojo.ai
              </span>
              <h2>
                What if learning
                <br />
                was about{' '}
                <em>
                  becoming
                  <br />
                  capable?
                </em>
              </h2>
              <p>
                A correct answer isn’t the whole story. I’m building student-centred learning that
                makes the questions, decisions, and revisions visible. AI that challenges you to
                think.
              </p>
              <a
                href={siteConfig.links.edudojo}
                target="_blank"
                rel="noopener noreferrer"
                className="field-text-link"
              >
                Step inside Edudojo <ArrowUpRight size={18} />
              </a>
            </div>
            <a
              className="learning-sketch"
              href={siteConfig.links.edudojo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore the Edudojo learning process"
            >
              <div className="sketch-caption field-label">
                <span>Edudojo / The learning loop</span>
                <ArrowUpRight size={18} />
              </div>
              <div className="sketch-orbit" aria-hidden="true">
                <span className="orbit-word orbit-one">Create</span>
                <span className="orbit-word orbit-two">Question</span>
                <span className="orbit-word orbit-three">Reflect</span>
                <span className="orbit-word orbit-four">Grow</span>
                <div className="orbit-center">
                  The thinking
                  <br />
                  <em>is the work.</em>
                </div>
              </div>
              <p>
                Less “give me the answer.”
                <br />
                More “show me how you got there.”
              </p>
            </a>
          </div>
        </section>

        <section className="field-section" data-reveal>
          <div className="field-section-heading">
            <Link href="/playground" className="field-text-link">
              All the experiments <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="section-title-row">
            <h2>
              Apps &
              <br />
              <em>experiments.</em>
            </h2>
            <p>
              Small apps, side projects, and things made just to see what happens. Open one. Give it
              a spin.
            </p>
          </div>
          <div className="play-preview-grid">
            <Link href="/playground/idea-mixer" className="experiment-preview">
              <div className="mixer-art" aria-hidden="true">
                <span>What if</span>
                <span className="mix-disc">?</span>
                <span>meets this?</span>
              </div>
              <div className="preview-caption">
                <div>
                  <h3>Idea mixer</h3>
                  <p>A tiny nudge for your next thing.</p>
                </div>
                <ArrowUpRight size={24} />
              </div>
            </Link>
            <Link href="/playground" className="experiment-preview website-preview">
              <div className="website-art" aria-hidden="true">
                <div className="mini-browser">
                  <span>● ● ●</span>
                  <p>
                    A space
                    <br />
                    to <em>make.</em>
                  </p>
                  <div />
                  <div />
                </div>
              </div>
              <div className="preview-caption">
                <div>
                  <h3>The personal corner</h3>
                  <p>A home for an expanding body of work.</p>
                </div>
                <ArrowUpRight size={24} />
              </div>
            </Link>
          </div>
        </section>

        <section className="field-section writing-spread" data-reveal>
          <div>
            <h2>
              Latest from
              <br />
              the <em>journal.</em>
            </h2>
            <p className="field-copy">
              Essays on AI, learning, systems, and the craft of building. Writing is how I find out
              what I actually think.
            </p>
            <Link className="field-text-link" href="/journal">
              Open the journal <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="writing-index">
            {articles.length ? (
              articles.map((article) => (
                <Link key={article.id} href={'/journal/' + article.slug} className="writing-row">
                  <div>
                    <p className="field-label">
                      {article.categories.slice(0, 2).join(' / ') || 'Essay'}
                    </p>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                  <ArrowUpRight size={20} />
                </Link>
              ))
            ) : (
              <Link href="/journal" className="writing-row">
                <div>
                  <p className="field-label">The journal</p>
                  <h3>Follow a thought a little further.</h3>
                  <p>Essays and build notes, collected in one place.</p>
                </div>
                <ArrowUpRight size={20} />
              </Link>
            )}
            <Link href="/notes" className="letter-row">
              <span aria-hidden="true">↳</span>
              <div>
                <h3>Notes, on Sunday.</h3>
                <p>One argument. A little room to think.</p>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
        <section className="elsewhere-spread field-section" data-reveal>
          <div>
            <h2>
              Films &
              <br />
              <em>conversations.</em>
            </h2>
          </div>
          <div className="elsewhere-links">
            <Link href="/youtube">
              <Play size={21} />
              <span>
                <strong>Watch the films</strong>
                <small>Films, videos, and another way of seeing.</small>
              </span>
              <ArrowUpRight size={20} />
            </Link>
            <Link href="/community">
              <span className="social-at">@</span>
              <span>
                <strong>Find me online</strong>
                <small>Find me on X, GitHub, and beyond.</small>
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
