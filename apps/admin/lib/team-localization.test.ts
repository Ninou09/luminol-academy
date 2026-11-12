import { STAFF_ROLE_KEYS } from '@luminol/database/staff-roles';
import { describe, expect, it } from 'vitest';

import { getTeamCopy } from './team-localization';

describe('team localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'names and describes every governed staff role in %s',
    (locale) => {
      const copy = getTeamCopy(locale);
      expect(copy.title).toBeTruthy();
      expect(copy.adminNote).toBeTruthy();
      for (const role of STAFF_ROLE_KEYS) {
        expect(copy.roleName[role]).toBeTruthy();
        expect(copy.roleDescription[role]).toBeTruthy();
      }
    },
  );
});
