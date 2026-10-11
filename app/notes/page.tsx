import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';

import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { DotGlyph } from '@/components/dot-glyph';
import { getPublicNotes } from '@/lib/newsletter-service';
import { SAMPLE_NOTE } from '@/lib/newsletter-sample';
import { formatNoteDate, wordCount } from '@/lib/newsletter-model';
import { NotesBody } from '@/components/notes-body';
import { NotesMasthead } from '@/components/notes-masthead';
import { notesBrand } from '@/lib/notes-brand';
import './notes.css';

export const metadata: Metadata = getPageMetadata({
  title: `${notesBrand.name}`,
  description: `${notesBrand.tagline} A weekly letter from Gargeya on the human mind, learning with AI, and what we actually score. Sunday evening. No roundup.`,
  path: '/notes',
});

export const dynamic = 'force-dynamic';

const OPENING_PARAGRAPH_COUNT = 2;

const promises = [
  'A single claim, carried through to a technique you can use.',
  'Studies and trials linked, so you can check the numbers yourself.',
  'Quiet weeks stay quiet. No filler to feed a schedule.',
];

/** Splits a letter into its opening (the first paragraphs before any heading) and the rest. */
function splitLetter(bodyMd: string) {
  const blocks = bodyMd.trim().split(/\r?\n\s*\r?\n/);
  const firstHeadingIndex = blocks.findIndex((block) => block.startsWith('## '));
  const hasHeading = firstHeadingIndex !== -1;
  const openingEnd = hasHeading
    ? Math.min(OPENING_PARAGRAPH_COUNT, firstHeadingIndex)
    : OPENING_PARAGRAPH_COUNT;
  return {
    opening: blocks.slice(0, openingEnd).join('\n\n'),
    rest: blocks.slice(openingEnd).join('\n\n'),
  };
}

export default async function NotesPage() {
  const sent = await getPublicNotes();
  const example = sent[0]
    ? {
        title: sent[0].title,
        dek: sent[0].dek,
        bodyMd: sent[0].bodyMd,
        weekOf: sent[0].weekOf,
        slug: sent[0].slug,
        links: sent[0].links,
      }
    : SAMPLE_NOTE;
  const exampleIsLive = Boolean(sent[0]);
  const exampleWeekOf = example.weekOf === 'example' ? '2026-09-06' : example.weekOf;
  const exampleMinutes = Math.max(1, Math.round(wordCount(example.bodyMd) / 220));

  const { opening, rest } = splitLetter(example.bodyMd);
  const exampleHeadings = example.bodyMd
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .slice(0, 5);
  const earlierLetters = sent.slice(1);
  const hasArchive = earlierLetters.length > 0;

  return (
    <div className="field-site notes-page">
      <Navigation />

      <main id="page-main" tabIndex={-1} className="field-main notes-main">
        <section className="notes-hero" aria-labelledby="notes-title">
          <div className="notes-hero-wash" aria-hidden="true" />
          <div className="notes-hero-grid">
            <NotesMasthead size="hero" />
            <div className="notes-hero-side">
              <div className="notes-hero-glyph glyph-host">
                <DotGlyph name="notes" size={104} />
              </div>
              <p>
                A weekly letter from Gargeya on learning, judgment, and being human with AI in the
                room. One argument, followed all the way through.
              </p>
              <NewsletterSignup source="notes" variant="light" />
              <div className="field-actions notes-hero-links">
                <a href="#latest" className="field-text-link">
                  Read a letter <ArrowDown size={16} />
                </a>
                {hasArchive && (
                  <a href="#archive" className="field-text-link">
                    Browse the archive <ArrowDown size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* The letter, shown as a letter: raised paper, the writing's own face, a date and a signature. */}
        <section id="latest" className="notes-letter" aria-labelledby="latest-letter-title">
          <article className="notes-paper">
            <header className="notes-paper-head">
              <span>From Gargeya</span>
              <span className="notes-data">{formatNoteDate(exampleWeekOf)}</span>
            </header>
            <h2 id="latest-letter-title">{example.title}</h2>
            {example.dek && <p className="notes-paper-dek">{example.dek}</p>}
            <div className="notes-prose article-prose">
              <NotesBody content={opening} />
            </div>
            {!exampleIsLive && rest && (
              <details className="notes-more">
                <summary>Read the rest of the sample letter</summary>
                <div className="notes-prose notes-prose-continued article-prose">
                  <NotesBody content={rest} />
                </div>
              </details>
            )}
            <footer className="notes-paper-foot">
              {exampleIsLive ? (
                <Link href={'/notes/' + example.slug} className="field-text-link">
                  Read the letter <ArrowRight size={16} />
                </Link>
              ) : (
                <span className="notes-sample-note">A sample, until the next one is sent.</span>
              )}
              <span className="notes-signature">Gargeya</span>
            </footer>
          </article>

          <aside className="notes-rail" aria-label="About this letter">
            <p className="work-meta">
              <span>{exampleIsLive ? 'The latest letter' : 'A letter to start with'}</span>
              <span>{exampleMinutes} min read</span>
            </p>
            {exampleHeadings.length > 0 && (
              <div>
                <h3 className="notes-rail-title">The questions it follows</h3>
                <ol className="notes-steps">
                  {exampleHeadings.map((heading) => (
                    <li key={heading}>{heading}</li>
                  ))}
                </ol>
              </div>
            )}
            {example.links.length > 0 && (
              <div>
                <h3 className="notes-rail-title">Read the sources</h3>
                <ul className="notes-sources">
                  {example.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <span>{link.label}</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </section>

        {hasArchive && (
          <section id="archive" className="notes-archive" aria-labelledby="archive-title">
            <header className="notes-section-head">
              <h2 id="archive-title">
                Earlier letters.{' '}
                <em>{earlierLetters.length} so far, newest first.</em>
              </h2>
            </header>
            <ul className="ledger">
              {earlierLetters.map((week) => {
                const minutes = Math.max(1, Math.round(wordCount(week.bodyMd) / 220));
                return (
                  <li key={week.id}>
                    <Link href={`/notes/${week.slug}`} className="ledger-row notes-ledger-row">
                      <span className="ledger-data">{formatNoteDate(week.weekOf)}</span>
                      <span className="ledger-essay-copy">
                        <span className="ledger-title">{week.title}</span>
                        {week.dek ? <span className="ledger-excerpt">{week.dek}</span> : null}
                      </span>
                      <span className="ledger-note">~{minutes} min</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* The one inverted band, as on the homepage: the promise restated, one more way in. */}
        <section className="notes-band" aria-labelledby="notes-closing-title">
          <div className="notes-band-copy">
            <h2 id="notes-closing-title">
              One argument. <em>Evidence attached. Reply open.</em>
            </h2>
            <ul>
              {promises.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="notes-band-form">
            <p className="notes-band-label">Get the next one</p>
            <p className="notes-band-note">Free. Sunday 19:00 in your timezone. Unsubscribe anytime.</p>
            <NewsletterSignup source="notes-closing" variant="dark" />
            <a href="#latest" className="notes-band-link">
              Read this week first <ArrowUp size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
