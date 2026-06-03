import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getArticles, saveArticles, Article } from '@/lib/blog-service';
import { verifyJWT } from '@/lib/auth';

/**
 * Public Endpoint: Retrieve all blog posts
 * Supports ?includeAll=true query parameter (requires authentication)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const list = await getArticles();

    if (includeAll) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('auth_session');
      if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
      }
      const user = await verifyJWT(sessionCookie.value);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized: Session invalid' }, { status: 401 });
      }
      return NextResponse.json(list);
    }

    // Filter only published articles for public readers
    const published = list.filter(a => a.status === 'published' || !a.status);
    return NextResponse.json(published);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve blog list: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Protected Endpoint: Create or Update an article
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    const user = await verifyJWT(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid' }, { status: 401 });
    }

    const body = await request.json();
    const article: Partial<Article> = body;

    if (!article.title || !article.slug || !article.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, or content' },
        { status: 400 }
      );
    }

    const articles = await getArticles();

    // 2. Validate Slug Uniqueness
    const slugConflict = articles.some(
      a => a.slug === article.slug && (!article.id || a.id !== article.id)
    );
    if (slugConflict) {
      return NextResponse.json(
        { error: `An article with slug "${article.slug}" already exists. Slugs must be unique.` },
        { status: 400 }
      );
    }

    let updatedArticles: Article[] = [];
    let savedArticle: Article;

    // Check if updating or creating
    if (article.id) {
      // Update
      const index = articles.findIndex(a => a.id === article.id);
      if (index === -1) {
        return NextResponse.json(
          { error: `Article with ID ${article.id} not found.` },
          { status: 404 }
        );
      }
      
      savedArticle = {
        ...articles[index],
        ...article,
        // Keep slug, date, author defaults if not overwritten
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt || articles[index].excerpt,
        categories: article.categories || articles[index].categories,
        readTime: article.readTime || articles[index].readTime,
        takeaways: article.takeaways || articles[index].takeaways,
        content: article.content,
        illustrationType: article.illustrationType || articles[index].illustrationType,
        featured: article.featured !== undefined ? article.featured : articles[index].featured,
        status: article.status || articles[index].status || 'published',
        coverImage: article.coverImage !== undefined ? article.coverImage : articles[index].coverImage,
        updatedAt: new Date().toISOString(),
      } as Article;

      updatedArticles = [...articles];
      updatedArticles[index] = savedArticle;
    } else {
      // Create
      const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
      
      savedArticle = {
        id: newId,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt || '',
        categories: article.categories || ['Engineering'],
        author: article.author || 'Gargeya Sharma',
        authorRole: article.authorRole || 'Founder & Architect',
        authorAvatar: article.authorAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=gargeya',
        date: article.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        readTime: article.readTime || '5 min read',
        takeaways: article.takeaways || [],
        content: article.content,
        illustrationType: article.illustrationType || 'diagram1',
        featured: !!article.featured,
        status: article.status || 'draft',
        coverImage: article.coverImage || '',
        updatedAt: new Date().toISOString(),
      } as Article;

      updatedArticles = [...articles, savedArticle];
    }

    // Handle featured post constraint (only one post can be featured at a time)
    if (savedArticle.featured) {
      updatedArticles = updatedArticles.map(a => 
        a.id === savedArticle.id ? a : { ...a, featured: false }
      );
    }

    await saveArticles(updatedArticles);

    return NextResponse.json({ success: true, article: savedArticle });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to save blog post: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Protected Endpoint: Delete an article
 */
export async function DELETE(request: Request) {
  try {
    // Authenticate Request
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    const user = await verifyJWT(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid' }, { status: 401 });
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
      return NextResponse.json(
        { error: 'Invalid ID parameter value.' },
        { status: 400 }
      );
    }

    const articles = await getArticles();
    const index = articles.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: `Article with ID ${id} not found.` },
        { status: 404 }
      );
    }

    const updatedArticles = articles.filter(a => a.id !== id);

    // If we deleted the featured post, feature the next recent one if available
    if (articles[index].featured && updatedArticles.length > 0) {
      updatedArticles[0].featured = true;
    }

    await saveArticles(updatedArticles);

    return NextResponse.json({ success: true, message: `Article ${id} deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete blog post: ' + error.message },
      { status: 500 }
    );
  }
}
