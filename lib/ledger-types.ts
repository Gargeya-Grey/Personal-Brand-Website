export type LedgerCredentialSource = 'user' | 'env' | 'none';

export type LedgerSettingsPublic = {
  configured: boolean;
  source: LedgerCredentialSource;
  tokenHint: string | null;
  databaseIdHint: string | null;
  encryptionConfigured: boolean;
  supabaseConfigured: boolean;
  aiConfigured: boolean;
  geminiConfigured: boolean;
  openRouterConfigured: boolean;
  geminiModel: string | null;
  openRouterModel: string | null;
};
