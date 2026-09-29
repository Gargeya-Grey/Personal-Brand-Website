// Homepage teasers only. Published titles, excerpts, and article URLs stay in the CMS.
// For future stories, add a short headline and one sentence that adds context rather
// than repeating it. Unlisted stories use their published copy; never truncate it.
const previews: Record<string, { title: string; excerpt: string }> = {
  'gpt-sol-frontier-best-deal': {
    title: 'GPT-5.6 Sol: more intelligence, lower cost',
    excerpt: 'A closer look at pricing, token use, and what they mean when choosing a model.',
  },
  'why-short-video-erodes-cognition': {
    title: 'What short-form video asks of our attention',
    excerpt: 'Examining the research on heavy viewing, cognitive control, and the capacity to learn over time.',
  },
  'cursor-origin-git-forge-for-agents': {
    title: 'Cursor Origin: a home for coding agents',
    excerpt: 'How editing code, opening pull requests, and reviewing changes come together inside the editor.',
  },
};

export function getHomeJournalPreview(article: { slug: string; title: string; excerpt: string }) {
  return Object.hasOwn(previews, article.slug)
    ? previews[article.slug]
    : { title: article.title, excerpt: article.excerpt };
}
