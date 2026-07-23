import type { Metadata } from 'next';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import BlogClient from './blog-client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Personal writing from Gargeya Sharma — systems, AI, craft, opinions, and useful finds.',
};

export default async function BlogPage() {
  const articles = await getPublishedArticlesLite();
  return <BlogClient initialArticles={articles} />;
}
