import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('workshop calendar download', () => {
  it('uses the Algeria timezone and contains no joining secret', async () => {
    const response = GET();
    const calendar = await response.text();

    expect(response.headers.get('content-type')).toContain('text/calendar');
    expect(response.headers.get('content-disposition')).toContain('.ics');
    expect(calendar).toContain('TZID:Africa/Algiers');
    expect(calendar).toContain('DTSTART;TZID=Africa/Algiers:20260925T200000');
    expect(calendar).toContain('DTEND;TZID=Africa/Algiers:20260925T220000');
    expect(calendar).not.toMatch(/volgograd|telegram|t\.me\//i);
  });
});
