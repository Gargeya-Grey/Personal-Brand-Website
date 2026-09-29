import type { MetadataRoute } from 'next';
import { allWork } from '@/data/selected-work';
import { getPublishedArticlesLite } from '@/lib/blog-service';
import { getPublicNotes } from '@/lib/newsletter-service';
import { getSiteOrigin } from '@/lib/site-config';

export const revalidate = 3600;

function contentDate(value: string | undefined | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteOrigin();
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/playground',
    ...allWork.map((work) => '/playground/' + work.id),
    '/research',
    '/journal',
    '/notes',
    '/youtube',
    '/community',
    '/contact',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${base}${path || '/'}`,
    changeFrequency: path === '/journal' || path === '/notes' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/journal' || path === '/notes' ? 0.9 : 0.7,
  }));

  // One unavailable collection must not hide the other from crawlers.
  const [articlesResult, notesResult] = await Promise.allSettled([
    getPublishedArticlesLite(),
    getPublicNotes(),
  ]);
  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value : [];
  const sentNotes = notesResult.status === 'fulfilled' ? notesResult.value : [];
  const posts: MetadataRoute.Sitemap = articles.filter((article) => article.slug).map((article) => ({
    url: `${base}/journal/${article.slug}`,
    lastModified: contentDate(article.updatedAt) ?? contentDate(article.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  const notes: MetadataRoute.Sitemap = sentNotes.filter((week) => week.slug).map((week) => ({
    url: `${base}/notes/${week.slug}`,
    lastModified: contentDate(week.updatedAt) ?? contentDate(week.sentAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  return [...staticRoutes, ...posts, ...notes];
}
