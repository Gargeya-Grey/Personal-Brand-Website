import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { InvalidEvalExport } from '../lib/eval-export-validation.ts';
import {
  parseEvalReport,
  evalSummary,
  evalGroups,
  evalHistory,
  evalSetupLabel,
  PUBLIC_EVAL_WARNING,
} from '../lib/eval-results.ts';

// Synthetic adversarial/aggregation test data. Never publish these records as model results.
const approved = {
  publication: 'owner_approved',
  model: 'GPT Sol',
  version: '1.0',
  effort: 'high',
  harness: 'Codex CLI',
  tool_version: '1.0',
};
const withheld = {
  publication: 'withheld',
  model: 'Unknown',
  version: 'unknown',
  effort: 'unknown',
  harness: 'Unknown',
  tool_version: 'unknown',
};
const row = (n, changes = {}) => ({
  case_id: 'bug-starter',
  task_type: 'bug fix',
  suite_version: '1.0.0',
  setup: 'setup-aaaaaaaaaaaaaaaa',
  status: 'success',
  verification: 'verified',
  elapsed_seconds: 10,
  intervention_count: 0,
  usage_state: 'unknown',
  check_pass_count: 2,
  check_count: 2,
  run_id: `run-${n.toString(16).padStart(20, '0')}`,
  date_utc: `2026-01-${n.toString().padStart(2, '0')}T12:00:00Z`,
  public_metadata: approved,
  ...changes,
});
const input = {
  report_version: 2,
  warning: PUBLIC_EVAL_WARNING,
  runs: [
    row(1),
    row(2, { status: 'fail', elapsed_seconds: null, check_pass_count: 1 }),
    row(3, { verification: 'self_reported', elapsed_seconds: 999 }),
    row(4, { status: 'blocked', elapsed_seconds: 500 }),
    row(5, {
      setup: 'setup-bbbbbbbbbbbbbbbb',
      elapsed_seconds: 20,
      public_metadata: { ...approved, version: '2.0' },
    }),
    row(6, { suite_version: '2.0.0', status: 'fail', elapsed_seconds: 30, check_pass_count: 0 }),
    row(7, {
      case_id: 'review-gate',
      task_type: 'review',
      setup: 'setup-cccccccccccccccc',
      date_utc: null,
      elapsed_seconds: 0,
      public_metadata: withheld,
    }),
    row(8, {
      case_id: 'feature-demo',
      task_type: 'small feature',
      status: 'blocked',
      verification: 'self_reported',
      elapsed_seconds: null,
    }),
  ],
};
const published = parseEvalReport(
  JSON.parse(readFileSync(new URL('../data/eval-results.json', import.meta.url))),
);
assert.equal(published.report_version, 2);
const parsed = parseEvalReport(input);
assert.deepEqual(evalSummary(parsed.runs), {
  verifiedCompleted: 5,
  setups: 3,
  cases: 3,
  successful: 3,
  successRate: 0.6,
  blocked: 2,
  selfReported: 2,
});
const groups = evalGroups(parsed.runs);
assert.equal(groups.length, 5, 'Different suite/task/setup versions cannot share a comparison row');
const first = groups.find((g) => g.total === 4);
assert.equal(first.verifiedCompleted, 2);
assert.equal(first.observedDurations, 1);
assert.equal(
  first.meanSeconds,
  10,
  'Null, self-reported and blocked durations do not alter completed timing',
);
assert.equal(
  groups.find((g) => g.run.task_type === 'review').meanSeconds,
  0,
  'Measured zero is preserved',
);
assert.equal(groups.find((g) => g.run.task_type === 'small feature').meanSeconds, null);
assert.equal(evalSummary([]).successRate, null);
assert.equal(evalSetupLabel(parsed.runs[6]), 'Undisclosed setup · setup-cccccccccccccccc');
assert(evalSetupLabel(parsed.runs[4]).includes('GPT Sol 2.0'));
const rejectRow = (changes) =>
  assert.throws(() => parseEvalReport({ ...input, runs: [row(1, changes)] }), InvalidEvalExport);
for (const date_utc of [
  '2026-02-30T12:00:00Z',
  '2026-01-01T25:00:00Z',
  '2026-01-01T12:00:00+05:30',
  '2026-01-01',
  '2026-01-01T12:00:00Z\n',
])
  rejectRow({ date_utc });
