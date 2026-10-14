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

function faceKey(face: LoadedFontInfo) {
  return [unquote(face.family), face.weight, face.style, face.unicodeRange].map(compact).join('|');
}
