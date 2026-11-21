import 'server-only';

/**
 * Instant team alert for a new enquiry, sent to a private Telegram chat.
 * Switched on only when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
 * The message carries what the team needs to call back, never the full
 * free-text message, so sensitive details stay in the database.
 */
export type TelegramEnquiryAlert = {
  id: string;
  name: string;
  preferredContact: string;
  phone: string | null;
  email: string;
  school: string;
  programmeTitle: string | null;
  locale: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function buildTelegramEnquiryText(alert: TelegramEnquiryAlert): string {
  const lines = [
    '<b>New Luminol enquiry</b>',
    `Name: ${escapeHtml(alert.name)}`,
    `Area: ${escapeHtml(alert.school)}`,
    alert.programmeTitle
      ? `Programme: ${escapeHtml(alert.programmeTitle)}`
      : null,
    `Prefers: ${escapeHtml(alert.preferredContact)}`,
    alert.phone ? `Phone: ${escapeHtml(alert.phone)}` : null,
    alert.email ? `Email: ${escapeHtml(alert.email)}` : null,
    `Language: ${escapeHtml(alert.locale)}`,
    `Ref: ${escapeHtml(alert.id)}`,
  ];
  return lines.filter(Boolean).join('\n');
}

export async function sendTelegramEnquiryAlert(
  alert: TelegramEnquiryAlert,
  fetchImpl: typeof fetch = fetch,
): Promise<'sent' | 'skipped' | 'failed'> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return 'skipped';
  try {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildTelegramEnquiryText(alert),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
