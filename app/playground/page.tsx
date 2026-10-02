import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { PlaygroundIndex } from './playground-index';
import { playgroundEntries } from '@/data/playground';

export const metadata: Metadata = getPageMetadata({
  title: 'Playground',
  description:
    'Apps, experiments, and things made out of curiosity by Gargeya Sharma. Open one and try it.',
  path: '/playground',
});
export default function PlaygroundPage() {
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          title={
            <>
              The <em>playground.</em>
            </>
          }
        >
          <p>
            Explore what I&apos;m building for learning, see the evidence behind my AI experiments,
            or try a small tool right in your browser.
          </p>
        </PageIntro>
        <PlaygroundIndex entries={playgroundEntries} />
      </main>
      <Footer />
    </div>
  );
}
