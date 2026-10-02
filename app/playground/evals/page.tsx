import Link from 'next/link';
import { ArrowLeft, ArrowDownRight, LockKeyhole, Scale } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { WorkVisual } from '@/components/work-visual';
import { allWork } from '@/data/selected-work';
import { getPageMetadata } from '@/lib/page-metadata';
import './evals.css';
import './results.css';
import publishedExport from '@/data/eval-results.json';
import { parseEvalReport } from '@/lib/eval-results';
import { ResultsView } from './results-view';

export const metadata = getPageMetadata({
  title: 'Eval dashboard',
  description:
    'Public, read-only AI evaluation results. Inspect verified evidence, compare runs, and understand the limits. No verified results are published yet.',
  path: '/playground/evals',
});

// Only the reviewed static sanitized export is allowed here. Validation fails the build
// on unsupported versions or unapproved fields; no private runner assets are imported.
const report = parseEvalReport(publishedExport);
export default function EvalDashboardPage() {
  const work = allWork.find((entry) => entry.id === 'evals')!;
  return (
    <div className="field-site">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main eval-main">
        <Link href="/playground" className="field-text-link">
          <ArrowLeft size={16} /> All projects
        </Link>
        <header className="eval-intro">
          <div>
            <p className="field-label">AI evaluations / Public results</p>
            <h1>
              Show the <em>evidence.</em>
            </h1>
            <p className="eval-lede">
              A closer look at how AI setups handle real tasks. Published results, the conditions
              behind them, and room for an honest comparison.
            </p>
          </div>
          <div className="eval-cover">
            <WorkVisual cover={work.cover} />
          </div>
        </header>

        <div className="eval-public-note">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>Read-only results. Evaluations run privately; this page never starts a run.</span>
        </div>

        <ResultsView report={report} />

        <section id="reading-results" className="eval-reading" aria-labelledby="reading-title">
          <div className="eval-reading-intro">
            <Scale size={24} aria-hidden="true" />
            <h2 id="reading-title">Evidence needs context.</h2>
            <p>A useful comparison explains both the result and the conditions that produced it.</p>
          </div>
          <div className="eval-reading-notes">
            <article>
              <span className="field-label">01 / Comparable conditions</span>
              <h3>Compare like with like.</h3>
              <p>
                Different tasks, tools, budgets, and human assistance can change the outcome. A
                shared task set matters more than a single headline score.
              </p>
            </article>
            <article>
              <span className="field-label">02 / A traceable record</span>
              <h3>Keep the history in view.</h3>
              <p>
                When reviewed results are published, the run date, setup, coverage, and available
                metrics should make it clear what changed between runs.
              </p>
            </article>
            <article>
              <span className="field-label">03 / Honest limits</span>
              <h3>A missing value is not zero.</h3>
              <p>
                Unavailable measurements stay unavailable. A blocked run, illustrative example, or
                setup check cannot establish a model&apos;s performance.
              </p>
            </article>
          </div>
        </section>

        <section className="eval-boundary" aria-labelledby="boundary-title">
          <div>
            <p className="field-label">Publication boundary</p>
            <h2 id="boundary-title">Public evidence. Private execution.</h2>
          </div>
          <div>
            <p>
              Only reviewed, sanitized result summaries will be published here. Task prompts,
              private source, raw logs, and account details stay outside this public record.
            </p>
            <p>
              For the owner: run and review evaluations in your private local workspace, then
              publish the approved export through the website&apos;s normal release workflow.
            </p>
            <Link href="/playground/edudojo" className="field-text-link">
              Explore Edudojo <ArrowDownRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
