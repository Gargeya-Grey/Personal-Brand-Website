import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ArticleClient } from '../[slug]/article-client';
import { INTERACTIVE_EXAMPLE } from '@/lib/article-interactive-example';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import type { Article } from '@/lib/blog-service';

export const metadata = { title: 'Interactive article preview', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** Local design/authoring fixture. Never appears in the public journal or sitemap. */
export default function InteractiveArticlePreview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  const article: Article = {
    id: -1,
    slug: 'interactive-preview',
    title: 'Some ideas are better understood by playing with them.',
    excerpt: 'A reading experience with room to explore. Change an assumption, move a slider, and let an abstract idea become something you can see.',
    categories: ['Design', 'Learning'],
    author: siteConfig.name,
    authorRole: '',
    authorAvatar: siteConfig.authorAvatar,
    date: 'September 29, 2026',
    readTime: '4 min read',
    illustrationType: 'cover',
    coverImage: '/covers/interactive-reading.svg',
    status: 'draft',
    takeaways: ['A useful interactive makes the idea easier to understand.', 'Readers choose when to explore, and can reset or stop at any time.', 'The article remains the story. Interaction gives it another dimension.'],
    content: [
      'Reading gives us a way into an idea. Trying it gives us a second. The best explanations make space for both, without asking us to leave the page.',
      '## From a sentence to a feeling',
      '“Small changes add up” is easy to read and easy to forget. Moving a number yourself makes the relationship tangible. Start with the example below and try the smallest change.',
      INTERACTIVE_EXAMPLE,
      '## A model, not a promise',
      'The slider is a mathematical illustration. It assumes the same proportional improvement every day. Learning, work, and life do not progress that neatly, but the model helps us ask better questions.',
      '> Give someone a way to ask “what if?” and the explanation becomes a conversation.',
      '### Make the assumptions visible',
      '| Daily change | Starting value | Days | Multiplier | Assumption |\n| --- | --- | --- | --- | --- |\n| 0% | 1 | 365 | 1.0× | No change |\n| 0.5% | 1 | 365 | 6.2× | Constant compounding |\n| 1% | 1 | 365 | 37.8× | Constant compounding |',
      'A table lets us inspect the same relationship at a glance. On smaller screens, scroll the table or open it in a larger view.',
      '## Keep the reader in control',
      'Start an experiment when you are curious. Reset it when you want a clean slate. Stop it when you want to return to the argument. Each piece should work with a keyboard and fit a phone as naturally as a large screen.',
      '## Leave room for the idea',
      'The important part is still the thought. Typography, navigation, and interaction should help that thought land. They should give you just enough structure to move comfortably, and just enough freedom to follow your curiosity.',
    ].join('\n\n'),
  };
  return <div className="min-h-screen bg-surface text-primary"><Navigation /><main id="page-main" tabIndex={-1} className="pb-24 pt-28 sm:pt-32 lg:pt-36"><ArticleClient article={article} canonicalUrl={absoluteUrl('/journal/interactive-preview')} /></main><Footer /></div>;
}
