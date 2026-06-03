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
          className="h-full bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-12"
      >
        {/* Top Centered Header Block */}
        <header className="text-center max-w-4xl mx-auto space-y-6 pt-8">
          <div className="flex justify-center gap-2">
            {article.categories.map((c) => (
              <span key={c} className="font-label text-xs uppercase tracking-wider font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                {c}
              </span>
            ))}
          </div>
          
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-label text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/20 dark:border-white/10 relative bg-slate-100 dark:bg-slate-800">
                <img src={article.authorAvatar} alt={article.author} className="object-cover w-full h-full" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white/80">{article.author}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{article.date}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-white/5 border border-emerald-500/10 dark:border-white/10 px-3 py-1 rounded-full text-emerald-600 dark:text-[#10B981] font-semibold text-xs">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
          </div>

          <div className="h-[1px] bg-slate-200/80 dark:bg-white/10 w-full mt-8" />
        </header>

        {/* Article Structure Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sticky Sidebar (TOC & Controls) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-32 space-y-8 order-1 pt-4">
            
            <Link
              href="/blog"
              className="group flex items-center gap-2 font-label font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-white/60 hover:text-emerald-600 dark:hover:text-[#10B981] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
              <span>Go back to blog</span>
            </Link>

            {headings.length > 0 && (
              <div className="space-y-4">
                <nav className="space-y-2.5">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(heading.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`flex items-start gap-2.5 text-xs transition-all duration-300 py-1 leading-normal ${
                        activeHeadingId === heading.id
                          ? 'text-accent font-semibold'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'
                      } ${heading.level === 3 ? 'ml-3' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 transition-colors ${
                        activeHeadingId === heading.id ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'
                      }`} />
                      <span>{heading.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Share Control Box */}
            <div className="flex items-center justify-start gap-3.5 p-3.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm text-xs font-label text-slate-500 max-w-max">
              <span className="font-semibold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Share</span>
              <span className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800" />
              
              <button 
                onClick={handleLikeToggle}
                title="Like Post"
                className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-emerald-500 text-emerald-500" : ""}`} />
              </button>
              
              <button 
                onClick={handleCopyLink}
                title="Copy URL"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                target="_blank" 
                rel="noopener noreferrer"
                title="Share on X"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                title="Share on LinkedIn"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
            {article.coverImage ? (
              <div className="rounded-3xl overflow-hidden border border-emerald-500/20 dark:border-white/10 shadow-sm relative aspect-video w-full bg-slate-100 dark:bg-slate-900">
                <img src={article.coverImage} alt={article.title} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden border border-emerald-500/20 dark:border-white/10 shadow-sm relative bg-slate-50 dark:bg-white/[0.01]">
                {renderIllustration(article.illustrationType, true)}
              </div>
            )}

            {/* Key Takeaways Box */}
            {article.takeaways && article.takeaways.length > 0 && (
              <div className="bg-sky-500/[0.04] dark:bg-sky-500/[0.02] border-l-4 border-sky-400 p-8 sm:p-10 rounded-2xl rounded-l-none space-y-5">
                <h3 className="font-headline font-bold text-sky-950 dark:text-sky-300 text-lg tracking-tight">
                  Key Takeaways
                </h3>
                <ul className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-white/70 leading-relaxed font-body">
                  {article.takeaways.map((point, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2.5" />
                      <p>{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Content Render */}
            <div className="pt-4">
              {renderMarkdown(article.content)}
            </div>

            {/* Footer recommendation */}
            <div className="border-t border-emerald-500/20 dark:border-white/10 pt-12 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/10 p-8 rounded-3xl shadow-sm">
              <div className="space-y-2 text-left">
                <p className="font-headline font-bold text-lg text-slate-900 dark:text-white">Finished reading?</p>
                <p className="text-xs text-slate-500 dark:text-white/60 font-body">Connect with Gargeya Sharma on digital strategy and autonomous pipelines.</p>
              </div>
              <Link 
                href="/blog"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-xs h-11 px-6 rounded-full tracking-tight transition-all active:scale-95 shadow-md shadow-emerald-600/10 whitespace-nowrap"
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
