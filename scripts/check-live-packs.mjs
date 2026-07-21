import fs from 'fs';
import path from 'path';

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

loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

const base = (process.env.APP_URL || 'https://www.sgargeya.com').replace(/\/$/, '');
const secret = process.env.X_SCOUT_SECRET || '';

const url = `${base}/api/x-content/ingest`;
console.log('GET', url);

const res = await fetch(url, {
  headers: {
    Authorization: `Bearer ${secret}`,
    'x-scout-secret': secret,
  },
});
const text = await res.text();
console.log('status', res.status);
console.log(text);
