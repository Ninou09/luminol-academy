export const databaseProvider = 'postgresql' as const;

export function assertDatabaseUrl(value: string | undefined): string {
  if (!value?.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }
  return value;
}
