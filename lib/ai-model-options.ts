/**
 * Model choice for every AI call in the atelier. Client and server both import this file.
 * The owner picks a model slug and an effort level per surface; the browser remembers the pick,
 * and the server uses the .env model when no slug is sent.
 */

/** OpenRouter's unified reasoning levels. "default" sends no reasoning field, so the model keeps its own default. */
export const REASONING_EFFORTS = ['default', 'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

export const EFFORT_LABELS: Record<ReasoningEffort, string> = {
  default: 'Model default',
  none: 'None',
  minimal: 'Minimal',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  xhigh: 'Extra high',
  max: 'Max',
};

/** The places in the atelier that call a model. Each remembers its own choice. */
export type AiSurface = 'blog-metadata' | 'x-lab-analyst' | 'ledger-extract';

/** The Ledger can run on Google's Gemini API or on OpenRouter; every other surface runs on OpenRouter. */
export type AiModelProvider = 'openrouter' | 'google';

export const MAX_MODEL_SLUG_LENGTH = 128;
// OpenRouter slugs look like "vendor/model-name:variant"; Gemini slugs look like "gemini-flash-latest".
const MODEL_SLUG_PATTERN = /^[A-Za-z0-9~][A-Za-z0-9._\-/:~]*$/;

/** A trimmed, safe model slug, or null when the input is empty or malformed (the server then uses .env). */
export function normalizeModelSlug(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const slug = raw.trim();
  if (!slug || slug.length > MAX_MODEL_SLUG_LENGTH) return null;
  return MODEL_SLUG_PATTERN.test(slug) ? slug : null;
}

export function isReasoningEffort(raw: unknown): raw is ReasoningEffort {
  return typeof raw === 'string' && (REASONING_EFFORTS as readonly string[]).includes(raw);
}

/** Unknown or missing values become "default". */
export function normalizeEffort(raw: unknown): ReasoningEffort {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : raw;
  return isReasoningEffort(value) ? value : 'default';
}

/** The fields an AI request carries. An empty slug and "default" effort are left out, so the server uses its defaults. */
export type AiModelRequest = { model?: string; effort?: ReasoningEffort };

export function aiModelRequest(model: string, effort: ReasoningEffort): AiModelRequest {
  const slug = normalizeModelSlug(model);
  return {
    ...(slug ? { model: slug } : {}),
    ...(effort !== 'default' ? { effort } : {}),
  };
}

/** localStorage key for one surface and provider. The stored value is JSON: { model: string, effort: ReasoningEffort }. */
export function aiChoiceStorageKey(surface: AiSurface, provider: AiModelProvider = 'openrouter'): string {
  return `atelier:ai-model:${surface}:${provider}`;
}

/** The .env defaults, shown next to the controls so the owner sees what an empty field means. */
export type AiModelDefaults = { openRouterModel: string | null };
