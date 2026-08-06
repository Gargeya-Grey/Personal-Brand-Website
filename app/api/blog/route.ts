import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  getArticles,
  getPublishedArticlesLite,
  upsertArticle,
  deleteArticleById,
  sanitizeSlug,
  MAX_ARTICLE_CONTENT_CHARS,
  type Article,
} from '@/lib/blog-service';
import { requireAllowedSession } from '@/lib/auth';
import { isTrustedOrigin } from '@/lib/csrf';
import { siteConfig } from '@/lib/site-config';
import { clampMetaDescription } from '@/lib/meta';

function checkCsrf(request: Request): boolean {
  return isTrustedOrigin(request);
}

function revalidateBlog(slug?: string) {
  try {
    revalidatePath('/blog');
    revalidatePath('/sitemap');
    if (slug) revalidatePath(`/blog/${slug}`);
  } catch {
    /* revalidatePath can throw outside Next request context — ignore */
  }
}

/**
 * Public: published list (lite — no markdown bodies).
 * Auth: ?includeAll=true returns full rows for CMS.
 * Auth: ?id=123 returns single full article (editor on-demand).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';
    const idParam = searchParams.get('id');

    if (idParam) {
      const id = Number.parseInt(idParam, 10);
      if (!Number.isFinite(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      }
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('auth_session');
      const user = await requireAllowedSession(sessionCookie?.value);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const { getArticleById } = await import('@/lib/blog-service');
      const article = await getArticleById(id);
      if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(article, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

    if (includeAll) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('auth_session');
      const user = await requireAllowedSession(sessionCookie?.value);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const list = await getArticles();
      return NextResponse.json(list, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

    const published = await getPublishedArticlesLite();
    return NextResponse.json(published, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to retrieve blog list: ' + message },
      { status: 500 }
    );
  }
}

/**
 * Protected: create or update a single article (O(1) upsert).
 */
export async function POST(request: Request) {
  try {
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const article: Partial<Article> = body;

    if (article.id !== undefined && (typeof article.id !== 'number' || !Number.isFinite(article.id))) {
      return NextResponse.json(
        { error: 'Invalid article ID: must be a finite number.' },
        { status: 400 }
      );
    }

    if (!article.title || !article.slug || !article.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, or content' },
        { status: 400 }
      );
    }

    if (typeof article.content === 'string' && article.content.length > MAX_ARTICLE_CONTENT_CHARS) {
      return NextResponse.json(
        { error: `Content too large (max ${MAX_ARTICLE_CONTENT_CHARS} characters).` },
        { status: 400 }
      );
    }

    const cleanSlug = sanitizeSlug(article.slug);
    if (!cleanSlug || cleanSlug.length < 2) {
      return NextResponse.json(
        { error: 'Invalid slug. Use lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }

    const articles = await getArticles();

    const slugConflict = articles.some(
      (a) => a.slug === cleanSlug && (!article.id || a.id !== article.id)
    );
    if (slugConflict) {
      return NextResponse.json(
        { error: `An article with slug "${cleanSlug}" already exists. Slugs must be unique.` },
        { status: 400 }
      );
    }

    let savedArticle: Article;

    if (article.id) {
      const index = articles.findIndex((a) => a.id === article.id);
      if (index === -1) {
        return NextResponse.json(
          { error: `Article with ID ${article.id} not found.` },
          { status: 404 }
        );
      }

      const existing = articles[index];
      const existingStatus = existing.status;
      const newStatus = article.status || existingStatus || 'published';
      const isPublishing = newStatus === 'published' && existingStatus !== 'published';
      const publicationDate = isPublishing
        ? new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : article.date || existing.date;

      const existingAvatar = existing.authorAvatar;
      const avatarLooksBroken =
        !existingAvatar ||
        existingAvatar.includes('dicebear.com') ||
        existingAvatar.length < 4;

      savedArticle = {
        ...existing,
        ...article,
        id: existing.id,
        slug: cleanSlug,
        title: article.title.trim(),
        excerpt: clampMetaDescription(
          (article.excerpt ?? existing.excerpt) || '',
          { fallback: `${article.title.trim()} — writing by ${siteConfig.name}.` }
        ),
        categories: article.categories?.length ? article.categories : existing.categories,
        readTime: article.readTime || existing.readTime,
        takeaways: article.takeaways ?? existing.takeaways,
        content: article.content,
        illustrationType: article.illustrationType || existing.illustrationType,
        featured: article.featured !== undefined ? article.featured : existing.featured,
        status: newStatus,
        coverImage:
          article.coverImage !== undefined ? article.coverImage : existing.coverImage,
        author: article.author || existing.author || siteConfig.name,
        authorRole: article.authorRole || existing.authorRole || siteConfig.authorRole,
        authorAvatar:
          article.authorAvatar ||
          (avatarLooksBroken ? siteConfig.authorAvatar : existingAvatar),
        date: publicationDate,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newId =
        articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;

      savedArticle = {
        id: newId,
        slug: cleanSlug,
        title: article.title.trim(),
        excerpt: clampMetaDescription(article.excerpt || '', {
          fallback: `${article.title.trim()} — writing by ${siteConfig.name}.`,
        }),
        categories: article.categories?.length ? article.categories : ['Engineering'],
        author: article.author || siteConfig.name,
        authorRole: article.authorRole || siteConfig.authorRole,
        authorAvatar: article.authorAvatar || siteConfig.authorAvatar,
        date:
          article.date ||
          new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        readTime: article.readTime || '5 min read',
        takeaways: article.takeaways || [],
        content: article.content,
        illustrationType: article.illustrationType || 'diagram1',
        featured: !!article.featured,
        status: article.status || 'draft',
        coverImage: article.coverImage || '',
        updatedAt: new Date().toISOString(),
      };
    }

    const ok = await upsertArticle(savedArticle);
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to persist article changes to the database.' },
        { status: 500 }
      );
    }

    revalidateBlog(savedArticle.slug);

    return NextResponse.json(
      { success: true, article: savedArticle },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to save blog post: ' + message },
      { status: 500 }
    );
  }
}

/**
 * Protected: delete one article by id.
 */
export async function DELETE(request: Request) {
  try {
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID parameter value.' }, { status: 400 });
    }

    const articles = await getArticles();
    const existing = articles.find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json({ error: `Article with ID ${id} not found.` }, { status: 404 });
    }

    const ok = await deleteArticleById(id);
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to persist deletion to the database.' },
        { status: 500 }
      );
    }

    revalidateBlog(existing.slug);

    return NextResponse.json(
      { success: true, message: `Article ${id} deleted successfully.` },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete blog post: ' + message },
      { status: 500 }
    );
  }
}
