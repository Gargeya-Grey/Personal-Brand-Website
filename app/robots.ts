import type { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteOrigin();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/editorial', '/login', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
