import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { getPublicNotes } from '@/lib/newsletter-service';
import { SAMPLE_NOTE } from '@/lib/newsletter-sample';
import { formatNoteDate } from '@/lib/newsletter-model';
import { NotesBody } from '@/components/notes-body';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Notes',
  description:
    'A weekly letter from Gargeya on the human mind, learning with AI, and what we actually score. Sunday evening. No roundup.',
  alternates: { canonical: '/notes' },
};

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const sent = await getPublicNotes();
  const example = sent[0]
    ? { title: sent[0].title, dek: sent[0].dek, bodyMd: sent[0].bodyMd, weekOf: sent[0].weekOf, slug: sent[0].slug }
    : SAMPLE_NOTE;
  const exampleIsLive = Boolean(sent[0]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-grow px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">Notes</p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] text-primary sm:text-5xl">
          One argument a week. The mind stays in the picture.
        </h1>
        <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant">
          A Sunday letter from {siteConfig.shortName} on how people learn and grow with AI in the room: capability, judgment, assessment, and the techniques that keep you in the loop. Not a news dump. Not a recap of tweets. If a week has nothing honest to say, it stays quiet.
        </p>

        <div className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white/70 p-5 sm:p-8 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="font-headline text-xl font-bold text-primary">Get it on Sunday evening</h2>
          <p className="mt-2 mb-6 text-sm text-on-surface-variant">
            In your timezone when we know it. Unsubscribe anytime.
          </p>
          <NewsletterSignup source="notes" variant="light" />
        </div>

        <section className="mt-16">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
            {exampleIsLive ? 'Latest letter' : 'How a letter looks'}
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {siteConfig.shortName} · {formatNoteDate(example.weekOf === 'example' ? '2026-09-06' : example.weekOf)}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-primary">
            {example.title}
          </h2>
          {example.dek ? (
            <p className="mt-3 font-body text-lg text-on-surface-variant">{example.dek}</p>
          ) : null}
          {!exampleIsLive ? (
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-on-surface-variant/70">
              Sample · the live letter lands Sunday
            </p>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">
              <Link href={`/notes/${example.slug}`} className="text-accent hover:underline">
                Open the full letter
              </Link>
            </p>
          )}
          <div className="notes-prose article-prose relative mt-8 max-h-[32rem] overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-white/75 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_72%,transparent)] sm:p-8 dark:border-white/10 dark:bg-slate-950/65">
            <NotesBody content={example.bodyMd} />
          </div>
        </section>

        {sent.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-headline text-xl font-bold text-primary">Archive</h2>
            <ul className="mt-6 space-y-4">
              {sent.map((week) => (
                <li key={week.id}>
                  <Link href={`/notes/${week.slug}`} className="group block">
                    <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{week.weekOf}</p>
                    <p className="mt-1 font-headline text-lg font-bold text-primary group-hover:text-accent">
                      {week.title}
                    </p>
                    {week.dek ? <p className="mt-1 text-sm text-on-surface-variant">{week.dek}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
