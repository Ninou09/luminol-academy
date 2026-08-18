import { z } from 'zod';

import { localizeProgrammeDelivery } from './programme-presentation';
import {
  PROGRAMME_LANGUAGE_CODES,
  type CmsProgrammeLanguage,
  type PublicCmsProgramme,
} from './sanity';
import { getSchools, isSchoolSlug, type SchoolSlug } from './schools';

export const PUBLIC_PROGRAMME_MAX_QUERY_LENGTH = 100;

export const programmeLanguageLabels: Record<CmsProgrammeLanguage, string> = {
  ar: 'Arabic',
  fr: 'French',
  en: 'English',
};

const programmeLanguageSearchLabels: Record<CmsProgrammeLanguage, string> = {
  ar: 'Arabic Arabe العربية',
  fr: 'French Français الفرنسية',
  en: 'English Anglais الإنجليزية',
};

export type ProgrammeDiscoveryFilters = {
  query: string;
  school?: SchoolSlug;
  language?: CmsProgrammeLanguage;
};

const paramsObjectSchema = z.record(z.string(), z.unknown());
const singleValueSchema = z.union([
  z.string(),
  z.tuple([z.string()]).transform(([value]) => value),
]);

function parseSingleParam(value: unknown, maxLength: number) {
  const parsed = singleValueSchema.safeParse(value);
  if (!parsed.success) return undefined;
  return parsed.data.trim().slice(0, maxLength);
}

function fold(value: string) {
  return value
    .normalize('NFKD')
    .toLocaleLowerCase('en')
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[-‐‑‒–—_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseProgrammeDiscoveryParams(
  value: unknown,
): ProgrammeDiscoveryFilters {
  const parsed = paramsObjectSchema.safeParse(value);
  if (!parsed.success) return { query: '' };

  const query =
    parseSingleParam(parsed.data.q, PUBLIC_PROGRAMME_MAX_QUERY_LENGTH) ?? '';
  const schoolValue = parseSingleParam(parsed.data.school, 32);
  const languageValue = parseSingleParam(parsed.data.language, 8);

  const school =
    schoolValue && isSchoolSlug(schoolValue) ? schoolValue : undefined;
  const languageResult = z
    .enum(PROGRAMME_LANGUAGE_CODES)
    .safeParse(languageValue);
  const filters: ProgrammeDiscoveryFilters = { query };

  if (school) filters.school = school;
  if (languageResult.success) filters.language = languageResult.data;

  return filters;
}

export function hasProgrammeDiscoveryFilters(
  filters: ProgrammeDiscoveryFilters,
) {
  return (
    filters.query.length > 0 ||
    filters.school !== undefined ||
    filters.language !== undefined
  );
}

function textScore(programme: PublicCmsProgramme, foldedQuery: string) {
  if (!foldedQuery) return 0;

  const title = fold(programme.title);
  const summary = fold(programme.summary);
  const delivery = fold(
    (['ar', 'fr', 'en'] as const)
      .map(
        (locale) => localizeProgrammeDelivery(locale, programme.delivery) ?? '',
      )
      .join(' '),
  );
  const school = fold(
    (['ar', 'fr', 'en'] as const)
      .map((locale) => getSchools(locale)[programme.school].name)
      .join(' '),
  );
  const languageText = fold(
    programme.languages
      .map((code) => programmeLanguageSearchLabels[code])
      .join(' '),
  );
  const queryTerms = [...new Set(foldedQuery.split(' ').filter(Boolean))];
  const searchableText = [title, summary, school, delivery, languageText].join(
    ' ',
  );

  if (
    queryTerms.length > 1 &&
    queryTerms.some((term) => !searchableText.includes(term))
  ) {
    return 0;
  }

  let score = 0;
  if (title === foldedQuery) score += 120;
  else if (title.startsWith(foldedQuery)) score += 90;
  else if (title.includes(foldedQuery)) score += 70;

  if (summary.includes(foldedQuery)) score += 30;
  if (school.includes(foldedQuery)) score += 20;
  if (delivery.includes(foldedQuery)) score += 10;
  if (languageText.includes(foldedQuery)) score += 10;

  if (score > 0 || queryTerms.length <= 1) return score;

  for (const term of queryTerms) {
    if (title === term) score += 60;
    else if (title.startsWith(term)) score += 45;
    else if (title.includes(term)) score += 35;

    if (summary.includes(term)) score += 15;
    if (school.includes(term)) score += 10;
    if (delivery.includes(term)) score += 5;
    if (languageText.includes(term)) score += 5;
  }

  return score;
}

export function filterPublicProgrammes(
  programmes: readonly PublicCmsProgramme[],
  filters: ProgrammeDiscoveryFilters,
) {
  const foldedQuery = fold(filters.query);

  return programmes
    .flatMap((programme) => {
      if (filters.school && programme.school !== filters.school) return [];
      if (filters.language && !programme.languages.includes(filters.language)) {
        return [];
      }

      const score = textScore(programme, foldedQuery);
      if (foldedQuery && score === 0) return [];

      return [{ programme, score }];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.programme.featured) - Number(a.programme.featured) ||
        a.programme.title.localeCompare(b.programme.title) ||
        a.programme._id.localeCompare(b.programme._id),
    )
    .map(({ programme }) => programme);
}
