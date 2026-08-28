import { describe, expect, it } from 'vitest';

import { getPsychologyContactPathDescription } from './contact-paths';

describe('psychology contact pathway copy', () => {
  it('keeps therapy, consultations and adjacent pathways visible in every locale', () => {
    expect(getPsychologyContactPathDescription('en')).toBe(
      'Therapy & consultations · Child and family guidance · Coaching programs',
    );
    expect(getPsychologyContactPathDescription('fr')).toBe(
      'Thérapie & consultations · Accompagnement enfant et famille · Programmes de coaching',
    );
    expect(getPsychologyContactPathDescription('ar')).toBe(
      'العلاج النفسي والاستشارات · إرشاد الطفل والعائلة · برامج الكوتشينغ',
    );
  });
});
