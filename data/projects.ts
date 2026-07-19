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
      'AI-native platform rethinking evaluation, assessment, and continuous capability building in education — from zero-to-one architecture through production intelligence loops.',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #065F46 45%, #10B981 100%)',
    tags: ['Next.js', 'TypeScript', 'AI/LLMs', 'Education'],
    link: 'https://edudojo.ai',
    category: 'Live Venture',
    role: 'Founder & Lead Architect',
  },
  {
    id: 'personal-brand',
    title: 'Engineering Editorial',
    description:
      'This site: a production personal brand system with an AI-assisted editorial CMS, glass design language, and a content pipeline tuned for founder presence.',
    gradient: 'linear-gradient(135deg, #111827 0%, #1F2938 50%, #10B981 120%)',
    tags: ['Next.js 16', 'Tailwind v4', 'OpenRouter', 'CMS'],
    github: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
    category: 'Open Source',
    role: 'Creator',
  },
  {
    id: 'systems-thinking',
    title: 'Systems Mentorship',
    description:
      'High-signal coaching for engineers and builders who want mechanical sympathy — architecture reviews, AI implementation strategy, and craft elevation toward top-tier standards.',
    gradient: 'linear-gradient(145deg, #0E1626 0%, #134E4A 55%, #34D399 100%)',
    tags: ['Architecture', 'Mentorship', 'AI Strategy'],
    link: '/contact',
    category: 'Advisory',
    role: 'Mentor & Strategist',
  },
];
