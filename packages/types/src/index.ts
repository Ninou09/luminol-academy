export type Locale = 'ar' | 'en' | 'fr';
export type SchoolSlug =
  'psychology' | 'languages' | 'professional-development';
export interface School {
  slug: SchoolSlug;
  name: string;
  description: string;
}

export const permissions = [
  'academy:manage',
  'course:read',
  'course:manage',
  'enrollment:manage',
  'progress:read:self',
  'progress:manage',
  'certificate:issue',
  'certificate:revoke',
  'certificate:audit:read',
  'notification:manage',
  'notification:failures:read',
  'finance:manage',
  'finance:refund',
  'finance:reconcile',
] as const;
export type PermissionKey = (typeof permissions)[number];
