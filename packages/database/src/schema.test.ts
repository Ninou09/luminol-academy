import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(
  fileURLToPath(new URL('../prisma/schema.prisma', import.meta.url)),
  'utf8',
);

describe('academy database relations', () => {
  it.each([
    'User',
    'Profile',
    'Role',
    'Permission',
    'School',
    'Program',
    'Course',
    'Module',
    'Lesson',
    'Enrollment',
    'Progress',
    'Certificate',
    'StudentProfile',
  ])('defines the %s model', (model) =>
    expect(schema).toContain(`model ${model} {`),
  );
  it('enforces one enrollment per student and program', () =>
    expect(schema).toContain('@@unique([userId, programId])'));
  it('enforces one progress row per enrollment and lesson', () =>
    expect(schema).toContain('@@unique([enrollmentId, lessonId])'));
  it('uses explicit cascading and restrictive foreign keys', () => {
    expect(schema).toContain('onDelete: Cascade');
    expect(schema).toContain('onDelete: Restrict');
  });
});
