import { luminolEvents } from '../../../../../lib/events';

/**
 * "Add to calendar" for a Luminol event: a small iCalendar file. Events with
 * no confirmed time are added as all-day reminders on their date.
 */
function escapeText(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n');
}

function compactDate(iso: string) {
  return iso.replaceAll('-', '');
}

function nextDay(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const event = luminolEvents.find((item) => item.id === id);
  if (!event || !event.date) {
    return new Response('Not found', { status: 404 });
  }
  const url = new URL(request.url);
  const locale = url.searchParams.get('lang');
  const lang = locale === 'fr' || locale === 'ar' ? locale : 'en';
  const day = event.secondDate ?? event.date;
  const stamp =
    new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luminol Academy//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@luminol-academy`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(day)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDay(day))}`,
    `SUMMARY:${escapeText(`Luminol · ${event.title[lang]}`)}`,
    `DESCRIPTION:${escapeText(
      `${event.audience[lang]}. Online via Zoom. The exact time and link are shared by Luminol before the session.`,
    )}`,
    'LOCATION:Online (Zoom)',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="luminol-${event.id}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
