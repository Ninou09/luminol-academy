import type { Locale } from '@luminol/localization';

import { getSchools } from './schools';

export function getPsychologyContactPathDescription(locale: Locale): string {
  return getSchools(locale).psychology.programs
    .slice(0, 3)
    .map((program) => program.title)
    .join(' · ');
}
