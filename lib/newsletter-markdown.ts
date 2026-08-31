function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_m, label: string, url: string) => {
    return `<a href="${escapeHtml(url)}" style="color:#059669;text-decoration:underline;">${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0f172a;">$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(
    /`([^`]+)`/g,
    '<code style="font-family:ui-monospace,monospace;font-size:13px;background:#f1f5f9;padding:1px 4px;border-radius:4px;">$1</code>'
  );
  return out;
}

export function parseKickerLine(line: string): { label: string; rest: string } | null {
  const match = /^\*\*([^*]{2,40})\.\*\*\s+(.+)$/.exec(line.trim());
  if (!match || !match[1] || !match[2]) return null;
  return { label: match[1], rest: match[2] };
}

function kickerHtml(label: string, rest: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 28px;">
  <tr>
    <td style="border-left:3px solid #10b981;padding:6px 0 6px 16px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#059669;font-weight:700;">${escapeHtml(label)}</p>
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:#0f172a;">${inline(rest)}</p>
    </td>
  </tr>
</table>`;
}

function headingHtml(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:36px 0 14px;">
  <tr>
    <td style="border-top:1px solid #e2e8f0;padding-top:22px;">
      <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#0f172a;font-weight:500;margin:0;">${inline(text)}</h2>
    </td>
  </tr>
</table>`;
}

function quoteHtml(lines: string[]): string {
  const inner = lines.map((line) => inline(line)).join('<br />');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="border-left:3px solid #10b981;padding:4px 0 4px 16px;">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.5;color:#0f172a;font-style:italic;">${inner}</p>
    </td>
  </tr>
</table>`;
}

function listHtml(items: string[], ordered: boolean): string {
  if (!ordered) {
    const lis = items
      .map(
        (item) =>
          `<tr><td style="width:14px;vertical-align:top;padding:0 0 10px;color:#10b981;font-size:16px;line-height:1.7;">•</td><td style="padding:0 0 10px;font-size:16px;line-height:1.7;color:#1e293b;">${inline(item)}</td></tr>`
      )
      .join('');
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 20px;">${lis}</table>`;
  }
  const rows = items
    .map((item, index) => {
      const n = String(index + 1).padStart(2, '0');
      return `<tr>
        <td style="width:36px;vertical-align:top;padding:0 0 14px;">
          <p style="margin:0;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:0.08em;color:#059669;font-weight:700;line-height:1.7;">${n}</p>
        </td>
        <td style="padding:0 0 14px;font-size:16px;line-height:1.7;color:#1e293b;">${inline(item)}</td>
      </tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:12px 0 24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
  <tr><td style="padding:16px 18px 4px;">${rows}</td></tr>
</table>`;
}

export function markdownToEmailHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let firstParagraph = true;
  let i = 0;

  while (i < lines.length) {
    const trimmed = (lines[i] || '').trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && (lines[i] || '').trim().startsWith('>')) {
        const raw = (lines[i] || '').trim();
        quote.push(raw.startsWith('> ') ? raw.slice(2) : raw.slice(1).trim());
        i += 1;
      }
      html.push(quoteHtml(quote.filter(Boolean)));
      firstParagraph = false;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      html.push(
        '<p style="margin:28px 0;text-align:center;color:#10b981;letter-spacing:0.4em;font-size:12px;">· · ·</p>'
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      html.push(
        `<h3 style="font-family:Georgia,serif;font-size:18px;line-height:1.35;color:#0f172a;margin:28px 0 10px;font-weight:500;">${inline(trimmed.slice(4))}</h3>`
      );
      firstParagraph = false;
      i += 1;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      html.push(headingHtml(trimmed.slice(3)));
      firstParagraph = false;
      i += 1;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      i += 1;
      continue;
    }

    const kicker = parseKickerLine(trimmed);
    if (kicker) {
      html.push(kickerHtml(kicker.label, kicker.rest));
      firstParagraph = false;
      i += 1;
      continue;
    }

    if (/^[-*] /.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const ordered = /^\d+\.\s/.test(trimmed);
      const items: string[] = [];
      while (i < lines.length) {
        const item = (lines[i] || '').trim();
        if (!item) break;
        if (ordered && /^\d+\.\s/.test(item)) {
          items.push(item.replace(/^\d+\.\s/, ''));
          i += 1;
          continue;
        }
        if (!ordered && /^[-*] /.test(item)) {
          items.push(item.slice(2));
          i += 1;
          continue;
        }
        break;
      }
      html.push(listHtml(items, ordered));
      firstParagraph = false;
      continue;
    }

    if (firstParagraph) {
      html.push(
        `<p style="margin:0 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.55;color:#0f172a;">${inline(trimmed)}</p>`
      );
      firstParagraph = false;
    } else {
      html.push(
        `<p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#334155;">${inline(trimmed)}</p>`
      );
    }
    i += 1;
  }

  return html.join('\n');
}

export function emailHasUnsubscribe(html: string): boolean {
  return /unsubscribe/i.test(html) && /href=/i.test(html);
}
