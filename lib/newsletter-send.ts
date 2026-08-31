import 'server-only';
import {
  alreadySentTo,
  canRelease,
  markComplete,
  markSent,
  NEWSLETTER_TZ,
  normalizeTimeZone,
  shouldSendToTimezone,
  type NewsletterRecipientSend,
  type NewsletterWeek,
} from './newsletter-model';
import { renderNewsletterEmail } from './newsletter-html';
import {
  getResendKey,
  listResendContacts,
  sendResendBatch,
  sendResendEmail,
} from './resend';
import { getSubscriberTimezones, upsertNewsletterWeek } from './newsletter-service';

const BATCH = 50;

export type SendResult = {
  attempted: number;
  sent: number;
  skipped: number;
  complete: boolean;
  error?: string;
  week: NewsletterWeek;
};

function uniqueEmails(week: NewsletterWeek, contacts: Array<{ email: string; timezone: string }>): Array<{ email: string; timezone: string }> {
  const seen = new Set<string>();
  const out: Array<{ email: string; timezone: string }> = [];
  for (const row of contacts) {
    const email = row.email.trim().toLowerCase();
    if (!email || seen.has(email) || alreadySentTo(week, email)) continue;
    seen.add(email);
    out.push({ email, timezone: row.timezone });
  }
  return out;
}

export async function resolveRecipients(): Promise<Array<{ email: string; timezone: string }>> {
  const tzMap = await getSubscriberTimezones();
  const fromResend = await listResendContacts();
  if (fromResend.length) {
    return fromResend.map((c) => {
      const propTz =
        c.properties && typeof c.properties.timezone === 'string' ? c.properties.timezone : '';
      return {
        email: c.email,
        timezone: normalizeTimeZone(tzMap.get(c.email) || propTz || NEWSLETTER_TZ),
      };
    });
  }
  return [...tzMap.entries()].map(([email, timezone]) => ({ email, timezone }));
}

export async function sendWeekNow(
  week: NewsletterWeek,
  options?: { onlyEmail?: string; forceAll?: boolean; now?: Date }
): Promise<SendResult> {
  if (!canRelease(week) && !options?.onlyEmail) {
    return {
      attempted: 0,
      sent: 0,
      skipped: 0,
      complete: false,
      error: 'Letter is not releasable yet.',
      week,
    };
  }
  if (!getResendKey()) {
    return {
      attempted: 0,
      sent: 0,
      skipped: 0,
      complete: false,
      error: 'RESEND_API_KEY is missing.',
      week,
    };
  }

  const now = options?.now || new Date();
  const rendered = renderNewsletterEmail(week, { includeUnsubscribe: true });
  let recipients = await resolveRecipients();
  if (options?.onlyEmail) {
    const email = options.onlyEmail.trim().toLowerCase();
    recipients = [{ email, timezone: NEWSLETTER_TZ }];
  } else if (!options?.forceAll) {
    recipients = uniqueEmails(week, recipients).filter((row) =>
      shouldSendToTimezone(week, row.timezone, now)
    );
  } else {
    recipients = uniqueEmails(week, recipients);
  }

  if (!recipients.length) {
    const remaining = uniqueEmails(week, await resolveRecipients());
    const complete = remaining.length === 0 && week.sentTo.length > 0;
    const next = complete ? markComplete(week, now) : week;
    if (complete) await upsertNewsletterWeek(next);
    return { attempted: 0, sent: 0, skipped: 0, complete, week: next };
  }

  let sent = 0;
  const ids: string[] = [];
  const sentRows: NewsletterRecipientSend[] = [];
  let error: string | undefined;

  for (let i = 0; i < recipients.length; i += BATCH) {
    const slice = recipients.slice(i, i + BATCH);
    if (slice.length === 1 && slice[0]) {
      const one = await sendResendEmail({
        to: slice[0].email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });
      if (one.ok) {
        sent += 1;
        if (one.id) ids.push(one.id);
        sentRows.push({
          email: slice[0].email,
          timezone: slice[0].timezone,
          sentAt: now.toISOString(),
          resendId: one.id,
        });
      } else {
        error = one.error;
        break;
      }
      continue;
    }
    const batch = await sendResendBatch(
      slice.map((row) => ({
        to: row.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }))
    );
    if (batch.error) {
      error = batch.error;
      break;
    }
    sent += batch.sent;
    ids.push(...batch.ids);
    for (let j = 0; j < slice.length; j += 1) {
      const row = slice[j];
      if (!row) continue;
      sentRows.push({
        email: row.email,
        timezone: row.timezone,
        sentAt: now.toISOString(),
        resendId: batch.ids[j],
      });
    }
  }

  let next = markSent(week, sentRows, now);
  if (ids.length) {
    next = {
      ...next,
      resendBroadcastIds: [...next.resendBroadcastIds, ...ids].slice(-20),
    };
  }
  const remaining = uniqueEmails(next, await resolveRecipients());
  if (!remaining.length && next.sentTo.length > 0) {
    next = markComplete(next, now);
  }
  await upsertNewsletterWeek(next);
  return {
    attempted: recipients.length,
    sent,
    skipped: recipients.length - sent,
    complete: next.stage === 'sent',
    error,
    week: next,
  };
}
