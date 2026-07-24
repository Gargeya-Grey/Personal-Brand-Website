import { Metadata } from 'next';
import AboutClient from './about-client';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteConfig.name} — ${siteConfig.authorRole} at Edudojo.ai, building AI for evaluation, assessment, and education.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}
