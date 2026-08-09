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
  /^haha this lands hard/i,
  /^yeah this lands clean/i,
  /^this lands hard/i,
];

/** Fake “clever brand” parallel — banned as default reply glue (voice file). */
const FAKE_CLEVER_SCHOOL = [
  /same fog students hit/i,
  /clean final sheet/i,
  /grade still smiles/i,
  /train the best cheaters/i,
  /if we only score the win/i,
];

/**
 * Conversational / second-person energy expected in replies (voice: reply ≠ post).
 * Avoid bare "this"/"that" — they appear in formal posts ("that's what…").
 */
const REPLY_MARKERS =
  /\b(you|your|you'?re|you'?ve|yeah|yep|yup|haha|hehe|lol|lmao|btw|huh|thanks|thank you|love this|this lands|this tracks|this clicked|this is so true|this really|this framing|you'?re right|i get you|fair point|same here|opened my eyes|for me —|for me -|genuinely helpful)\b/i;

const REPLY_OPENERS =
  /^(yeah|yep|yup|haha|lol|btw|oh|wow|damn|true|fair|exactly|love this|you |you'?re |thanks )/i;

/** Formal standalone openers that smell like an original post, not a reply. */
const POST_LIKE_OPENERS =
  /^(open weights|ai is |the real |the fastest |when knowledge|access without|if writing|if models|students are |believe it or not|here'?s a quiet|here is a |the boring |outsourcing thinking|sandboxes,|model weights)/i;

/**
 * True if a reply/quote body reads like a standalone post (fails quality gate).
 * Short micros can pass without many markers; longer bodies need reply energy.
 * @param {string} body
 */
export function looksLikeStandalonePost(body) {
  const text = String(body || '').trim();
  if (!text) return false;

  const hasMarkers = REPLY_MARKERS.test(text) || REPLY_OPENERS.test(text);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const lines = text.split(/\n/).filter((l) => l.trim());

  // Wall of text in a thread reply
  if (paragraphs.length > 4 || text.length > 900) return true;

  // Long formal thesis with no conversational glue
  if (text.length >= 140 && !hasMarkers) return true;

  // Medium length + post-like cold open + no markers
  if (text.length >= 90 && POST_LIKE_OPENERS.test(text) && !hasMarkers) return true;

  // Multi-paragraph essay without any reply markers
  if (paragraphs.length >= 2 && text.length >= 160 && !hasMarkers) return true;

  // Three+ dense lines, cold open, no reply energy
  if (lines.length >= 3 && text.length >= 160 && !hasMarkers) return true;

  return false;
}

/**
 * Soft: original that is only a reply-to-someone with no standalone meat.
 * @param {string} body
 */
export function looksLikeReplyDisguisedAsOriginal(body) {
  const text = String(body || '').trim();
  if (text.length < 40) return false;
  // Almost only addressing "you" about "this post" without a self-contained claim
  const onlyReactive =
    /^(yeah|yep|haha|love this|this is so true|thanks for)/i.test(text) &&
    text.length < 120 &&
    !/\b(i |i'?m |we |students |schools |when |if you learn|try this|here'?s )\b/i.test(text);
  return onlyReactive;
}

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
    const kind = d.kind || 'short';

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

    // Reply ≠ post gate (voice + quality docs)
    if (kind === 'reply' || kind === 'quote') {
      if (looksLikeStandalonePost(body)) {
        issues.push(
          `[error] ${id}: post-like reply — rewrite to sound conversational/second-person (see voice Reply vs original; x-reply-quality.md). Body should fail if it works as a standalone post.`
        );
      }
      const paras = body.split(/\n\s*\n/).filter((p) => p.trim());
      if (paras.length > 4) {
        issues.push(
          `[error] ${id}: reply wall of text (${paras.length} paragraphs) — cut to ≤4 short beats for a busy thread`
        );
      }
      // Echo OP then slam school/assessment slogan (canonical fake Gargeya)
      const schoolHits = FAKE_CLEVER_SCHOOL.filter((re) => re.test(body)).length;
      if (schoolHits >= 2) {
        issues.push(
          `[error] ${id}: fake-clever school parallel — restating OP then forcing final-sheet/grade/cheater glue (see gargeya-voice.md forbidden). Stay in the post's world.`
        );
      }
      if (/^haha this lands hard/i.test(body) || /^this lands hard —/i.test(body)) {
        issues.push(
          `[error] ${id}: stamp opener "lands hard" — rewrite in natural voice (banned house style)`
        );
      }
    }

    if (kind === 'short' || kind === 'flagship') {
      if (looksLikeReplyDisguisedAsOriginal(body)) {
        issues.push(
          `[warn] ${id}: original may be reply-shaped only — ensure standalone insight (pillar + soul)`
        );
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

    const chars = body.length;
    const paras = body.split(/\n\s*\n/).filter(Boolean).length;
    if (chars > 900 && (dims.lengthFit ?? 0) >= 10) {
      issues.push(
        `[warn] ${id}: body is very long (${chars} chars) but lengthFit is high — double-check fit`
      );
    }
    if (chars < 15 && (d.kind === 'reply' || d.kind === 'short')) {
      issues.push(`[warn] ${id}: extremely short body (${chars} chars) — is hook enough?`);
    }
    if ((d.kind === 'reply' || d.kind === 'quote') && (paras > 4 || chars > 900)) {
      const msg = `[error] ${id}: reply wall — ${paras} paras / ${chars} chars (reply should be readable in thread; cut to conversational length, see gargeya-voice.md Length guidance)`;
      if (paras > 5 || chars > 1100) issues.push(msg);
      else issues.push(msg.replace('[error]', '[warn]'));
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
