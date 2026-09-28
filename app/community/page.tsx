import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Elsewhere & community',
  description:
    'Find Gargeya on X, GitHub, LinkedIn, and YouTube. Follow the work and join the conversation.',
  alternates: { canonical: '/community' },
};
export default function CommunityPage() {
  const destinations = [
    {
      title: 'X / Twitter',
      description:
        'Day-to-day thinking, work in progress, and conversations about learning with AI.',
      href: siteConfig.links.twitter,
      handle: '@GargeyaS',
    },
    {
      title: 'GitHub',
      description:
        'The code behind the projects. Explore, inspect, or build something of your own.',
      href: siteConfig.links.github,
      handle: 'Gargeya-Grey',
    },
    {
      title: 'LinkedIn',
      description: 'The professional thread: Edudojo, systems, and building useful things.',
      href: siteConfig.links.linkedin,
      handle: 'Gargeya Sharma',
    },
    {
      title: 'YouTube',
      description: 'Travel films, observations, and another window into what catches my attention.',
      href: siteConfig.links.youtube,
      handle: '@GargeyaS',
    },
    ...(siteConfig.links.discord !== 'https://discord.gg'
      ? [
          {
            title: 'Discord',
            description: 'A quieter place for builder conversations and work in progress.',
            href: siteConfig.links.discord,
            handle: 'Join the conversation',
          },
        ]
      : []),
  ];
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          number="05"
          eyebrow="Around the internet"
          title={
            <>
              Good work starts
              <br />
              <em>with a conversation.</em>
            </>
          }
        >
          <p>
            This site is home. These are the places I wander out to share what I’m making, think in
            public, and meet people following similar questions.
          </p>
        </PageIntro>
        <section className="social-directory" aria-label="Social profiles">
          {destinations.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal
            >
              <span className="field-label">0{index + 1}</span>
              <div>
                <h2>{item.title}</h2>
                <span className="field-label">{item.handle}</span>
              </div>
              <p>{item.description}</p>
              <ArrowUpRight size={22} />
            </a>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
