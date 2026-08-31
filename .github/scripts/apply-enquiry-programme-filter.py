from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one marker, found {count}")
    return text.replace(old, new, 1)


def write_new(path: str, content: str) -> None:
    target = Path(path)
    if target.exists():
        raise SystemExit(f"refusing to overwrite existing file: {path}")
    target.write_text(content)


write_new(
    "apps/admin/lib/enquiry-programme-filter.ts",
    """import type { Prisma } from '@luminol/database';

const PROGRAMME_SLUG_LIMIT = 96;
const PROGRAMME_TITLE_SNAPSHOT_LIMIT = 240;
const PROGRAMME_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTROL_CHARACTER_PATTERN = /[\\u0000-\\u001f\\u007f]/;

export type EnquiryProgrammeFilter = {
  programmeSlug: string;
  programmeTitleSnapshot: string;
};

function scalar(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : null;
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
    CONTROL_CHARACTER_PATTERN.test(programmeTitleSnapshot)
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
""",
)

write_new(
    "apps/admin/lib/enquiry-programme-filter.test.ts",
    """import { describe, expect, it } from 'vitest';

import {
  buildEnquiryProgrammeQuery,
  getEnquiryProgrammeWhere,
  parseEnquiryProgrammeFilter,
} from './enquiry-programme-filter';

describe('enquiry programme filter', () => {
  it('accepts one exact canonical persisted programme pair', () => {
    expect(
      parseEnquiryProgrammeFilter('act-foundations', 'ACT Foundations'),
    ).toEqual({
      programmeSlug: 'act-foundations',
      programmeTitleSnapshot: 'ACT Foundations',
    });
  });

  it('fails closed for repeated or one-sided values', () => {
    expect(
      parseEnquiryProgrammeFilter(
        ['act-foundations'],
        'ACT Foundations',
      ),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter(
        'act-foundations',
        ['ACT Foundations', 'Other'],
      ),
    ).toBeNull();
    expect(parseEnquiryProgrammeFilter('act-foundations', undefined)).toBeNull();
    expect(parseEnquiryProgrammeFilter(undefined, 'ACT Foundations')).toBeNull();
  });

  it('fails closed rather than normalizing malformed programme context', () => {
    expect(parseEnquiryProgrammeFilter('ACT-Foundations', 'ACT Foundations')).toBeNull();
    expect(parseEnquiryProgrammeFilter('act foundations', 'ACT Foundations')).toBeNull();
    expect(parseEnquiryProgrammeFilter('act-foundations', ' ACT Foundations ')).toBeNull();
    expect(parseEnquiryProgrammeFilter('act-foundations', 'ACT\\nFoundations')).toBeNull();
    expect(parseEnquiryProgrammeFilter('a'.repeat(97), 'ACT Foundations')).toBeNull();
    expect(parseEnquiryProgrammeFilter('act-foundations', 'A'.repeat(241))).toBeNull();
  });

  it('builds an exact atomic Prisma predicate', () => {
    expect(
      getEnquiryProgrammeWhere({
        programmeSlug: 'act-foundations',
        programmeTitleSnapshot: 'ACT Foundations',
      }),
    ).toEqual({
      programmeSlug: 'act-foundations',
      programmeTitleSnapshot: 'ACT Foundations',
    });
    expect(getEnquiryProgrammeWhere(null)).toBeNull();
  });

  it('builds a deterministic encoded query from both persisted values', () => {
    expect(
      buildEnquiryProgrammeQuery({
        programmeSlug: 'act-foundations',
        programmeTitleSnapshot: 'ACT Foundations',
      }),
    ).toBe('programmeSlug=act-foundations&programmeTitle=ACT+Foundations');
  });
});
""",
)

