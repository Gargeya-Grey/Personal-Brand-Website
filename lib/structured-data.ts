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
    // Edudojo's founder page, so both sites name the same person in structured data.
    `${links.edudojo}/about`,
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
    knowsAbout: [
      'AI in education',
      'Socratic learning',
      'Process-based assessment',
      'Voice and speech interfaces',
      'Computer vision',
    ],
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

/** Downloadable software on a project page. The facts come from the page's own record. */
export function getSoftwareApplicationJsonLd(work: {
  id: string;
  title: string;
  description: string;
  source?: string;
  software: { operatingSystem: string; version: string; license: string };
}) {
  const origin = getSiteOrigin();
  const pageUrl = absoluteUrl(`/playground/${work.id}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${pageUrl}#software`,
    name: work.title,
    description: work.description,
    url: pageUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: work.software.operatingSystem,
    softwareVersion: work.software.version,
    isAccessibleForFree: true,
    license: work.software.license,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': `${origin}/#person` },
    ...(work.source ? { codeRepository: work.source } : {}),
  };
}

/** Turns a running time such as `1:08` into the ISO 8601 form search engines read (`PT1M8S`). */
function isoDuration(shown: string): string | undefined {
  const parts = shown.split(':').map(Number);
  if (parts.some((n) => !Number.isInteger(n) || n < 0) || parts.length < 2 || parts.length > 3) {
    return undefined;
  }
  const [h, m, sec] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${sec ? `${sec}S` : ''}` || undefined;
}

/** The project's own demo film on YouTube, so the video can appear in video results. */
export function getVideoObjectJsonLd(work: {
  id: string;
  film: { youtubeId: string; title: string; duration: string; caption: string; uploadDate: string };
}) {
  const origin = getSiteOrigin();
  const { film } = work;
  const duration = isoDuration(film.duration);
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: film.title,
    description: film.caption,
    thumbnailUrl: `https://i.ytimg.com/vi/${film.youtubeId}/hqdefault.jpg`,
    uploadDate: film.uploadDate,
    ...(duration ? { duration } : {}),
    embedUrl: `https://www.youtube.com/embed/${film.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${film.youtubeId}`,
    publisher: { '@id': `${origin}/#person` },
    isPartOf: { '@id': `${absoluteUrl(`/playground/${work.id}`)}#software` },
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
