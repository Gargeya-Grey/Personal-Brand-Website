import { Metadata } from 'next';
import AboutClient from './about-client';
import { clampMetaDescription } from '@/lib/meta';

export const metadata: Metadata = {
  title: { absolute: 'About Gargeya Sharma | Founder & Architect' },
  description: clampMetaDescription(
    'About Gargeya Sharma — Founder & Architect at Edudojo.ai, building AI for evaluation and education.'
  ),
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}
