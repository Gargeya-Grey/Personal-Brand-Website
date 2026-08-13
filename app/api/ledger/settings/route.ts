import {
  deleteUserLedgerCredentials,
  publicLedgerSettings,
  resolveLedgerCredentials,
  saveUserLedgerCredentials,
} from '@/lib/ledger-settings';
import { testNotionConnection } from '@/lib/ledger-notion';
import { privateJson, requireLedgerUser } from '@/lib/ledger-http';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const gate = await requireLedgerUser(request);
  if ('response' in gate) return gate.response;
  const settings = await publicLedgerSettings(gate.user.email);
  return privateJson(settings);
}

export async function POST(request: Request) {
  const gate = await requireLedgerUser(request);
  if ('response' in gate) return gate.response;

  try {
    const body = await request.json();
    const token = typeof body.notionToken === 'string' ? body.notionToken : '';
    const databaseId = typeof body.databaseId === 'string' ? body.databaseId : '';
    await saveUserLedgerCredentials(gate.user.email, token, databaseId);

    const creds = await resolveLedgerCredentials(gate.user.email);
    let test: { ok: boolean; title?: string; error?: string } = { ok: true };
    if (creds) {
      const probed = await testNotionConnection(creds);
      test = probed.ok ? { ok: true, title: probed.title } : { ok: false, error: probed.error };
    }

    const settings = await publicLedgerSettings(gate.user.email);
    return privateJson({ ...settings, test });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save settings.';
    return privateJson({ error: message }, 400);
  }
}

export async function DELETE(request: Request) {
  const gate = await requireLedgerUser(request);
  if ('response' in gate) return gate.response;
  await deleteUserLedgerCredentials(gate.user.email);
  return privateJson(await publicLedgerSettings(gate.user.email));
}
