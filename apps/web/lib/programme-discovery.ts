import { z } from 'zod';

import {
  PROGRAMME_LANGUAGE_CODES,
  type CmsProgrammeLanguage,
  type PublicCmsProgramme,
} from './sanity';
import { isSchoolSlug, schools, type SchoolSlug } from './schools';

export const PUBLIC_PROGRAMME_MAX_QUERY_LENGTH = 100;

export const programmeLanguageLabels: Record<CmsProgrammeLanguage, string> = {
  ar: 'Arabic',
  fr: 'French',
  en: 'English',
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
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
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

  return {
    query,
    school,
    language: languageResult.success ? languageResult.data : undefined,
  };
}

function textScore(programme: PublicCmsProgramme, foldedQuery: string) {
  if (!foldedQuery) return 0;

  const title = fold(programme.title);
  const summary = fold(programme.summary);
  const delivery = fold(programme.delivery ?? '');
  const school = fold(schools[programme.school].name);
  const languageText = fold(
    programme.languages
      .map((code) => programmeLanguageLabels[code])
      .join(' '),
  );

  let score = 0;
  if (title === foldedQuery) score += 120;
  else if (title.startsWith(foldedQuery)) score += 90;
  else if (title.includes(foldedQuery)) score += 70;

  if (summary.includes(foldedQuery)) score += 30;
  if (school.includes(foldedQuery)) score += 20;
  if (delivery.includes(foldedQuery)) score += 10;
  if (languageText.includes(foldedQuery)) score += 10;

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
      if (
        filters.language &&
        !programme.languages.includes(filters.language)
      ) {
        return [];
      }

      const score = textScore(programme, foldedQuery);
      if (foldedQuery && score === 0) return [];

      return [{ programme, score }];
    })
    .sort(
      (a, b) =>
        Number(b.programme.featured) - Number(a.programme.featured) ||
        b.score - a.score ||
        a.programme.title.localeCompare(b.programme.title) ||
        a.programme._id.localeCompare(b.programme._id),
    )
    .map(({ programme }) => programme);
}
