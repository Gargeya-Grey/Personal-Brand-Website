import 'server-only';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { decryptSecret, encryptSecret, isTokenEncryptionConfigured } from '@/lib/x-lab-crypto';
import { ledgerAiPublicConfig } from '@/lib/ledger-ai';
import type { LedgerCredentialSource, LedgerSettingsPublic } from '@/lib/ledger-types';

export type { LedgerCredentialSource, LedgerSettingsPublic } from '@/lib/ledger-types';

export type LedgerCredentials = {
  notionToken: string;
  databaseId: string;
  source: Exclude<LedgerCredentialSource, 'none'>;
};

function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) return '••••';
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

function envCredentials(): LedgerCredentials | null {
  const notionToken = (process.env.NOTION_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const databaseId = (process.env.NOTION_DATABASE_ID || '').trim().replace(/^["']|["']$/g, '');
  if (!notionToken || !databaseId) return null;
  return { notionToken, databaseId, source: 'env' };
}

export { isLedgerAiConfigured } from '@/lib/ledger-ai';

export async function getUserLedgerCredentials(email: string): Promise<LedgerCredentials | null> {
  if (!isSupabaseConfigured() || !isTokenEncryptionConfigured()) return null;
  const { data, error } = await supabase
    .from('ledger_settings')
    .select('notion_token_enc, database_id_enc')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error || !data?.notion_token_enc || !data?.database_id_enc) return null;
  try {
    return {
      notionToken: decryptSecret(data.notion_token_enc),
      databaseId: decryptSecret(data.database_id_enc),
      source: 'user',
    };
  } catch {
    return null;
  }
}

export async function resolveLedgerCredentials(email: string): Promise<LedgerCredentials | null> {
  const userCreds = await getUserLedgerCredentials(email);
  if (userCreds) return userCreds;
  return envCredentials();
}

export async function saveUserLedgerCredentials(
  email: string,
  notionToken: string,
  databaseId: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. You can still use NOTION_API_KEY and NOTION_DATABASE_ID in env.');
  }
  if (!isTokenEncryptionConfigured()) {
    throw new Error('X_TOKEN_ENCRYPTION_KEY is missing. Set a long random secret (32+ chars) before saving Notion keys.');
  }

  const token = notionToken.trim();
  const db = databaseId.trim().replace(/-/g, '');
  if (token.length < 20) throw new Error('Notion integration token looks too short.');
  if (db.length < 20) throw new Error('Notion database ID looks invalid.');

  const row = {
    email: email.toLowerCase().trim(),
    notion_token_enc: encryptSecret(token),
    database_id_enc: encryptSecret(db),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('ledger_settings').upsert(row, { onConflict: 'email' });
  if (error) throw new Error(`Could not save ledger settings: ${error.message}`);
}

export async function deleteUserLedgerCredentials(email: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from('ledger_settings').delete().eq('email', email.toLowerCase().trim());
}

export async function publicLedgerSettings(email: string): Promise<LedgerSettingsPublic> {
  const creds = await resolveLedgerCredentials(email);
  return {
    configured: !!creds,
    source: creds?.source || 'none',
    tokenHint: creds ? maskSecret(creds.notionToken) : null,
    databaseIdHint: creds ? maskSecret(creds.databaseId) : null,
    encryptionConfigured: isTokenEncryptionConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
    ...ledgerAiPublicConfig(),
  };
}
