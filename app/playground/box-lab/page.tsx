import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { BoxLab } from './box-lab';

export const metadata: Metadata = {
  title: 'The overlap lab · Playground',
  description:
    'An interactive introduction to intersection over union. Move a predicted box and explore how object detection measures a match.',
  alternates: { canonical: '/playground/box-lab' },
};

export default function BoxLabPage() {
  return (
    <div className="field-site">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main">
        <Link href="/playground" className="field-text-link">
          <ArrowLeft size={16} /> Playground
        </Link>
        <PageIntro
          title={
            <>
              How close is <em>close enough?</em>
            </>
          }
        >
          <p>
            A computer can draw a box around an object. But did it find the right area? Move the
            prediction and discover one way of measuring the answer.
          </p>
        </PageIntro>
        <BoxLab />
        <section className="lab-explainer field-section">
          <div>
            <h2>
              The shared part,
              <br />
              <em>over the whole.</em>
            </h2>
          </div>
          <div>
            <p>
              Intersection over union (IoU) divides the area shared by both boxes by the total area
              they cover. A perfect overlap is 1. No overlap is 0.
            </p>
            <p>
              The threshold is your rule for accepting a match. It changes the verdict, not the
              overlap. Real detection benchmarks also consider object classes, confidence, and
              missed or duplicate detections.
            </p>
            <p>
              This is a geometric illustration, not a running AI model or a reproduction of my
              paper’s results. My coauthored work explores object detection and surface-crack
              segmentation.
            </p>
            <Link href="/research" className="field-text-link">
              Read the research <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
