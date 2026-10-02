'use client';

import { useState } from 'react';
import { ArrowDownRight, ScanLine } from 'lucide-react';
import {
  evalGroups,
  evalHistory,
  evalSetupLabel,
  evalSummary,
  evalTaskTypes,
  type EvalReport,
} from '@/lib/eval-results';

function seconds(value: number | null) {
  return value === null
    ? 'Unavailable'
    : `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })} s`;
}
function dateLabel(value: string | null) {
  return value === null ? 'Date unavailable' : value.replace('T', ' ').replace('Z', ' UTC');
}

export function ResultsView({ report }: { report: EvalReport }) {
  const [task, setTask] = useState('All');
  const [suite, setSuite] = useState('All');
  const [setup, setSetup] = useState('All');
  const runs = report.runs.filter(
    (run) =>
      (task === 'All' || task === run.task_type) &&
      (suite === 'All' || suite === run.suite_version) &&
      (setup === 'All' || setup === run.setup),
  );
  const summary = evalSummary(runs);
  const groups = evalGroups(runs);
  const setups = [...new Map(report.runs.map((run) => [run.setup, evalSetupLabel(run)])).entries()];
  const suites = [...new Set(report.runs.map((run) => run.suite_version))].sort();
  const history = evalHistory(runs);
  const metrics = [
    [
      'Verified completed runs',
      String(summary.verifiedCompleted),
      report.runs.length
        ? 'Excludes blocked and self-reported records'
        : 'No completed results published',
    ],
    [
      'Evaluated setups',
      summary.verifiedCompleted ? String(summary.setups) : '—',
      'Setups with verified completed runs',
    ],
    [
      'Task coverage',
      summary.verifiedCompleted ? String(summary.cases) : '—',
      'Distinct case / suite pairs evaluated',
    ],
    [
      'Success rate',
      summary.successRate === null ? '—' : `${Math.round(summary.successRate * 100)}%`,
      summary.successRate === null
        ? 'No evidence to calculate a rate'
        : `${summary.successful} / ${summary.verifiedCompleted} verified completed runs`,
    ],
  ];
  return (
    <>
      {!!report.runs.length && (
        <div className="eval-filters" aria-label="Filter published results">
          <label>
            Task type
            <select
              aria-label="Task type"
              value={task}
              onChange={(event) => setTask(event.target.value)}
            >
              <option>All</option>
              {evalTaskTypes
                .filter((type) => report.runs.some((run) => run.task_type === type))
                .map((type) => (
                  <option key={type}>{type}</option>
                ))}
            </select>
          </label>
          <label>
            Suite
            <select
              aria-label="Suite"
              value={suite}
              onChange={(event) => setSuite(event.target.value)}
            >
              <option>All</option>
              {suites.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Setup
            <select
              aria-label="Setup"
              value={setup}
              onChange={(event) => setSetup(event.target.value)}
            >
              <option value="All">All</option>
              {setups.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="field-text-link"
            onClick={() => {
              setTask('All');
              setSuite('All');
              setSetup('All');
            }}
          >
            Reset filters
          </button>
        </div>
      )}
      <section className="eval-metrics" aria-label="Published evaluation summary">
        {metrics.map(([label, value, detail]) => (
          <div key={label}>
            <h2>{label}</h2>
            <p className="eval-metric-value">{value}</p>
            <p>{detail}</p>
          </div>
        ))}
      </section>
      <section className="eval-results" aria-labelledby="results-title">
        <div className="eval-section-heading">
          <div>
            <p className="field-label">The record</p>
            <h2 id="results-title">Results & comparisons</h2>
          </div>
          <span className="eval-status" role="status">
            <span aria-hidden="true" />
            {report.runs.length
              ? `${runs.length} published ${runs.length === 1 ? 'record' : 'records'} shown`
              : 'Awaiting first publication'}
          </span>
        </div>
        {!report.runs.length ? (
          <div className="eval-empty">
            <div className="eval-empty-mark" aria-hidden="true">
              <ScanLine size={34} strokeWidth={1.2} />
            </div>
            <h3>No verified results published yet.</h3>
            <p>
              The first reviewed run will start the record. Until then, there is no leaderboard,
              success rate, or winning setup to report.
            </p>
            <p className="eval-empty-footnote">
              Example records and setup checks do not count as model evaluations.
            </p>
            <a href="#reading-results" className="field-text-link">
              How to read future results <ArrowDownRight size={16} />
            </a>
          </div>
        ) : !runs.length ? (
          <div className="eval-empty">
            <h3>No published records match these filters.</h3>
            <p>Change a filter or reset to the full published record.</p>
          </div>
        ) : (
          <>
            <p className="eval-comparison-note">
              Compare within a suite and task type. Sample counts describe this record, not a global
              model ranking. Anonymous setup identity does not prove equivalent tools, budgets, or
              human assistance.
            </p>
            <div
              className="eval-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Task comparisons, scroll horizontally if needed"
            >
              <table className="eval-table">
                <caption>Task comparisons by suite and setup</caption>
                <thead>
                  <tr>
                    {[
                      'Task / suite',
                      'Setup',
                      'Sample / evidence',
                      'Verified outcomes',
                      'Mean elapsed',
                    ].map((label) => (
                      <th scope="col" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.key}>
                      <th scope="row">
                        {group.run.task_type}
                        <small>Suite {group.run.suite_version}</small>
                      </th>
                      <td>
                        {evalSetupLabel(group.run)}
                        <small>{group.run.setup}</small>
                      </td>
                      <td>
                        {group.total} records
                        <small>
                          {group.verifiedCompleted} verified completed · {group.selfReported}{' '}
                          self-reported · {group.blocked} blocked
                        </small>
                      </td>
                      <td>
                        {group.successful} success / {group.failed} fail
                        <small>Blocked attempts excluded</small>
                      </td>
                      <td>
                        {seconds(group.meanSeconds)}
                        <small>
                          {group.observedDurations} / {group.verifiedCompleted} durations observed
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="eval-history-heading">
              <h2>Run history</h2>
              <p>Newest known UTC dates first. Unknown dates remain unavailable.</p>
            </div>
            <div className="eval-history">
              {history.map((run) => (
                <details key={run.run_id} id={run.run_id} className="eval-run">
                  <summary>
                    <span>
                      <time dateTime={run.date_utc ?? undefined}>{dateLabel(run.date_utc)}</time>
                      <strong>{run.task_type}</strong>
                      <small>{evalSetupLabel(run)}</small>
                    </span>
                    <span className="eval-outcome">
                      {run.status}
                      <small>
                        {run.verification === 'verified' ? 'Evaluator verified' : 'Self-reported'}
                      </small>
                    </span>
                  </summary>
                  <dl>
                    <div>
                      <dt>Public run ID</dt>
                      <dd>
                        <a href={`#${run.run_id}`}>{run.run_id}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>Case / suite</dt>
                      <dd>
                        {run.case_id} / {run.suite_version}
                      </dd>
                    </div>
                    <div>
                      <dt>Evidence classification</dt>
                      <dd>
                        {run.verification === 'verified'
                          ? 'Evaluator verified'
                          : 'Self-reported, not included in verified success metrics'}
                      </dd>
                    </div>
                    <div>
                      <dt>Checks passed</dt>
                      <dd>
                        {run.check_pass_count} / {run.check_count}
                      </dd>
                    </div>
                    <div>
                      <dt>Elapsed time</dt>
                      <dd>{seconds(run.elapsed_seconds)}</dd>
                    </div>
                    <div>
                      <dt>Human interventions</dt>
                      <dd>{run.intervention_count}</dd>
                    </div>
                    <div>
                      <dt>Usage visibility</dt>
                      <dd>
                        {run.usage_state === 'visible'
                          ? 'Visible to the owner; quantities not exported'
                          : 'Unavailable'}
                      </dd>
                    </div>
                    <div>
                      <dt>Publication labels</dt>
                      <dd>
                        {run.public_metadata.publication === 'owner_approved'
                          ? 'Owner approved'
                          : 'Withheld'}
                      </dd>
                    </div>
                  </dl>
                  <p>
                    Private artifacts are withheld. This summary does not expose task prompts,
                    private checks, or raw logs.
                  </p>
                </details>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
