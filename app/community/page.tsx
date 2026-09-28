import type { Metadata } from 'next';
import { ArrowUpRight, Code2, MessageCircle, Clapperboard, BriefcaseBusiness } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { FieldMotion } from '@/components/field-notes';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Social profiles',
  description:
    'Conversations on X, code on GitHub, founder updates on LinkedIn, and films from Japan. Find Gargeya around the internet.',
  alternates: { canonical: '/community' },
};

export default function CommunityPage() {
  const destinations = [
    {
      id: 'conversation',
      title: 'X / Twitter',
      invitation: 'Join a conversation',
      description:
        'Shorter thoughts on AI and learning. Ask a question, share a useful distinction, or push back on an idea.',
      href: siteConfig.links.twitter,
      handle: '@GargeyaS',
      icon: MessageCircle,
    },
    {
      id: 'code',
      title: 'GitHub',
      invitation: 'Look under the hood',
      description:
        'Odicto, TwinAatma, and the experiments behind this site. Read the code, explore a decision, or make something with it.',
      href: siteConfig.links.github,
      handle: 'Gargeya-Grey',
      icon: Code2,
    },
    {
      id: 'work',
      title: 'LinkedIn',
      invitation: 'Follow the work',
      description:
        'Updates on Edudojo, AI engineering, and the questions that come with building a company.',
      href: siteConfig.links.linkedin,
      handle: 'Gargeya Sharma',
      icon: BriefcaseBusiness,
    },
    {
      id: 'film',
      title: 'YouTube',
      invitation: 'Take a detour',
      description:
        'Come along to Japan: arrival in Tokyo, winter in Osaka, and a day in Nara. A different side of the person behind the projects.',
      href: siteConfig.links.youtube,
      handle: '@GargeyaS',
      icon: Clapperboard,
    },
    ...(siteConfig.links.discord !== 'https://discord.gg'
      ? [
          {
            id: 'discord',
            title: 'Discord',
            invitation: 'Keep talking',
            description: 'A place for builder conversations and work in progress.',
            href: siteConfig.links.discord,
            handle: 'Join the conversation',
            icon: MessageCircle,
          },
        ]
      : []),
  ];
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main social-main">
        <header className="social-intro">
          <div>
            <h1>
              Let’s <em>cross paths.</em>
            </h1>
            <p>
              The code, the conversations, the occasional travel film. Pick the part of my world
              you’d like to follow.
            </p>
          </div>
          <span className="social-hello" aria-hidden="true">
            ↗
          </span>
        </header>
        <section className="social-cards" aria-label="Social profiles">
          {destinations.map(({ icon: Icon, ...item }) => (
            <a
              key={item.id}
              className={'social-card social-' + item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="social-card-top">
                <span className="social-symbol">
                  <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <ArrowUpRight className="social-arrow" size={26} aria-hidden="true" />
              </div>
              <p className="social-invitation">{item.invitation}</p>
              <h2>{item.title}</h2>
              <p className="social-description">{item.description}</p>
              <span className="social-handle">
                {item.handle}
                <span aria-hidden="true">Open profile ↗</span>
              </span>
            </a>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
