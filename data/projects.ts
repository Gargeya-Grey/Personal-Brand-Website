export interface Project {
  id: string;
  title: string;
  description: string;
  /** Gradient CSS used when no photo asset is available */
  gradient: string;
  tags: string[];
  link?: string;
  github?: string;
  category: string;
  role?: string;
}

export const projects: Project[] = [
  {
    id: 'edudojo',
    title: 'Edudojo.ai',
    description:
      'Process-based assessment that grades how students think — not just what they submit. Socratic AI check-ins, reasoning diagnostics, and formative insights for real learning.',
    gradient: 'linear-gradient(135deg, #020617 0%, #064e3b 42%, #059669 100%)',
    tags: ['Process Assessment', 'Socratic AI', 'Education', 'NEP 2020'],
    link: 'https://edudojo.ai',
    category: 'Live Venture',
    role: 'Founder & Lead Architect',
  },
  {
    id: 'personal-brand',
    title: 'Engineering Editorial',
    description:
      'This site: a production personal brand system with an AI-assisted editorial CMS, glass design language, and a content pipeline tuned for founder presence.',
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
    tags: ['Next.js 16', 'Tailwind v4', 'OpenRouter', 'CMS'],
    github: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
    category: 'Open Source',
    role: 'Creator',
  },
  {
    id: 'systems-thinking',
    title: 'AI Mentorship',
    description:
      'Consulting and advising for founders and builders shipping AI products — strategy, implementation guidance, and hands-on mentorship when you want a clear next step.',
    gradient: 'linear-gradient(150deg, #0c1929 0%, #0f3d4a 50%, #0d9488 100%)',
    tags: ['Consulting', 'Mentorship', 'AI Strategy'],
    link: '/contact',
    category: 'Advisory',
    role: 'Advisor',
  },
];
