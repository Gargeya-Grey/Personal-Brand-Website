import { Metadata } from 'next';
import AboutClient from './about-client';
import { getPageMetadata } from '@/lib/page-metadata';
import { getProfilePageJsonLd, serializeJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = getPageMetadata({
  title: { absolute: 'About Gargeya Sharma | AI engineer & Edudojo founder' },
  description:
    'Meet Gargeya Sharma, AI engineer and founder of Edudojo. Explore his work in learning tools, computer vision, writing, and travel films.',
  path: '/about',
  type: 'profile',
});

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(getProfilePageJsonLd()) }}
      />
      <AboutClient />
    </>
  );
}
