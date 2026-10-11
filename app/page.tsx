import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { FieldMotion } from '@/components/field-notes';
import { siteConfig } from '@/lib/site-config';
import { getPageMetadata } from '@/lib/page-metadata';
import { InkWord } from '@/components/ink-word';
import { DotGlyph } from '@/components/dot-glyph';
import { MarginDots } from '@/components/margin-dots';
import { ProcessPath } from '@/components/process-path';
import type { GlyphName, MarginSymbol } from '@/lib/stipple';
import { allWork, selectedWork, type WorkProject } from '@/data/selected-work';
import { publications } from '@/data/research';
import { getHomeJournalPreview } from '@/data/home-journal';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import './home.css';

export const revalidate = 60;
export const metadata: Metadata = getPageMetadata({
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  path: '/',
});

/** Each section's heading, and the figure the margin dots gather into while it is read. */
const marginSections: readonly { id: string; symbol: MarginSymbol }[] = [
  { id: 'home-title', symbol: 'path' },
  { id: 'work-title', symbol: 'torii' },
  { id: 'also-title', symbol: 'odicto-mobile' },
  { id: 'research-title', symbol: 'research' },
  { id: 'journal-title', symbol: 'page' },
  { id: 'notes-title', symbol: 'ginkgo' },
];

// The owner lives in IST; the server runs in UTC, which would show last month for 5.5 hours.
const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

function workHref(work: WorkProject) {
  return '/playground/' + work.id;
}

