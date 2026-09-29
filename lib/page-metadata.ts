import type { Metadata } from 'next';
import { clampMetaDescription } from '@/lib/meta';
import { absoluteUrl, getDefaultShareImage, siteConfig } from '@/lib/site-config';

type PageMetadataInput = {
  title: string | { absolute: string };
  description: string;
  path: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
};

/** Keep each public page's search snippet and social preview about that page. */
export function getPageMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const pageTitle = typeof title === 'string' ? `${title} | ${siteConfig.name}` : title.absolute;
  const pageDescription = clampMetaDescription(description);
  const shareImage = getDefaultShareImage();

  return {
    title: { absolute: pageTitle },
    description: pageDescription,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: pageTitle,
      description: pageDescription,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [shareImage],
      ...(type === 'article'
        ? { publishedTime, modifiedTime, authors: [absoluteUrl('/about')] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      images: [shareImage],
    },
  };
}
