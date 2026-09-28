import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
        <section className="personal-history field-section" data-reveal>
          <h2>The path here.</h2>
          <div className="history-rows">
            <article>
              <h3>Theatre, then AI</h3>
              <p>
                My background includes theatre. Today, the human side of technology still matters to
                me: how people ask questions, explain their thinking, and interact with a system.
              </p>
            </article>
            <article>
              <h3>Learning how machines see</h3>
              <p>
                I coauthored a paper on surface-crack segmentation and a chapter on object
                detection. I later studied Artificial Intelligence at Queen Mary University of
                London.
              </p>
              <Link href="/research" className="field-text-link">
                Papers & academic work <ArrowUpRight size={16} />
              </Link>
            </article>
            <article>
              <h3>Tools for the person using them</h3>
              <p>
                Edudojo focuses on the learning process. Odicto puts spoken words into the app
                already in front of you. They explore different parts of how AI can help with
                everyday work.
              </p>
              <Link href="/playground/odicto" className="field-text-link">
                Explore Odicto <ArrowUpRight size={16} />
              </Link>
            </article>
          </div>
        </section>
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
