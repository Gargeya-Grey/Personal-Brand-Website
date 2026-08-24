import 'server-only';
import {
  Categories,
  DealTypes,
  PaymentModes,
  SubscriptionFrequencies,
  TaxClasses,
  Types,
} from '@/lib/ledger-schema';

export type LedgerAiProvider = 'google' | 'openrouter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ChatPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export function resolveLedgerProvider(requested?: string): LedgerAiProvider {
  return requested === 'openrouter' ? 'openrouter' : 'google';
}

export function geminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
}

export function geminiModels(): string[] {
  const primary = (process.env.GEMINI_MODEL || process.env.LEDGER_GEMINI_MODEL || 'gemini-flash-latest').trim();
  const fallback = (process.env.GEMINI_MODEL_FALLBACK || 'gemini-flash-latest').trim();
  return [...new Set([primary, fallback, 'gemini-flash-latest'].filter(Boolean))];
}

/** Change LEDGER_OPENROUTER_MODEL in .env to switch the OpenRouter model. */
export function ledgerOpenRouterModel(): string {
  return (process.env.LEDGER_OPENROUTER_MODEL || process.env.OPENROUTER_MODEL || '').trim();
}

export function isGeminiConfigured(): boolean {
  return geminiApiKey().length > 0;
}

export function isOpenRouterConfigured(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || '').trim() && !!ledgerOpenRouterModel();
}

export function isLedgerAiConfigured(): boolean {
  return isGeminiConfigured() || isOpenRouterConfigured();
}

export function ledgerAiPublicConfig() {
  return {
    aiConfigured: isLedgerAiConfigured(),
    geminiConfigured: isGeminiConfigured(),
    openRouterConfigured: isOpenRouterConfigured(),
    geminiModel: geminiModels()[0] || null,
    openRouterModel: ledgerOpenRouterModel() || null,
  };
}

async function fetchJsonWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, init);
      const retryable = response.status === 429 || response.status === 503 || response.status === 504;
      if (retryable && attempt < attempts) {
        await sleep(2 ** attempt * 400);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < attempts) await sleep(2 ** attempt * 400);
    }
  }
  throw lastError || new Error('AI request failed');
}

function contentFromOpenAiShape(data: unknown): string {
  const payload = data as {
    choices?: Array<{ message?: { content?: unknown } }>;
    output_text?: string;
    text?: string;
  };
  const raw = payload.choices?.[0]?.message?.content;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (Array.isArray(raw)) {
    const joined = raw
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: string }).text || '');
        }
        return '';
      })
      .join('\n')
      .trim();
    if (joined) return joined;
  }
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim();
  if (typeof payload.text === 'string' && payload.text.trim()) return payload.text.trim();
  return '';
}

function contentFromGemini(data: unknown): string {
  const payload = data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };
  if (payload.error?.message) throw new Error(payload.error.message);
  const parts = payload.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part.text || '')
    .join('\n')
    .trim();
  return text;
}

const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW', 'ABSENT'];

export const LEDGER_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    chainOfThought: { type: 'STRING' },
    transactionName: { type: 'STRING' },
    type: { type: 'STRING', enum: [...Types] },
    category: { type: 'STRING', enum: [...Categories] },
    amount: { type: 'NUMBER', nullable: true },
    netAmount: { type: 'NUMBER', nullable: true },
    gstAmount: { type: 'NUMBER', nullable: true },
    date: { type: 'STRING' },
    paymentMode: { type: 'STRING', enum: [...PaymentModes] },
    taxClass: { type: 'STRING', enum: [...TaxClasses] },
    dealType: { type: 'STRING', enum: [...DealTypes] },
    vendor: { type: 'STRING' },
    customer: { type: 'STRING', nullable: true },
    invoiceNumber: { type: 'STRING' },
    businessPurpose: { type: 'STRING' },
    idfcWowCard: { type: 'BOOLEAN', nullable: true },
    gstApplicable: { type: 'BOOLEAN', nullable: true },
    financialYear: { type: 'STRING' },
    month: { type: 'STRING' },
    notes: { type: 'STRING' },
    requiresInrConversion: { type: 'BOOLEAN', nullable: true },
    isSubscription: { type: 'BOOLEAN', nullable: true },
    subscriptionFrequency: { type: 'STRING', enum: [...SubscriptionFrequencies], nullable: true },
    confidence_flags: {
      type: 'OBJECT',
      properties: {
        transactionName: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        type: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        category: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        amount: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        netAmount: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        gstAmount: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        date: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        paymentMode: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        taxClass: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        dealType: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        vendor: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        invoiceNumber: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        businessPurpose: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        financialYear: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        month: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        notes: { type: 'STRING', enum: CONFIDENCE_LEVELS },
        isSubscription: { type: 'STRING', enum: CONFIDENCE_LEVELS },
      },
    },
    sourceFusion: { type: 'STRING' },
  },
  required: ['transactionName', 'type', 'category', 'date', 'vendor', 'businessPurpose'],
};