export default async function Home() {
  const articles = (await getPublishedArticlesLite())
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 4)
    .map((article) => ({ ...article, ...getHomeJournalPreview(article) }));
  const latestArticle = articles[0];
  const [leadWork, ...moreWork] = selectedWork;
  // Smaller tools, both with public source. Odicto Mobile sits here, apart from its desktop sibling above.
  const alsoBuilt = ['odicto-mobile', 'twinaatma']
    .map((id) => allWork.find((work) => work.id === id))
    .filter((work): work is WorkProject => Boolean(work));

  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <MarginDots sections={marginSections} />
      <main id="page-main" tabIndex={-1} className="field-main home-main">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-wash" aria-hidden="true" />
          <p className="home-hero-hello">
            <span className="status-dot" /> Hello, I’m Gargeya.
          </p>
          <div className="home-hero-grid">
            <div className="home-hero-claim">
              <h1 id="home-title">
                I build tools{' '}
                <span className="home-hero-turn">
                  <em>for how we learn to</em> <InkWord word="think" />.
                </span>
              </h1>
              {/* The stance under the claim: something a reader can disagree with. */}
              <p className="home-hero-stance">
                AI made answers cheap. I build for the part that isn’t: <strong>the thinking.</strong>
              </p>
            </div>
            <div className="home-hero-side">
              <p>
                I’m building{' '}
                <a href={siteConfig.links.edudojo} target="_blank" rel="noopener noreferrer">
                  Edudojo
                </a>
                , an AI writing coach that asks students questions instead of writing for them.
                I also make tools to capture a thought, keep useful context, and test an idea in
                code.
              </p>
              <div className="field-actions">
                <Link href="#currently" className="field-button">
                  Explore my work <ArrowRight size={16} />
                </Link>
                <Link href="/about" className="field-text-link">
                  About me <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* A "now" page in miniature: the person, and the three things in motion this month. */}
          <div className="home-notebook">
            <Link href="/about" className="home-portrait">
              <div className="home-portrait-photo">
                <Image
                  src="/profile.webp"
                  alt=""
                  fill
                  sizes="(max-width: 760px) 56px, 240px"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <span className="home-portrait-name">
                Gargeya Sharma <ArrowUpRight size={15} />
              </span>
            </Link>
            <div className="home-now-wrap">
              <p className="home-now-head">
                Now <span className="home-now-data">{monthFormat.format(new Date())}</span>
              </p>
              <ul className="home-now" aria-label="What I am working on now">
                <li>
                  <a href={siteConfig.links.edudojo} target="_blank" rel="noopener noreferrer">
                    <span className="home-now-label">Building</span>
                    <span className="home-now-title">Edudojo</span>
                    <span className="home-now-note">{leadWork.stage}</span>
                    <ArrowUpRight size={16} />
                  </a>
                </li>
                {latestArticle && (
                  <li>
                    <Link href={'/journal/' + latestArticle.slug}>
                      <span className="home-now-label">Writing</span>
                      <span className="home-now-title home-now-essay">{latestArticle.title}</span>
                      <span className="home-now-note home-now-data">{latestArticle.date}</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/notes">
                    <span className="home-now-label">Every Sunday</span>
                    <span className="home-now-title">Notes</span>
                    <span className="home-now-note">One idea on learning, AI, and being human</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Work as an index of propositions. Each entry leads with the question it answers and
            shows the process it supports; the dot glyph names it without a picture. */}
        <section id="currently" className="home-section" aria-labelledby="work-title" data-reveal>
          <header className="home-section-head">
            <h2 id="work-title">
              Selected work. <em>Software that gives your ideas somewhere to go.</em>
            </h2>
            <Link href="/playground" className="field-text-link">
              The full playground <ArrowUpRight size={16} />
            </Link>
          </header>

          <article className="work-lead glyph-host">
            <Link
              href={workHref(leadWork)}
              className="work-lead-glyph"
              aria-hidden="true"
              tabIndex={-1}
            >
              <DotGlyph name={leadWork.id as GlyphName} size={176} />
            </Link>
            <div className="work-lead-copy">
              <p className="work-meta">
                <span>{leadWork.title}</span>
                <span>{leadWork.category}</span>
                <span>{leadWork.stage}</span>
              </p>
              <h3>
                <Link href={workHref(leadWork)}>{leadWork.subtitle}</Link>
              </h3>
              <p className="work-lead-description">{leadWork.description}</p>
              <ProcessPath steps={leadWork.steps} />
              <div className="field-actions">
                <Link href={workHref(leadWork)} className="field-text-link">
                  Explore the project <ArrowUpRight size={16} />
                </Link>
                <a
                  href={leadWork.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-text-link"
                >
                  Visit Edudojo <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </article>

          <ul className="work-index">
            {moreWork.map((work) => (
              <li key={work.id}>
                <Link href={workHref(work)} className="work-row glyph-host">
                  <DotGlyph name={work.id as GlyphName} size={72} className="work-row-glyph" />
                  <span className="work-row-copy">
                    <span className="work-meta">
                      <span>{work.title}</span>
                      <span>{work.category}</span>
                      {work.stage && <span>{work.stage}</span>}
                    </span>
                    <span className="work-row-title">{work.subtitle}</span>
                    <ProcessPath steps={work.steps} />
                  </span>
                  <ArrowUpRight size={20} className="work-row-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="home-section" aria-labelledby="also-title" data-reveal>
          <header className="home-section-head">
            <h2 id="also-title">
              Also built. <em>Smaller tools, with the source in the open.</em>
            </h2>
            <Link href="/playground" className="field-text-link">
              All the software <ArrowUpRight size={16} />
            </Link>
          </header>
          <div className="try-grid">
            {alsoBuilt.map((work) => (
              <Link key={work.id} href={workHref(work)} className="try-card glyph-host">
                <DotGlyph name={work.id as GlyphName} size={88} />
                <span className="try-card-title">{work.subtitle}</span>
                <span className="try-card-name">
                  {work.title} <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="research-title" data-reveal>
          <header className="home-section-head">
            <h2 id="research-title">
              Before these tools, <em>computer vision.</em>
            </h2>
            <Link href="/research" className="field-text-link">
              Research & publications <ArrowUpRight size={16} />
            </Link>
          </header>
          <ul className="ledger">
            {publications.map((paper) => (
              <li key={paper.id}>
                <Link href={'/research#' + paper.id} className="ledger-row">
                  <span className="ledger-data">{paper.year}</span>
                  <span className="ledger-title">{paper.title}</span>
                  <span className="ledger-note">{paper.type}</span>
                  <ArrowUpRight size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="home-section" aria-labelledby="journal-title" data-reveal>
          <header className="home-section-head">
            <h2 id="journal-title">
              From the journal. <em>Following a thought a little further.</em>
            </h2>
            <Link href="/journal" className="field-text-link">
              Explore the journal <ArrowUpRight size={16} />
            </Link>
          </header>
          {articles.length ? (
            <ul className="ledger">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link href={'/journal/' + article.slug} className="ledger-row ledger-essay">
                    <span className="ledger-data">{article.date}</span>
                    <span className="ledger-essay-copy">
                      <span className="ledger-kicker">
                        {article.categories.slice(0, 2).join(' / ') || 'Essay'}
                      </span>
                      <span className="ledger-title">{article.title}</span>
                      <span className="ledger-excerpt">{article.excerpt}</span>
                    </span>
                    {/* An essay's own cover is part of the writing, so it stays, small, beside it. */}
                    <span className="ledger-thumb">
                      {article.coverImage && (
                        <Image
                          src={article.coverImage}
                          alt=""
                          fill
                          sizes="(max-width: 760px) 96px, 200px"
                        />
                      )}
                    </span>
                    <ArrowUpRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-copy">
              Essays and build notes, collected in one place.{' '}
              <Link href="/journal">Visit the journal</Link>.
            </p>
          )}
        </section>

        {/* The one inverted band on the page, as on Edudojo: the letter is the slow, recurring thing. */}
        <section className="home-band" aria-labelledby="notes-title" data-reveal>
          <div className="home-band-copy">
            <h2 id="notes-title">
              Notes, on Sunday. <em>One idea on learning, AI, and being human.</em>
            </h2>
            <p>A short letter, once a week. A little room to think.</p>
            <Link href="/notes" className="home-band-button">
              Read a letter <ArrowRight size={16} />
            </Link>
          </div>
          <DotGlyph name="notes" size={160} className="home-band-glyph" />
        </section>

        <section className="home-section home-elsewhere" aria-label="Away from the editor" data-reveal>
          <Link href="/youtube" className="elsewhere-row glyph-host">
            <DotGlyph name="films" size={56} />
            <span>
              <strong>Watch the films</strong>
              <small>Start in Japan. Tokyo, Osaka, and a day in Nara.</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link href="/community" className="elsewhere-row glyph-host">
            <DotGlyph name="social" size={56} />
            <span>
              <strong>Find me online</strong>
              <small>Build notes on GitHub. Conversations on X and LinkedIn.</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
