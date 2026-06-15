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
import * as motion from 'motion/react-client';
import { renderMarkdown, slugify } from '@/lib/markdown';
import { renderIllustration } from '@/components/render-illustration';
import { Article } from '@/lib/blog-service';

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
  const [likeCount, setLikeCount] = useState(24);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  // Parse headings for Table of Contents
  const headings = useMemo(() => extractHeadings(article.content), [article.content]);

  // Handle actual scroll progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // TOC scroll spy: track which heading is currently in viewport
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 160; // Offset for sticky headers
      
      // If we are at the bottom of the page, activate the last heading
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveHeadingId(headings[headings.length - 1].id);
        return;
      }

      let currentActiveId = headings[0].id;
      for (let i = 0; i < headings.length; i++) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            currentActiveId = headings[i].id;
          } else {
            break; // Stop checking when headers go below active view line
          }
        }
      }
      setActiveHeadingId(currentActiveId);
    };

    window.addEventListener('scroll', handleScrollSpy);
    // Initial check
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
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
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  return (
    <div className="px-6 md:px-12 max-w-screen-2xl mx-auto w-full relative pb-32">
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
          <div className="flex justify-center gap-3">
            {article.categories.map((c) => (
              <span key={c} className="font-label text-xs uppercase tracking-wider font-[520] dark:font-[480] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-400/20 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]">
                {c}
              </span>
            ))}
          </div>
          
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-[700] dark:font-[700] bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 leading-[1.1] tracking-[-0.02em]">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative bg-slate-100 dark:bg-slate-800">
                <img src={article.authorAvatar} alt={article.author} className="object-cover w-full h-full" />
              </div>
              <span className="font-label font-[500] text-sm text-slate-800 dark:text-slate-200">{article.author}</span>
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
          <aside className="lg:col-span-3 lg:sticky lg:top-32 space-y-8 order-1 pt-4">
            
            <Link
              href="/blog"
              className="group flex items-center gap-2 font-label font-[520] dark:font-[480] text-xs uppercase tracking-wider text-slate-500 dark:text-white/60 hover:text-emerald-600 dark:hover:text-[#10B981] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
              <span>Go back to blog</span>
            </Link>

            {headings.length > 0 && (
              <div className="space-y-4 pl-1">
                <nav className="flex flex-col border-l border-slate-200 dark:border-slate-800">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      aria-current={activeHeadingId === heading.id ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(heading.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
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
            <div className="flex items-center justify-start gap-3 px-4 py-2 bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200/80 dark:border-white/10 rounded-full shadow-sm text-xs font-label text-slate-500 max-w-max transition-all">
              <span className="font-semibold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Share</span>
              <span className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700/50" />
              
              <button 
                onClick={handleLikeToggle}
                aria-label="Like Post"
                title="Like Post"
                className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full p-1 motion-safe:active:scale-90"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-emerald-500 text-emerald-500" : ""}`} />
              </button>
              
              <button 
                onClick={handleCopyLink}
                aria-label="Copy URL"
                title="Copy URL"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full p-1 motion-safe:active:scale-90"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on X (Twitter)"
                title="Share on X"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full p-1 motion-safe:active:scale-90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full p-1 motion-safe:active:scale-90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>

          </aside>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 space-y-10 order-2">
            {/* Cover image or illustration */}
            {article.illustrationType === 'cover' && article.coverImage ? (
              <div className="rounded-3xl overflow-hidden border border-emerald-500/20 dark:border-white/10 shadow-sm relative aspect-video w-full bg-slate-100 dark:bg-slate-900">
                <img src={article.coverImage} alt={article.title} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden border border-emerald-500/20 dark:border-white/10 shadow-sm relative bg-slate-50 dark:bg-white/[0.01]">
                {renderIllustration(article.illustrationType === 'cover' ? 'diagram1' : article.illustrationType, true)}
              </div>
            )}

            {/* Key Takeaways */}
            {article.takeaways && article.takeaways.length > 0 && (
              <div className="relative overflow-hidden mb-8 p-6 bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-[2px] border border-slate-200/80 dark:border-white/5 border-l-4 border-l-emerald-500 dark:border-l-emerald-400/80 rounded-2xl shadow-sm transition-all duration-300 hover:border-emerald-500/20 dark:hover:border-emerald-400/20">
                {/* Decorative top-right gradient glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-400/[0.04] dark:to-transparent rounded-full blur-2xl pointer-events-none" />

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
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/10 p-8 rounded-3xl shadow-sm shadow-emerald-900/5 dark:shadow-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
