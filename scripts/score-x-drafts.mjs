/**
 * Tiny mechanical gate for X packs.
 * Writing law lives in data/gargeya-voice.md. There is no numeric score.
 *
 * Usage:
 *   node scripts/score-x-drafts.mjs data/x-pack-today.json
 */
import fs from 'fs';
import path from 'path';

const EM_DASH = /[—―]|–(?=\s)|(?<=\s)–/;
const NONSENSE_REPLY =
  /\b(evening shift|live (thread|updates)|go do your|football|kick-?off|full[- ]time)\b/i;
const INVENTED_FRAME =
  /\b(ranking|scoreboard|fight|debate) on your post\b/i;
const WRITER_TWEET =
  /^the \w{3,14} is the \w{3,14} (part|bit)\b/i;
const FAKE_PERSONAL = [
  /\blast night i\b/i,
  /\byesterday i\b/i,
  /\bthis morning i\b/i,
  /\bmy (younger )?cousin\b/i,
  /\bteammate'?s doc\b/i,
  /\bmy friend said\b/i,
  /\ba customer told me\b/i,
];

/**
 * Whole draft is a punch-stack: three or more sentences, all short.
 * A long noticing plus a short closing principle is allowed (owner style).
 */
export function looksChoppyTelegram(body) {
  const text = String(body || '').replace(/\n+/g, ' ').trim();
  if (!text) return false;
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 1);
  if (sentences.length < 3) return false;
  const lengths = sentences.map((s) => s.trim().split(/\s+/).filter(Boolean).length);
  return lengths.every((n) => n > 0 && n <= 14);
}

export function hasEmDash(body) {
  return EM_DASH.test(String(body || ''));
}

export function looksOffThesisReply(body) {
  return NONSENSE_REPLY.test(String(body || ''));
}

/**
 * @param {object} pack
 * @returns {{ ok: boolean, issues: string[], scores: object[] }}
 */
export function scorePack(pack) {
  const issues = [];
  const scores = [];
  const drafts = Array.isArray(pack?.drafts) ? pack.drafts : [];

  const replies = drafts.filter((d) => d.kind === 'reply' || d.kind === 'quote');
  const originals = drafts.filter((d) => d.kind === 'short' || d.kind === 'flagship');
  if (replies.length < 1) {
    issues.push('[error] pack needs at least one reply with a real source');
  }
  if (replies.length < 2) {
    issues.push('[warn] sitting packs usually want 2 morning or 3 evening replies in different big rooms');
  }
  if (replies.length >= 1 && originals.length < 1) {
    issues.push('[warn] pack has no own tweet (ok on evening if morning already left the day’s original)');
  }

  const openers = drafts.map((d) =>
    String(d.body || '')
      .trim()
      .slice(0, 40)
      .toLowerCase()
      .replace(/\s+/g, ' ')
  );
  for (let i = 0; i < openers.length; i++) {
    for (let j = i + 1; j < openers.length; j++) {
      if (openers[i] && openers[i] === openers[j]) {
        issues.push(
          `[error] monotony: drafts ${drafts[i].id} and ${drafts[j].id} share the same opener`
        );
      }
    }
  }

  if (replies.filter((d) => /^yeah\b/i.test(String(d.body || '').trim())).length >= 2) {
    issues.push('[error] monotony: both replies open with "yeah"');
  }

  for (const d of drafts) {
    const id = d.id || '?';
    const body = typeof d.body === 'string' ? d.body.trim() : '';
    const kind = d.kind || 'short';

    if (!body) {
      issues.push(`[error] ${id}: empty body`);
      scores.push({ id, pass: false });
      continue;
    }
    if (hasEmDash(body)) {
      issues.push(`[error] ${id}: em-dash found`);
    }
    if (looksChoppyTelegram(body)) {
      issues.push(
        `[error] ${id}: punch stack — three+ short sentences. Write like a person. One feeling, sentences that hold together (data/gargeya-voice.md)`
      );
    }
    if (WRITER_TWEET.test(body) || /^\s*fine\.\s*$/im.test(body)) {
      issues.push(`[error] ${id}: writer-tweet voice — The X is the Y part / lone Fine.`);
    }
    if (kind === 'reply' || kind === 'quote') {
      if (looksOffThesisReply(body)) {
        issues.push(
          `[error] ${id}: sports / evening-shift / live-thread reply — drop the room`
        );
      }
      if (INVENTED_FRAME.test(body)) {
        issues.push(
          `[error] ${id}: invented ranking/fight/debate on your post`
        );
      }
    }
    if ((kind === 'short' || kind === 'flagship') && FAKE_PERSONAL.some((re) => re.test(body))) {
      issues.push(`[error] ${id}: fake-personal original`);
    }

    scores.push({ id, kind, pass: true, notes: '' });
  }

  const errors = issues.filter((i) => i.startsWith('[error]'));
  for (const s of scores) {
    if (issues.some((i) => i.startsWith(`[error] ${s.id}:`))) s.pass = false;
  }
  return { ok: errors.length === 0, issues, scores };
}

const runningAsCli =
  process.argv[1] &&
  /score-x-drafts\.mjs$/i.test(String(process.argv[1]).replace(/\\/g, '/'));

if (runningAsCli) {
  const packPath = process.argv[2] || 'data/x-pack-today.json';
  const pack = JSON.parse(fs.readFileSync(path.resolve(packPath), 'utf8'));
  const result = scorePack(pack);
  console.log(`Pack: ${pack.id || packPath}`);
  console.log('Gate: mechanical (no numeric score)');
  for (const s of result.scores) {
    console.log(`  [${s.pass ? 'OK' : 'FAIL'}] ${s.id} · ${s.kind || ''}`);
  }
  for (const i of result.issues) console.log(i);
  if (!result.issues.length) console.log('OK — mechanical gate passed');
  process.exit(result.ok ? 0 : 1);
}
