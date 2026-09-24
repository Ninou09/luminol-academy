import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export async function GET() {
  const html = await readFile(join(process.cwd(), 'public', 'psy-library.html'), 'utf8');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
