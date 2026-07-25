import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://luminol:luminol_local@localhost:5432/luminol';
const database = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const permissions = [
  'academy.manage',
  'content.manage',
  'enrollment.manage',
  'reports.view',
  'roles.manage',
  'users.manage',
] as const;

const grants: Record<string, readonly string[]> = {
  SUPER_ADMIN: permissions,
  ADMIN: [
    'academy.manage',
    'content.manage',
    'enrollment.manage',
    'reports.view',
    'users.manage',
  ],
  ACADEMIC_DIRECTOR: [
    'academy.manage',
    'content.manage',
    'enrollment.manage',
    'reports.view',
  ],
  PSYCHOLOGY_DIRECTOR: ['content.manage', 'enrollment.manage', 'reports.view'],
  LANGUAGE_DIRECTOR: ['content.manage', 'enrollment.manage', 'reports.view'],
  TRAINER: ['content.manage', 'reports.view'],
  STUDENT: [],
};

const users = [
  ['SUPER_ADMIN', 'super-admin@luminol.local', 'Super Admin'],
  ['ADMIN', 'admin@luminol.local', 'Admin'],
  ['ACADEMIC_DIRECTOR', 'academic-director@luminol.local', 'Academic Director'],
  [
    'PSYCHOLOGY_DIRECTOR',
    'psychology-director@luminol.local',
    'Psychology Director',
  ],
  ['LANGUAGE_DIRECTOR', 'language-director@luminol.local', 'Language Director'],
  ['TRAINER', 'trainer@luminol.local', 'Trainer'],
  ['STUDENT', 'student@luminol.local', 'Student'],
] as const;

async function seed() {
  const permissionRecords = await Promise.all(
    permissions.map((key) =>
      database.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      }),
    ),
  );

  for (const [name, rolePermissions] of Object.entries(grants)) {
    await database.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        permissions: {
          create: rolePermissions.map((key) => ({
            permission: {
              connect: {
                id: permissionRecords.find((item) => item.key === key)!.id,
              },
            },
          })),
        },
      },
    });
  }

  for (const [role, email, displayName] of users) {
    await database.user.upsert({
      where: { email },
      update: {},
      create: {
        clerkId: `seed_${role.toLowerCase()}`,
        email,
        emailVerified: true,
        profile: { create: { displayName } },
        roles: { create: { role: { connect: { name: role } } } },
        ...(role === 'STUDENT'
          ? { studentProfile: { create: { studentNumber: 'LA-DEV-0001' } } }
          : {}),
      },
    });
  }

  await database.school.upsert({
    where: { slug: 'psychology' },
    update: {},
    create: {
      slug: 'psychology',
      name: 'School of Psychology',
      programs: {
        create: {
          slug: 'foundations-of-psychology',
          title: 'Foundations of Psychology',
          status: 'PUBLISHED',
          courses: {
            create: {
              slug: 'introduction-to-psychology',
              title: 'Introduction to Psychology',
              status: 'PUBLISHED',
            },
          },
        },
      },
    },
  });
}

seed().finally(async () => database.$disconnect());
