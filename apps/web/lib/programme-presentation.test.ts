import { describe, expect, it } from 'vitest';

import {
  isProgrammeWaitlist,
  localizeProgrammeDelivery,
  localizeProgrammeEnquiryAction,
  localizeProgrammePublicCopy,
  localizeProgrammeViewAction,
  localizeProgrammeWaitlistAction,
  localizeProgrammeWaitlistLabel,
} from './programme-presentation';

describe('localizeProgrammeDelivery', () => {
  it.each([
    ['en', 'In person', 'In person'],
    ['en', 'Online', 'Online'],
    ['en', 'Hybrid', 'Hybrid'],
    ['en', 'Flexible', 'Flexible'],
    ['fr', 'In person', 'En présentiel'],
    ['fr', 'Online', 'En ligne'],
    ['fr', 'Hybrid', 'Hybride'],
    ['fr', 'Flexible', 'Flexible'],
    ['ar', 'In person', 'حضوري'],
    ['ar', 'Online', 'عن بُعد'],
    ['ar', 'Hybrid', 'هجين'],
    ['ar', 'Flexible', 'مرن'],
  ] as const)('localizes %s %s', (locale, delivery, expected) => {
    expect(localizeProgrammeDelivery(locale, delivery)).toBe(expected);
  });

  it('preserves unknown governed CMS values', () => {
    expect(localizeProgrammeDelivery('ar', 'Workshop blend')).toBe(
      'Workshop blend',
    );
  });

  it('returns null for empty delivery values', () => {
    expect(localizeProgrammeDelivery('fr', null)).toBeNull();
    expect(localizeProgrammeDelivery('fr', '   ')).toBeNull();
  });
});

describe('programme conversion actions', () => {
  it.each([
    ['en', 'View programme'],
    ['fr', 'Voir le programme'],
    ['ar', 'عرض البرنامج'],
  ] as const)(
    'localizes the %s programme detail action',
    (locale, expected) => {
      expect(localizeProgrammeViewAction(locale)).toBe(expected);
    },
  );

  it.each([
    ['en', 'Ask about this programme'],
    ['fr', 'Demander des informations sur ce programme'],
    ['ar', 'استفسر عن هذا البرنامج'],
  ] as const)(
    'localizes the %s programme enquiry action',
    (locale, expected) => {
      expect(localizeProgrammeEnquiryAction(locale)).toBe(expected);
    },
  );
});

describe('programme public copy localization', () => {
  const act = {
    title: 'العلاج بالتقبل والالتزام ACT',
    summary:
      'دورة تدريبية متخصصة في العلاج بالتقبل والالتزام تهدف إلى تقديم مبادئ وتقنيات عملية تساعد المختصين والمهتمين بالمجال النفسي على فهم هذا التوجه العلاجي وتطبيق أدواته الأساسية.',
    slug: { current: 'acceptance-commitment-therapy-act' },
  };

  it('keeps the canonical Arabic copy on Arabic routes', () => {
    expect(localizeProgrammePublicCopy('ar', act)).toEqual({
      title: act.title,
      summary: act.summary,
    });
  });

  it('uses reviewed ACT fallback translations until CMS translations are present', () => {
    expect(localizeProgrammePublicCopy('fr', act).title).toBe(
      'Thérapie d’acceptation et d’engagement (ACT)',
    );
    expect(localizeProgrammePublicCopy('en', act).title).toBe(
      'Acceptance and Commitment Therapy (ACT)',
    );
    expect(localizeProgrammePublicCopy('fr', act).summary).toContain(
      'formation spécialisée',
    );
    expect(localizeProgrammePublicCopy('en', act).summary).toContain(
      'specialized training course',
    );
  });

  it('prefers reviewed CMS translations over the temporary ACT fallback', () => {
    expect(
      localizeProgrammePublicCopy('en', {
        ...act,
        localizedCopy: {
          en: {
            title: 'Reviewed CMS ACT title',
            summary:
              'A reviewed English CMS summary that is intentionally long enough for the public content contract.',
          },
        },
      }),
    ).toEqual({
      title: 'Reviewed CMS ACT title',
      summary:
        'A reviewed English CMS summary that is intentionally long enough for the public content contract.',
    });
  });

  it('falls back to canonical copy for programmes without a reviewed translation', () => {
    const programme = {
      title: 'Canonical programme',
      summary: 'Canonical programme summary.',
      slug: { current: 'another-programme' },
    };
    expect(localizeProgrammePublicCopy('fr', programme)).toEqual({
      title: programme.title,
      summary: programme.summary,
    });
  });
});

describe('programme waitlist presentation', () => {
  it('marks only the operator-approved ACT slug as next-cohort waitlist', () => {
    expect(isProgrammeWaitlist('acceptance-commitment-therapy-act')).toBe(true);
    expect(isProgrammeWaitlist(' ACCEPTANCE-COMMITMENT-THERAPY-ACT ')).toBe(
      true,
    );
    expect(isProgrammeWaitlist('english-conversation')).toBe(false);
  });

  it('provides localized waitlist labels and contact actions', () => {
    expect(localizeProgrammeWaitlistLabel('en')).toBe('Next cohort · Waitlist');
    expect(localizeProgrammeWaitlistLabel('fr')).toBe(
      'Prochaine cohorte · Liste d’attente',
    );
    expect(localizeProgrammeWaitlistLabel('ar')).toBe(
      'الفوج القادم · قائمة الانتظار',
    );

    expect(localizeProgrammeWaitlistAction('en')).toBe('Ask about next cohort');
    expect(localizeProgrammeWaitlistAction('fr')).toBe(
      'Demander la prochaine cohorte',
    );
    expect(localizeProgrammeWaitlistAction('ar')).toBe('اسأل عن الفوج القادم');
  });
});
