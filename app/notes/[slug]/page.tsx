import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="relative flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <NotesReadTracker issueId={week.id} />
      <NotesReadProgress />
      <Navigation />
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <Link href="/notes" className="group inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
            All letters
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <article className="min-w-0 lg:col-span-8">
              <NotesMasthead size="letter" href="/notes" />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AuthorAvatar src={siteConfig.authorAvatar} name={siteConfig.name} size="md" />
                  <div className="leading-tight">
                    <p className="font-label text-sm font-semibold text-primary">{siteConfig.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {formatNoteDate(week.weekOf)} · {minutes} min
                    </p>
                  </div>
                </div>
                <NotesShareRail title={week.title} compact />
              </div>
              <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium tracking-[-0.03em] text-primary sm:text-5xl">
                {week.title}
              </h1>
              {week.dek ? (
                <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant">{week.dek}</p>
              ) : null}

              {/* Letter paper — the reading object, capped for measure */}
              <div className="surface-panel mt-10 max-w-3xl rounded-[1.75rem] p-6 sm:p-10">
                <div className="flex items-center gap-3 border-b border-slate-900/[0.08] pb-5 dark:border-white/10">
                  <AuthorAvatar src={siteConfig.authorAvatar} name={siteConfig.name} size="sm" />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate font-label text-sm font-semibold text-primary">
                      {siteConfig.name}
                    </p>
                    <p className="truncate text-xs text-on-surface-variant">
                      to you · {formatNoteDate(week.weekOf)} · ~{minutes} min
                    </p>
                  </div>
                </div>
                <div className="notes-prose notes-unboxed article-prose mt-8">
                  <NotesBody content={week.bodyMd} />
                </div>
              </div>

              <div className="board-card mt-8 max-w-3xl rounded-2xl p-5 sm:p-6">
                <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                  If this landed,{' '}
                  <a
                    href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Notes: ${week.title}`)}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    reply and tell me where it broke
                  </a>
                  .
                </p>
              </div>
              {week.links.length ? (
                <aside className="board-card mt-6 max-w-3xl rounded-2xl p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Go deeper</p>
                  <ul className="mt-4 space-y-2">
                    {week.links.map((link) => (
                      <li key={link.url}>
                        <a href={link.url} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}

              <nav aria-label="More letters" className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                {older ? (
                  <Link href={`/notes/${older.slug}`} className="board-card group rounded-2xl p-5">
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      ← Previous
                    </p>
                    <p className="mt-2 font-headline text-base font-bold leading-snug text-primary group-hover:text-accent">
                      {older.title}
                    </p>
                  </Link>
                ) : <span aria-hidden="true" className="hidden sm:block" />}
                {newer ? (
                  <Link href={`/notes/${newer.slug}`} className="board-card group rounded-2xl p-5 sm:text-right">
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      Next →
                    </p>
                    <p className="mt-2 font-headline text-base font-bold leading-snug text-primary group-hover:text-accent">
                      {newer.title}
                    </p>
                  </Link>
                ) : <span aria-hidden="true" className="hidden sm:block" />}
              </nav>
            </article>

            {/* Sticky rail — inbox card + facts + next letter */}
            <aside className="lg:col-span-4">
              <div className="space-y-5 lg:sticky lg:top-28">
                <div className="board-card rounded-[1.5rem] p-6">
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    Inbox card
                  </p>
                  <dl className="mt-4 space-y-3 font-body text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between gap-3">
                      <dt>Sent</dt>
                      <dd className="font-semibold text-primary">{formatNoteDate(week.weekOf)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Read</dt>
                      <dd className="font-semibold text-primary">~{minutes} min</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Cadence</dt>
                      <dd className="font-semibold text-primary">Sunday 19:00</dd>
                    </div>
                  </dl>
                  <div className="mt-5 border-t border-slate-900/[0.08] pt-5 dark:border-white/10">
                    <p className="font-headline text-base font-bold text-primary">Get the next one</p>
                    <p className="mt-1.5 mb-4 font-body text-sm text-on-surface-variant">
                      Sunday evening. One argument. No roundup.
                    </p>
                    <NewsletterSignup source="notes-issue" variant="light" />
                  </div>
                </div>

                <div className="board-card rounded-[1.5rem] p-6">
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    Share this letter
                  </p>
                  <div className="mt-4">
                    <NotesShareRail title={week.title} />
                  </div>
                </div>

                {newer || older ? (
                  <div className="board-card rounded-[1.5rem] p-6">
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                      Keep reading
                    </p>
                    <div className="mt-4 space-y-3">
                      {newer ? (
                        <Link href={`/notes/${newer.slug}`} className="group flex items-center justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate font-headline text-sm font-bold text-primary group-hover:text-accent">
                              {newer.title}
                            </span>
                            <span className="block font-body text-xs text-on-surface-variant">
                              {formatNoteDate(newer.weekOf)}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
                        </Link>
                      ) : null}
                      {older ? (
                        <Link href={`/notes/${older.slug}`} className="group flex items-center justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate font-headline text-sm font-bold text-primary group-hover:text-accent">
                              {older.title}
                            </span>
                            <span className="block font-body text-xs text-on-surface-variant">
                              {formatNoteDate(older.weekOf)}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


