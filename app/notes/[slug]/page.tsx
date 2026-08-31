import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { MarkdownPreview } from '@/components/editor/markdown-preview';
import { getWeekBySlug } from '@/lib/newsletter-service';
import { publicWeek, wordCount } from '@/lib/newsletter-model';
import { NotesReadTracker } from '../notes-read-client';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const week = await getWeekBySlug(slug);
  if (!week || !publicWeek(week)) {
    return { title: 'Notes' };
  }
  return {
    title: week.title,
    description: week.dek || week.title,
    alternates: { canonical: `/notes/${week.slug}` },
  };
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

  return (
    <div className="flex min-h-screen flex-col">
      <NotesReadTracker issueId={week.id} />
      <Navigation />
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-grow px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <Link href="/notes" className="text-sm text-accent hover:underline">
          All Notes
        </Link>
        <article className="relative mt-8 rounded-[2rem] border border-slate-200/60 bg-white/75 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-8 md:p-10 dark:border-white/10 dark:bg-slate-950/65">
          <p className="text-xs uppercase tracking-[0.16em] text-on-surface-variant">
            {week.weekOf} · {minutes} min · {siteConfig.shortName}
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] text-primary sm:text-5xl">
            {week.title}
          </h1>
          {week.dek ? (
            <p className="mt-4 font-body text-lg leading-relaxed text-on-surface-variant">{week.dek}</p>
          ) : null}
          <div className="notes-prose article-prose mt-10">
            <MarkdownPreview content={week.bodyMd} />
          </div>
          {week.links.length ? (
            <aside className="mt-12 border-t border-slate-200/80 pt-8 dark:border-white/10">
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
        </article>
        <div className="mt-16 rounded-[2rem] border border-slate-200/80 p-6 dark:border-white/10">
          <p className="font-headline text-lg font-bold text-primary">Get the next one</p>
          <p className="mt-2 mb-5 text-sm text-on-surface-variant">Sunday evening. One argument. No roundup.</p>
          <NewsletterSignup source="notes-issue" variant="light" />
        </div>
      </main>
      <Footer />
    </div>
  );
}


