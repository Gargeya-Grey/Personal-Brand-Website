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
