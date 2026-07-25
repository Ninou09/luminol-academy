import { describe, expect, it } from 'vitest';

import { createCertificateRecipientName } from './certificate';

describe('createCertificateRecipientName', () => {
  it('creates a trimmed public recipient name', () => {
    expect(createCertificateRecipientName('  Amel ', ' Benali  ')).toBe(
      'Amel Benali',
    );
  });

  it('supports a single synchronized name', () => {
    expect(createCertificateRecipientName('Amel', null)).toBe('Amel');
  });

  it('rejects an empty public identity', () => {
    expect(createCertificateRecipientName(' ', null)).toBeNull();
  });
});
