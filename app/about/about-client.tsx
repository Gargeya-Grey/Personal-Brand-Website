import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { JourneyMap } from './journey-map';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { siteConfig } from '@/lib/site-config';

export default function AboutClient() {
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          title={
            <>
              Hi, I’m <em>Gargeya.</em>
            </>
          }
        >
          <p>
            I’m an AI engineer and the founder of Edudojo.ai, with a background in theatre and
            computer vision. I build tools, write about learning, and make films when I travel.
          </p>
        </PageIntro>
        <section className="about-spread" data-reveal>
          <div className="about-photo">
            <Image
              src="/profile.webp"
              alt="Gargeya Sharma"
              fill
              priority
              sizes="(max-width: 700px) 100vw, 450px"
            />
          </div>
          <div className="about-story">
            <h2>
              Output is cheap.
              <br />
              <em>The mind takes work.</em>
            </h2>
            <p>
              As AI makes production easier, I keep coming back to what happens to the person doing
              the work. Are we becoming more capable, or just getting better-looking answers?
            </p>
            <p>
              I’m building Edudojo to explore that question in education. Student work, questions,
              process journals, and feedback: a learning loop that values how someone gets there.
            </p>
            <p>
              This website is the rest of the picture. The things I write to think more clearly.
              Films from places I’ve been. Small applications made out of curiosity. And the work as
              it develops.
            </p>
            <div className="field-actions">
              <Link href="/contact" className="field-button">
                Say hello <ArrowUpRight size={16} />
              </Link>
              <a
                href={siteConfig.links.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="field-text-link"
              >
                The formal version / CV <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
        <JourneyMap />
        <section className="field-section elsewhere-spread" data-reveal>
          <div>
            <h2>
              There’s more
              <br />
              <em>around here.</em>
            </h2>
          </div>
          <div className="elsewhere-links">
            {[
              [
                'The work & experiments',
                'Open an app, explore the startup, see the source.',
                '/playground',
              ],
              ['The longer thoughts', 'Essays on systems, learning, AI, and craft.', '/journal'],
              ['The conversations', 'Where I share the work as it happens.', '/community'],
            ].map(([title, copy, href]) => (
              <Link key={href} href={href}>
                <span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
