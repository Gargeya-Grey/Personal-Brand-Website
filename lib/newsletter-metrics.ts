import 'server-only';
import {
  medianReadSeconds,
  type IssueMetrics,
  type NewsletterDashboard,
} from './newsletter-model';
import { getBroadcastMetrics, countResendSubscribers } from './resend';
import { getNewsletterWeeks, getReadSeconds } from './newsletter-service';

export type { IssueMetrics, NewsletterDashboard };

export async function getNewsletterDashboard(): Promise<NewsletterDashboard> {
  const [weeks, subscribers] = await Promise.all([
    getNewsletterWeeks(),
    countResendSubscribers(),
  ]);
  const sentish = weeks.filter((w) => w.stage === 'sent' || w.stage === 'sending' || w.sentAt);
  const issues: IssueMetrics[] = [];

  for (const week of sentish.sort((a, b) => b.weekOf.localeCompare(a.weekOf)).slice(0, 12)) {
    const seconds = await getReadSeconds(week.id);
    const broadcastId = [...week.resendBroadcastIds].reverse()[0];
    const opens = broadcastId ? await getBroadcastMetrics(broadcastId) : { uniqueOpened: null };
    issues.push({
      id: week.id,
      weekOf: week.weekOf,
      title: week.title,
      stage: week.stage,
      subscribersAtSend: week.sentTo.length || null,
      uniqueOpens: opens.uniqueOpened,
      medianReadSeconds: medianReadSeconds(seconds),
      sentCount: week.sentTo.length,
    });
  }

  const latest = issues[0];
  return {
    subscribers,
    lastUniqueOpens: latest?.uniqueOpens ?? null,
    lastMedianReadSeconds: latest?.medianReadSeconds ?? null,
    issues,
  };
}
