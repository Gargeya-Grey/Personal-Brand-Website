import {
  InvalidEvalExport,
  exactExportObject,
  exportArray,
  exportChoice,
  exportIdentifier,
  exportNumber,
  nullableExportValue,
  parseVersionedEvalExport,
} from './eval-export-validation';

export const PUBLIC_EVAL_WARNING =
  'Setup comparison; small samples do not establish a global winner. Labels appear only through a constrained owner-approved publication map. No private configuration or raw evidence is published.';
export const evalTaskTypes = [
  'bug fix',
  'small feature',
  'refactor',
  'review',
  'clarification/ambiguity',
] as const;
const caseTypes = {
  'bug-starter': 'bug fix',
  'feature-demo': 'small feature',
  'refactor-props': 'refactor',
  'review-gate': 'review',
  'clarify-recovery': 'clarification/ambiguity',
} as const;
const version = exportIdentifier(
  /^(unknown|[0-9]{1,4}(\.[0-9]{1,4}){0,3}|[0-9]{4}-[0-9]{2}-[0-9]{2})$/,
  32,
);
const metadataSchema = exactExportObject({
  publication: exportChoice(['withheld', 'owner_approved']),
  model: exportChoice([
    'Claude Fable',
    'Claude Opus',
    'Claude Sonnet',
    'GPT',
    'GPT Astra',
    'GPT Sol',
    'Unknown',
  ]),
  version,
  effort: exportChoice(['high', 'low', 'max', 'medium', 'ultra', 'unknown', 'xhigh']),
  harness: exportChoice(['Claude Code', 'Codex + PStack', 'Codex CLI', 'Unknown']),
  tool_version: version,
});
const utcIdentifier = exportIdentifier(
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?Z$/,
  32,
);
function utcDate(value: unknown): string {
  const text = utcIdentifier(value);
  const date = new Date(text);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 19) !== text.slice(0, 19)) {
    throw new InvalidEvalExport();
  }
  return text;
}
const runSchema = exactExportObject({
  case_id: exportChoice([
    'bug-starter',
    'feature-demo',
    'refactor-props',
    'review-gate',
    'clarify-recovery',
  ]),
  task_type: exportChoice(evalTaskTypes),
  suite_version: exportIdentifier(/^[0-9]+\.[0-9]+\.[0-9]+$/, 32),
  setup: exportIdentifier(/^setup-[0-9a-f]{16}$/, 22),
  status: exportChoice(['success', 'fail', 'blocked']),
  verification: exportChoice(['self_reported', 'verified']),
  elapsed_seconds: nullableExportValue(exportNumber()),
  intervention_count: exportNumber({ integer: true }),
  usage_state: exportChoice(['visible', 'unknown']),
  check_pass_count: exportNumber({ integer: true }),
  check_count: exportNumber({ integer: true }),
  run_id: exportIdentifier(/^run-[0-9a-f]{20}$/, 24),
  date_utc: nullableExportValue(utcDate),
  public_metadata: metadataSchema,
});
const reportSchema = exactExportObject({
  report_version: exportChoice([2]),
  // Do not accept/render arbitrary export warning text.
  warning: exportChoice([PUBLIC_EVAL_WARNING]),
  runs: exportArray(runSchema, 10000),
});
export type EvalRun = ReturnType<typeof runSchema>;
export type EvalReport = ReturnType<typeof reportSchema>;

export function parseEvalReport(value: unknown): EvalReport {
  const report = parseVersionedEvalExport(value, { 2: reportSchema });
  const ids = new Set<string>();
  for (const run of report.runs) {
    const m = run.public_metadata;
    if (
      ids.has(run.run_id) ||
      caseTypes[run.case_id] !== run.task_type ||
      run.check_pass_count > run.check_count ||
      (m.publication === 'withheld' &&
        (m.model !== 'Unknown' ||
          m.version !== 'unknown' ||
          m.effort !== 'unknown' ||
          m.harness !== 'Unknown' ||
          m.tool_version !== 'unknown'))
    )
      throw new InvalidEvalExport();
    ids.add(run.run_id);
  }
  return report;
}

export function evalSetupLabel(run: EvalRun): string {
  const m = run.public_metadata;
  return m.publication === 'owner_approved'
    ? `${m.model} ${m.version} · ${m.effort} · ${m.harness} (${m.tool_version})`
    : `Undisclosed setup · ${run.setup}`;
}

export function evalSummary(runs: readonly EvalRun[]) {
  const completed = runs.filter((r) => r.verification === 'verified' && r.status !== 'blocked');
  const successful = completed.filter((r) => r.status === 'success').length;
  return {
    verifiedCompleted: completed.length,
    setups: new Set(completed.map((r) => r.setup)).size,
    cases: new Set(completed.map((r) => `${r.suite_version}|${r.case_id}`)).size,
    successful,
    successRate: completed.length ? successful / completed.length : null,
    blocked: runs.filter((r) => r.status === 'blocked').length,
    selfReported: runs.filter((r) => r.verification === 'self_reported').length,
  };
}

export function evalGroups(runs: readonly EvalRun[]) {
  const groups = new Map<string, { key: string; run: EvalRun; runs: EvalRun[] }>();
  for (const run of runs) {
    const key = JSON.stringify([run.suite_version, run.task_type, run.setup, run.public_metadata]);
    const group = groups.get(key) ?? { key, run, runs: [] };
    group.runs.push(run);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const summary = evalSummary(group.runs);
    const observed = group.runs.filter(
      (r) => r.verification === 'verified' && r.status !== 'blocked' && r.elapsed_seconds !== null,
    );
    return {
      ...group,
      ...summary,
      total: group.runs.length,
      failed: summary.verifiedCompleted - summary.successful,
      observedDurations: observed.length,
      meanSeconds: observed.length
        ? observed.reduce((sum, r) => sum + r.elapsed_seconds! / observed.length, 0)
        : null,
    };
  });
}
