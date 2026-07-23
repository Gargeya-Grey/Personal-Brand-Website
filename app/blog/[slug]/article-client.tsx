'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  Heart,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as motion from 'motion/react-client';
import { renderMarkdown, slugify } from '@/lib/markdown';
import { renderIllustration } from '@/components/render-illustration';
import { AuthorAvatar } from '@/components/author-avatar';
import { Article } from '@/lib/blog-service';
import { siteConfig } from '@/lib/site-config';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string | undefined | null): HeadingItem[] {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings: HeadingItem[] = [];
  
  lines.forEach((line) => {
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      headings.push({
        id: slugify(text),
        text,
        level: 2
      });
    } else if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      headings.push({
        id: slugify(text),
        text,
        level: 3
      });
    }
  });
  return headings;
}

interface ArticleClientProps {
  article: Article;
}

export function ArticleClient({ article }: ArticleClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setShareUrl(window.location.href);
      try {
        const key = `liked:${article.slug}`;
        setLiked(localStorage.getItem(key) === '1');
      } catch {
        /* ignore storage errors */
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [article.slug]);

  // Parse headings for Table of Contents
  const headings = useMemo(() => extractHeadings(article.content), [article.content]);

  useEffect(() => {
    let frameId = 0;

    const updateScrollState = () => {
      frameId = 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);

      if (headings.length > 0) {
        const scrollPosition = window.scrollY + 160;
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
      }
    };

    const scheduleUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [headings]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
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

  return (
    <div className="relative mx-auto w-full max-w-screen-2xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-10 lg:pb-32 xl:px-12">
      {/* Actual Scroll-Based Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-200/30 dark:bg-white/5 z-50">
        <div 
          className="h-full w-full bg-accent transition-transform duration-75 ease-out origin-left shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-12 relative"
      >
        {/* Subtle background glow for the header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-emerald-500/5 dark:bg-emerald-400/[0.03] blur-[100px] pointer-events-none rounded-full" />

        {/* Top Centered Header Block */}
        <header className="text-center max-w-4xl mx-auto space-y-8 pt-8 pb-4 relative z-10">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {article.categories.map((c) => (
              <span key={c} className="font-label text-xs uppercase tracking-wider font-[520] dark:font-[480] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-400/20 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]">
                {c}
              </span>
            ))}
          </div>
          
          <h1 className="font-display text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-4xl md:text-5xl lg:text-[3.5rem] dark:text-white">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2.5">
              <AuthorAvatar
                src={article.authorAvatar || siteConfig.authorAvatar}
                name={article.author || siteConfig.name}
                size="md"
              />
              <div className="text-left leading-tight">
                <span className="font-label font-[500] text-sm text-slate-800 dark:text-slate-200 block">
                  {article.author || siteConfig.name}
                </span>
                {article.authorRole && (
                  <span className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                    {article.authorRole}
                  </span>
                )}
              </div>
            </div>
            
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/50" />
            
            <span className="flex items-center gap-2 font-body text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 opacity-70" />
              {article.date}
            </span>
            
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/50" />
            
            <span className="flex items-center gap-2 font-body text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 opacity-70" /> 
              {article.readTime}
            </span>
          </div>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200/80 dark:via-white/10 to-transparent w-full mt-10" />
        </header>

        {/* Article Structure Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sticky Sidebar (TOC & Controls) */}
          <aside className="order-2 space-y-8 pt-4 lg:order-1 lg:col-span-3 lg:sticky lg:top-32">
            
            <Link
              href="/blog"
              className="group flex items-center gap-2 font-label font-[520] dark:font-[480] text-xs uppercase tracking-wider text-slate-500 dark:text-white/60 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
              <span>Go back to blog</span>
            </Link>

            {headings.length > 0 && (
              <div className="space-y-4 pl-1">
                <nav aria-label="On this page" className="flex flex-col border-l border-slate-200 dark:border-slate-800">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      aria-current={activeHeadingId === heading.id ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(heading.id);
                        if (element) {
                          const reduceMotion = window.matchMedia(
                            '(prefers-reduced-motion: reduce)'
                          ).matches;
                          element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
                        }
                      }}
                      className={`relative flex items-start gap-3 text-xs transition-colors py-1.5 pl-4 leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-r-md ${
                        activeHeadingId === heading.id
                          ? 'text-emerald-600 dark:text-emerald-400 font-[520] dark:font-[480]'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-[320] dark:font-[300]'
                      } ${heading.level === 3 ? 'ml-3' : ''}`}
                    >
                      {/* Active line indicator overlaying the main border */}
                      <span className={`absolute left-[-1px] top-0 bottom-0 w-[2px] transition-opacity duration-300 ${
                        activeHeadingId === heading.id ? 'opacity-100 bg-emerald-500' : 'opacity-0'
                      }`} />
                      <span>{heading.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Share Control Box */}
            <div className="board-card flex max-w-max items-center justify-start gap-1 rounded-full px-2 py-1 font-label text-xs text-slate-500">
              <span className="font-semibold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Share</span>
              <span className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700/50" />
              
              <button 
                type="button"
                onClick={handleLikeToggle}
                aria-label={liked ? 'Remove bookmark' : 'Save for later'}
                aria-pressed={liked}
                title={liked ? 'Saved on this device' : 'Save on this device'}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-90 dark:hover:text-emerald-400"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-emerald-500 text-emerald-500" : ""}`} />
              </button>
              
              <button 
                type="button"
                onClick={handleCopyLink}
                aria-label="Copy URL"
                title="Copy URL"
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-90 dark:hover:text-white"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl || '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on X (Twitter)"
                title="Share on X"
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-90 dark:hover:text-white"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl || '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-90 dark:hover:text-white"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>

          </aside>

          {/* Right Main Content Area */}
          <div className="order-1 space-y-10 lg:order-2 lg:col-span-9">
            {/* Cover image or illustration */}
            {article.illustrationType === 'cover' && article.coverImage ? (
              <div className="rounded-3xl overflow-hidden border border-emerald-500/20 dark:border-white/10 shadow-sm relative aspect-video w-full bg-slate-100 dark:bg-slate-900">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 72vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-slate-900">
                {renderIllustration(article.illustrationType === 'cover' ? 'diagram1' : article.illustrationType, true)}
              </div>
            )}

            {/* Key Takeaways */}
            {article.takeaways && article.takeaways.length > 0 && (
              <div className="board-card relative mb-8 overflow-hidden rounded-2xl border-l-4 border-l-accent p-6">

                <div className="flex items-center gap-2.5 mb-5 relative z-10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <h3 className="font-headline font-[520] dark:font-[480] text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Key Takeaways
                  </h3>
                </div>

                <div className="relative">
                  <ul className="space-y-4 relative z-10">
                    {article.takeaways.map((point, index) => (
                      <li key={index} className="relative grid grid-cols-[1.25rem_1fr] gap-4 items-start group">
                        {/* Connecting line to next item */}
                        {index < article.takeaways.length - 1 && (
                          <div className="absolute left-[10px] -translate-x-1/2 top-[25px] -bottom-[13px] pointer-events-none z-0">
                            <div className="h-full w-px border-l border-dashed border-slate-300 dark:border-white/10" />
                          </div>
                        )}
                        <div className="w-5 h-5 mt-[1px] rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-400/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm z-10 transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/40 dark:group-hover:border-emerald-400/40">
                          <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                        </div>
                        <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-300 font-body tracking-[0.015em] font-[320] dark:font-[300]">
                          {point}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Article Content Render */}
            <div className="pt-4">
              {renderMarkdown(article.content)}
            </div>

            {/* Footer recommendation */}
            <div className="board-card group relative mt-16 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl p-8 sm:flex-row">
              <div className="space-y-2 text-center sm:text-left relative z-10">
                <p className="font-headline font-[520] dark:font-[480] text-lg text-slate-900 dark:text-white">Finished reading?</p>
                <p className="text-xs text-slate-500 dark:text-white/60 font-body">Connect with Gargeya Sharma on digital strategy and autonomous pipelines.</p>
              </div>
              <Link 
                href="/blog"
                className="relative z-10 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 text-white font-headline font-[520] dark:font-[480] text-xs h-11 px-6 rounded-full tracking-tight transition-all motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap"
              >
                All Broadcast Articles
              </Link>
            </div>

          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
