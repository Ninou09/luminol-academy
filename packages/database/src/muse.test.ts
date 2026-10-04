import { describe, expect, test, vi } from 'vitest';
import type { PrismaClient } from '../generated/prisma/client';
import { runMuseCommand } from './muse';

function database(permissions: string[] = ['academy:manage']) {
  const saved: Array<Record<string, unknown>> = [];
  const events: Array<Record<string, unknown>> = [];
  const client = {
    user: {
      findUniqueOrThrow: vi.fn(async () => ({
        roles: [
          {
            role: {
              permissions: permissions.map((key) => ({ permission: { key } })),
            },
          },
        ],
      })),
    },
    museRun: {
      findUnique: vi.fn(async () => null),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: 'run1', ...data };
        saved.push(row);
        return row;
      }),
    },
    museEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        events.push(data);
        return data;
      }),
    },
    enquiry: { count: vi.fn(async () => 3) },
    museKnowledge: { findMany: vi.fn(async () => []) },
    museTask: { findMany: vi.fn(async () => []) },
    invoice: { groupBy: vi.fn(async () => []) },
    course: {
      findMany: vi.fn(async () => [
        { id: 'course1', title: 'Verified course' },
      ]),
    },
    $transaction: async <T>(operation: (tx: PrismaClient) => Promise<T>) =>
      operation(client as unknown as PrismaClient),
  };
  return { client, saved, events, db: client as unknown as PrismaClient };
}
const command = {
  requestId: '54185969-ab22-493d-9fa3-b52881fcbeff',
  prompt: 'Daily briefing',
  locale: 'ar',
};
describe('Muse grounded commands and permission boundary', () => {
  test('persists an aggregate briefing and audit event atomically', async () => {
    const fixture = database();
    await runMuseCommand(fixture.db, 'actor1', command);
    expect(fixture.saved).toHaveLength(1);
    expect(fixture.events).toEqual([
      { actorId: 'actor1', kind: 'COMMAND_COMPLETED', reference: 'run1' },
    ]);
    expect(fixture.saved[0]?.response).toMatchObject({
      agent: 'main',
      mode: 'local',
      evidence: [{ reference: '/enquiries' }],
    });
  });
  test('refuses ordinary users before reading academy data', async () => {
    const fixture = database([]);
    await expect(runMuseCommand(fixture.db, 'actor1', command)).rejects.toThrow(
      'MUSE_FORBIDDEN',
    );
    expect(fixture.client.enquiry.count).not.toHaveBeenCalled();
  });
  test('requires finance permission on a natural-language revenue request', async () => {
    const fixture = database();
    await expect(
      runMuseCommand(fixture.db, 'actor1', {
        ...command,
        prompt: 'ملخص الإيرادات',
      }),
    ).rejects.toThrow('MUSE_FORBIDDEN');
    expect(fixture.client.invoice.groupBy).not.toHaveBeenCalled();
  });
  test('does not fabricate missing FAQ answers or process text as an instruction', async () => {
    const fixture = database();
    await runMuseCommand(fixture.db, 'actor1', {
      ...command,
      intent: 'faq',
      prompt: 'دورة التواصل',
    });
    expect(fixture.saved[0]?.response).toMatchObject({
      agent: 'courses',
      evidence: [],
    });
    expect(fixture.client.museKnowledge.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          active: true,
          locale: 'ar',
          agent: { not: 'revenue' },
        }),
      }),
    );
  });
  test('does not confirm bookings when the connector is absent', async () => {
    const fixture = database();
    await runMuseCommand(fixture.db, 'actor1', {
      ...command,
      intent: 'booking',
    });
    expect(fixture.saved[0]?.response).toMatchObject({
      agent: 'booking',
      evidence: [],
    });
  });
  test('keeps finance knowledge and task titles out of general command history', async () => {
    const fixture = database(['academy:manage', 'finance:manage']);
    await runMuseCommand(fixture.db, 'actor1', {
      ...command,
      intent: 'faq',
      prompt: 'Course details',
    });
    expect(fixture.client.museKnowledge.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ agent: { not: 'revenue' } }),
      }),
    );
    await runMuseCommand(fixture.db, 'actor1', { ...command, intent: 'plan' });
    expect(fixture.client.museTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { actorId: 'actor1', done: false, agent: { not: 'revenue' } },
      }),
    );
  });
  test('generates captions from published courses without inventing price or dates', async () => {
    const fixture = database();
    await runMuseCommand(fixture.db, 'actor1', {
      ...command,
      locale: 'en',
      intent: 'content',
    });
    expect(fixture.saved[0]?.response).toMatchObject({
      agent: 'content',
      text: expect.stringContaining('Verified course'),
      evidence: [{ reference: 'course:course1' }],
    });
    expect(fixture.client.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true } }),
    );
  });
});
