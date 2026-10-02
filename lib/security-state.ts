import 'server-only';
import { createHash } from 'node:crypto';
import { supabase, isSupabaseConfigured } from './supabase';
import fs from 'node:fs/promises';
import path from 'node:path';
import { withLocalContentLock } from './content-lock';

const usedTokens = new Map<string, number>();
const localBudgets = new Map<string, { used: number; expires: number }>();
const localRequests = new Map<string, number>();
type LocalState = { tokens: Record<string,number>; requests: Record<string,number>;
  budgets: Record<string,{used:number;expires:number}> };
async function localState<T>(action: (state: LocalState) => T): Promise<T> {
  return withLocalContentLock(async () => {
    const filename = path.join(process.cwd(),'data','security-state.json');
    let state: LocalState;
    try { state = JSON.parse(await fs.readFile(filename,'utf8')); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      state = {tokens:{},requests:{},budgets:{}};
    }
    const now = Date.now();
    for (const [key, expiry] of Object.entries(state.tokens)) if (expiry <= now) delete state.tokens[key];
    for (const [key, expiry] of Object.entries(state.requests)) if (expiry <= now) delete state.requests[key];
    for (const [key, row] of Object.entries(state.budgets)) if (row.expires <= now) delete state.budgets[key];
    const result = action(state);
    const staging = `${filename}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(staging,JSON.stringify(state),{mode:0o600,flag:'wx'});
    await fs.rename(staging,filename);
    return result;
  });
}
export const securityDigest = (value: string): string => createHash('sha256').update(value).digest('hex');

/** All instances consume a signed capability exactly once. Production never uses process memory. */
export async function consumeSecurityToken(nonce: string, expiresAt: number): Promise<boolean> {
  if (!/^[a-f0-9-]{36}$/i.test(nonce) || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  const digest = securityDigest(nonce);
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('security_consume_token', {
      p_digest: digest, p_expires_at: new Date(expiresAt).toISOString(),
    });
    if (error) throw new Error('Sign-in or confirmation storage is unavailable.');
    return data === true;
  }
  if (process.env.VERCEL) throw new Error('Security storage is not configured.');
  if (process.env.NODE_ENV === 'production') return localState(state => {
    if (state.tokens[digest]) return false;
    state.tokens[digest] = expiresAt;
    return true;
  });
  for (const [key, expiry] of usedTokens) if (expiry <= Date.now()) usedTokens.delete(key);
  if (usedTokens.has(digest)) return false;
  usedTokens.set(digest, expiresAt);
  return true;
}

export type IntakeAdmission = 'allowed' | 'duplicate' | 'denied';

/** Failed delivery can be retried, while its spent capacity stays charged. */
export async function releasePublicIntake(identity: string): Promise<void> {
  const digest = securityDigest(identity);
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('security_requests').delete().eq('digest', digest);
    if (error) throw new Error('Could not release failed intake request.');
  } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    await localState(state => { delete state.requests[digest]; });
  } else localRequests.delete(digest);
}

/** Reserve the complete request's worst-case provider cost before any outbound operation. */
export async function admitPublicIntake(request: Request, email: string, identity: string, weight: number): Promise<IntakeAdmission> {
  // Vercel replaces this header; self-hosted callers share the unknown-client budget.
  const client = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for') || 'unknown' : 'unknown';
  const args = { p_client: securityDigest(client), p_email: securityDigest(email.trim().toLowerCase()),
    p_request: securityDigest(identity), p_weight: weight };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('security_admit_intake', args);
    if (error || !['allowed', 'duplicate', 'denied'].includes(data)) throw new Error('Public intake protection is unavailable.');
    return data as IntakeAdmission;
  }
  if (process.env.VERCEL) throw new Error('Public intake protection is not configured.');
  if (process.env.NODE_ENV === 'production') return localState(state => {
    if (state.requests[args.p_request]) return 'duplicate';
    const now=Date.now();
    const rules=[['global-hour',3600000,20,weight],['global-day',86400000,100,weight],
      [`client-${args.p_client}`,900000,5,1],[`email-${args.p_email}`,86400000,6,1]] as const;
    const rows=rules.map(([key,window,limit,cost])=>({key:`${key}:${Math.floor(now/window)}`,limit,cost,expires:(Math.floor(now/window)+1)*window}));
    if (rows.some(row => (state.budgets[row.key]?.used || 0)+row.cost > row.limit)) return 'denied';
    for (const row of rows) state.budgets[row.key]={used:(state.budgets[row.key]?.used || 0)+row.cost,expires:row.expires};
    state.requests[args.p_request]=now+3600000;
    return 'allowed';
  });
  const now = Date.now();
  for (const [key, row] of localBudgets) if (row.expires <= now) localBudgets.delete(key);
  for (const [key, expires] of localRequests) if (expires <= now) localRequests.delete(key);
  if (localRequests.has(args.p_request)) return 'duplicate';
  const rules = [
    ['global-hour', 3600000, 20, weight], ['global-day', 86400000, 100, weight],
    [`client-${args.p_client}`, 900000, 5, 1], [`email-${args.p_email}`, 86400000, 6, 1],
  ] as const;
  const rows = rules.map(([key, window, limit, cost]) => ({ key: `${key}:${Math.floor(now / window)}`,
    expires: (Math.floor(now / window) + 1) * window, limit, cost }));
  if (rows.some((row) => (localBudgets.get(row.key)?.used || 0) + row.cost > row.limit)) return 'denied';
  for (const row of rows) localBudgets.set(row.key, { used: (localBudgets.get(row.key)?.used || 0) + row.cost, expires: row.expires });
  localRequests.set(args.p_request, now + 3600000);
  return 'allowed';
}
