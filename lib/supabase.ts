import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize client only if credentials are provided to prevent build-time crashes
export const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null!;

/**
 * Returns true if Supabase is properly configured in the current environment.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}
