/**
 * Validate a pack for scout bugs (meta shape, reply URLs, optional evidence map)
 * + small mechanical gate via score-x-drafts.mjs (no numeric score)
 *
 * Usage:
 *   node scripts/validate-x-pack.mjs data/x-pack-today.json
 *   node scripts/validate-x-pack.mjs data/x-pack-today.json data/x-pack-evidence.json
 *   node scripts/validate-x-pack.mjs data/x-pack-today.json data/x-pack-evidence.json --no-quality
 *
 * Evidence file (optional): { "https://x.com/.../status/123": "full source text..." }
 */
import fs from 'fs';
import path from 'path';
import { scorePack } from './score-x-drafts.mjs';

const packPath = process.argv[2] || 'data/x-pack-today.json';
const evidencePath = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
const skipQuality = process.argv.includes('--no-quality');

const pack = JSON.parse(fs.readFileSync(path.resolve(packPath), 'utf8'));
const evidence = evidencePath
  ? JSON.parse(fs.readFileSync(path.resolve(evidencePath), 'utf8'))
  : {};

function extractUrl(meta) {
  if (meta == null) return null;
  if (typeof meta === 'string') {
    const m = meta.trim().match(/https?:\/\/[^\s)"']+/i);
    return m ? m[0] : null;
  }
  if (typeof meta === 'object' && typeof meta.url === 'string') return meta.url.trim();
  return null;
}

function normalizeUrl(url) {
  return url
    .replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)/i, 'https://x.com')
    .replace(/[?#].*$/, '')
    .replace(/\/$/, '');
}

const TOKEN_RE =
  /\b(?:Fable\s*\d*|GPT-?\d+(?:\.\d+)?|Claude\s*[\w.-]*|Gemini\s*[\w.-]*|DeepSeek\s*[\w.-]*|Kimi\s*[\w.-]*|ProgramBench|Terminal\s*Bench(?:\s*[\d.]+)?|SWE-?bench)\b/gi;

const issues = [];
const drafts = Array.isArray(pack.drafts) ? pack.drafts : [];

for (const d of drafts) {
  const id = d.id || '?';
  if (d.meta && typeof d.meta === 'object') {
    issues.push(`[error] ${id}: meta is object — must be plain URL string`);
  }
  if (d.kind === 'reply' || d.kind === 'quote') {
    const url = extractUrl(d.meta);
    if (!url || !/\/status\/\d+/i.test(url)) {
      issues.push(`[error] ${id}: reply/quote missing status URL in meta`);
      continue;
    }
    const key = normalizeUrl(url);
    const evidenceText =
      evidence[url] || evidence[key] || evidence[url.replace('twitter.com', 'x.com')];
    if (evidenceText && typeof d.body === 'string') {
      const tokens = d.body.match(TOKEN_RE) || [];
      const lower = evidenceText.toLowerCase();
      for (const t of tokens) {
        if (!lower.includes(String(t).toLowerCase())) {
          issues.push(
            `[error] ${id}: body mentions "${t}" not found in evidence for ${url}`
          );
        }
      }
    } else if (!evidenceText) {
      issues.push(
        `[warn] ${id}: no evidence text provided for ${url} — manual verify required`
      );
    }
  }
}

// duplicate sources
const byUrl = new Map();
for (const d of drafts) {
  if (d.kind !== 'reply' && d.kind !== 'quote') continue;
  const url = extractUrl(d.meta);
  if (!url) continue;
  const k = normalizeUrl(url);
  if (!byUrl.has(k)) byUrl.set(k, []);
  byUrl.get(k).push(d.id);
}
for (const [url, ids] of byUrl) {
  if (ids.length > 1) {
    issues.push(`[warn] same source used by multiple drafts (${ids.join(', ')}): ${url}`);
  }
}

// Quality gate (default on)
if (!skipQuality) {
  const q = scorePack(pack);
  for (const s of q.scores) {
    console.log(
      `  gate ${s.pass ? 'OK' : 'FAIL'} ${s.id}`
    );
  }
  for (const i of q.issues) issues.push(i);
}

const errors = issues.filter((i) => i.startsWith('[error]'));
const warns = issues.filter((i) => i.startsWith('[warn]'));

console.log(`Pack: ${pack.id || packPath}`);
console.log(`Drafts: ${drafts.length}`);
if (!issues.length) {
  console.log('OK — no issues (grounding + mechanical gate)');
  process.exit(0);
}
for (const i of issues) console.log(i);
console.log(`\n${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
