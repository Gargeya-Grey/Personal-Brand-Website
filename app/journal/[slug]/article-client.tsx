'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Bookmark, Check, ChevronDown, Clock, Copy, List, Type } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { renderMarkdown } from '@/lib/markdown';
import { extractArticleHeadings } from '@/lib/article-markdown';
import { ExpandableFrame } from '@/components/article-expandable';
import { renderIllustration } from '@/components/render-illustration';
import { AuthorAvatar } from '@/components/author-avatar';
import type { Article } from '@/lib/blog-service';
import { siteConfig } from '@/lib/site-config';
import './article-reader.css';

export type RelatedArticleCard = { slug: string; title: string; readTime: string };

function CoverImage({ src, title, expanded = false }: { src: string; title: string; expanded?: boolean }) {
  return (
    <figure className="reader-cover-image">
      <Image
        src={src}
        alt={title}
        fill
        preload={!expanded}
        loading={expanded ? 'eager' : undefined}
        sizes={expanded
          ? '(max-width: 600px) calc(100vw - 50px), (max-width: 1232px) calc(100vw - 74px), 1158px'
          : '(max-width: 767px) calc(100vw - 40px), (max-width: 879px) calc(100vw - 80px), (max-width: 1199px) 800px, 720px'}
        className="object-contain"
      />
    </figure>
  );
}

