import type { Metadata } from 'next';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import JournalClient from './journal-client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Personal writing from Gargeya Sharma on systems, AI, craft, building in public, and useful finds.',
  alternates: { canonical: '/journal' },
};

export default async function JournalPage() {
  const articles = await getPublishedArticlesLite();
  return <JournalClient initialArticles={articles} />;
}
