import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Drama,
  ScanEye,
  GraduationCap,
  Sprout,
  Mountain,
  MessagesSquare,
} from 'lucide-react';
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
        <section className="journey-section field-section" aria-labelledby="journey-title">
          <div className="journey-intro">
            <h2 id="journey-title">The path here.</h2>
            <p>
              I didn’t grow up planning to be an AI engineer. There was a stage, a nearly empty
              campus, a lot of self-teaching, and a very different kind of education in London.
            </p>
            <a
              href={siteConfig.links.cv}
              target="_blank"
              rel="noopener noreferrer"
              className="field-text-link"
            >
              The full CV <ArrowUpRight size={16} />
            </a>
          </div>
          <ol className="journey-track">
            <li className="journey-stage">
              <span className="journey-marker">
                <Drama size={25} aria-hidden="true" />
              </span>
              <div className="journey-chapter">
                <span className="journey-era">School → university · 2018</span>
                <h3>I wanted to do theatre.</h3>
                <p>
                  Theatre was what I loved at school. My parents encouraged a more secure path, and
                  I already liked science, so I enrolled in computer science, specialising in
                  cybersecurity and forensics. It wasn’t my first choice. But I decided that if I
                  was going to spend years on it, I owed it my best.
                </p>
              </div>
            </li>
            <li className="journey-stage">
              <span className="journey-marker">
                <Mountain size={25} aria-hidden="true" />
              </span>
              <div className="journey-chapter">
                <span className="journey-era">The pandemic · A campus in the mountains</span>
                <h3>An empty campus changed the direction.</h3>
                <p>
                  Most students had gone home. I stayed near a campus surrounded by mountains, with
                  very few people around and time to explore. I worked through more than a hundred
                  online courses, doing the exercises as well as watching the lectures. Learning
                  became something I chose every day.
                </p>
                <p>
                  Reinforcement learning caught me because I’d always been curious about psychology:
                  here were machines learning from actions and feedback. I watched one course three
                  times before Q-learning began to make sense. I wanted to keep going.
                </p>
              </div>
            </li>
            <li className="journey-research">
              <span className="journey-marker">
                <ScanEye size={25} aria-hidden="true" />
              </span>
              <div className="journey-chapter">
                <span className="journey-era">By graduation · 2022</span>
                <h3>Learning turned into work I could share.</h3>
                <p>
                  Alongside my degree, I taught myself machine learning and deep learning, interned
                  at a startup, and helped my professors with their research. That work led to a
                  computer vision paper and a coauthored book chapter. I also wrote technical
                  articles to help support myself. The subject I hadn’t chosen had become the thing
                  I wanted to spend my days doing.
                </p>
                <Link href="/research" className="field-text-link">
                  Read the publications <ArrowUpRight size={16} />
                </Link>
              </div>
            </li>
            <li className="journey-study">
              <span className="journey-marker">
                <GraduationCap size={25} aria-hidden="true" />
              </span>
              <div className="journey-chapter">
                <span className="journey-era">Queen Mary University of London</span>
                <h3>I wanted to find the gaps.</h3>
                <p>
                  Self-teaching had taken me a long way. For my MSc in Artificial Intelligence at
                  Queen Mary, I wanted to find what I’d missed and learn alongside people who would
                  challenge me. Moving from a cybersecurity degree into AI wasn’t a straightforward
                  admissions path, but I got there. The coursework and dissertation gave me both a
                  deeper foundation and more confidence in my research.
                </p>
                <a
                  href="https://github.com/Gargeya-Grey/MSc-Artificial-Intelligence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-text-link"
                >
                  Explore the academic work <ArrowUpRight size={16} />
                </a>
              </div>
            </li>
            <li className="journey-study">
              <span className="journey-marker">
                <MessagesSquare size={25} aria-hidden="true" />
              </span>
              <div className="journey-chapter">
                <span className="journey-era">London · Beyond the screen</span>
                <h3>The other education happened across a bar.</h3>
                <p>
                  Finding an AI role was harder than I’d hoped. Alongside the search, I worked in
                  hospitality, from VIP lounges at The O2 to running a busy bar in Leicester Square.
                  I learned to approach strangers, listen, manage a team, and stay composed when
                  everything was happening at once.
                </p>
                <p>
                  Those conversations didn’t turn into the job I was looking for. They did change
                  how I relate to people. After years of learning behind a screen, that mattered.
                </p>
              </div>
            </li>
            <li className="journey-now">
              <span className="journey-marker">
                <Sprout size={25} aria-hidden="true" />
              </span>
              <div className="journey-chapter">
                <span className="journey-era">Now · Building</span>
                <h3>Now I’m building around how people learn.</h3>
                <p>
                  My own path involved choosing a subject, getting stuck, trying again, and finding
                  people who could push me further. Those experiences shape the questions I bring to
                  Edudojo: how can AI help someone develop understanding, and how can a teacher see
                  that progress? I’m building it to make room for questions, revision, and the work
                  behind an answer.
                </p>
                <Link href="/#currently" className="field-text-link">
                  See what I’m building <ArrowUpRight size={16} />
                </Link>
              </div>
            </li>
          </ol>
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