export function ArticleClient({ article, canonicalUrl, related = [] }: { article: Article; canonicalUrl: string; related?: RelatedArticleCard[] }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [liked, setLiked] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const readingRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headings = useMemo(() => extractArticleHeadings(article.content), [article.content]);
  const content = useMemo(() => renderMarkdown(article.content, { pageTitle: article.title }), [article.content, article.title]);
  const parsedMinutes = parseInt(article.readTime, 10);
  const totalMinutes = Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : 6;
  const remainingMinutes = Math.max(0, Math.ceil(totalMinutes * (1 - scrollProgress / 100)));
  const activeHeading = headings.find((heading) => heading.id === activeHeadingId);
  const shareUrl = canonicalUrl;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        setLiked(localStorage.getItem(`liked:${article.slug}`) === '1');
        setLargeText(localStorage.getItem('article:large-text') === '1');
      } catch { /* Reading remains available when storage is disabled. */ }
    });
    return () => {
      cancelAnimationFrame(frameId);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [article.slug]);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const body = readingRef.current;
      if (!body) return;
      const bounds = body.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - window.innerHeight + 160);
      setScrollProgress(Math.min(100, Math.max(0, (140 - bounds.top) / distance * 100)));
      let active = '';
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 190) active = heading.id;
      }
      setActiveHeadingId(active);
    };
    const schedule = () => { if (!frameId) frameId = requestAnimationFrame(update); };
    const resizeObserver = new ResizeObserver(schedule);
    if (readingRef.current) resizeObserver.observe(readingRef.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [headings]);

  useEffect(() => {
    const nav = railRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !current) return;
    const item = current.getBoundingClientRect();
    const viewport = nav.getBoundingClientRect();
    if (item.top < viewport.top || item.bottom > viewport.bottom) {
      nav.scrollTop += item.top - viewport.top - nav.clientHeight / 3;
    }
  }, [activeHeadingId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('Link copied');
    } catch {
      setCopyStatus('Copy the address from your browser');
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus(''), 2500);
  };

  const toggleBookmark = () => {
    const next = !liked;
    setLiked(next);
    try {
      if (next) localStorage.setItem(`liked:${article.slug}`, '1');
      else localStorage.removeItem(`liked:${article.slug}`);
    } catch { /* The current visit still reflects the choice. */ }
  };

  const toggleTextSize = () => {
    const next = !largeText;
    setLargeText(next);
    try { localStorage.setItem('article:large-text', next ? '1' : '0'); } catch { /* optional preference */ }
  };

  const contents = () => headings.map((heading) => (
    <a
      key={heading.id}
      href={`#${heading.id}`}
      className="reader-toc-link"
      data-level={heading.level}
      aria-current={activeHeadingId === heading.id ? 'location' : undefined}
      onClick={(event) => {
        const details = event.currentTarget.closest('details');
        if (details) details.open = false;
      }}
    >{heading.text}</a>
  ));

  return (
    <article className="article-reader" data-large-text={largeText} aria-labelledby="article-title">
      <div className="reader-progress" aria-hidden="true"><div style={{ transform: `scaleX(${scrollProgress / 100})` }} /></div>
      <header className="reader-header" id="article-top">
        <div className="reader-breadcrumb">
          <Link href="/journal"><ArrowLeft size={15} aria-hidden="true" /> All essays</Link>
          <span>{article.categories.join(' / ')}</span>
        </div>
        <h1 id="article-title" className="article-title">{article.title}</h1>
        {article.excerpt && <p className="reader-dek">{article.excerpt}</p>}
        <div className="reader-byline">
          <div className="reader-author">
            <AuthorAvatar src={article.authorAvatar || siteConfig.authorAvatar} name={article.author || siteConfig.name} size="md" />
            <div><span>{article.author || siteConfig.name}</span><span>{article.date} <span aria-hidden="true">·</span> {article.readTime}</span></div>
          </div>
          <div className="reader-actions" aria-label="Article tools">
            <button type="button" onClick={toggleTextSize} aria-label="Larger reading text" aria-pressed={largeText} title="Larger reading text"><Type size={18} /></button>
            <button type="button" onClick={toggleBookmark} aria-label={liked ? 'Remove bookmark' : 'Bookmark on this device'} aria-pressed={liked} title={liked ? 'Bookmarked on this device' : 'Bookmark on this device'}><Bookmark size={17} fill={liked ? 'currentColor' : 'none'} /></button>
            <button type="button" onClick={() => void handleCopyLink()} aria-label="Copy article link" title="Copy article link">{copyStatus === 'Link copied' ? <Check size={17} /> : <Copy size={17} />}</button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X">𝕏</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn"><span className="reader-linkedin">in</span></a>
            <span className="reader-copy-status" role="status">{copyStatus}</span>
          </div>
        </div>
      </header>
      <div className="reader-opening" data-has-brief={article.takeaways?.length > 0}>
        <div className="reader-cover">
          {article.illustrationType === 'cover' && article.coverImage ? (
            <ExpandableFrame
              label="Cover image"
              expandText="View full image"
              expandedContent={<CoverImage src={article.coverImage} title={article.title} expanded />}
            >
              <CoverImage src={article.coverImage} title={article.title} />
            </ExpandableFrame>
          ) : (
            <div className="reader-cover-illustration">{renderIllustration(article.illustrationType === 'cover' ? 'diagram1' : article.illustrationType, true)}</div>
          )}
        </div>
        {article.takeaways?.length > 0 && (
          <aside className="reader-brief" aria-labelledby="reader-brief-title">
            <h2 id="reader-brief-title">The short version</h2>
            <ul>{article.takeaways.map((point, index) => <li key={index}>{point}</li>)}</ul>
          </aside>
        )}
      </div>
      <div className="reader-layout">
        <aside className="reader-rail" aria-label="Reading navigation">
          <div className="reader-rail-inner">
            <div className="reader-rail-label"><List size={15} aria-hidden="true" /> In this essay</div>
            {headings.length > 0 && <nav ref={railRef} className="reader-toc" aria-label="On this page">{contents()}</nav>}
            <div className="reader-remaining">
              <div><Clock size={14} aria-hidden="true" /><span>{remainingMinutes > 0 ? `${remainingMinutes} min remaining` : 'You’ve reached the end'}</span></div>
              <div className="reader-rail-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress / 100})` }} /></div>
              <a href="#article-top"><ArrowUp size={13} aria-hidden="true" /> Back to top</a>
            </div>
          </div>
        </aside>
        <div className="reader-main">
          {headings.length > 0 && (
            <details className="reader-mobile-toc">
              <summary><List size={16} aria-hidden="true" /><span>{activeHeading?.text || 'In this essay'}</span><ChevronDown size={16} aria-hidden="true" /></summary>
              <nav aria-label="On this page">{contents()}</nav>
            </details>
          )}
          <div ref={readingRef} className="reader-body">
            <div className="article-prose reader-prose">{content}</div>
          </div>
          <div className="reader-endnote"><span aria-hidden="true">✳</span><p>Thanks for reading.</p><button type="button" onClick={() => void handleCopyLink()}><Copy size={14} aria-hidden="true" /> Share this essay</button></div>
          <section className="reader-next" aria-labelledby="reader-next-title">
            <div className="reader-next-header"><h2 id="reader-next-title">Keep exploring</h2><Link href="/journal">All essays <ArrowRight size={15} aria-hidden="true" /></Link></div>
            {related.length > 0 && <ul>{related.map((item) => (
              <li key={item.slug}><Link href={`/journal/${item.slug}`}><div><span>{item.readTime}</span><h3>{item.title}</h3></div><ArrowRight size={20} aria-hidden="true" /></Link></li>
            ))}</ul>}
          </section>
        </div>
      </div>
    </article>
  );
}
