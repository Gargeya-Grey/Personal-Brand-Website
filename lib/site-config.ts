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
  locale: 'en_US',
  twitterHandle: '@gargeyasharma',
  /** Shown on contact page — no city unless you set one */
  locationLabel: 'Remote · Global',
  links: {
    edudojo: 'https://edudojo.ai',
    youtube: 'https://www.youtube.com/@gargeyasharma',
    github: 'https://github.com/Gargeya-Grey',
    twitter: 'https://x.com/gargeyasharma',
    linkedin: 'https://www.linkedin.com/in/gargeya-sharma',
    /** Replace with a permanent invite when ready */
    discord: process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg',
  },
} as const;

export type SiteConfig = typeof siteConfig;
