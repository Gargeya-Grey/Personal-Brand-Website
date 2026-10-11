import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/page-metadata';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { FieldMotion } from '@/components/field-notes';
import { DotGlyph } from '@/components/dot-glyph';
import { MarginDots } from '@/components/margin-dots';
import type { GlyphName, MarginSymbol } from '@/lib/stipple';
import { PlaygroundIndex } from './playground-index';
import { leadEntryId, playgroundEntries } from '@/data/playground';

export const metadata: Metadata = getPageMetadata({
  title: 'Playground',
  description:
    'Apps, experiments, and things made out of curiosity by Gargeya Sharma, with source and evidence.',
  path: '/playground',
});

/** Each heading, and the figure the margin dots gather into while it is read. */
const marginSections: readonly { id: string; symbol: MarginSymbol }[] = [
  { id: 'playground-title', symbol: 'path' },
  { id: 'playground-software', symbol: 'torii' },
  { id: 'playground-experiments', symbol: 'evals' },
];

export default function PlaygroundPage() {
  // Glyphs are drawn here, on the server, so the filtering client component never ships the stipple library.
  const rowGlyphs = Object.fromEntries(
    playgroundEntries
      .filter((entry) => entry.id !== leadEntryId)
      .map((entry) => [
        entry.id,
        <DotGlyph key={entry.id} name={entry.id as GlyphName} size={72} className="work-row-glyph" />,
      ]),
  );
  const leadGlyph = <DotGlyph name={leadEntryId as GlyphName} size={176} />;

  return (
    <div className="field-site">
      <Navigation />
      <FieldMotion />
      <MarginDots sections={marginSections} />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          titleId="playground-title"
          title={
            <>
              The playground. <em>What I build to learn.</em>
            </>
          }
        >
          <p>
            Explore what I&apos;m building for learning, voice, and memory, and see the evidence
            behind my AI experiments.
          </p>
        </PageIntro>
        <PlaygroundIndex
          entries={playgroundEntries}
          leadEntryId={leadEntryId}
          leadGlyph={leadGlyph}
          rowGlyphs={rowGlyphs}
        />
      </main>
      <Footer />
    </div>
  );
}
