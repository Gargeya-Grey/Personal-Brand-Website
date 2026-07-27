/**
 * SERP-safe meta description helpers.
 * Auditors typically want 25–160 characters; Google often displays ~150–160.
 */

export const META_DESCRIPTION_MIN = 25;
export const META_DESCRIPTION_MAX = 155;

/** Collapse whitespace and trim. */
export function normalizeMetaText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Clamp a description into a healthy SERP window (25–155 by default).
 * Prefer ending on a sentence/word boundary when truncating.
 */
export function clampMetaDescription(
  text: string,
  opts?: { min?: number; max?: number; fallback?: string }
): string {
  const min = opts?.min ?? META_DESCRIPTION_MIN;
  const max = opts?.max ?? META_DESCRIPTION_MAX;
  const fallback =
    opts?.fallback ||
    'Gargeya Sharma — Founder & Architect at Edudojo.ai, building AI for evaluation and education.';

  let value = normalizeMetaText(text || '');
  if (!value || value.length < min) {
    value = normalizeMetaText(fallback);
  }

  if (value.length > max) {
    const slice = value.slice(0, max - 1);
    const lastStop = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? ')
    );
    const lastSpace = slice.lastIndexOf(' ');
    if (lastStop >= Math.floor(max * 0.55)) {
      value = slice.slice(0, lastStop + 1).trim();
    } else if (lastSpace > 40) {
      value = `${slice.slice(0, lastSpace).trim()}…`;
    } else {
      value = `${slice.trim()}…`;
    }
  }

  if (value.length > max) {
    value = `${value.slice(0, max - 1).trim()}…`;
  }

  return value;
}
