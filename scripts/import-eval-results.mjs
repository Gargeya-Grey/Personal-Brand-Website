import { readFileSync, renameSync, writeFileSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { parseEvalReport } from '../lib/eval-results.ts';

const target = new URL('../data/eval-results.json', import.meta.url);
const temporary = new URL(`../data/.eval-results-import-${randomUUID()}.tmp`, import.meta.url);
let created = false;
try {
  if (!process.argv[2]) throw new Error();
  const bytes = readFileSync(process.argv[2]);
  if (bytes.length > 16 * 1024 * 1024) throw new Error();
  const approved = parseEvalReport(JSON.parse(bytes.toString('utf-8')));
  // Validate first, then write only the projection. An invalid source never enters site data.
  writeFileSync(temporary, JSON.stringify(approved, null, 2) + '\n', { flag: 'wx' });
  created = true;
  renameSync(temporary, target);
  console.log(`Imported approved V2 export: ${approved.runs.length} published records.`);
} catch {
  if (created) {
    try {
      unlinkSync(temporary);
    } catch {
      /* Rename may already have consumed this task's file. */
    }
  }
  console.error(
    'Import rejected. Provide a valid reviewed V2 sanitized JSON export; site data was not replaced.',
  );
  process.exitCode = 1;
}
