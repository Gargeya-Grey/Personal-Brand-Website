import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles } from '@/lib/blog-service';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ArticleClient } from './article-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const list = await getArticles();
    // Pre-build pages for published articles
    return list
      .filter(a => a.status === 'published' || !a.status)
      .map(a => ({
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

  if (!article || article.status !== 'published') {
    return {
      title: 'Article Not Found',
    };
  }

  const titleText = `${article.title} | Gargeya Sharma`;
  const descriptionText = article.excerpt;

  return {
    title: titleText,
    description: descriptionText,
    openGraph: {
      type: 'article',
      title: titleText,
      description: descriptionText,
      url: `https://gargeyasharma.com/blog/${article.slug}`,
      publishedTime: article.date,
      authors: [article.author],
      tags: article.categories,
      images: article.coverImage ? [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descriptionText,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // Drafts or missing posts return 404 server-side
  if (!article || (article.status && article.status !== 'published')) {
    notFound();
  }

  // Create JSON-LD structured data (BlogPosting schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: new Date(article.date).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gargeya Sharma',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gargeyasharma.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://gargeyasharma.com/blog/${article.slug}`,
    },
    image: article.coverImage || 'https://gargeyasharma.com/default-blog.png',
  };

  return (
    <div className="min-h-screen bg-surface text-primary antialiased relative selection:bg-[#D4FF00] selection:text-black flex flex-col justify-between">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <main className="relative z-10 pt-52 pb-32 flex-grow">
        <ArticleClient article={article} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
