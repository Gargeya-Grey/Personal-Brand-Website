import 'server-only';

export function getResendKey(): string {
  return (process.env.RESEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');
}

export function getResendSegmentId(): string {
  return (process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID || '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

export function getResendFrom(): string {
  return process.env.RESEND_FROM || 'onboarding@resend.dev';
}

export function resendConfigured(): boolean {
  return Boolean(getResendKey() && getResendSegmentId());
}

type ResendContact = {
  id?: string;
  email: string;
  unsubscribed?: boolean;
  properties?: Record<string, unknown>;
};

async function resendFetch(path: string, init?: RequestInit): Promise<Response> {
  const key = getResendKey();
  if (!key) throw new Error('RESEND_API_KEY is missing.');
  return fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

export async function addResendContact(input: {
  email: string;
  timezone?: string;
  unsubscribed?: boolean;
}): Promise<{ ok: boolean; status: number; body: string }> {
  const segmentId = getResendSegmentId();
  const attempts: Array<{ url: string; body: Record<string, unknown> }> = [
    {
      url: '/contacts',
      body: {
        email: input.email,
        unsubscribed: input.unsubscribed === true ? true : false,
        segments: segmentId ? [{ id: segmentId }] : undefined,
        properties: input.timezone ? { timezone: input.timezone } : undefined,
      },
    },
    {
      url: '/contacts',
      body: {
        email: input.email,
        unsubscribed: false,
      },
    },
  ];
  if (segmentId) {
    attempts.push({
      url: `/audiences/${segmentId}/contacts`,
      body: { email: input.email, unsubscribed: false },
    });
  }

  let lastStatus = 0;
  let lastBody = '';
  for (const attempt of attempts) {
    const res = await resendFetch(attempt.url, {
      method: 'POST',
      body: JSON.stringify(attempt.body),
    });
    lastStatus = res.status;
    lastBody = await res.text().catch(() => `HTTP ${res.status}`);
    if (res.ok || res.status === 409) return { ok: true, status: res.status, body: lastBody };
    if (res.status === 401 || res.status === 403) break;
  }
  return { ok: false, status: lastStatus, body: lastBody };
}

async function listAllResendContacts(): Promise<ResendContact[]> {
  const segmentId = getResendSegmentId();
  const key = getResendKey();
  if (!key) return [];

  const contacts: ResendContact[] = [];
  let after: string | undefined;
  for (let page = 0; page < 20; page += 1) {
    const params = new URLSearchParams();
    if (segmentId) params.set('segment_id', segmentId);
    params.set('limit', '100');
    if (after) params.set('after', after);
    const res = await resendFetch(`/contacts?${params.toString()}`);
    if (!res.ok) break;
    const json: unknown = await res.json();
    const rows =
      json && typeof json === 'object' && Array.isArray((json as { data?: unknown }).data)
        ? ((json as { data: unknown[] }).data)
        : [];
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const rec = row as Record<string, unknown>;
      const email = typeof rec.email === 'string' ? rec.email.toLowerCase() : '';
      if (!email) continue;
      contacts.push({
        id: typeof rec.id === 'string' ? rec.id : undefined,
        email,
        unsubscribed: rec.unsubscribed === true,
        properties: rec.properties && typeof rec.properties === 'object' ? (rec.properties as Record<string, unknown>) : {},
      });
    }
    const hasMore =
      json && typeof json === 'object' && (json as { has_more?: boolean }).has_more === true;
    const last = rows[rows.length - 1];
    const lastId =
      last && typeof last === 'object' && typeof (last as { id?: unknown }).id === 'string'
        ? (last as { id: string }).id
        : undefined;
    if (!hasMore || !lastId) break;
    after = lastId;
  }
  return contacts;
}

export async function listResendContacts(options?: {
  includeUnsubscribed?: boolean;
}): Promise<ResendContact[]> {
  const contacts = await listAllResendContacts();
  if (options?.includeUnsubscribed) return contacts;
  return contacts.filter((c) => !c.unsubscribed);
}

export async function countResendSubscribers(): Promise<number | null> {
  if (!getResendKey()) return null;
  try {
    const list = await listResendContacts();
    return list.length;
  } catch {
    return null;
  }
}

export async function setResendUnsubscribed(
  email: string,
  unsubscribed: boolean
): Promise<{ ok: boolean; error?: string }> {
  const target = email.trim().toLowerCase();
  const contacts = await listAllResendContacts();
  const match = contacts.find((c) => c.email === target);
  if (match && match.unsubscribed === unsubscribed) return { ok: true };

  const attempts: Array<{ path: string; body: Record<string, unknown> }> = [];
  if (match?.id) {
    attempts.push({ path: `/contacts/${match.id}`, body: { unsubscribed } });
  }
  attempts.push({ path: `/contacts/${encodeURIComponent(target)}`, body: { unsubscribed } });

  let last = 'Could not update Resend contact.';
  for (const attempt of attempts) {
    const res = await resendFetch(attempt.path, {
      method: 'PATCH',
      body: JSON.stringify(attempt.body),
    });
    if (res.ok) return { ok: true };
    last = await res.text().catch(() => `HTTP ${res.status}`);
  }
  if (!match && unsubscribed) {
    const created = await addResendContact({ email: target, unsubscribed: true });
    if (created.ok) return { ok: true };
    last = created.body || last;
  }
  return { ok: false, error: last.slice(0, 400) };
}

export async function unsubscribeResendContact(email: string): Promise<{ ok: boolean; error?: string }> {
  return setResendUnsubscribed(email, true);
}

export async function sendResendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}): Promise<{ id?: string; ok: boolean; error?: string }> {
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const res = await resendFetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from: getResendFrom(),
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: input.headers,
    }),
  });
  const raw = await res.text();
  if (!res.ok) return { ok: false, error: raw.slice(0, 500) };
  try {
    const parsed = JSON.parse(raw) as { id?: string };
    return { ok: true, id: parsed.id };
  } catch {
    return { ok: true };
  }
}

