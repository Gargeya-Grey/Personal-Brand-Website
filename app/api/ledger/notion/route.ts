import { saveLedgerEntries } from '@/lib/ledger-notion';
import { resolveLedgerCredentials } from '@/lib/ledger-settings';
import { privateJson, requireLedgerUser } from '@/lib/ledger-http';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const gate = await requireLedgerUser(request);
  if ('response' in gate) return gate.response;

  const creds = await resolveLedgerCredentials(gate.user.email);
  if (!creds) {
    return privateJson(
      {
        error:
          'Notion is not connected. Open Ledger settings and paste your integration token + database ID, or set NOTION_API_KEY and NOTION_DATABASE_ID.',
      },
      400
    );
  }

  try {
    const body = await request.json();
    const result = await saveLedgerEntries(creds, body);
    return privateJson(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save to Notion.';
    console.error('[ledger/notion]', message);
    return privateJson({ error: message }, 500);
  }
}
