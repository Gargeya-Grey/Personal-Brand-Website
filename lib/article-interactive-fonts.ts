/** Pure helpers that choose which of the page's own font files an interactive frame may receive. */

export type FontFaceRuleInfo = {
  family: string;
  src: string;
  sheetHref: string;
  weight: string;
  style: string;
  unicodeRange: string;
  stretch: string;
};

export type LoadedFontInfo = {
  family: string;
  weight: string;
  style: string;
  unicodeRange: string;
};

export type FontDescriptors = {
  weight?: string;
  style?: string;
  unicodeRange?: string;
  stretch?: string;
};

export type ArticleFontFace = {
  family: string;
  url: string;
  descriptors: FontDescriptors;
};

const unquote = (value: string) => value.trim().replace(/^(["'])(.*)\1$/, '$2').trim();

const compact = (value: string) => value.replace(/\s+/g, '').toLowerCase();

/** First family of a CSS font-family list, without quotes. */
export function primaryFamily(list: string) {
  const first = list.split(',')[0] ?? '';
  return unquote(first);
}

const FIRST_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/i;

function sameOriginFontUrl(src: string, sheetHref: string, origin: string) {
  const match = FIRST_URL.exec(src);
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? match[3] ?? '';
  if (!raw) return null;
  try {
    const resolved = new URL(raw, sheetHref || origin);
    return resolved.origin === origin ? resolved.href : null;
  } catch {
    return null;
  }
}

/**
 * Keep only faces the page already loaded, for wanted families, from the page's own origin.
 * The parent sends these bytes to the frame; the frame's CSP stays closed.
 */
export function pickArticleFontFaces({ families, origin, rules, loaded }: {
  families: string[];
  origin: string;
  rules: FontFaceRuleInfo[];
  loaded: LoadedFontInfo[];
}): ArticleFontFace[] {
  const wanted = new Set(families.map((family) => unquote(family).toLowerCase()).filter(Boolean));
  const loadedKeys = new Set(loaded.map((face) => faceKey(face)));
  const picked: ArticleFontFace[] = [];
  for (const rule of rules) {
    const family = unquote(rule.family);
    if (!wanted.has(family.toLowerCase())) continue;
    if (!loadedKeys.has(faceKey(rule))) continue;
    const url = sameOriginFontUrl(rule.src, rule.sheetHref, origin);
    if (!url) continue;
    const descriptors: FontDescriptors = {};
    if (rule.weight) descriptors.weight = rule.weight;
    if (rule.style) descriptors.style = rule.style;
    if (rule.unicodeRange) descriptors.unicodeRange = rule.unicodeRange;
    if (rule.stretch) descriptors.stretch = rule.stretch;
    picked.push({ family, url, descriptors });
  }
  return picked;
}

export type CodePointRange = [start: number, end: number];

const MAX_CODE_POINT = 0x10ffff;

/**
 * Parse a CSS unicode-range value into sorted, merged numeric ranges.
 * Handles `U+26`, `U+0-FF`, `U+4??` (wildcards), zero padding, any case and comma lists.
 * An empty value means the whole range, as CSS defines. Returns null for text it cannot parse.
 */
export function parseUnicodeRanges(text: string): CodePointRange[] | null {
  const trimmed = text.trim();
  if (!trimmed) return [[0, MAX_CODE_POINT]];
  const ranges: CodePointRange[] = [];
  for (const token of trimmed.split(',')) {
    const match = /^u\+\s*([0-9a-f?]{1,6})(?:\s*-\s*([0-9a-f]{1,6}))?$/i.exec(token.trim());
    if (!match) return null;
    const [, first, last] = match;
    if (first.includes('?')) {
      if (last !== undefined || !/^[0-9a-f]*\?+$/i.test(first)) return null;
      ranges.push([parseInt(first.replace(/\?/g, '0'), 16), parseInt(first.replace(/\?/g, 'f'), 16)]);
    } else {
      const start = parseInt(first, 16);
      const end = last === undefined ? start : parseInt(last, 16);
      if (end < start) return null;
      ranges.push([start, end]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: CodePointRange[] = [];
  for (const [start, end] of ranges) {
    const clampedEnd = Math.min(end, MAX_CODE_POINT);
    const previous = merged[merged.length - 1];
    if (previous && start <= previous[1] + 1) previous[1] = Math.max(previous[1], clampedEnd);
    else merged.push([start, clampedEnd]);
  }
  return merged;
}

/** Canonical text for a unicode-range, so the CSSOM text and `FontFace.unicodeRange` compare equal. */
export function normalizeUnicodeRange(text: string) {
  const ranges = parseUnicodeRanges(text);
  if (!ranges) return `raw:${compact(text)}`;
  return ranges.map(([start, end]) => `${start.toString(16)}-${end.toString(16)}`).join(',');
}

const WEIGHT_KEYWORDS: Record<string, number> = { normal: 400, bold: 700 };

/** Canonical text for a font-weight: `400`, `normal` and `400 400` are one value; a range is `low-high`. */
export function normalizeFontWeight(text: string) {
  const parts = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '400-400';
  const numbers = parts.map((part) => WEIGHT_KEYWORDS[part] ?? Number(part));
  if (numbers.length > 2 || numbers.some((value) => !Number.isFinite(value))) return `raw:${compact(text)}`;
  const low = numbers[0];
  const high = numbers[1] ?? low;
  return `${Math.min(low, high)}-${Math.max(low, high)}`;
}

function normalizeFontStyle(text: string) {
  const style = text.trim().toLowerCase().replace(/\s+/g, ' ');
  return style || 'normal';
}

/** Key that two descriptions of one face share, whichever API (CSSOM rule or FontFace) wrote them. */
export function faceKey(face: LoadedFontInfo) {
  return [
    unquote(face.family).toLowerCase(),
    normalizeFontWeight(face.weight),
    normalizeFontStyle(face.style),
    normalizeUnicodeRange(face.unicodeRange),
  ].join('|');
}
