import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { AuthorAvatar } from '@/components/author-avatar';
import { NotesBody } from '@/components/notes-body';
import { NotesShareRail } from './notes-share-client';
import { getPublicNotes, getWeekBySlug } from '@/lib/newsletter-service';
import { formatNoteDate, publicWeek, wordCount } from '@/lib/newsletter-model';
import { NotesReadProgress, NotesReadTracker } from '../notes-read-client';
import { NotesMasthead } from '@/components/notes-masthead';
import { notesBrand } from '@/lib/notes-brand';
import { siteConfig } from '@/lib/site-config';
import { getPageMetadata } from '@/lib/page-metadata';
import { getBlogPostingJsonLd, serializeJsonLd } from '@/lib/structured-data';
import '../notes.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const week = await getWeekBySlug(slug);
  if (!week || !publicWeek(week)) {
    return { title: notesBrand.name };
  }
  return getPageMetadata({
    title: week.title,
    description: week.dek || week.title,
    path: `/notes/${week.slug}`,
    type: 'article',
    publishedTime: week.sentAt || undefined,
    modifiedTime: week.updatedAt,
  });
}

export default async function NoteIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const week = await getWeekBySlug(slug);
  if (!week || !publicWeek(week)) notFound();

  const minutes = Math.max(1, Math.round(wordCount(week.bodyMd) / 220));
  const all = await getPublicNotes();
  const idx = all.findIndex((w) => w.id === week.id);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const jsonLd = getBlogPostingJsonLd({
    title: week.title,
    excerpt: week.dek || week.title,
    slug: week.slug,
    path: `/notes/${week.slug}`,
    date: week.sentAt || undefined,
    updatedAt: week.updatedAt,
    author: siteConfig.name,
  });

  return (
    <div className="field-site notes-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <NotesReadTracker issueId={week.id} />
      <NotesReadProgress />
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main notes-main notes-issue-main">
        <Link href="/notes" className="field-text-link notes-back">
          <ArrowLeft size={16} aria-hidden="true" />
          All letters
        </Link>

        <div className="notes-issue">
          <article className="notes-issue-article">
            <NotesMasthead size="letter" href="/notes" />
            <header className="notes-issue-head">
              <p className="notes-issue-meta">
                <span className="notes-data">{formatNoteDate(week.weekOf)}</span>
                <span>{minutes} min read</span>
              </p>
              <h1>{week.title}</h1>
              {week.dek ? <p className="notes-issue-dek">{week.dek}</p> : null}
              <div className="notes-issue-byline">
                <div className="notes-issue-author">
                  <AuthorAvatar src={siteConfig.authorAvatar} name={siteConfig.name} size="md" />
                  <span>{siteConfig.name}</span>
                </div>
                <NotesShareRail title={week.title} compact />
              </div>
            </header>

            {/* Letter paper: the reading object, capped for a comfortable measure. */}
            <div className="notes-paper notes-paper-reading">
              <div className="notes-paper-head">
                <span>From {siteConfig.shortName}, to you</span>
              </div>
              <div className="notes-prose article-prose">
                <NotesBody content={week.bodyMd} />
              </div>
              <div className="notes-paper-foot">
                <a
                  href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Notes: ${week.title}`)}`}
                  className="field-text-link"
                >
                  If this landed, reply and tell me where it broke
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <span className="notes-signature">Gargeya</span>
              </div>
            </div>

            {week.links.length ? (
              <aside className="notes-deeper" aria-label="Go deeper">
                <h2 className="notes-rail-title">Go deeper</h2>
                <ul className="notes-sources">
                  {week.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <span>{link.label}</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}

            {newer || older ? (
              <nav aria-label="More letters" className="notes-pager">
                {older ? (
                  <Link href={`/notes/${older.slug}`} className="notes-pager-link">
                    <span className="notes-pager-label">Previous</span>
                    <span className="notes-pager-title">{older.title}</span>
                    <span className="notes-data">{formatNoteDate(older.weekOf)}</span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
                {newer ? (
                  <Link href={`/notes/${newer.slug}`} className="notes-pager-link notes-pager-next">
                    <span className="notes-pager-label">Next</span>
                    <span className="notes-pager-title">{newer.title}</span>
                    <span className="notes-data">{formatNoteDate(newer.weekOf)}</span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
              </nav>
            ) : null}
          </article>

          <aside className="notes-issue-aside">
            <div className="notes-aside-block">
              <h2 className="notes-rail-title">This letter</h2>
              <dl className="notes-facts">
                <div>
                  <dt>Sent</dt>
                  <dd className="notes-data">{formatNoteDate(week.weekOf)}</dd>
                </div>
                <div>
                  <dt>Read</dt>
                  <dd>~{minutes} min</dd>
                </div>
                <div>
                  <dt>Cadence</dt>
                  <dd>Sunday 19:00</dd>
                </div>
              </dl>
            </div>
            <div className="notes-aside-block">
              <h2 className="notes-rail-title">Get the next one</h2>
              <p className="notes-aside-copy">Sunday evening. One argument. No roundup.</p>
              <NewsletterSignup source="notes-issue" variant="light" />
            </div>
            <div className="notes-aside-block">
              <h2 className="notes-rail-title">Share this letter</h2>
              <NotesShareRail title={week.title} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
