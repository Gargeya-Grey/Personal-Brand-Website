'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Check,
  Copy,
  Heart,
  List,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as motion from 'motion/react-client';
import { renderMarkdown, slugify } from '@/lib/markdown';
import { ExpandableFrame } from '@/components/article-expandable';
import { renderIllustration } from '@/components/render-illustration';
import { AuthorAvatar } from '@/components/author-avatar';
import { Article } from '@/lib/blog-service';
import { siteConfig } from '@/lib/site-config';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export type RelatedArticleCard = {
  slug: string;
  title: string;
  readTime: string;
};

function extractHeadings(markdown: string | undefined | null): HeadingItem[] {
  if (!markdown) return [];
  const headings: HeadingItem[] = [];
  markdown.split('\n').forEach((line) => {
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      headings.push({ id: slugify(text), text, level: 2 });
    } else if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      headings.push({ id: slugify(text), text, level: 3 });
    }
  });
  return headings;
}

function minutesFromReadTime(readTime: string): number {
  const n = parseInt(readTime, 10);
  return Number.isFinite(n) && n > 0 ? n : 6;
}

function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

interface ArticleClientProps {
  article: Article;
  related?: RelatedArticleCard[];
}

export function ArticleClient({ article, related = [] }: ArticleClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setShareUrl(window.location.href);
      try {
        setLiked(localStorage.getItem(`liked:${article.slug}`) === '1');
      } catch {
        /* ignore */
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [article.slug]);

  const headings = useMemo(() => extractHeadings(article.content), [article.content]);
  const totalMinutes = minutesFromReadTime(article.readTime);
  const remainingMinutes = Math.max(1, Math.ceil(totalMinutes * (1 - scrollProgress / 100)));
  const activeHeading = headings.find((h) => h.id === activeHeadingId) ?? headings[0];

  useEffect(() => {
    let frameId = 0;

    const updateScrollState = () => {
      frameId = 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);

      if (headings.length === 0) return;
      const scrollPosition = window.scrollY + 180;
      let currentActiveId = headings[0].id;

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        currentActiveId = headings[headings.length - 1].id;
      } else {
        for (const heading of headings) {
          const element = document.getElementById(heading.id);
          if (element && scrollPosition >= element.offsetTop) {
            currentActiveId = heading.id;
          } else if (element) {
            break;
          }
        }
      }
      setActiveHeadingId(currentActiveId);
    };

    const scheduleUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [headings]);

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch((err) => console.error('Failed to copy link:', err));
  };

  const handleLikeToggle = () => {
    const next = !liked;
    setLiked(next);
    try {
      const key = `liked:${article.slug}`;
      if (next) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };

  const shareClass =
    'flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full active:scale-[0.97]';

  const renderToc = () =>
    headings.map((heading) => (
      <a
        key={heading.id}
        href={`#${heading.id}`}
        title={heading.text}
        aria-current={activeHeadingId === heading.id ? 'location' : undefined}
        onClick={(e) => {
          e.preventDefault();
          scrollToId(heading.id);
        }}
        className={`article-toc-link relative flex min-w-0 items-start py-[0.4rem] pl-3.5 pr-2 text-[12px] font-normal leading-[1.35] tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          heading.level === 3 ? 'pl-5' : ''
        } ${
          activeHeadingId === heading.id
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <span
          className={`absolute left-[-1px] top-1 bottom-1 w-[2px] rounded-full ${
            activeHeadingId === heading.id ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-transparent'
          }`}
        />
        <span className="min-w-0 text-pretty">{heading.text}</span>
      </a>
    ));

  const shareCluster = (
    <div className="flex items-center justify-center gap-0.5">
      <button type="button" onClick={handleLikeToggle} aria-label={liked ? 'Remove bookmark' : 'Save for later'} aria-pressed={liked} className={shareClass}>
        <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-emerald-500 text-emerald-500' : ''}`} />
      </button>
      <button type="button" onClick={handleCopyLink} aria-label="Copy URL" className={shareClass}>
        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl || '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={shareClass}
      >
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl || '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={shareClass}
      >
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-[50.4rem] px-4 pb-24 sm:px-6">
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-slate-200/80 dark:bg-white/10">
        <div
          className="h-full origin-left bg-emerald-600 dark:bg-emerald-400 transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <header className="mx-auto w-full pt-4 text-center">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {article.categories.map((c) => (
              <span
                key={c}
                className="font-label text-[0.65rem] uppercase tracking-[0.14em] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-400/20"
              >
                {c}
              </span>
            ))}
          </div>

          <h1 className="mb-8 font-display text-3xl font-medium leading-[1.12] tracking-[-0.025em] text-slate-800 sm:text-4xl md:text-[2.75rem] dark:text-slate-50">
            {article.title}
          </h1>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <AuthorAvatar
                src={article.authorAvatar || siteConfig.authorAvatar}
                name={article.author || siteConfig.name}
                size="md"
              />
              <div className="text-left leading-tight">
                <span className="font-label font-medium text-sm text-slate-700 dark:text-slate-200 block">
                  {article.author || siteConfig.name}
                </span>
                {article.authorRole && (
                  <span className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                    {article.authorRole}
                  </span>
                )}
              </div>
            </div>
            <span className="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
            <span className="flex items-center gap-1.5 font-body text-sm">
              <Calendar className="h-3.5 w-3.5 opacity-70" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5 font-body text-sm">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              {article.readTime}
            </span>
            <span className="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
            {shareCluster}
          </div>
        </header>

        <div className="relative">
          <aside className="article-toc absolute top-0 bottom-0 right-full mr-6 hidden w-[18.5rem] max-w-[18.5rem] border-l border-slate-200/70 xl:block dark:border-white/10">
            <div className="sticky top-28 space-y-8 pl-0">
            <Link
              href="/blog"
              className="group flex items-center gap-2 pl-3.5 font-label text-[0.7rem] uppercase tracking-[0.14em] text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Essays
            </Link>

            {headings.length > 0 && (
              <nav aria-label="On this page" className="flex flex-col">
                {renderToc()}
              </nav>
            )}
            </div>
          </aside>

          <div className="min-w-0 pb-16 lg:pb-8 xl:pl-8">
            <Link
              href="/blog"
              className="group mb-6 inline-flex items-center gap-2 font-label text-[0.7rem] uppercase tracking-[0.14em] text-slate-500 hover:text-emerald-700 dark:text-slate-400 xl:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Essays
            </Link>

            {article.illustrationType === 'cover' && article.coverImage ? (
              <ExpandableFrame label="Cover">
                <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50.4rem"
                    className="object-cover"
                  />
                </figure>
              </ExpandableFrame>
            ) : (
              <ExpandableFrame label="Figure">
                <div className="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900">
                  {renderIllustration(
                    article.illustrationType === 'cover' ? 'diagram1' : article.illustrationType,
                    true
                  )}
                </div>
              </ExpandableFrame>
            )}

            {headings.length > 0 && (
              <details className="mb-7 mt-6 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] xl:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-2 font-label text-[0.7rem] uppercase tracking-[0.14em] text-slate-500">
                  <List className="h-3.5 w-3.5" />
                  On this page
                </summary>
                <nav aria-label="On this page" className="mt-3 flex flex-col border-l border-slate-200 dark:border-slate-800">
                  {renderToc()}
                </nav>
              </details>
            )}

            {article.takeaways && article.takeaways.length > 0 && (
              <aside className="mt-10 border-l-2 border-emerald-500/45 pl-5 dark:border-emerald-400/40">
                <p className="mb-3 font-label text-[0.7rem] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  In brief
                </p>
                <ol className="space-y-3.5">
                  {article.takeaways.map((point, index) => (
                    <li key={index} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-3">
                      <span className="font-label text-[0.9375rem] leading-[1.75] tabular-nums text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="font-body text-[0.9375rem] leading-[1.75] tracking-normal text-left text-slate-700 dark:text-slate-300">
                        {point}
                      </p>
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            <div className="article-prose mt-14">{renderMarkdown(article.content, { pageTitle: article.title })}</div>

            <section className="mt-4 border-t border-slate-200/70 pt-12 dark:border-white/10">
              <p className="font-label text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
                Continue
              </p>
              {related.length > 0 ? (
                <ul className="mt-2 divide-y divide-slate-200/80 dark:divide-white/10">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/blog/${item.slug}`}
                        className="block py-4 text-slate-800 hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-400"
                      >
                        <span className="font-headline text-lg font-medium">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                          {item.readTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Link
                  href="/blog"
                  className="mt-3 inline-block font-headline text-lg font-medium text-slate-800 hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-400"
                >
                  All essays
                </Link>
              )}
            </section>
          </div>
        </div>
      </motion.div>

      {activeHeading && scrollProgress > 8 && scrollProgress < 97 && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[min(92vw,22rem)] -translate-x-1/2 lg:hidden">
          <div className="flex items-center justify-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-center text-xs shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
            <span className="line-clamp-1 font-medium text-slate-700 dark:text-slate-200">
              {activeHeading.text}
            </span>
            <span className="shrink-0 text-slate-400">· {remainingMinutes} min</span>
          </div>
        </div>
      )}
    </div>
  );
}
