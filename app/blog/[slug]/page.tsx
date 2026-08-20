import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getArticleBySlug,
  getArticles,
  getPublishedArticlesLite,
  isArticlePublished,
  type Article,
} from '@/lib/blog-service';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ArticleClient } from './article-client';
import { absoluteUrl, getDefaultShareImage, siteConfig } from '@/lib/site-config';
import { clampMetaDescription } from '@/lib/meta';
import { getBlogPostingJsonLd } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Cache pages for a short window; CMS saves call revalidatePath so new/edited
 * posts still show up quickly without forcing every visit to hit Supabase cold.
 */
export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const list = await getArticles();
    return list
      .filter((a) => isArticlePublished(a) && a.slug)
      .map((a) => ({
        slug: a.slug,
      }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!isArticlePublished(article)) {
    return {
      title: 'Article Not Found',
    };
  }

  const brandedTitle = `${article!.title} | ${siteConfig.name}`;
  const descriptionText = clampMetaDescription(article!.excerpt, {
    fallback: `${article!.title} — writing by ${siteConfig.name} on systems, AI, and building in public.`,
  });
  const canonicalPath = `/blog/${article!.slug}`;
  const defaultShare = getDefaultShareImage(brandedTitle);
  const cover = article!.coverImage
    ? [
        {
          url: absoluteUrl(article!.coverImage),
          secureUrl: absoluteUrl(article!.coverImage),
          width: 1200,
          height: 630,
          alt: article!.title,
        },
      ]
    : [defaultShare];

  return {
    // Avoid double "| Gargeya Sharma" from the root title template
    title: { absolute: brandedTitle },
    description: descriptionText,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'article',
      title: brandedTitle,
      description: descriptionText,
      url: absoluteUrl(canonicalPath),
      publishedTime: article!.date,
      authors: [article!.author],
      tags: article!.categories,
      images: cover,
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description: descriptionText,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      images: cover.map((img) => ({
        url: img.url,
        alt: img.alt,
        width: img.width,
        height: img.height,
      })),
    },
  };
}

function pickRelated(current: Article, all: Awaited<ReturnType<typeof getPublishedArticlesLite>>) {
  return all
    .filter((a) => {
      const s = (a.status || 'published').toString().trim().toLowerCase();
      return a.slug !== current.slug && (s === 'published' || s === '');
    })
    .map((a) => ({
      a,
      overlap: a.categories.filter((c) => current.categories.includes(c)).length,
    }))
    .sort((x, y) => y.overlap - x.overlap)
    .slice(0, 2)
    .map(({ a }) => ({ slug: a.slug, title: a.title, readTime: a.readTime }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [article, listing] = await Promise.all([
    getArticleBySlug(slug),
    getPublishedArticlesLite(),
  ]);

  if (!isArticlePublished(article) || !article) {
    notFound();
  }

  const related = pickRelated(article, listing);

  const jsonLd = getBlogPostingJsonLd({
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    date: article.date,
    author: article.author,
    authorRole: article.authorRole,
    categories: article.categories,
    coverImage: article.coverImage,
  });

  return (
    <div className="min-h-screen bg-surface text-primary relative selection:bg-emerald-500/20 selection:text-inherit flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="relative z-10 flex-grow pb-24 pt-28 sm:pt-32 lg:pt-36"
      >
        <ArticleClient article={article} related={related} />
      </main>

      <Footer />
    </div>
  );
}
