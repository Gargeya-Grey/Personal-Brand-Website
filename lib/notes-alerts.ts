export type SubscriberAlertKind = 'subscribed' | 'unsubscribed' | 'resubscribed';

export type SubscriberAlert = {
  kind: SubscriberAlertKind;
  email: string;
  source?: string;
  timezone?: string;
};

export function subscriberAlertKind(input: {
  priorUnsubscribed: boolean | null;
  nextUnsubscribed: boolean;
}): SubscriberAlertKind | null {
  const prior = input.priorUnsubscribed;
  const next = input.nextUnsubscribed;
  if (prior == null && !next) return 'subscribed';
  if (prior == null && next) return 'unsubscribed';
  if (prior === true && !next) return 'resubscribed';
  if (prior === false && next) return 'unsubscribed';
  return null;
}

export function formatSubscriberAlert(alert: SubscriberAlert): string {
  const title =
    alert.kind === 'subscribed'
      ? 'Notes · new subscriber'
      : alert.kind === 'resubscribed'
        ? 'Notes · resubscribed'
        : 'Notes · unsubscribed';
  const lines = [title, alert.email.trim().toLowerCase()];
  if (alert.source) lines.push(`source: ${alert.source}`);
  if (alert.timezone) lines.push(`timezone: ${alert.timezone}`);
  return lines.join('\n');
}

function isPlain(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function rowLooksUnsubscribed(row: Record<string, unknown> | null | undefined): boolean | null {
  if (!row) return null;
  if (typeof row.unsubscribed === 'boolean') return row.unsubscribed;
  if (typeof row.source === 'string' && row.source.toLowerCase().startsWith('unsubscribe')) return true;
  return false;
}

/** Map a Supabase Database Webhook payload (INSERT/UPDATE) to an alert. */
export function subscriberAlertFromWebhook(payload: {
  type?: unknown;
  record?: unknown;
  old_record?: unknown;
}): SubscriberAlert | null {
  const type = typeof payload.type === 'string' ? payload.type.toUpperCase() : '';
  const record = isPlain(payload.record) ? payload.record : null;
  const oldRecord = isPlain(payload.old_record) ? payload.old_record : null;
  const emailRaw =
    typeof record?.email === 'string'
      ? record.email
      : typeof oldRecord?.email === 'string'
        ? oldRecord.email
        : '';
  const email = emailRaw.trim().toLowerCase();
  if (!email) return null;

  let priorUnsubscribed: boolean | null = null;
  let nextUnsubscribed = false;
  if (type === 'INSERT') {
    priorUnsubscribed = null;
    nextUnsubscribed = rowLooksUnsubscribed(record) === true;
  } else if (type === 'UPDATE') {
    priorUnsubscribed = rowLooksUnsubscribed(oldRecord) === true;
    nextUnsubscribed = rowLooksUnsubscribed(record) === true;
  } else {
    return null;
  }

  const kind = subscriberAlertKind({ priorUnsubscribed, nextUnsubscribed });
  if (!kind) return null;
  return {
    kind,
    email,
    source: typeof record?.source === 'string' ? record.source : undefined,
    timezone: typeof record?.timezone === 'string' ? record.timezone : undefined,
  };
}
