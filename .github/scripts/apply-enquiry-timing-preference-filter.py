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
    "apps/admin/lib/enquiry-timing-preference-filter.ts",
    """import type { Prisma } from '@luminol/database';

import {
  ENQUIRY_TIMING_PREFERENCES,
  type EnquiryTimingPreference,
} from './enquiry-timing-preference-reporting';

export type { EnquiryTimingPreference };

export function parseEnquiryTimingPreferenceFilter(
  value: string | string[] | undefined,
): EnquiryTimingPreference | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_TIMING_PREFERENCES as readonly string[]).includes(value)
    ? (value as EnquiryTimingPreference)
    : null;
}

export function getEnquiryTimingPreferenceWhere(
  timingPreference: EnquiryTimingPreference | null,
): Prisma.EnquiryWhereInput | null {
  return timingPreference ? { timingPreference } : null;
}

export function buildEnquiryTimingPreferenceQuery(
  timingPreference: EnquiryTimingPreference,
): string {
  const query = new URLSearchParams();
  query.set('timingPreference', timingPreference);
  return query.toString();
}
""",
)

write_new(
    "apps/admin/lib/enquiry-timing-preference-filter.test.ts",
    """import { describe, expect, it } from 'vitest';

import {
  buildEnquiryTimingPreferenceQuery,
  getEnquiryTimingPreferenceWhere,
  parseEnquiryTimingPreferenceFilter,
} from './enquiry-timing-preference-filter';

describe('enquiry timing-preference filter', () => {
  it.each(['SOON', 'WITHIN_MONTH', 'LATER', 'NOT_SURE'] as const)(
    'accepts %s',
    (value) => expect(parseEnquiryTimingPreferenceFilter(value)).toBe(value),
  );

  it('fails closed for repeated values', () => {
    expect(parseEnquiryTimingPreferenceFilter(['SOON', 'LATER'])).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter(['NOT_SURE'])).toBeNull();
  });

  it('fails closed for invalid values', () => {
    expect(parseEnquiryTimingPreferenceFilter(undefined)).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter('')).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter('soon')).toBeNull();
    expect(parseEnquiryTimingPreferenceFilter('IMMEDIATE')).toBeNull();
  });

  it('builds an exact Prisma predicate', () => {
    expect(getEnquiryTimingPreferenceWhere('WITHIN_MONTH')).toEqual({
      timingPreference: 'WITHIN_MONTH',
    });
    expect(getEnquiryTimingPreferenceWhere(null)).toBeNull();
  });

  it('builds the deterministic query', () => {
    expect(buildEnquiryTimingPreferenceQuery('NOT_SURE')).toBe(
      'timingPreference=NOT_SURE',
    );
  });
});
""",
)

write_new(
    "apps/admin/lib/enquiry-timing-preference-filter-localization.ts",
    """import type { Locale } from '@luminol/localization';

export type EnquiryTimingPreferenceFilterCopy = {
  eyebrow: string;
  preference: string;
  intro: string;
  clear: string;
};

const COPY: Record<Locale, EnquiryTimingPreferenceFilterCopy> = {
  en: {
    eyebrow: 'Recorded requested timing',
    preference: 'Requested timing',
    intro:
      'This protected view is scoped only by the structured requested timing recorded on the enquiry. “Soon” is not an emergency or urgency signal, and “Not sure yet” is a recorded answer rather than low intent. It does not indicate lead quality, readiness, suitability, conversion probability, programme recommendation or clinical need.',
    clear: 'Clear timing-preference filter',
  },
  fr: {
    eyebrow: 'Calendrier souhaité enregistré',
    preference: 'Calendrier souhaité',
    intro:
      'Cette vue protégée est limitée uniquement au calendrier souhaité structuré enregistré sur la demande. « Bientôt » ne constitue pas un signal d’urgence ou d’urgence clinique, et « Pas encore sûr » est une réponse enregistrée plutôt qu’un signe de faible intention. Elle n’indique ni la qualité du prospect, ni la préparation, l’adéquation, une probabilité de conversion, une recommandation de programme ou un besoin clinique.',
    clear: 'Effacer le filtre de calendrier souhaité',
  },
  ar: {
    eyebrow: 'التوقيت المطلوب المسجّل',
    preference: 'التوقيت المطلوب',
    intro:
      'يقتصر هذا العرض المحمي على التوقيت المطلوب المنظم والمسجل في الطلب فقط. خيار «قريبًا» ليس إشارة إلى حالة طارئة أو درجة استعجال، وخيار «غير متأكد بعد» هو إجابة مسجلة وليس دليلاً على ضعف النية. ولا يدل هذا التوقيت على جودة الطلب أو الجاهزية أو الملاءمة أو احتمال التحويل أو توصية ببرنامج أو حاجة سريرية.',
    clear: 'مسح مرشح التوقيت المطلوب',
  },
};

export function getEnquiryTimingPreferenceFilterCopy(
  locale: Locale,
): EnquiryTimingPreferenceFilterCopy {
  return COPY[locale];
}
""",
)

