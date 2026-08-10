import 'server-only';

export type AiProvider = 'meta' | 'openrouter';

export function resolveAiProvider(requested?: string): AiProvider {
  const raw = (requested || process.env.AI_METADATA_PROVIDER || 'meta')
    .toString()
    .toLowerCase()
    .trim();
  return raw === 'openrouter' ? 'openrouter' : 'meta';
}

export async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  jsonFormat: boolean = false
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'Gargeya Editorial',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: jsonFormat ? { type: 'json_object' } : undefined,
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

export async function callMeta(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  _jsonFormat: boolean = false
): Promise<string> {
  const response = await fetch('https://api.meta.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
        { role: 'user', content: [{ type: 'input_text', text: userContent }] },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta API returned error: ${errorText}`);
  }

  const data = await response.json();
  let content: string | null = null;

  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    content = data.output_text;
  } else if (typeof data.outputText === 'string' && data.outputText.trim()) {
    content = data.outputText;
  } else if (Array.isArray(data.output)) {
    const pieces: string[] = [];
    for (const item of data.output) {
      if (item?.content && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (typeof c?.text === 'string' && c.text.trim()) pieces.push(c.text);
          else if (typeof c?.output_text === 'string' && c.output_text.trim())
            pieces.push(c.output_text);
        }
      } else if (typeof item?.text === 'string' && item.text.trim()) {
        pieces.push(item.text);
      }
    }
    if (pieces.length) content = pieces.join('\n');
    if (!content) {
      const maybe = data.output?.[0]?.content?.find(
        (c: { type?: string; text?: string }) => c?.type === 'output_text'
      )?.text;
      if (typeof maybe === 'string' && maybe.trim()) content = maybe;
    }
  }

  if (!content && typeof data.content === 'string') content = data.content;
  if (!content && typeof data.text === 'string') content = data.text;
  if (!content && typeof data.response === 'string') content = data.response;
  if (!content && data.choices?.[0]?.message?.content) content = data.choices[0].message.content;
  if (!content && data.data?.choices?.[0]?.message?.content)
    content = data.data.choices[0].message.content;
  if (!content && typeof data.result === 'string') content = data.result;

  if (!content || !content.trim()) {
    throw new Error('Failed to receive completion content from Meta.');
  }
  return content.trim();
}

export async function completeWithConfiguredProvider(opts: {
  provider?: string;
  systemPrompt: string;
  userContent: string;
  jsonFormat?: boolean;
}): Promise<{ provider: AiProvider; model: string; text: string }> {
  const provider = resolveAiProvider(opts.provider);
  let apiKey: string | undefined;
  let model: string;

  if (provider === 'meta') {
    apiKey = process.env.MODEL_API_KEY;
    model = (process.env.META_MODEL || '').trim();
    if (!apiKey) throw new Error('MODEL_API_KEY is not configured.');
    if (!model) throw new Error('META_MODEL is not configured.');
    const text = await callMeta(
      apiKey,
      model,
      opts.systemPrompt,
      opts.userContent,
      opts.jsonFormat
    );
    return { provider, model, text };
  }

  apiKey = process.env.OPENROUTER_API_KEY;
  model = (process.env.OPENROUTER_MODEL || '').trim();
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.');
  if (!model) throw new Error('OPENROUTER_MODEL is not configured.');
  const text = await callOpenRouter(
    apiKey,
    model,
    opts.systemPrompt,
    opts.userContent,
    opts.jsonFormat
  );
  return { provider, model, text };
}
