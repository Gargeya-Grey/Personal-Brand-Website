import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { IdeaMixer } from './idea-mixer';

export const metadata: Metadata = {
  title: 'Idea mixer · Playground',
  description:
    'A small creative tool: mix an audience with a constraint and find your next experiment.',
  alternates: { canonical: '/playground/idea-mixer' },
};
export default function IdeaMixerPage() {
  return (
    <div className="field-site">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          title={
            <>
              Good ideas have
              <br />
              <em>unlikely parents.</em>
            </>
          }
        >
          <p>
            Mix an audience with a constraint. Build the smallest thing that could help. No account,
            no AI calls, just a little creative friction.
          </p>
        </PageIntro>
        <IdeaMixer />
        <Link href="/playground" className="field-text-link mb-10">
          ← Back to the playground
        </Link>
      </main>
      <Footer />
    </div>
  );
}
