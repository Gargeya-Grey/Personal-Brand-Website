'use client';

import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 24,
  md: 36,
  lg: 48,
};

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

/**
 * Small byline avatar next to the author name.
 * Uses a local profile photo by default so Google cookie-stripped avatars never break the UI.
 */
export function AuthorAvatar({
  src,
  name = siteConfig.name,
  size = 'md',
  className = '',
}: {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}) {
  const fallback = siteConfig.authorAvatar;
  const [imgSrc, setImgSrc] = useState(() => {
    if (src && src.trim() && !src.includes('dicebear.com')) return src.trim();
    return fallback;
  });
  const [failed, setFailed] = useState(false);
  const px = SIZE_PX[size];

  if (failed) {
    const initials = name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <div
        className={`${SIZE_CLASS[size]} shrink-0 rounded-full border border-slate-200 dark:border-white/10 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-headline font-bold text-[0.65rem] ${className}`}
        aria-hidden
      >
        {initials || 'GS'}
      </div>
    );
  }

  return (
    <div
      className={`${SIZE_CLASS[size]} shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative bg-slate-100 dark:bg-slate-800 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt=""
        width={px}
        height={px}
        className="h-full w-full object-cover object-top"
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}