async function callGemini(opts: {
  systemPrompt: string;
  userText: string;
  image?: { mimeType: string; data: string };
  jsonFormat?: boolean;
  thinkingBudget?: number;
}): Promise<string> {
  const apiKey = geminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

  const parts: Array<Record<string, unknown>> = [];
  if (opts.image?.data) {
    parts.push({
      inline_data: {
        mime_type: opts.image.mimeType || 'image/jpeg',
        data: opts.image.data,
      },
    });
  }
  parts.push({ text: opts.userText });

  const body = {
    system_instruction: { parts: [{ text: opts.systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.1,
      ...(opts.thinkingBudget !== undefined
        ? { thinkingConfig: { thinkingBudget: opts.thinkingBudget } }
        : {}),
      ...(opts.jsonFormat
        ? {
            responseMimeType: 'application/json',
            responseSchema: LEDGER_RESPONSE_SCHEMA,
          }
        : {}),
    },
  };

  let lastError: Error | null = null;
  const models = geminiModels();
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex]!;
    const attempts = modelIndex === 0 ? 2 : 1;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const raw = await response.text();
        let parsed: unknown = {};
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch {
          parsed = { error: { message: raw.slice(0, 300) } };
        }

        if (!response.ok) {
          const message =
            (parsed as { error?: { message?: string } }).error?.message ||
            `Gemini ${response.status}`;
          // If thinkingConfig is unsupported on this model, retry without it
          if (body.generationConfig.thinkingConfig && /thinkingConfig|unrecognized/i.test(message)) {
            delete (body.generationConfig as { thinkingConfig?: unknown }).thinkingConfig;
            continue;
          }
          const transient =
            response.status === 429 ||
            response.status === 503 ||
            response.status === 504 ||
            /unavailable|overloaded|resource exhausted|high demand/i.test(message);
          if (transient && attempt < attempts) {
            await sleep(2 ** attempt * 400);
            continue;
          }
          lastError = new Error(message);
          break;
        }

        const text = contentFromGemini(parsed);
        if (!text) {
          lastError = new Error(`Gemini model ${model} returned an empty completion.`);
          break;
        }
        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < attempts) await sleep(2 ** attempt * 400);
      }
    }
  }

  throw lastError || new Error('Gemini request failed.');
}

async function callOpenRouter(opts: {
  systemPrompt: string;
  userText: string;
  image?: { mimeType: string; data: string };
  jsonFormat?: boolean;
}): Promise<string> {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.');
  const model = ledgerOpenRouterModel();
  if (!model) {
    throw new Error('Set LEDGER_OPENROUTER_MODEL (or OPENROUTER_MODEL) in .env to choose the OpenRouter model.');
  }

  const userContent: ChatPart[] = [];
  if (opts.image?.data) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:${opts.image.mimeType || 'image/jpeg'};base64,${opts.image.data}` },
    });
  }
  userContent.push({ type: 'text', text: opts.userText });

  const response = await fetchJsonWithRetry('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'Gargeya Ledger',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: opts.systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      ...(opts.jsonFormat ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText.slice(0, 400)}`);
  }
  const text = contentFromOpenAiShape(await response.json());
  if (!text) throw new Error('OpenRouter returned an empty completion.');
  return text;
}

export async function completeLedgerModel(opts: {
  provider?: string;
  systemPrompt: string;
  userText: string;
  image?: { mimeType: string; data: string };
  jsonFormat?: boolean;
  thinkingBudget?: number;
}): Promise<{ text: string; provider: LedgerAiProvider; model: string }> {
  const provider = resolveLedgerProvider(opts.provider);

  if (provider === 'openrouter') {
    try {
      const text = await callOpenRouter(opts);
      return { text, provider: 'openrouter', model: ledgerOpenRouterModel() };
    } catch (error) {
      console.warn('[ledger-ai] OpenRouter failed, falling back to Gemini', error);
      if (!isGeminiConfigured()) throw error;
    }
  }

  const text = await callGemini(opts);
  return { text, provider: 'google', model: geminiModels()[0] || 'gemini' };
}

export function parseJsonFromModel(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try {
      return JSON.parse(fenced);
    } catch {
      const start = trimmed.indexOf('{');
      const end = trimmed.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(trimmed.slice(start, end + 1));
      }
      throw new Error('Model did not return valid JSON.');
    }
  }
}
