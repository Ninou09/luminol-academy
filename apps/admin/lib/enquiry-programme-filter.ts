import type { Prisma } from '@luminol/database';

const PROGRAMME_SLUG_LIMIT = 96;
const PROGRAMME_TITLE_SNAPSHOT_LIMIT = 240;
const PROGRAMME_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type EnquiryProgrammeFilter = {
  programmeSlug: string;
  programmeTitleSnapshot: string;
};

function scalar(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }

  return false;
}

export function parseEnquiryProgrammeFilter(
  slugValue: string | string[] | undefined,
  titleValue: string | string[] | undefined,
): EnquiryProgrammeFilter | null {
  const programmeSlug = scalar(slugValue);
  const programmeTitleSnapshot = scalar(titleValue);

  if (
    !programmeSlug ||
    programmeSlug.length > PROGRAMME_SLUG_LIMIT ||
    !PROGRAMME_SLUG_PATTERN.test(programmeSlug)
  ) {
    return null;
  }

  if (
    !programmeTitleSnapshot ||
    programmeTitleSnapshot.length > PROGRAMME_TITLE_SNAPSHOT_LIMIT ||
    programmeTitleSnapshot !== programmeTitleSnapshot.trim() ||
    hasControlCharacter(programmeTitleSnapshot)
  ) {
    return null;
  }

  return { programmeSlug, programmeTitleSnapshot };
}

export function getEnquiryProgrammeWhere(
  programme: EnquiryProgrammeFilter | null,
): Prisma.EnquiryWhereInput | null {
  return programme
    ? {
        programmeSlug: programme.programmeSlug,
        programmeTitleSnapshot: programme.programmeTitleSnapshot,
      }
    : null;
}

export function buildEnquiryProgrammeQuery(
  programme: EnquiryProgrammeFilter,
): string {
  const query = new URLSearchParams();
  query.set('programmeSlug', programme.programmeSlug);
  query.set('programmeTitle', programme.programmeTitleSnapshot);
  return query.toString();
}
