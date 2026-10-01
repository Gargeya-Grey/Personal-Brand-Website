import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';
import { isSupabaseConfigured } from './supabase';

const held = new AsyncLocalStorage<boolean>();
/** Local JSON backend needs the same exclusion across processes as a database transaction. */
export async function withLocalContentLock<T>(action: () => Promise<T>): Promise<T> {
  if (isSupabaseConfigured() || held.getStore()) return action();
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  const filename = path.join(dataDir, '.content-write.lock');
  let handle;
  for (let attempt=0; attempt<100; attempt++) {
    try { handle = await fs.open(filename, 'wx'); break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  if (!handle) throw new Error('Content is being updated. Please retry.');
  try { return await held.run(true, action); }
  finally { await handle.close(); await fs.unlink(filename); }
}
