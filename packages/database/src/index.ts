import { PrismaPg } from '@prisma/adapter-pg';
import { createRequire } from 'node:module';

export type PrincipalRecord = {
  id: string;
  clerkId: string;
  roles: Array<{
    role: { name: string; permissions: Array<{ permission: { key: string } }> };
  }>;
};

type UserRepository = {
  findFirst(input: unknown): Promise<PrincipalRecord | null>;
  upsert(input: unknown): Promise<unknown>;
  update(input: unknown): Promise<unknown>;
};

export type DatabaseClient = {
  user: UserRepository;
  $disconnect(): Promise<void>;
};

type PrismaModule = {
  PrismaClient: new (options: { adapter: PrismaPg }) => DatabaseClient;
};
let client: DatabaseClient | undefined;

export function getDatabase(): DatabaseClient {
  if (client) return client;
  const require = createRequire(import.meta.url);
  const prismaClientModule = ['@prisma', 'client'].join('/');
  const { PrismaClient } = require(prismaClientModule) as PrismaModule;
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://luminol:luminol_local@localhost:5432/luminol';
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  return client;
}
