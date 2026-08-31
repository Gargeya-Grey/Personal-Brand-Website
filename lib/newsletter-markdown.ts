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
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(
    /`([^`]+)`/g,
    '<code style="font-family:ui-monospace,monospace;font-size:13px;background:#f1f5f9;padding:1px 4px;border-radius:4px;">$1</code>'
  );
  return out;
}

export function markdownToEmailHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }
    if (/^[-*] /.test(trimmed)) {
      if (!inList) {
        html.push('<ul style="padding-left:20px;margin:12px 0;">');
        inList = true;
      }
      html.push(`<li style="margin:0 0 8px;line-height:1.65;">${inline(trimmed.slice(2))}</li>`);
      continue;
    }
    closeList();
    if (trimmed.startsWith('### ')) {
      html.push(
        `<h3 style="font-family:Georgia,serif;font-size:18px;line-height:1.3;color:#0f172a;margin:28px 0 10px;">${inline(trimmed.slice(4))}</h3>`
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      html.push(
        `<h2 style="font-family:Georgia,serif;font-size:22px;line-height:1.3;color:#0f172a;margin:32px 0 12px;">${inline(trimmed.slice(3))}</h2>`
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      html.push(
        `<h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#0f172a;margin:0 0 16px;">${inline(trimmed.slice(2))}</h1>`
      );
      continue;
    }
    if (trimmed.startsWith('> ')) {
      html.push(
        `<blockquote style="margin:16px 0;padding:4px 0 4px 16px;border-left:3px solid #10b981;color:#334155;font-style:italic;">${inline(trimmed.slice(2))}</blockquote>`
      );
      continue;
    }
    html.push(
      `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#1e293b;">${inline(trimmed)}</p>`
    );
  }
  closeList();
  return html.join('\n');
}

export function emailHasUnsubscribe(html: string): boolean {
  return html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}');
}
