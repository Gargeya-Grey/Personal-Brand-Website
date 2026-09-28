import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { PlaygroundIndex } from './playground-index';
import { playgroundEntries } from '@/data/playground';

export const metadata: Metadata = {
  title: 'Playground',
  description:
    'Apps, experiments, and things made out of curiosity by Gargeya Sharma. Open one and try it.',
  alternates: { canonical: '/playground' },
};
export default function PlaygroundPage() {
  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          title={
            <>
              Apps & <em>experiments.</em>
            </>
          }
        >
          <p>
            Try a small app, explore Edudojo, or read the source behind this site. Each project has
            a link to open it or see how it was made.
          </p>
        </PageIntro>
        <PlaygroundIndex entries={playgroundEntries} />
      </main>
      <Footer />
    </div>
  );
}
