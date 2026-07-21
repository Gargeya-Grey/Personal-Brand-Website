import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const root = process.cwd();
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, '.env'));

const base = (process.env.APP_URL || '').replace(/\/$/, '');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('APP_URL', base);
console.log('Supabase URL set', !!url);

const sb = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await sb
  .from('x_content_packs')
  .select('id, date, title, updated_at, payload')
  .order('date', { ascending: false });

if (error) {
  console.error('Supabase error', error);
  process.exit(1);
}

console.log('row count', data?.length ?? 0);
for (const row of data || []) {
  const p = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  const drafts = p?.drafts || [];
  const ready = drafts.filter((d) => d.status === 'ready').length;
  console.log({
    id: row.id,
    date: row.date,
    title: row.title,
    drafts: drafts.length,
    ready,
    statuses: drafts.map((d) => d.status),
    updated_at: row.updated_at,
  });
}

const g = await fetch(`${base}/api/x-content/ingest`);
console.log('GET ingest', g.status, await g.text());
