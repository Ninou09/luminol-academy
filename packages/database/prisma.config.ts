import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const packageDirectory = dirname(fileURLToPath(import.meta.url));
const rootEnvironmentPath = resolve(packageDirectory, '../../.env');

if (existsSync(rootEnvironmentPath)) {
  loadEnvFile(rootEnvironmentPath);
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // `generate` does not need a live database. Migration commands still fail
    // safely unless DATABASE_URL is present in the process or root .env file.
    url: process.env.DATABASE_URL ?? '',
  },
});