rejectRow({ check_pass_count: 3 });
rejectRow({ task_type: 'review' });
rejectRow({ raw_log: 'DO_NOT_RENDER' });
rejectRow({ public_metadata: { ...approved, private_key: 'DO_NOT_RENDER' } });
rejectRow({ public_metadata: { ...approved, model: 'Unapproved model label' } });
rejectRow({ public_metadata: { ...approved, publication: 'withheld' } });
rejectRow({ public_metadata: { ...approved, tool_version: 'private/config' } });
rejectRow({ run_id: 'private-run-id' });
rejectRow({ elapsed_seconds: '10' });
assert.throws(() => parseEvalReport({ ...input, report_version: 1 }), InvalidEvalExport);
assert.throws(() => parseEvalReport({ ...input, warning: 'DO_NOT_RENDER' }), InvalidEvalExport);
assert.throws(() => parseEvalReport({ ...input, runs: [row(1), row(1)] }), InvalidEvalExport);
assert.throws(() => parseEvalReport({ ...input, prompts: ['DO_NOT_RENDER'] }), InvalidEvalExport);
assert.equal(
  parseEvalReport({ ...input, runs: [row(1, { date_utc: '2026-01-01T12:00:00.123456Z' })] }).runs
    .length,
  1,
);
const siteData = new URL('../data/eval-results.json', import.meta.url);
const orderingInput = parseEvalReport({
  ...input,
  runs: [
    row(1, { date_utc: '2026-01-01T12:00:00Z' }),
    row(2, { date_utc: '2026-01-01T12:00:00.000001Z' }),
    row(3, { date_utc: '2026-01-01T12:00:00.123456Z' }),
    row(4, { date_utc: '2026-01-01T12:00:00.123455Z' }),
    row(5, { date_utc: '2026-01-01T12:00:00.500000Z' }),
    row(6, { date_utc: '2026-01-01T12:00:00.5Z' }),
    row(7, { date_utc: null }),
    row(8, { date_utc: null }),
  ],
}).runs;
const orderingBefore = orderingInput.map((run) => run.run_id);
assert.deepEqual(
  evalHistory(orderingInput).map((run) => run.run_id),
  [5, 6, 3, 4, 2, 1, 7, 8].map((n) => `run-${n.toString(16).padStart(20, '0')}`),
  'Newest numeric UTC instants first, preserving microseconds, stable equal-instant IDs, null last',
);
assert.deepEqual(
  orderingInput.map((run) => run.run_id),
  orderingBefore,
  'History sort cannot mutate source records',
);
const pageSource = readFileSync(
  new URL('../app/playground/evals/page.tsx', import.meta.url),
  'utf8',
);
const metadataDescription = pageSource.match(/description:\s*'([^']+)'/)[1];
assert(!metadataDescription.includes('No verified results are published yet'));
assert(metadataDescription.includes('published evidence'));
const before = readFileSync(siteData, 'utf8');
const temp = mkdtempSync(path.join(tmpdir(), 'eval-import-rejection-'));
const unapproved = path.join(temp, 'unapproved.json');
writeFileSync(unapproved, JSON.stringify({ ...input, warning: 'PRIVATE_TEST_SENTINEL' }));
const rejectedImport = spawnSync(
  process.execPath,
  [
    '--experimental-strip-types',
    '--import',
    fileURLToPath(new URL('./security-test-register.mjs', import.meta.url)),
    fileURLToPath(new URL('./import-eval-results.mjs', import.meta.url)),
    unapproved,
  ],
  { encoding: 'utf8' },
);
assert.equal(rejectedImport.status, 1);
assert(!`${rejectedImport.stdout}${rejectedImport.stderr}`.includes('PRIVATE_TEST_SENTINEL'));
assert.equal(
  readFileSync(siteData, 'utf8'),
  before,
  'Rejected imports must not modify published site data',
);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(input, null, 2) + '\n');
console.log(
  'PASS: empty V2 import, approved/withheld labels, strict privacy rejection, UTC/unique IDs, count consistency, suite separation, verified-only rates, null/zero timing, populated fixture',
);
