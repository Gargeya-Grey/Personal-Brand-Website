import 'server-only';
import { formatSubscriberAlert, type SubscriberAlert } from './notes-alerts';

function telegramConfig(): { token: string; chatId: string } | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
  if (!token || !chatId) return null;
  return { token, chatId };
}

export async function notifySubscriberAlert(alert: SubscriberAlert): Promise<void> {
  const cfg = telegramConfig();
  if (!cfg) return;
  const text = formatSubscriberAlert(alert);
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[notes] telegram alert failed', res.status, body.slice(0, 180));
    }
  } catch (err) {
    console.warn('[notes] telegram alert failed', err);
  }
}
