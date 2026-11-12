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
  'enquiry:work',
  'team:manage',
  'consultation:manage',
  'consultation:deliver',
  'office-payment:record',
  'office-payment:void',
] as const;
export type PermissionKey = (typeof permissions)[number];
