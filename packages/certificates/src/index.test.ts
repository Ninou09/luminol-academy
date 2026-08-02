import { describe, expect, it } from 'vitest';
import { createSerial, renderCertificate } from './index';
describe('certificate rendering', () => {
  it('creates deterministic printable data', () => {
    const issuedAt = new Date('2026-08-02T12:00:00Z');
    expect(
      renderCertificate({
        serialNumber: createSerial(issuedAt, 'abc-123'),
        recipientName: 'Learner',
        courseTitle: 'Course',
        issuerName: 'Luminol Academy',
        issuedAt,
      }),
    ).toMatchObject({
      serialNumber: 'LUM-2026-ABC123',
      issuedDate: '2026-08-02',
    });
  });
});
