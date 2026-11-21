import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('public enquiry form qualification contract', () => {
  it('submits request kind, profession, and readiness', async () => {
    const source = await readFile(
      new URL('./enquiry-form.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('requestKind');
    expect(source).toContain('name="profession"');
    expect(source).toContain('name="readiness"');
    expect(source).toContain('qualification.profession');
    expect(source).toContain('qualification.readiness');
  });
});
