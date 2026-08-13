import { runLedgerExtraction } from '@/lib/ledger-extract';
import { allowExtract, privateJson, requireLedgerUser } from '@/lib/ledger-http';
import { isLedgerAiConfigured } from '@/lib/ledger-settings';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const gate = await requireLedgerUser(request);
  if ('response' in gate) return gate.response;

  if (!isLedgerAiConfigured()) {
    return privateJson(
      {
        error:
          'No AI provider is configured. Set GEMINI_API_KEY (default), or OPENROUTER_API_KEY plus LEDGER_OPENROUTER_MODEL.',
      },
      503
    );
  }

  if (!allowExtract(gate.user.email)) {
    return privateJson({ error: 'Too many extractions. Wait a few minutes and try again.' }, 429);
  }

  try {
    const body = await request.json();
    const result = await runLedgerExtraction({
      file: body.file ?? null,
      fileText: typeof body.fileText === 'string' ? body.fileText : '',
      extraDetails: typeof body.extraDetails === 'string' ? body.extraDetails : '',
      provider: body.provider === 'openrouter' ? 'openrouter' : 'google',
    });
    return privateJson(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Extraction failed.';
    const lowered = message.toLowerCase();
    if (lowered.includes('not configured')) return privateJson({ error: message }, 503);
    if (lowered.includes('too large') || lowered.includes('unsupported')) {
      return privateJson({ error: message }, 400);
    }
    console.error('[ledger/extract]', message);
    return privateJson({ error: message }, 500);
  }
}