write_new(
    "apps/admin/lib/enquiry-programme-filter-localization.ts",
    """import type { Locale } from '@luminol/localization';

export type EnquiryProgrammeFilterCopy = {
  eyebrow: string;
  programme: string;
  storedSlug: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryProgrammeFilterCopy> = {
  en: {
    eyebrow: 'Verified programme context',
    programme: 'Recorded programme',
    storedSlug: 'Stored slug',
    intro:
      'This protected view is scoped only by the exact programme slug and title snapshot stored with the enquiry after server verification. The snapshot is historical enquiry context, not a current-catalogue replacement, recommendation, suitability assessment, conversion signal, lead-quality signal or clinical inference.',
    clear: 'Clear programme filter',
  },
  fr: {
    eyebrow: 'Contexte de programme vérifié',
    programme: 'Programme enregistré',
    storedSlug: 'Slug enregistré',
    intro:
      'Cette vue protégée est limitée uniquement au slug et à l’intitulé instantané exacts enregistrés avec la demande après vérification serveur. Cet instantané est un contexte historique de la demande et ne remplace pas le catalogue actuel ; il ne constitue ni une recommandation, ni une évaluation d’adéquation, ni un signal de conversion ou de qualité du prospect, ni une inférence clinique.',
    clear: 'Effacer le filtre de programme',
  },
  ar: {
    eyebrow: 'سياق البرنامج المتحقق منه',
    programme: 'البرنامج المسجّل',
    storedSlug: 'المعرّف المحفوظ',
    intro:
      'يقتصر هذا العرض المحمي على معرّف البرنامج ولقطة عنوانه المطابقين تمامًا لما حُفظ مع الطلب بعد التحقق على الخادم. هذه اللقطة سياق تاريخي للطلب وليست بديلًا عن الكتالوج الحالي، ولا تمثل توصية أو تقييم ملاءمة أو إشارة تحويل أو جودة للطلب أو استنتاجًا سريريًا.',
    clear: 'مسح مرشح البرنامج',
  },
};

export function getEnquiryProgrammeFilterCopy(
  locale: Locale,
): EnquiryProgrammeFilterCopy {
  return COPY[locale];
}
""",
)

write_new(
    "apps/admin/lib/enquiry-programme-filter-localization.test.ts",
    """import { describe, expect, it } from 'vitest';

import { getEnquiryProgrammeFilterCopy } from './enquiry-programme-filter-localization';

describe('enquiry programme filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete filter copy for %s',
    (locale) => {
      const copy = getEnquiryProgrammeFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.programme.length).toBeGreaterThan(0);
      expect(copy.storedSlug.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy tied to exact stored verified context', () => {
    const copy = getEnquiryProgrammeFilterCopy('en');

    expect(copy.intro).toContain('exact programme slug and title snapshot');
    expect(copy.intro).toContain('server verification');
    expect(copy.intro).toContain('historical enquiry context');
    expect(copy.intro).toContain('not a current-catalogue replacement');
    expect(copy.intro).toContain('clinical inference');
  });
});
""",
)

page = Path("apps/admin/app/enquiries/page.tsx")
text = page.read_text()

marker = "import { getEnquiryTimingPreferenceFilterCopy } from '../../lib/enquiry-timing-preference-filter-localization';\n"
text = replace_once(
    text,
    marker,
    marker + "import { getEnquiryProgrammeFilterCopy } from '../../lib/enquiry-programme-filter-localization';\n",
    "programme localization import",
)

