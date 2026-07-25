export type Locale = 'ar' | 'en' | 'fr';
export type SchoolSlug =
  'psychology' | 'languages' | 'professional-development';
export interface School {
  slug: SchoolSlug;
  name: string;
  description: string;
}
