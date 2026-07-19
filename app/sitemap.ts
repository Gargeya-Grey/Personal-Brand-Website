import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/blog-service';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, '');
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/blog',
    '/youtube',
    '/community',
    '/contact',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: path === '/blog' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/blog' ? 0.9 : 0.7,
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
    return [...staticRoutes, ...posts];
  } catch {
    return staticRoutes;
  }
}
