import { absoluteUrl, getSiteOrigin, siteConfig } from '@/lib/site-config';

export type BlogPostingInput = {
  title: string;
  excerpt: string;
  slug: string;
  date?: string;
  author: string;
  authorRole?: string;
  categories?: string[];
  coverImage?: string;
};

function sameAsLinks(): string[] {
  const { links } = siteConfig;
  return [
    links.twitter,
    links.linkedin,
    links.github,
    links.youtube,
    links.edudojo,
    links.cv,
  ].filter(Boolean);
}

export function getPersonJsonLd() {
  const origin = getSiteOrigin();
  return {
    '@type': 'Person',
    '@id': `${origin}/#person`,
    name: siteConfig.name,
    url: origin,
    image: [
      absoluteUrl(siteConfig.authorAvatar),
      absoluteUrl(siteConfig.brand.logo.darkPng),
    ],
    email: siteConfig.email,
    jobTitle: siteConfig.authorRole,
    description: siteConfig.description,
    sameAs: sameAsLinks(),
  };
}

export function getWebSiteJsonLd() {
  const origin = getSiteOrigin();
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: siteConfig.name,
    alternateName: ['Gargeya', 'GS', 'The Engineering Editorial'],
    url: origin,
    description: siteConfig.description,
    inLanguage: 'en-US',
    publisher: { '@id': `${origin}/#person` },
    author: { '@id': `${origin}/#person` },
  };
}

/** Site-wide graph for layout injection. */
export function getSiteJsonLdGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [getPersonJsonLd(), getWebSiteJsonLd()],
  };
}

function safeIsoDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function getBlogPostingJsonLd(article: BlogPostingInput) {
  const origin = getSiteOrigin();
  const pageUrl = `${origin}/blog/${article.slug}`;
  const publishedIso = safeIsoDate(article.date);
  const imageUrl = absoluteUrl(article.coverImage || siteConfig.authorAvatar);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    author: {
      '@type': 'Person',
      '@id': `${origin}/#person`,
      name: article.author || siteConfig.name,
      jobTitle: article.authorRole || siteConfig.authorRole,
      url: origin,
      sameAs: sameAsLinks(),
    },
    publisher: {
      '@type': 'Person',
      '@id': `${origin}/#person`,
      name: siteConfig.name,
      url: origin,
      image: absoluteUrl(siteConfig.brand.logo.darkPng),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    image: [imageUrl, absoluteUrl(siteConfig.brand.ogImage)],
    keywords: article.categories?.join(', '),
    url: pageUrl,
  };
}
