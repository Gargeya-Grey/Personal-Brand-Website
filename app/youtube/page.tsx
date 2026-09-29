import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { YoutubeGrid } from '@/components/youtube-grid';
import { siteConfig } from '@/lib/site-config';

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
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          title={
            <>
              Films & <em>videos.</em>
            </>
          }
        >
          <p>
            Places, people, details worth noticing. A few films from outside the usual tabs and text
            editors.
          </p>
          <a
            href={siteConfig.links.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="field-text-link mt-4"
          >
            Find me on YouTube <ArrowUpRight size={16} />
          </a>
        </PageIntro>
        <section className="pb-14" aria-label="Film collection">
          <div className="field-section-heading">
            <p className="field-label">From Japan / The travel films</p>
            <span className="field-aside">Pick a film. Stay a while.</span>
          </div>
          <YoutubeGrid />
        </section>
        <section className="field-section elsewhere-spread">
          <h2>
            More of a<br />
            <em>reading person?</em>
          </h2>
          <div>
            <p className="field-copy">
              The journal is where the longer thoughts live. Notes is a smaller window, sent on
              Sunday.
            </p>
            <div className="field-actions mt-5">
              <Link href="/journal" className="field-text-link">
                The journal <ArrowUpRight size={16} />
              </Link>
              <Link href="/notes" className="field-text-link">
                Sunday Notes <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
