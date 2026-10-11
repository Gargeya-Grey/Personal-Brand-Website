import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPageMetadata } from '@/lib/page-metadata';
import { ArrowUpRight, Github, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { DotGlyph } from '@/components/dot-glyph';
import { siteConfig } from '@/lib/site-config';
import './social.css';

export const metadata: Metadata = getPageMetadata({
  title: 'Social profiles',
  description:
    'Explore Gargeya’s code, conversations, professional work, and travel films. Find the place you’d like to follow.',
  path: '/community',
});

interface SubLink {
  name: string;
  note: string;
  url: string;
}

interface Channel {
  id: string;
  name: string;
  handle: string;
  context: string;
  /** The proposition: what this place is for. */
  title: string;
  description: string;
  url: string;
  mark: ReactNode;
  /** Real destinations inside the network, shown under the description. */
  links?: SubLink[];
  question?: string;
}

const XMark = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2ZM17.8 20h1.7L6.3 3.9H4.5Z" />
  </svg>
);

const channels: Channel[] = [
  {
    id: 'github',
    name: 'GitHub',
    handle: 'Gargeya-Grey',
    context: 'The things I’m making',
    title: 'Open the source.',
    description:
      'Voice input, personal memory, and the small decisions behind the tools. This is where you can see how they work.',
    url: siteConfig.links.github,
    mark: <Github size={26} strokeWidth={1.5} aria-hidden="true" />,
    links: [
      {
        name: 'Odicto',
        note: 'Desktop voice input',
        url: `${siteConfig.links.github}/Odicto`,
      },
      {
        name: 'Odicto Mobile',
        note: 'An Android voice keyboard',
        url: `${siteConfig.links.github}/Odicto-Mobile`,
      },
      {
        name: 'TwinAatma',
        note: 'Memory you own and approve',
        url: `${siteConfig.links.github}/TwinAatma`,
      },
    ],
  },
  {
    id: 'x',
    name: 'X',
    handle: '@GargeyaS',
    context: 'The conversation in between',
    title: 'Think along with me.',
    description:
      'I write about AI, learning, and what happens when getting an answer becomes easier than understanding it. Bring a question or a different experience.',
    url: siteConfig.links.twitter,
    mark: XMark,
    question: 'Are we becoming more capable, or just getting better-looking answers?',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'Gargeya Sharma',
    context: 'The professional thread',
    title: 'Building Edudojo. Learning in public.',
    description:
      'AI engineering, the work of starting a company, and the people I meet along the way. Follow the professional side of the story, or get in touch about working together.',
    url: siteConfig.links.linkedin,
    mark: <Linkedin size={26} strokeWidth={1.5} aria-hidden="true" />,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@GargeyaS',
    context: 'Away from the keyboard',
    title: 'Start with Japan.',
    description:
      'Tokyo, winter in Osaka, and a day in Nara. These films are another way to meet me: out in the world, following whatever catches my attention.',
    url: siteConfig.links.youtube,
    mark: <Youtube size={26} strokeWidth={1.5} aria-hidden="true" />,
    links: [
      {
        name: 'Part 1: Arrival',
        note: 'The Japan film, on YouTube',
        url: 'https://www.youtube.com/watch?v=bUk92KXUh1M',
      },
    ],
  },
];

const hasDiscordInvite = siteConfig.links.discord !== 'https://discord.gg';

export default function CommunityPage() {
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main social-page">
        <PageIntro
          title={
            <>
              Elsewhere on <em>the internet.</em>
            </>
          }
        >
          <p>
            A few different windows into what I’m doing. Pick the place you’d like to follow.
          </p>
          <div className="social-intro-glyph glyph-host" aria-hidden="true">
            <DotGlyph name="social" size={120} />
          </div>
        </PageIntro>

        <ul className="social-index" aria-label="Find me online">
          {channels.map((channel) => (
            <li key={channel.id} className="social-row" data-reveal>
              <span className="social-mark">{channel.mark}</span>
              <div className="social-copy">
                <p className="work-meta">
                  <span>{channel.name}</span>
                  <span>{channel.handle}</span>
                  <span>{channel.context}</span>
                </p>
                <h2 className="social-row-title">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${channel.title} Open ${channel.name} in a new tab`}
                  >
                    {channel.title}
                  </a>
                </h2>
                <p className="social-blurb">{channel.description}</p>
                {channel.question && (
                  <figure className="social-question">
                    <figcaption>A question I keep returning to</figcaption>
                    <blockquote>{channel.question}</blockquote>
                  </figure>
                )}
                {channel.links && (
                  <ul className="social-sub">
                    {channel.links.map((link) => (
                      <li key={link.url}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <strong>{link.name}</strong>
                          <small>{link.note}</small>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ArrowUpRight size={20} className="social-row-arrow" aria-hidden="true" />
            </li>
          ))}
          {hasDiscordInvite && (
            <li className="social-row" data-reveal>
              <span className="social-mark">
                <MessageCircle size={26} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="social-copy">
                <p className="work-meta">
                  <span>Discord</span>
                </p>
                <h2 className="social-row-title">
                  <a
                    href={siteConfig.links.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Continue the conversation on Discord in a new tab"
                  >
                    Continue the conversation.
                  </a>
                </h2>
              </div>
              <ArrowUpRight size={20} className="social-row-arrow" aria-hidden="true" />
            </li>
          )}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
