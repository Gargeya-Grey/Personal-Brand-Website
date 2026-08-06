/**
 * Quality gate for X packs (pass ≥ 90).
 * Rubric: data/x-reply-quality.md
 *
 * Usage:
 *   node scripts/score-x-drafts.mjs data/x-pack-today.json
 *   node scripts/score-x-drafts.mjs data/x-pack-today.json --require
 *
 * Exit 1 if --require and any draft fails.
 * Can be required from validate-x-pack.mjs
 */
import fs from 'fs';
import path from 'path';

export const PASS = 90;

export const CAPS = {
  lengthFit: 12,
  clarity: 15,
  hook: 15,
  funRead: 12,
  relatability: 15,
  voiceMatch: 15,
  humanTexture: 12,
  groundingFit: 4,
};

const SLUDGE = [
  /here are \d+ takeaways/i,
  /let'?s dive in/i,
  /game-?changer/i,
  /\bunlock\b/i,
  /\bleverage\b/i,
  /in today'?s landscape/i,
  /double down/i,
  /at the end of the day/i,
  /hot take\s*🔥/i,
  /as an ai\b/i,
  /delve into/i,
  /it'?s important to note/i,
  /in conclusion,/i,
];

const STAMP_OPENERS = [
  /^you'?re absolutely right\s*[—–-]/i,
  /^my take on your question is/i,
  /^that'?s the actual problem i'?m trying to solve/i,
];

/**
 * @param {object} pack
 * @returns {{ ok: boolean, issues: string[], scores: object[] }}
 */
export function scorePack(pack) {
  const issues = [];
  const scores = [];
  const drafts = Array.isArray(pack?.drafts) ? pack.drafts : [];

  const openers = drafts.map((d) =>
    String(d.body || '')
      .trim()
      .slice(0, 40)
      .toLowerCase()
      .replace(/\s+/g, ' ')
  );

  // pack monotony: identical openers
  for (let i = 0; i < openers.length; i++) {
    for (let j = i + 1; j < openers.length; j++) {
      if (openers[i] && openers[i] === openers[j]) {
        issues.push(
          `[error] monotony: drafts ${drafts[i].id} and ${drafts[j].id} share the same opener`
        );
      }
    }
  }

  // stamp opener on multiple replies
  const replies = drafts.filter((d) => d.kind === 'reply' || d.kind === 'quote');
  let stampCount = 0;
  for (const d of replies) {
    const body = String(d.body || '').trim();
    if (STAMP_OPENERS.some((re) => re.test(body))) stampCount += 1;
  }
  if (stampCount >= 2) {
    issues.push(
      `[error] monotony: ${stampCount} replies use forbidden stamp openers (see voice anti-monotony)`
    );
  }

  // shapes variety when ≥2 drafts have quality.shape
  const shapes = drafts.map((d) => d.quality?.shape).filter(Boolean);
  if (drafts.length >= 3 && shapes.length >= 2) {
    const unique = new Set(shapes);
    if (unique.size < 2) {
      issues.push(`[error] monotony: need ≥2 different quality.shape values in pack`);
    }
  }

  for (const d of drafts) {
    const id = d.id || '?';
    const body = typeof d.body === 'string' ? d.body.trim() : '';
    const q = d.quality;

    if (!body) {
      issues.push(`[error] ${id}: empty body`);
      scores.push({ id, total: 0, pass: false });
      continue;
    }

    for (const re of SLUDGE) {
      if (re.test(body)) {
        issues.push(`[error] ${id}: AI sludge matched ${re}`);
      }
    }

    if (!q || typeof q !== 'object') {
      issues.push(
        `[error] ${id}: missing quality{} — score via data/x-reply-quality.md (need total ≥ ${PASS})`
      );
      scores.push({ id, total: null, pass: false });
      continue;
    }

    const dims = q.dimensions && typeof q.dimensions === 'object' ? q.dimensions : null;
    if (!dims) {
      issues.push(`[error] ${id}: quality.dimensions required`);
      scores.push({ id, total: q.total ?? null, pass: false });
      continue;
    }

    let sum = 0;
    for (const [key, cap] of Object.entries(CAPS)) {
      const n = dims[key];
      if (typeof n !== 'number' || !Number.isFinite(n)) {
        issues.push(`[error] ${id}: quality.dimensions.${key} must be a number`);
        continue;
      }
      if (n < 0 || n > cap) {
        issues.push(`[error] ${id}: quality.dimensions.${key}=${n} outside 0–${cap}`);
      }
      sum += n;
    }

    const total = typeof q.total === 'number' ? q.total : sum;
    if (Math.abs(total - sum) > 1) {
      issues.push(
        `[error] ${id}: quality.total=${total} does not match dimensions sum=${sum}`
      );
    }

    if (!q.notes || typeof q.notes !== 'string' || !q.notes.trim()) {
      issues.push(`[error] ${id}: quality.notes required (why it passed)`);
    }

    if (total < PASS) {
      issues.push(
        `[error] ${id}: quality.total=${total} < ${PASS} — rewrite or drop (see x-reply-quality.md)`
      );
    }

    // soft heuristic: very long body with low claimed lengthFit is inconsistent
    const chars = body.length;
    if (chars > 900 && (dims.lengthFit ?? 0) >= 10) {
      issues.push(
        `[warn] ${id}: body is very long (${chars} chars) but lengthFit is high — double-check fit`
      );
    }
    if (chars < 15 && (d.kind === 'reply' || d.kind === 'short')) {
      issues.push(`[warn] ${id}: extremely short body (${chars} chars) — is hook enough?`);
    }

    scores.push({
      id,
      kind: d.kind,
      total,
      sum,
      shape: q.shape || null,
      pass: total >= PASS,
      notes: q.notes || '',
    });
  }

  const errors = issues.filter((i) => i.startsWith('[error]'));
  return { ok: errors.length === 0, issues, scores };
}

// CLI when run directly
const packPathArg = process.argv[2];
const runningAsCli =
  process.argv[1] &&
  /score-x-drafts\.mjs$/i.test(String(process.argv[1]).replace(/\\/g, '/'));

if (runningAsCli) {
  const packPath = packPathArg || 'data/x-pack-today.json';
  const pack = JSON.parse(fs.readFileSync(path.resolve(packPath), 'utf8'));
  const result = scorePack(pack);

  console.log(`Pack: ${pack.id || packPath}`);
  console.log(`Pass bar: ${PASS}`);
  console.log('Scores:');
  for (const s of result.scores) {
    const mark = s.pass ? 'PASS' : 'FAIL';
    console.log(
      `  [${mark}] ${s.id} · ${s.total ?? '—'}/100 · shape=${s.shape || '—'} · ${s.kind || ''}`
    );
  }
  for (const i of result.issues) console.log(i);

  if (!result.issues.length) {
    console.log('OK — all drafts meet quality gate');
  } else {
    const errors = result.issues.filter((i) => i.startsWith('[error]'));
    const warns = result.issues.filter((i) => i.startsWith('[warn]'));
    console.log(`\n${errors.length} error(s), ${warns.length} warning(s)`);
  }

  process.exit(result.ok ? 0 : 1);
}