marker = (
    "import {\n"
    "  getEnquiryTimingPreferenceWhere,\n"
    "  parseEnquiryTimingPreferenceFilter,\n"
    "  type EnquiryTimingPreference,\n"
    "} from '../../lib/enquiry-timing-preference-filter';\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "import {\n"
    + "  getEnquiryProgrammeWhere,\n"
    + "  parseEnquiryProgrammeFilter,\n"
    + "  type EnquiryProgrammeFilter,\n"
    + "} from '../../lib/enquiry-programme-filter';\n",
    "programme filter import",
)

marker = "    timingPreference?: string | string[] | undefined;\n"
text = replace_once(
    text,
    marker,
    marker
    + "    programmeSlug?: string | string[] | undefined;\n"
    + "    programmeTitle?: string | string[] | undefined;\n",
    "programme search params",
)

marker = "  timingPreference: EnquiryTimingPreference | null = null,\n) {\n"
text = replace_once(
    text,
    marker,
    "  timingPreference: EnquiryTimingPreference | null = null,\n"
    "  programme: EnquiryProgrammeFilter | null = null,\n"
    ") {\n",
    "programme href argument",
)

marker = "  if (timingPreference) query.set('timingPreference', timingPreference);\n"
text = replace_once(
    text,
    marker,
    marker
    + "  if (programme) {\n"
    + "    query.set('programmeSlug', programme.programmeSlug);\n"
    + "    query.set('programmeTitle', programme.programmeTitleSnapshot);\n"
    + "  }\n",
    "programme href query",
)

marker = (
    "  const timingPreferenceFilterCopy =\n"
    "    getEnquiryTimingPreferenceFilterCopy(locale);\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "  const programmeFilterCopy = getEnquiryProgrammeFilterCopy(locale);\n",
    "programme copy",
)

marker = (
    "  const activeTimingPreference = parseEnquiryTimingPreferenceFilter(\n"
    "    params?.timingPreference,\n"
    "  );\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "  const activeProgramme = parseEnquiryProgrammeFilter(\n"
    + "    params?.programmeSlug,\n"
    + "    params?.programmeTitle,\n"
    + "  );\n",
    "programme parse",
)

marker = "  if (timingPreferenceWhere) filters.push(timingPreferenceWhere);\n"
text = replace_once(
    text,
    marker,
    marker
    + "  const programmeWhere = getEnquiryProgrammeWhere(activeProgramme);\n"
    + "  if (programmeWhere) filters.push(programmeWhere);\n",
    "programme where",
)

marker = "      activeDeliveryPreference,\n      activeTimingPreference,\n    );\n"
text = replace_once(
    text,
    marker,
    "      activeDeliveryPreference,\n"
    "      activeTimingPreference,\n"
    "      activeProgramme,\n"
    "    );\n",
    "programme hrefFor scope",
)

# Preserve programme scope on all six existing context-clear controls.
markers = [
    (
        "                      activeDeliveryPreference,\n"
        "                      activeTimingPreference,\n"
        "                    )}\n",
        "                      activeDeliveryPreference,\n"
        "                      activeTimingPreference,\n"
        "                      activeProgramme,\n"
        "                    )}\n",
        3,
        "campaign/landing/school programme scope",
    ),
    (
        "                      null,\n"
        "                      activeDeliveryPreference,\n"
        "                      activeTimingPreference,\n"
        "                    )}\n",
        "                      null,\n"
        "                      activeDeliveryPreference,\n"
        "                      activeTimingPreference,\n"
        "                      activeProgramme,\n"
        "                    )}\n",
        1,
        "contact clear programme scope",
    ),
    (
        "                      activeContactPreference,\n"
        "                      null,\n"
        "                      activeTimingPreference,\n"
        "                    )}\n",
        "                      activeContactPreference,\n"
        "                      null,\n"
        "                      activeTimingPreference,\n"
        "                      activeProgramme,\n"
        "                    )}\n",
        1,
        "delivery clear programme scope",
    ),
    (
        "                      activeContactPreference,\n"
        "                      activeDeliveryPreference,\n"
        "                      null,\n"
        "                    )}\n",
        "                      activeContactPreference,\n"
        "                      activeDeliveryPreference,\n"
        "                      null,\n"
        "                      activeProgramme,\n"
        "                    )}\n",
        1,
        "timing clear programme scope",
    ),
]
for old, new, expected, label in markers:
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{label}: expected {expected} markers, found {count}")
    text = text.replace(old, new)

attention_marker = (
    "            <div className={styles.attentionSection}>\n"
    "              <span className={styles.filterLabel}>{copy.attentionQueue}</span>\n"
)
programme_panel = (
    "            {activeProgramme ? (\n"
    "              <div className={styles.attentionSection}>\n"
    "                <span className={styles.filterLabel}>\n"
    "                  {programmeFilterCopy.eyebrow}\n"
    "                </span>\n"
    "                <div className={styles.filters}>\n"
    "                  <span className={styles.filterLink} dir=\"auto\">\n"
    "                    {programmeFilterCopy.programme}:{' '}\n"
    "                    {activeProgramme.programmeTitleSnapshot}\n"
    "                  </span>\n"
    "                  <span className={styles.filterLink} dir=\"ltr\">\n"
    "                    {programmeFilterCopy.storedSlug}:{' '}\n"
    "                    {activeProgramme.programmeSlug}\n"
    "                  </span>\n"
    "                  <Link\n"
    "                    className={styles.filterLink}\n"
    "                    href={buildEnquiryHref(\n"
    "                      locale,\n"
    "                      activeStatus,\n"
    "                      activeFollowUp,\n"
    "                      activeAttention,\n"
    "                      activeOwner,\n"
    "                      activeCampaignAttribution,\n"
    "                      activeLandingPath,\n"
    "                      activeSchool,\n"
    "                      activeContactPreference,\n"
    "                      activeDeliveryPreference,\n"
    "                      activeTimingPreference,\n"
    "                      null,\n"
    "                    )}\n"
    "                  >\n"
    "                    <span>{programmeFilterCopy.clear}</span>\n"
    "                  </Link>\n"
    "                </div>\n"
    "                <p className={styles.filterLabel}>\n"
    "                  {programmeFilterCopy.intro}\n"
    "                </p>\n"
    "              </div>\n"
    "            ) : null}\n\n"
)
text = replace_once(
    text,
    attention_marker,
    programme_panel + attention_marker,
    "programme active panel",
)

for value in [
    "programmeSlug?: string | string[] | undefined;",
    "programmeTitle?: string | string[] | undefined;",
    "activeProgramme",
    "getEnquiryProgrammeWhere",
    "programmeFilterCopy",
    "query.set('programmeTitle', programme.programmeTitleSnapshot)",
]:
    if value not in text:
        raise SystemExit(f"missing expected enquiry-page integration: {value}")
page.write_text(text)


dashboard = Path("apps/admin/app/page.tsx")
dashboard_text = dashboard.read_text()

marker = "import { buildEnquiryTimingPreferenceQuery } from '../lib/enquiry-timing-preference-filter';\n"
dashboard_text = replace_once(
    dashboard_text,
    marker,
    marker + "import { buildEnquiryProgrammeQuery } from '../lib/enquiry-programme-filter';\n",
    "programme dashboard import",
)

marker = (
    "                  <article key={item.programmeSlug}>\n"
    "                    <span dir=\"auto\">{item.programmeTitleSnapshot}</span>\n"
    "                    <strong>{number(item.count)}</strong>\n"
)
replacement = (
    "                  <article key={`${item.programmeSlug}:${item.programmeTitleSnapshot}`}>\n"
    "                    <Link\n"
    "                      href={localizeHref(\n"
    "                        locale,\n"
    "                        `/enquiries?${buildEnquiryProgrammeQuery({\n"
    "                          programmeSlug: item.programmeSlug,\n"
    "                          programmeTitleSnapshot:\n"
    "                            item.programmeTitleSnapshot,\n"
    "                        })}`,\n"
    "                      )}\n"
    "                    >\n"
    "                      <span dir=\"auto\">\n"
    "                        {item.programmeTitleSnapshot}\n"
    "                      </span>\n"
    "                    </Link>\n"
    "                    <strong>{number(item.count)}</strong>\n"
)
dashboard_text = replace_once(
    dashboard_text,
    marker,
    replacement,
    "programme dashboard drill-down",
)

dashboard.write_text(dashboard_text)
