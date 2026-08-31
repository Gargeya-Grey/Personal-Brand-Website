import { siteConfig, getSiteOrigin } from './site-config';
import { markdownToEmailHtml } from './newsletter-markdown';
import { formatNoteDate, type NewsletterLink, type NewsletterWeek } from './newsletter-model';
import { notesBrand } from './notes-brand';

export function notesReplyTo(): string {
  return (process.env.CONTACT_EMAIL || '').trim() || siteConfig.email;
}

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
  options?: { unsubscribeUrl?: string; origin?: string }
): { html: string; text: string; subject: string } {
  const origin = options?.origin || getSiteOrigin();
  const archiveUrl = `${origin}/notes/${encodeURIComponent(week.slug)}`;
  const unsubscribeUrl = options?.unsubscribeUrl || `${origin}/notes/unsubscribe`;
  const body = markdownToEmailHtml(week.bodyMd);
  const deeper = linksBlock(week.links);
  const dateLabel = formatNoteDate(week.weekOf);
  const preheader = (week.dek || week.title).slice(0, 140);
  const unsub = `<p style="margin:28px 0 12px;font-size:13px;color:#64748b;line-height:1.5;">If this is no longer for you, leave the list here.</p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="${escapeHtml(unsubscribeUrl)}" style="display:inline-block;padding:10px 18px;border:1px solid #059669;border-radius:999px;color:#059669;text-decoration:none;font-size:13px;font-weight:700;line-height:1;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Or open <a href="${escapeHtml(unsubscribeUrl)}" style="color:#059669;text-decoration:underline;">this unsubscribe link</a>.</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(week.subject || week.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#10b981;font-weight:700;">${escapeHtml(notesBrand.kicker)}</p>
              <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.1;color:#0f172a;font-weight:500;">${escapeHtml(notesBrand.name)}</p>
              <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.4;color:#64748b;font-style:italic;">${escapeHtml(notesBrand.tagline)}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
                <tr><td style="width:44px;border-top:2px solid #10b981;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <p style="margin:0 0 18px;font-size:12px;color:#94a3b8;">
                ${escapeHtml(siteConfig.shortName)} · ${escapeHtml(dateLabel)}
                · <a href="${escapeHtml(archiveUrl)}" style="color:#059669;text-decoration:underline;">Read in the browser</a>
              </p>
              <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#0f172a;margin:0 0 10px;">${escapeHtml(week.title)}</h1>
              ${
                week.dek
                  ? `<p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#475569;">${escapeHtml(week.dek)}</p>`
                  : ''
              }
              ${body}
              ${deeper}
              <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#475569;">
                If this landed, reply to this email and tell me where it broke.
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
    `${notesBrand.name} · ${notesBrand.tagline}`,
    `${siteConfig.shortName} · ${dateLabel}`,
    week.title,
    week.dek,
    '',
    week.bodyMd,
    '',
    week.links.length
      ? `Go deeper:\n${week.links.map((l) => `- ${l.label}: ${l.url}`).join('\n')}`
      : '',
    'If this landed, reply to this email and tell me where it broke.',
    `Read in the browser: ${archiveUrl}`,
    `Unsubscribe: ${unsubscribeUrl}`,
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
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#10b981;font-weight:700;">${escapeHtml(notesBrand.kicker)}</p>
        <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:28px;line-height:1.1;">${escapeHtml(notesBrand.name)}</p>
        <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:16px;color:#64748b;font-style:italic;">${escapeHtml(notesBrand.tagline)}</p>
        <h1 style="font-size:22px;margin:0 0 16px;">You're on the list.</h1>
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
