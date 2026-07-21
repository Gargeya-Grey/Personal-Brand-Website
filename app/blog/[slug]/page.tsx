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
import { siteConfig } from '@/lib/site-config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Always resolve posts at request time so newly published articles work
 * without a redeploy. generateStaticParams still warms known slugs at build.
 */
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

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

function siteOrigin(): string {
  return (process.env.APP_URL || siteConfig.url || 'https://www.sgargeya.com').replace(
    /\/$/,
    ''
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!isArticlePublished(article)) {
    return {
      title: 'Article Not Found',
    };
  }

  const titleText = `${article!.title} | Gargeya Sharma`;
  const descriptionText = article!.excerpt;
  const origin = siteOrigin();

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      type: 'article',
      title: titleText,
      description: descriptionText,
      url: `${origin}/blog/${article!.slug}`,
      publishedTime: article!.date,
      authors: [article!.author],
      tags: article!.categories,
      images: article!.coverImage
        ? [
            {
              url: article!.coverImage,
              width: 1200,
              height: 630,
              alt: article!.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descriptionText,
      images: article!.coverImage ? [article!.coverImage] : [],
    },
  };
}

function safeIsoDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!isArticlePublished(article) || !article) {
    notFound();
  }

  const origin = siteOrigin();
  const publishedIso = safeIsoDate(article.date);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${origin}/blog/${article.slug}`,
    },
    image: article.coverImage || `${origin}/default-blog.png`,
  };

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
