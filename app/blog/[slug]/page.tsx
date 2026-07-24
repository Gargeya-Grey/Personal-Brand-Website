import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getArticleBySlug,
  getArticles,
  isArticlePublished,
} from '@/lib/blog-service';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ArticleClient } from './article-client';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
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
  const descriptionText = article!.excerpt;
  const canonicalPath = `/blog/${article!.slug}`;
  const cover = article!.coverImage
    ? [
        {
          url: absoluteUrl(article!.coverImage),
          width: 1200,
          height: 630,
          alt: article!.title,
        },
      ]
    : undefined;

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
      images: cover?.map((img) => img.url),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!isArticlePublished(article) || !article) {
    notFound();
  }

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
    <div className="min-h-screen bg-surface text-primary antialiased relative selection:bg-[#D4FF00] selection:text-black flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main
        id="page-main"
        tabIndex={-1}
        className="relative z-10 flex-grow pb-20 pt-28 sm:pb-24 sm:pt-36 lg:pb-32 lg:pt-44"
      >
        <ArticleClient article={article} />
      </main>

      <Footer />
    </div>
  );
}
