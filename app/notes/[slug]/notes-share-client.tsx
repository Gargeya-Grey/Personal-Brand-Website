'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.259 5.672L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function NotesShareRail({ title, compact = false }: { title: string; compact?: boolean }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setShareUrl(window.location.href);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const handleCopy = () => {
    const url = shareUrl || window.location.href;
    void navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  };

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl || '')}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl || '')}`;

  if (compact) {
    const btn =
      'flex h-9 w-9 items-center justify-center rounded-full border border-slate-900/[0.1] bg-white text-slate-500 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.97] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-accent';
    return (
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={handleCopy} aria-label="Copy link" className={btn}>
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
        </button>
        <a href={xHref} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={btn}>
          <XIcon className="h-3.5 w-3.5" />
        </a>
        <a href={liHref} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={btn}>
          <LinkedInIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  const row =
    'group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-900/[0.08] bg-white px-4 py-3 font-headline text-sm font-semibold text-primary transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-white/[0.03] dark:text-white';
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={handleCopy} className={row}>
        <span className="flex items-center gap-2.5">
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4 text-on-surface-variant" />}
          {copied ? 'Link copied' : 'Copy link'}
        </span>
        <ArrowUpRight className="h-4 w-4 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
      </button>
      <a href={xHref} target="_blank" rel="noopener noreferrer" className={row}>
        <span className="flex items-center gap-2.5">
          <XIcon className="h-4 w-4 text-on-surface-variant" />
          Share on X
        </span>
        <ArrowUpRight className="h-4 w-4 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
      </a>
      <a href={liHref} target="_blank" rel="noopener noreferrer" className={row}>
        <span className="flex items-center gap-2.5">
          <LinkedInIcon className="h-4 w-4 text-on-surface-variant" />
          Share on LinkedIn
        </span>
        <ArrowUpRight className="h-4 w-4 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
      </a>
    </div>
  );
}
