import type { Metadata } from 'next';
import Link from 'next/link';

import { ArrowRight, ArrowUpRight, Check, Mail } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { getPublicNotes } from '@/lib/newsletter-service';
import { SAMPLE_NOTE } from '@/lib/newsletter-sample';
import { formatNoteDate, wordCount } from '@/lib/newsletter-model';
import { NotesBody } from '@/components/notes-body';
import { NotesMasthead } from '@/components/notes-masthead';
import { notesBrand } from '@/lib/notes-brand';

export const metadata: Metadata = {
  title: `${notesBrand.name}`,
  description: `${notesBrand.tagline} A weekly letter from Gargeya on the human mind, learning with AI, and what we actually score. Sunday evening. No roundup.`,
  alternates: { canonical: '/notes' },
};

export const dynamic = 'force-dynamic';

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

  const opening = example.bodyMd
    .split(/\r?\n##\s/)[0]
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .slice(0, 2)
    .join('\n\n');
  const exampleHeadings = example.bodyMd
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="field-main reading-index w-full flex-grow pb-20"
      >
        <section className="notes-cover notes-cover-compact" aria-label="About Notes">
          <div>
            <NotesMasthead size="hero" />
            <p className="field-copy mt-6">
              A weekly letter from Gargeya on learning, judgment, and being human with AI in the
              room. One argument, followed all the way through.
            </p>
            <div className="mt-6 max-w-lg">
              <NewsletterSignup source="notes" variant="light" />
            </div>
            <div className="field-actions mt-4">
              <a href="#latest" className="field-text-link">
                Read a letter ↓
              </a>
              {sent.length > 1 && (
                <a href="#archive" className="field-text-link">
                  Browse the archive ↓
                </a>
              )}
            </div>
          </div>
        </section>

        <section id="latest" className="letter-invitation" aria-labelledby="latest-letter-title">
          <div className="letter-invitation-heading">
            <p className="work-category">
              {exampleIsLive ? 'The latest letter' : 'A letter to start with'}
            </p>
            <h2 id="latest-letter-title">{example.title}</h2>
            <p>{example.dek}</p>
            <span>
              {formatNoteDate(exampleWeekOf)} · {exampleMinutes} min read
            </span>
          </div>
          <article className="letter-opening">
            <span className="letter-salutation">From Gargeya</span>
            <div className="notes-prose article-prose">
              <NotesBody content={opening} />
            </div>
            {exampleIsLive ? (
              <Link href={'/notes/' + example.slug} className="field-button">
                Read the letter <ArrowRight size={18} />
              </Link>
            ) : (
              <details className="sample-letter-full">
                <summary>Read the full sample letter</summary>
                <div className="notes-prose article-prose">
                  <NotesBody content={example.bodyMd} />
                </div>
              </details>
            )}
          </article>
          {(exampleHeadings.length > 0 || example.links.length > 0) && (
            <details className="letter-details">
              <summary>
                Inside this letter & sources <span aria-hidden="true">+</span>
              </summary>
              <div className="letter-details-grid">
                {exampleHeadings.length > 0 && (
                  <div>
                    <h3>The questions it follows</h3>
                    <ul>
                      {exampleHeadings.map((heading) => (
                        <li key={heading}>{heading}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {example.links.length > 0 && (
                  <div>
                    <h3>Read the sources</h3>
                    <ul>
                      {example.links.map((link) => (
                        <li key={link.url}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.label} <ArrowUpRight size={14} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </section>

        {/* Archive — an inbox, not a bullet list */}
        {sent.length > 1 ? (
          <section
            id="archive"
            className="scroll-mt-32 border-t border-slate-900/[0.08] py-14 dark:border-white/10 sm:py-16 lg:py-20"
          >
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  The inbox
                </span>
                <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-primary sm:text-3xl">
                  Earlier letters.
                </h2>
              </div>
              <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant sm:text-right">
                {sent.length - 1} earlier {sent.length === 2 ? 'letter' : 'letters'}
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/[0.08] bg-white dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-900/[0.08] px-5 py-3.5 sm:px-7 dark:border-white/10">
                <p className="flex items-center gap-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  <Mail className="h-3.5 w-3.5 text-accent" /> Inbox
                </p>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Sunday 19:00
                </p>
              </div>
              <ul className="divide-y divide-slate-900/[0.06] dark:divide-white/[0.07]">
                {sent.slice(1).map((week, i) => {
                  const minutes = Math.max(1, Math.round(wordCount(week.bodyMd) / 220));
                  return (
                    <li key={week.id}>
                      <Link
                        href={`/notes/${week.slug}`}
                        className="group grid gap-3 px-5 py-5 transition-colors duration-300 hover:bg-accent/[0.05] sm:grid-cols-12 sm:items-center sm:gap-6 sm:px-7"
                      >
                        <div className="flex items-center gap-3 sm:col-span-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-accent' : 'bg-slate-300 dark:bg-white/20'}`}
                            aria-hidden="true"
                          />
                          <span className="font-mono text-xs font-semibold text-on-surface-variant">
                            {formatNoteDate(week.weekOf)}
                          </span>
                        </div>
                        <div className="min-w-0 sm:col-span-8">
                          <p className="truncate font-headline text-lg font-bold tracking-tight text-primary transition-colors group-hover:text-accent">
                            {week.title}
                          </p>
                          {week.dek ? (
                            <p className="mt-0.5 truncate font-body text-sm text-on-surface-variant">
                              {week.dek}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 sm:col-span-2 sm:justify-end">
                          <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                            ~{minutes} min
                          </span>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Closing — the promise restated, one more inbox door */}
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:rounded-[2.5rem] md:p-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Sunday evening
                </span>
                <h2 className="cta-card-heading mt-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl">
                  One argument. Evidence attached. Reply open.
                </h2>
                <ul className="mt-6 space-y-3">
                  {[
                    'A single claim, carried through to a technique you can use.',
                    'Studies and trials linked — check the numbers yourself.',
                    'Quiet weeks stay quiet. No filler to feed a schedule.',
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-on-surface-variant sm:text-[15px]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-outline-variant bg-canvas p-5 sm:p-7">
                  <p className="font-headline text-lg font-bold text-primary">Get the next one</p>
                  <p className="mt-1.5 mb-5 font-body text-sm text-on-surface-variant">
                    Free · Sunday 19:00 in your timezone · unsubscribe anytime.
                  </p>
                  <NewsletterSignup source="notes-closing" variant="light" />
                  <a
                    href="#latest"
                    className="project-link mt-5 rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>Read this week first</span>
                    <ArrowRight className="btn-icon h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
