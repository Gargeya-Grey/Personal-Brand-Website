import { siteConfig, getSiteOrigin } from './site-config';
import { markdownToEmailHtml } from './newsletter-markdown';
import type { NewsletterLink, NewsletterWeek } from './newsletter-model';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function linksBlock(links: NewsletterLink[]): string {
  if (!links.length) return '';
  const items = links
    .map((link) => {
      const safeUrl = escapeHtml(link.url);
      const safeLabel = escapeHtml(link.label);
      return `<li style="margin:0 0 8px;"><a href="${safeUrl}" style="color:#059669;text-decoration:underline;">${safeLabel}</a></li>`;
    })
    .join('');
  return `<p style="margin:28px 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:700;">Go deeper</p><ul style="padding-left:20px;margin:0 0 24px;">${items}</ul>`;
}

export { markdownToEmailHtml, emailHasUnsubscribe } from './newsletter-markdown';

export function renderNewsletterEmail(
  week: NewsletterWeek,
  options?: { includeUnsubscribe?: boolean; origin?: string }
): { html: string; text: string; subject: string } {
  const origin = options?.origin || getSiteOrigin();
  const archiveUrl = `${origin}/notes/${encodeURIComponent(week.slug)}`;
  const includeUnsub = options?.includeUnsubscribe !== false;
  const body = markdownToEmailHtml(week.bodyMd);
  const deeper = linksBlock(week.links);
  const unsub = includeUnsub
    ? `<p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">If this is no longer for you, <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#64748b;">unsubscribe</a>.</p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(week.subject || week.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#10b981;font-weight:700;">Notes</p>
              <p style="margin:0 0 20px;font-size:12px;color:#94a3b8;">${escapeHtml(week.weekOf)} · ${escapeHtml(siteConfig.shortName)}</p>
              <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#0f172a;margin:0 0 10px;">${escapeHtml(week.title)}</h1>
              ${
                week.dek
                  ? `<p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#475569;">${escapeHtml(week.dek)}</p>`
                  : ''
              }
              ${body}
              ${deeper}
              <p style="margin:28px 0 0;font-size:13px;color:#64748b;">
                <a href="${escapeHtml(archiveUrl)}" style="color:#059669;">Read in the browser</a>
                · takes a minute, and helps me see whether the letter was actually read.
              </p>
              ${unsub}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;font-size:12px;color:#94a3b8;">
              ${escapeHtml(siteConfig.name)} · <a href="${escapeHtml(origin)}" style="color:#64748b;">${escapeHtml(origin.replace(/^https?:\/\//, ''))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textParts = [
    `Notes · ${week.weekOf}`,
    week.title,
    week.dek,
    '',
    week.bodyMd,
    '',
    week.links.length
      ? `Go deeper:\n${week.links.map((l) => `- ${l.label}: ${l.url}`).join('\n')}`
      : '',
    `Read in the browser: ${archiveUrl}`,
    includeUnsub ? 'Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}' : '',
  ].filter((block) => block !== '');

  return {
    html,
    text: textParts.join('\n'),
    subject: week.subject || week.title,
  };
}

export function renderWelcomeEmail(origin = getSiteOrigin()): { html: string; text: string; subject: string } {
  const notesUrl = `${origin}/notes`;
  const subject = "You're on Notes.";
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Georgia,serif;color:#0f172a;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#10b981;font-weight:700;">Notes</p>
        <h1 style="font-size:24px;margin:0 0 16px;">You're on the list.</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">One letter a week on the human mind, learning with AI, and what we actually score. Sunday evening, in your timezone when we can tell it.</p>
        <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">If a week has nothing honest to say, it stays quiet. No roundup. No product pitch.</p>
        <p style="font-size:14px;color:#64748b;margin:24px 0 0;"><a href="${escapeHtml(notesUrl)}" style="color:#059669;">See how a letter looks</a>. Every letter has an unsubscribe link.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  const text = `You're on Notes.\n\nOne letter a week on the human mind, learning with AI, and what we actually score. Sunday evening.\n\nIf a week has nothing honest to say, it stays quiet.\n\n${notesUrl}\nEvery letter has an unsubscribe link.`;
  return { html, text, subject };
}
