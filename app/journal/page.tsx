import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import JournalClient from './journal-client';

export const revalidate = 60;

export const metadata: Metadata = getPageMetadata({
  title: 'Journal',
  description:
    'Personal writing from Gargeya Sharma on systems, AI, craft, building in public, and useful finds.',
  path: '/journal',
});

export default async function JournalPage() {
  const articles = await getPublishedArticlesLite();
  return <JournalClient initialArticles={articles} />;
}
