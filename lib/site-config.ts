/**
 * Single source of truth for brand URLs, contact, and social presence.
 * Update these when profiles or product links change.
 */
export const siteConfig = {
  name: 'Gargeya Sharma',
  shortName: 'GS',
  title: 'Gargeya Sharma | The Engineering Editorial',
  description:
    'Architecting the next generation of intelligent systems. Founder @ Edudojo.ai — AI for evaluation, assessment, and education.',
  url: process.env.APP_URL || 'https://sgargeya.com',
  /** Public-facing brand email (mailto + contact page) */
  email: 'contact@sgargeya.com',
  /** Compact headshot for blog bylines (local public asset — always loads) */
  authorAvatar: '/profile.webp',
  authorRole: 'Founder & Architect',
  locale: 'en_US',
  twitterHandle: '@GargeyaS',
  /** Shown on contact page — no city unless you set one */
  locationLabel: 'Remote · Global',
  keywords: [
    'Gargeya Sharma',
    'Gargeya',
    'Edudojo',
    'Edudojo.ai',
    'AI Education',
    'Founder & Architect',
    'Systems Architecture',
    'Soft Minimalism',
    'Building in Public',
  ],
  links: {
    edudojo: 'https://edudojo.ai',
    cv: 'https://cv.sgargeya.com',
    youtube: 'https://www.youtube.com/@GargeyaS',
    github: 'https://github.com/Gargeya-Grey',
    twitter: 'https://x.com/GargeyaS',
    linkedin: 'https://www.linkedin.com/in/gargeya-sharma',
    /** Replace with a permanent invite when ready */
    discord: process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg',
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Apex origin with no trailing slash — always prefer sgargeya.com. */
export function getSiteOrigin(): string {
  return String(siteConfig.url || 'https://sgargeya.com').replace(/\/$/, '');
}

/** Absolute URL for a site path or absolute asset. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = getSiteOrigin();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}
