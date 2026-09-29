import { absoluteUrl, getSiteOrigin, siteConfig } from '@/lib/site-config';

export type BlogPostingInput = {
  title: string;
  excerpt: string;
  slug: string;
  date?: string;
  updatedAt?: string;
  path?: string;
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
    image: absoluteUrl(siteConfig.authorAvatar),
    email: siteConfig.email,
    jobTitle: siteConfig.authorRole,
    description: siteConfig.description,
    sameAs: sameAsLinks(),
    worksFor: {
      '@type': 'Organization',
      name: 'Edudojo',
      url: siteConfig.links.edudojo,
    },
  };
}

export function getWebSiteJsonLd() {
  const origin = getSiteOrigin();
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: origin,
    description: siteConfig.description,
    inLanguage: 'en-US',
    publisher: { '@id': `${origin}/#person` },
    author: { '@id': `${origin}/#person` },
  };
}

/** The biography is the canonical profile of the site's author. */
export function getProfilePageJsonLd() {
  const origin = getSiteOrigin();
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${origin}/about#profile`,
    url: absoluteUrl('/about'),
    name: `About ${siteConfig.name}`,
    isPartOf: { '@id': `${origin}/#website` },
    mainEntity: getPersonJsonLd(),
  };
}

/** Escape HTML delimiters in CMS text before embedding JSON-LD in a script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
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
  const pageUrl = absoluteUrl(article.path || `/journal/${article.slug}`);
  const publishedIso = safeIsoDate(article.date);
  const modifiedIso = safeIsoDate(article.updatedAt);
  const imageUrl = absoluteUrl(article.coverImage || siteConfig.authorAvatar);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#article`,
    headline: article.title,
    description: article.excerpt,
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    ...(modifiedIso ? { dateModified: modifiedIso } : {}),
    inLanguage: 'en-US',
    isPartOf: { '@id': `${origin}/#website` },
    author: {
      '@type': 'Person',
      '@id': `${origin}/#person`,
      name: article.author || siteConfig.name,
      jobTitle: article.authorRole || siteConfig.authorRole,
      url: absoluteUrl('/about'),
      sameAs: sameAsLinks(),
    },
    publisher: {
      '@type': 'Person',
      '@id': `${origin}/#person`,
      name: siteConfig.name,
      url: origin,
      image: absoluteUrl(siteConfig.authorAvatar),
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
