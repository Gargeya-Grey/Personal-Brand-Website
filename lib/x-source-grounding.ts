/**
 * Source-grounding rules for X scout packs.
 * Replies must only quote / challenge claims that appear in the linked post.
 */

import type { XContentPack, XDraftItem, XDraftKind } from './x-content-model';
import { extractDraftSourceUrl } from './x-content-model';

export type GroundingIssue = {
  draftId: string;
  severity: 'error' | 'warn';
  message: string;
};

const STATUS_URL =
  /^https?:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+/i;

/** True if meta is a usable status URL for Copy & open. */
export function hasStatusUrl(meta: unknown): boolean {
  const url = extractDraftSourceUrl(meta);
  return !!url && STATUS_URL.test(url);
}

/**
 * Soft check: body should not name product/model tokens that are highly
 * specific unless they also appear in evidenceText (source post text).
 * This is a safety net — scouts must still verify by hand.
 */
export function findUngroundedProperTokens(
  body: string,
  evidenceText: string
): string[] {
  const evidence = evidenceText.toLowerCase();
  // Tokens that look like model/product names (Capitalized / CamelCase / digit-ish)
  const candidates = body.match(
    /\b(?:Fable\s*\d*|GPT-?\d+(?:\.\d+)?|Claude\s*[\w.-]*|Gemini\s*[\w.-]*|DeepSeek\s*[\w.-]*|Kimi\s*[\w.-]*|ProgramBench|Terminal\s*Bench(?:\s*[\d.]+)?|SWE-?bench|Arena|Elo)\b/gi
  );
  if (!candidates) return [];
  const bad: string[] = [];
  for (const raw of candidates) {
    const t = raw.trim();
    if (t.length < 3) continue;
    if (!evidence.includes(t.toLowerCase())) {
      // allow common words that match regex poorly
      if (/^(arena|elo)$/i.test(t) && evidence.includes('arena')) continue;
      bad.push(t);
    }
  }
  return [...new Set(bad)];
}

export function validateDraftGrounding(
  draft: XDraftItem,
  evidenceByUrl: Record<string, string> = {}
): GroundingIssue[] {
  const issues: GroundingIssue[] = [];
  const needsSource: XDraftKind[] = ['reply', 'quote'];

  if (needsSource.includes(draft.kind)) {
    if (!hasStatusUrl(draft.meta)) {
      issues.push({
        draftId: draft.id,
        severity: 'error',
        message:
          'Reply/quote must have meta = plain status URL (https://x.com/.../status/...).',
      });
    } else {
      const url = extractDraftSourceUrl(draft.meta)!;
      const evidence = evidenceByUrl[url] || evidenceByUrl[normalizeUrlKey(url)];
      if (evidence) {
        const ungrounded = findUngroundedProperTokens(draft.body, evidence);
        for (const token of ungrounded) {
          issues.push({
            draftId: draft.id,
            severity: 'error',
            message: `Body mentions "${token}" but that token is not in the linked source text. Quote only that post, or change meta to the post that said it.`,
          });
        }
      }
    }
  }

  if (typeof draft.meta === 'object' && draft.meta !== null) {
    issues.push({
      draftId: draft.id,
      severity: 'error',
      message: 'meta must be a string URL, not an object { url, note }.',
    });
  }

  return issues;
}

function normalizeUrlKey(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)/i, 'https://x.com')
    .replace(/[?#].*$/, '')
    .replace(/\/$/, '');
}

export function validatePackGrounding(
  pack: XContentPack,
  evidenceByUrl: Record<string, string> = {}
): GroundingIssue[] {
  const issues: GroundingIssue[] = [];
  for (const d of pack.drafts || []) {
    issues.push(...validateDraftGrounding(d, evidenceByUrl));
  }
  // One source post → at most one reply draft (avoid double-dipping / merged claims)
  const replyUrls = new Map<string, string[]>();
  for (const d of pack.drafts || []) {
    if (d.kind !== 'reply' && d.kind !== 'quote') continue;
    const u = extractDraftSourceUrl(d.meta);
    if (!u) continue;
    const key = normalizeUrlKey(u);
    const list = replyUrls.get(key) || [];
    list.push(d.id);
    replyUrls.set(key, list);
  }
  for (const [url, ids] of replyUrls) {
    if (ids.length > 1) {
      issues.push({
        draftId: ids.join(','),
        severity: 'warn',
        message: `Multiple drafts share the same source ${url}: ${ids.join(', ')}. Prefer one reply per post.`,
      });
    }
  }
  return issues;
}

export function formatGroundingReport(issues: GroundingIssue[]): string {
  if (!issues.length) return 'OK — no grounding issues detected.';
  return issues
    .map((i) => `[${i.severity}] ${i.draftId}: ${i.message}`)
    .join('\n');
}
