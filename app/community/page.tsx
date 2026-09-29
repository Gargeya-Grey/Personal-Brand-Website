import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, Github, Linkedin, Youtube, Plus, MessageCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Social profiles',
  description:
    'Explore Gargeya’s code, conversations, professional work, and travel films. Find the place you’d like to follow.',
  alternates: { canonical: '/community' },
};

const channels = [
  {
    id: 'github',
    name: 'GitHub',
    context: 'The things I’m making',
    handle: 'Gargeya-Grey',
    url: siteConfig.links.github,
    Icon: Github,
  },
  {
    id: 'x',
    name: 'X / Twitter',
    context: 'The conversation in between',
    handle: '@GargeyaS',
    url: siteConfig.links.twitter,
    Icon: null,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    context: 'The professional thread',
    handle: 'Gargeya Sharma',
    url: siteConfig.links.linkedin,
    Icon: Linkedin,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    context: 'Away from the keyboard',
    handle: '@GargeyaS',
    url: siteConfig.links.youtube,
    Icon: Youtube,
  },
];

function ChannelContent({ channel }: { channel: string }) {
  if (channel === 'github')
    return (
      <div className="channel-code-content">
        <div>
          <h2>Open the source.</h2>
          <p>
            Voice input, personal memory, and the small decisions behind the tools. This is where
            you can see how they work.
          </p>
        </div>
        <ul className="channel-repositories">
          {[
            ['Odicto', 'Desktop voice input', 'Odicto'],
            ['Odicto Mobile', 'An Android voice keyboard', 'Odicto-Mobile'],
            ['TwinAatma', 'Memory you own and approve', 'TwinAatma'],
          ].map(([name, description, repository]) => (
            <li key={repository}>
              <a
                href={`${siteConfig.links.github}/${repository}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  <strong>{name}</strong>
                  <small>{description}</small>
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  if (channel === 'x')
    return (
      <div className="channel-thought-content">
        <div>
          <h2>Think along with me.</h2>
          <p>
            I write about AI, learning, and what happens when getting an answer becomes easier than
            understanding it. Bring a question or a different experience.
          </p>
        </div>
        <div className="channel-question">
          <p>A question I keep returning to</p>
          <blockquote>
            Are we becoming more capable, or just getting better-looking answers?
          </blockquote>
        </div>
      </div>
    );
  if (channel === 'linkedin')
    return (
      <div className="channel-work-content">
        <Image src="/profile.webp" width={160} height={180} alt="Gargeya Sharma" />
        <div>
          <h2>Building Edudojo. Learning in public.</h2>
          <p>
            AI engineering, the work of starting a company, and the people I meet along the way.
            Follow the professional side of the story, or get in touch about working together.
          </p>
          <span className="channel-handle">Gargeya Sharma · Founder of Edudojo</span>
        </div>
      </div>
    );
  return (
    <div className="channel-film-content">
      <a
        className="channel-film"
        href="https://www.youtube.com/watch?v=bUk92KXUh1M"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Watch Gargeya’s Japan film on YouTube"
      >
        <Image
          src="https://img.youtube.com/vi/bUk92KXUh1M/hqdefault.jpg"
          fill
          sizes="(max-width: 700px) 90vw, 500px"
          alt="Illustrated thumbnail for Gargeya’s Japan travel film"
        />
        <span>
          <Youtube size={25} aria-hidden="true" /> Watch the film{' '}
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </a>
      <div>
        <h2>Start with Japan.</h2>
        <p>
          Tokyo, winter in Osaka, and a day in Nara. These films are another way to meet me: out in
          the world, following whatever catches my attention.
        </p>
        <span className="channel-handle">Travel films · @GargeyaS</span>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <div className="field-site">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main social-main">
        <header className="social-intro">
          <h1>
            Elsewhere on
            <br />
            <em>the internet.</em>
          </h1>
          <p>
            A few different windows into what I’m doing. Open a preview, or go straight to the
            profile.
          </p>
        </header>
        <section className="social-channels" aria-label="Find me online">
          {channels.map(({ Icon, ...channel }, index) => (
            <article className="social-channel" key={channel.id}>
              <details name="social-preview" open={index === 0}>
                <summary>
                  <span className="channel-logo" aria-hidden="true">
                    {Icon ? (
                      <Icon size={32} strokeWidth={1.5} />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2ZM17.8 20h1.7L6.3 3.9H4.5Z" />
                      </svg>
                    )}
                  </span>
                  <span className="channel-name">
                    {channel.name}
                    <small>{channel.context}</small>
                  </span>
                  <span className="channel-toggle">
                    <span>Preview</span>
                    <Plus size={20} aria-hidden="true" />
                  </span>
                </summary>
                <div className="channel-content">
                  <ChannelContent channel={channel.id} />
                </div>
              </details>
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="channel-direct"
                aria-label={`Open ${channel.name} profile in a new tab`}
              >
                <span>Open profile</span>
                <ArrowUpRight size={21} aria-hidden="true" />
              </a>
            </article>
          ))}
          {siteConfig.links.discord !== 'https://discord.gg' && (
            <a
              className="channel-discord"
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={22} /> Continue the conversation on Discord{' '}
              <ArrowUpRight size={18} />
            </a>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
