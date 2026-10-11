import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { DotGlyph } from '@/components/dot-glyph';
import { YoutubeGrid } from '@/components/youtube-grid';
import { siteConfig } from '@/lib/site-config';
import './films.css';

export const metadata: Metadata = getPageMetadata({
  title: 'Films & videos',
  description:
    'Travel films and things seen through Gargeya’s lens. Watch the Japan series and follow the channel.',
  path: '/youtube',
});
export default function YoutubePage() {
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main films-page">
        <PageIntro
          title={
            <>
              Films. <em>Places, people, details worth noticing.</em>
            </>
          }
        >
          <p>A few films from outside the usual tabs and text editors.</p>
          <a
            href={siteConfig.links.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="field-text-link mt-4"
          >
            Find me on YouTube <ArrowUpRight size={16} />
          </a>
        </PageIntro>

        <section className="films-section" aria-label="Film collection">
          <YoutubeGrid />
        </section>

        {/* The page's one filled button: the way to the rest of the channel. */}
        <section className="films-channel" aria-labelledby="films-channel-title" data-reveal>
          <div className="glyph-host films-channel-glyph">
            <DotGlyph name="films" size={88} />
          </div>
          <div className="films-channel-copy">
            <h2 id="films-channel-title">
              More on the channel. <em>The full collection, all in one place.</em>
            </h2>
          </div>
          <a
            href={siteConfig.links.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="field-button"
          >
            Open full channel <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section className="films-elsewhere" aria-label="More to read" data-reveal>
          <Link href="/journal" className="films-elsewhere-row glyph-host">
            <DotGlyph name="journal" size={56} />
            <span>
              <strong>Read the journal</strong>
              <small>The longer thoughts live here.</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link href="/notes" className="films-elsewhere-row glyph-host">
            <DotGlyph name="notes" size={56} />
            <span>
              <strong>Sunday Notes</strong>
              <small>A smaller window, sent every Sunday.</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