write_new(
    "apps/admin/lib/enquiry-timing-preference-filter-localization.test.ts",
    """import { describe, expect, it } from 'vitest';

import { getEnquiryTimingPreferenceFilterCopy } from './enquiry-timing-preference-filter-localization';

describe('enquiry timing-preference filter localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete filter copy for %s',
    (locale) => {
      const copy = getEnquiryTimingPreferenceFilterCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.preference.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.clear.length).toBeGreaterThan(0);
    },
  );

  it('keeps the English copy contextual and non-evaluative', () => {
    const copy = getEnquiryTimingPreferenceFilterCopy('en');

    expect(copy.intro).toContain('structured requested timing recorded');
    expect(copy.intro).toContain('not an emergency or urgency signal');
    expect(copy.intro).toContain('recorded answer rather than low intent');
    expect(copy.intro).toContain('clinical need');
  });
});
""",
)

page = Path("apps/admin/app/enquiries/page.tsx")
text = page.read_text()

marker = "import { getEnquiryDeliveryPreferenceFilterCopy } from '../../lib/enquiry-delivery-preference-filter-localization';\n"
text = replace_once(
    text,
    marker,
    marker + "import { getEnquiryTimingPreferenceFilterCopy } from '../../lib/enquiry-timing-preference-filter-localization';\n",
    "timing localization import",
)