export async function sendResendBatch(
  messages: Array<{
    to: string;
    subject: string;
    html: string;
    text: string;
    headers?: Record<string, string>;
  }>
): Promise<{ sent: number; ids: string[]; error?: string }> {
  if (!messages.length) return { sent: 0, ids: [] };
  const from = getResendFrom();
  const payload = messages.map((m) => ({
    from,
    to: [m.to],
    subject: m.subject,
    html: m.html,
    text: m.text,
    headers: m.headers,
  }));
  const res = await resendFetch('/emails/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const raw = await res.text();
  if (!res.ok) return { sent: 0, ids: [], error: raw.slice(0, 800) };
  try {
    const parsed = JSON.parse(raw) as { data?: Array<{ id?: string }> };
    const ids = (parsed.data || []).map((row) => row.id).filter((id): id is string => Boolean(id));
    return { sent: messages.length, ids };
  } catch {
    return { sent: messages.length, ids: [] };
  }
}

export type BroadcastMetrics = {
  uniqueOpened: number | null;
  sent: number | null;
  delivered: number | null;
};

export async function getBroadcastMetrics(broadcastId: string): Promise<BroadcastMetrics> {
  const empty: BroadcastMetrics = { uniqueOpened: null, sent: null, delivered: null };
  if (!broadcastId || !getResendKey()) return empty;
  try {
    const params = new URLSearchParams({
      broadcast_id: broadcastId,
      metrics: 'unique_opened,sent,delivered',
    });
    const res = await resendFetch(`/broadcasts/metrics?${params.toString()}`);
    if (!res.ok) return empty;
    const json: unknown = await res.json();
    if (!json || typeof json !== 'object') return empty;
    const totals = (json as { totals?: Record<string, unknown> }).totals || {};
    const num = (key: string): number | null => {
      const v = totals[key];
      return typeof v === 'number' ? v : null;
    };
    return {
      uniqueOpened: num('unique_opened'),
      sent: num('sent'),
      delivered: num('delivered'),
    };
  } catch {
    return empty;
  }
}
