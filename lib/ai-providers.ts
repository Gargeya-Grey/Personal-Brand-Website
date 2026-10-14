import 'server-only';
import { normalizeEffort, normalizeModelSlug, type ReasoningEffort } from '@/lib/ai-model-options';

/** The .env model. The owner can override it per request from the atelier's model control. */
export function defaultOpenRouterModel(): string {
  return (process.env.OPENROUTER_MODEL || '').trim();
}

/** OpenRouter's unified reasoning field. "default" sends none, so the model keeps its own setting. */
export function openRouterReasoning(effort: ReasoningEffort): { effort: Exclude<ReasoningEffort, 'default'>; exclude: true } | undefined {
  return effort === 'default' ? undefined : { effort, exclude: true };
}

export async function callOpenRouter(opts: {
  apiKey: string;
  model: string;
  effort: ReasoningEffort;
  systemPrompt: string;
  userContent: string;
  jsonFormat?: boolean;
}): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'Gargeya Editorial',
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.systemPrompt },
        { role: 'user', content: opts.userContent },
      ],
      response_format: opts.jsonFormat ? { type: 'json_object' } : undefined,
      reasoning: openRouterReasoning(opts.effort),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API returned error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Failed to receive completion content from OpenRouter.');
  return content as string;
}

/** Resolves the key, model and effort once, so a multi-step route uses one model throughout. */
export function resolveOpenRouterChoice(requested: { model?: unknown; effort?: unknown }): {
  apiKey: string;
  model: string;
  effort: ReasoningEffort;
} {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.');
  const model = normalizeModelSlug(requested.model) || defaultOpenRouterModel();
  if (!model) {
    throw new Error('No model chosen. Enter a model slug in the atelier, or set OPENROUTER_MODEL in .env.');
  }
  return { apiKey, model, effort: normalizeEffort(requested.effort) };
}

export async function completeWithOpenRouter(opts: {
  model?: unknown;
  effort?: unknown;
  systemPrompt: string;
  userContent: string;
  jsonFormat?: boolean;
}): Promise<{ model: string; effort: ReasoningEffort; text: string }> {
  const { apiKey, model, effort } = resolveOpenRouterChoice(opts);
  const text = await callOpenRouter({
    apiKey,
    model,
    effort,
    systemPrompt: opts.systemPrompt,
    userContent: opts.userContent,
    jsonFormat: opts.jsonFormat,
  });
  return { model, effort, text };
}
