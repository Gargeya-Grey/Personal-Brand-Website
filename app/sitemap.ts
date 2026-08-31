import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/blog-service';
import { getPublicNotes } from '@/lib/newsletter-service';
import { getSiteOrigin } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteOrigin();
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/blog',
    '/notes',
    '/youtube',
    '/community',
    '/contact',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: path === '/blog' || path === '/notes' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/blog' || path === '/notes' ? 0.9 : 0.7,
  }));

  try {
    const articles = await getArticles();
    const posts = articles
      .filter((a) => a.status === 'published' || !a.status)
      .map((a) => ({
        url: `${base}/blog/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    let notes: MetadataRoute.Sitemap = [];
    try {
      const sent = await getPublicNotes();
      notes = sent.map((week) => ({
        url: `${base}/notes/${week.slug}`,
        lastModified: week.updatedAt ? new Date(week.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch {
      notes = [];
    }
    return [...staticRoutes, ...posts, ...notes];
  } catch {
    return staticRoutes;
  }
}
