import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('EnquiryForm accessibility contract', () => {
  it('exposes a named form landmark and announces submission state coherently', async () => {
    const source = await readFile(
      new URL('./enquiry-form.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('aria-labelledby="enquiry-form-title"');
    expect(source).toContain('id="enquiry-form-title"');
    expect(source).toContain('aria-busy={isSubmitting}');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('disabled={isSubmitting}');
  });
});
