import type { Metadata } from 'next';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import BlogClient from './blog-client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog & Writing',
  description:
    'Personal writing from Gargeya Sharma on systems, AI, craft, building in public, and useful finds.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const articles = await getPublishedArticlesLite();
  return <BlogClient initialArticles={articles} />;
}