marker = (
    "import {\n"
    "  getEnquiryDeliveryPreferenceWhere,\n"
    "  parseEnquiryDeliveryPreferenceFilter,\n"
    "  type EnquiryDeliveryPreference,\n"
    "} from '../../lib/enquiry-delivery-preference-filter';\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "import {\n"
    + "  getEnquiryTimingPreferenceWhere,\n"
    + "  parseEnquiryTimingPreferenceFilter,\n"
    + "  type EnquiryTimingPreference,\n"
    + "} from '../../lib/enquiry-timing-preference-filter';\n",
    "timing filter import",
)

marker = "    deliveryPreference?: string | string[] | undefined;\n"
text = replace_once(
    text,
    marker,
    marker + "    timingPreference?: string | string[] | undefined;\n",
    "timing search param",
)

marker = "  deliveryPreference: EnquiryDeliveryPreference | null = null,\n) {\n"
text = replace_once(
    text,
    marker,
    "  deliveryPreference: EnquiryDeliveryPreference | null = null,\n"
    "  timingPreference: EnquiryTimingPreference | null = null,\n"
    ") {\n",
    "timing href argument",
)

marker = "  if (deliveryPreference) query.set('deliveryPreference', deliveryPreference);\n"
text = replace_once(
    text,
    marker,
    marker + "  if (timingPreference) query.set('timingPreference', timingPreference);\n",
    "timing href query",
)

marker = (
    "  const deliveryPreferenceFilterCopy =\n"
    "    getEnquiryDeliveryPreferenceFilterCopy(locale);\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "  const timingPreferenceFilterCopy =\n"
    + "    getEnquiryTimingPreferenceFilterCopy(locale);\n",
    "timing copy",
)

marker = (
    "  const activeDeliveryPreference = parseEnquiryDeliveryPreferenceFilter(\n"
    "    params?.deliveryPreference,\n"
    "  );\n"
)
text = replace_once(
    text,
    marker,
    marker
    + "  const activeTimingPreference = parseEnquiryTimingPreferenceFilter(\n"
    + "    params?.timingPreference,\n"
    + "  );\n",
    "timing parse",
)

marker = "  if (deliveryPreferenceWhere) filters.push(deliveryPreferenceWhere);\n"
text = replace_once(
    text,
    marker,
    marker
    + "  const timingPreferenceWhere = getEnquiryTimingPreferenceWhere(\n"
    + "    activeTimingPreference,\n"
    + "  );\n"
    + "  if (timingPreferenceWhere) filters.push(timingPreferenceWhere);\n",
    "timing where",
)

marker = "      activeContactPreference,\n      activeDeliveryPreference,\n    );\n"
text = replace_once(
    text,
    marker,
    "      activeContactPreference,\n"
    "      activeDeliveryPreference,\n"
    "      activeTimingPreference,\n"
    "    );\n",
    "timing hrefFor scope",
)

shared_clear = (
    "                      activeContactPreference,\n"
    "                      activeDeliveryPreference,\n"
    "                    )}\n"
)
shared_replacement = (
    "                      activeContactPreference,\n"
    "                      activeDeliveryPreference,\n"
    "                      activeTimingPreference,\n"
    "                    )}\n"
)
shared_count = text.count(shared_clear)
if shared_count != 3:
    raise SystemExit(
        f"campaign/landing/school timing scope: expected 3 markers, found {shared_count}"
    )
text = text.replace(shared_clear, shared_replacement)

marker = (
    "                      activeSchool,\n"
    "                      null,\n"
    "                      activeDeliveryPreference,\n"
    "                    )}\n"
)
text = replace_once(
    text,
    marker,
    "                      activeSchool,\n"
    "                      null,\n"
    "                      activeDeliveryPreference,\n"
    "                      activeTimingPreference,\n"
    "                    )}\n",
    "contact clear timing scope",
)

marker = (
    "                      activeSchool,\n"
    "                      activeContactPreference,\n"
    "                      null,\n"
    "                    )}\n"
)
text = replace_once(
    text,
    marker,
    "                      activeSchool,\n"
    "                      activeContactPreference,\n"
    "                      null,\n"
    "                      activeTimingPreference,\n"
    "                    )}\n",
    "delivery clear timing scope",
)

attention_marker = (
    "            <div className={styles.attentionSection}>\n"
    "              <span className={styles.filterLabel}>{copy.attentionQueue}</span>\n"
)
timing_panel = (
    "            {activeTimingPreference ? (\n"
    "              <div className={styles.attentionSection}>\n"
    "                <span className={styles.filterLabel}>\n"
    "                  {timingPreferenceFilterCopy.eyebrow}\n"
    "                </span>\n"
    "                <div className={styles.filters}>\n"
    "                  <span className={styles.filterLink}>\n"
    "                    {timingPreferenceFilterCopy.preference}:{' '}\n"
    "                    {getEnquiryTimingPreferenceLabel(\n"
    "                      locale,\n"
    "                      activeTimingPreference,\n"
    "                    )}\n"
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
    "                      null,\n"
    "                    )}\n"
    "                  >\n"
    "                    <span>{timingPreferenceFilterCopy.clear}</span>\n"
    "                  </Link>\n"
    "                </div>\n"
    "                <p className={styles.filterLabel}>\n"
    "                  {timingPreferenceFilterCopy.intro}\n"
    "                </p>\n"
    "              </div>\n"
    "            ) : null}\n\n"
)
text = replace_once(
    text,
    attention_marker,
    timing_panel + attention_marker,
    "timing active panel",
)

for value in [
    "timingPreference?: string | string[] | undefined;",
    "activeTimingPreference",
    "getEnquiryTimingPreferenceWhere",
    "timingPreferenceFilterCopy",
    "query.set('timingPreference', timingPreference)",
]:
    if value not in text:
        raise SystemExit(f"missing expected enquiry-page integration: {value}")
page.write_text(text)


dashboard = Path("apps/admin/app/page.tsx")
dashboard_text = dashboard.read_text()

marker = "import { buildEnquiryDeliveryPreferenceQuery } from '../lib/enquiry-delivery-preference-filter';\n"
dashboard_text = replace_once(
    dashboard_text,
    marker,
    marker + "import { buildEnquiryTimingPreferenceQuery } from '../lib/enquiry-timing-preference-filter';\n",
    "timing dashboard import",
)

marker = (
    "                  <article key={item.timingPreference}>\n"
    "                    <span>\n"
    "                      {item.timingPreference === 'SOON'\n"
    "                        ? timingPreferenceCopy.soon\n"
    "                        : item.timingPreference === 'WITHIN_MONTH'\n"
    "                          ? timingPreferenceCopy.withinMonth\n"
    "                          : item.timingPreference === 'LATER'\n"
    "                            ? timingPreferenceCopy.later\n"
    "                            : timingPreferenceCopy.notSure}\n"
    "                    </span>\n"
    "                    <strong>{number(item.count)}</strong>\n"
)
replacement = (
    "                  <article key={item.timingPreference}>\n"
    "                    <Link\n"
    "                      href={localizeHref(\n"
    "                        locale,\n"
    "                        `/enquiries?${buildEnquiryTimingPreferenceQuery(\n"
    "                          item.timingPreference,\n"
    "                        )}`,\n"
    "                      )}\n"
    "                    >\n"
    "                      <span>\n"
    "                        {item.timingPreference === 'SOON'\n"
    "                          ? timingPreferenceCopy.soon\n"
    "                          : item.timingPreference === 'WITHIN_MONTH'\n"
    "                            ? timingPreferenceCopy.withinMonth\n"
    "                            : item.timingPreference === 'LATER'\n"
    "                              ? timingPreferenceCopy.later\n"
    "                              : timingPreferenceCopy.notSure}\n"
    "                      </span>\n"
    "                    </Link>\n"
    "                    <strong>{number(item.count)}</strong>\n"
)
dashboard_text = replace_once(
    dashboard_text,
    marker,
    replacement,
    "timing dashboard drill-down",
)

dashboard.write_text(dashboard_text)
