from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


attention_lib = Path('apps/admin/lib/enquiry-attention.ts')
attention_lib.write_text('''import type { Prisma } from '@luminol/database';

export const enquiryAttentionFilters = [
  'unassigned',
  'closed-without-outcome',
] as const;

export type EnquiryAttentionFilter = (typeof enquiryAttentionFilters)[number];

export const ACTIVE_UNASSIGNED_ENQUIRY_WHERE = {
  ownerUserId: null,
  status: { notIn: ['CLOSED', 'SPAM'] },
} satisfies Prisma.EnquiryWhereInput;

export const CLOSED_WITHOUT_OUTCOME_WHERE = {
  status: 'CLOSED',
  outcome: null,
  outcomeAt: null,
} satisfies Prisma.EnquiryWhereInput;

export function parseEnquiryAttentionFilter(
  value: string | string[] | undefined,
): EnquiryAttentionFilter | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return null;

  return (enquiryAttentionFilters as readonly string[]).includes(candidate)
    ? (candidate as EnquiryAttentionFilter)
    : null;
}

export function getEnquiryAttentionWhere(
  filter: EnquiryAttentionFilter | null,
): Prisma.EnquiryWhereInput | null {
  if (filter === 'unassigned') return ACTIVE_UNASSIGNED_ENQUIRY_WHERE;
  if (filter === 'closed-without-outcome') return CLOSED_WITHOUT_OUTCOME_WHERE;
  return null;
}
''')

attention_test = Path('apps/admin/lib/enquiry-attention.test.ts')
attention_test.write_text('''import { describe, expect, it } from 'vitest';

import {
  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
  CLOSED_WITHOUT_OUTCOME_WHERE,
  getEnquiryAttentionWhere,
  parseEnquiryAttentionFilter,
} from './enquiry-attention';

describe('enquiry attention filters', () => {
  it('accepts only stable attention tokens and fails closed for invalid values', () => {
    expect(parseEnquiryAttentionFilter('unassigned')).toBe('unassigned');
    expect(parseEnquiryAttentionFilter('closed-without-outcome')).toBe(
      'closed-without-outcome',
    );
    expect(parseEnquiryAttentionFilter(['unassigned', 'ignored'])).toBe(
      'unassigned',
    );
    expect(parseEnquiryAttentionFilter('lead@example.com')).toBeNull();
    expect(parseEnquiryAttentionFilter(undefined)).toBeNull();
  });

  it('keeps attention semantics explicit and limited to structured fields', () => {
    expect(getEnquiryAttentionWhere('unassigned')).toEqual(
      ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
    );
    expect(ACTIVE_UNASSIGNED_ENQUIRY_WHERE).toEqual({
      ownerUserId: null,
      status: { notIn: ['CLOSED', 'SPAM'] },
    });
    expect(getEnquiryAttentionWhere('closed-without-outcome')).toEqual(
      CLOSED_WITHOUT_OUTCOME_WHERE,
    );
    expect(CLOSED_WITHOUT_OUTCOME_WHERE).toEqual({
      status: 'CLOSED',
      outcome: null,
      outcomeAt: null,
    });
    expect(getEnquiryAttentionWhere(null)).toBeNull();
  });
});
''')

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "import { db } from '@luminol/database';\n",
    "import { db, type Prisma } from '@luminol/database';\n",
    'database import',
)
page = replace_once(
    page,
    "import { getAdminEnumLabel } from '../../lib/admin-localization';\n",
    "import { getAdminEnumLabel } from '../../lib/admin-localization';\nimport {\n  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n  CLOSED_WITHOUT_OUTCOME_WHERE,\n  getEnquiryAttentionWhere,\n  parseEnquiryAttentionFilter,\n  type EnquiryAttentionFilter,\n} from '../../lib/enquiry-attention';\n",
    'attention import',
)
page = replace_once(
    page,
    '    status?: string | string[] | undefined;\n    followUp?: string | string[] | undefined;\n',
    '    status?: string | string[] | undefined;\n    followUp?: string | string[] | undefined;\n    attention?: string | string[] | undefined;\n',
    'attention search param',
)
page = replace_once(
    page,
    '  status: EnquiryStatusValue | null,\n  followUp: FollowUpFilter | null,\n) {\n  const query = new URLSearchParams();\n  if (status) query.set(\'status\', status);\n  if (followUp) query.set(\'followUp\', followUp);\n',
    '  status: EnquiryStatusValue | null,\n  followUp: FollowUpFilter | null,\n  attention: EnquiryAttentionFilter | null,\n) {\n  const query = new URLSearchParams();\n  if (status) query.set(\'status\', status);\n  if (followUp) query.set(\'followUp\', followUp);\n  if (attention) query.set(\'attention\', attention);\n',
    'attention href token',
)
page = replace_once(
    page,
    '  const activeStatus = parseStatus(params?.status);\n  const activeFollowUp = parseFollowUp(params?.followUp);\n',
    '  const activeStatus = parseStatus(params?.status);\n  const activeFollowUp = parseFollowUp(params?.followUp);\n  const activeAttention = parseEnquiryAttentionFilter(params?.attention);\n',
    'active attention parse',
)
old_query = '''  const statusFilter = activeStatus ? { status: activeStatus } : {};
  const followUpFilter =
    activeFollowUp === 'overdue'
      ? { nextFollowUpAt: { lt: todayUtc } }
      : activeFollowUp === 'due-today'
        ? { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } }
        : {};
  const enquiries = await db.enquiry.findMany({
    ...(activeStatus || activeFollowUp
      ? { where: { ...statusFilter, ...followUpFilter } }
      : {}),
'''
new_query = '''  const filters: Prisma.EnquiryWhereInput[] = [];
  if (activeStatus) filters.push({ status: activeStatus });
  if (activeFollowUp === 'overdue') {
    filters.push({ nextFollowUpAt: { lt: todayUtc } });
  } else if (activeFollowUp === 'due-today') {
    filters.push({ nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } });
  }
  const attentionWhere = getEnquiryAttentionWhere(activeAttention);
  if (attentionWhere) filters.push(attentionWhere);
  const enquiryWhere = filters.length > 0 ? { AND: filters } : null;

  const [
    enquiries,
    unassignedActiveCount,
    dueTodayCount,
    overdueCount,
    closedWithoutOutcomeCount,
  ] = await Promise.all([
    db.enquiry.findMany({
      ...(enquiryWhere ? { where: enquiryWhere } : {}),
'''
page = replace_once(page, old_query, new_query, 'explicit enquiry filters')
page = replace_once(
    page,
    '''      },
    },
  });
  const number = (value: number) => formatLocalizedNumber(value, locale);
''',
    '''        },
      },
    }),
    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),
    db.enquiry.count({
      where: { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } },
    }),
    db.enquiry.count({ where: { nextFollowUpAt: { lt: todayUtc } } }),
    db.enquiry.count({ where: CLOSED_WITHOUT_OUTCOME_WHERE }),
  ]);
  const number = (value: number) => formatLocalizedNumber(value, locale);
''',
    'attention counts',
)
attention_cards = '''            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
              <div className={styles.attentionGrid}>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'unassigned'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(locale, null, null, 'unassigned')}
                  aria-current={
                    activeAttention === 'unassigned' ? 'page' : undefined
                  }
                >
                  <span>{copy.unassignedActive}</span>
                  <strong>{number(unassignedActiveCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeFollowUp === 'due-today'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(locale, null, 'due-today', null)}
                  aria-current={
                    activeFollowUp === 'due-today' ? 'page' : undefined
                  }
                >
                  <span>{copy.dueToday}</span>
                  <strong>{number(dueTodayCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeFollowUp === 'overdue'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(locale, null, 'overdue', null)}
                  aria-current={activeFollowUp === 'overdue' ? 'page' : undefined}
                >
                  <span>{copy.overdue}</span>
                  <strong>{number(overdueCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'closed-without-outcome'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(
                    locale,
                    null,
                    null,
                    'closed-without-outcome',
                  )}
                  aria-current={
                    activeAttention === 'closed-without-outcome'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{copy.closedWithoutOutcome}</span>
                  <strong>{number(closedWithoutOutcomeCount)}</strong>
                </Link>
              </div>
            </div>

'''
page = replace_once(
    page,
    '            <div className={styles.filterGroups}>\n',
    attention_cards + '            <div className={styles.filterGroups}>\n',
    'attention cards',
)
page = page.replace(
    'enquiryHref(locale, null, activeFollowUp)',
    'enquiryHref(locale, null, activeFollowUp, activeAttention)',
)
page = page.replace(
    'enquiryHref(locale, status, activeFollowUp)',
    'enquiryHref(locale, status, activeFollowUp, activeAttention)',
)
page = page.replace(
    'enquiryHref(locale, activeStatus, null)',
    'enquiryHref(locale, activeStatus, null, activeAttention)',
)
page = page.replace(
    "enquiryHref(locale, activeStatus, 'due-today')",
    "enquiryHref(locale, activeStatus, 'due-today', activeAttention)",
)
page = page.replace(
    "enquiryHref(locale, activeStatus, 'overdue')",
    "enquiryHref(locale, activeStatus, 'overdue', activeAttention)",
)
attention_filter_group = '''
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  {copy.filterByAttention}
                </span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByAttention}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === null ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      null,
                    )}
                    aria-current={activeAttention === null ? 'page' : undefined}
                  >
                    <span>{copy.allAttention}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'unassigned' ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      'unassigned',
                    )}
                    aria-current={
                      activeAttention === 'unassigned' ? 'page' : undefined
                    }
                  >
                    <span>{copy.unassignedActive}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'closed-without-outcome'
                        ? styles.activeFilter
                        : ''
                    }`}
                    href={enquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      'closed-without-outcome',
                    )}
                    aria-current={
                      activeAttention === 'closed-without-outcome'
                        ? 'page'
                        : undefined
                    }
                  >
                    <span>{copy.closedWithoutOutcome}</span>
                  </Link>
                </nav>
              </div>
'''
page = replace_once(
    page,
    '            </div>\n          </section>\n\n          {enquiries.length > 0 ? (\n',
    attention_filter_group
    + '            </div>\n          </section>\n\n          {enquiries.length > 0 ? (\n',
    'attention filter group',
)
page_path.write_text(page)

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    '  filterByStatus: string;\n  filterByFollowUp: string;\n  all: string;\n',
    '  filterByStatus: string;\n  filterByFollowUp: string;\n  attentionQueue: string;\n  filterByAttention: string;\n  allAttention: string;\n  unassignedActive: string;\n  closedWithoutOutcome: string;\n  all: string;\n',
    'attention copy type',
)
localization = replace_once(
    localization,
    "    filterByStatus: 'Filter by status',\n    filterByFollowUp: 'Filter by follow-up',\n    all: 'All',\n",
    "    filterByStatus: 'Filter by status',\n    filterByFollowUp: 'Filter by follow-up',\n    attentionQueue: 'Attention queue',\n    filterByAttention: 'Filter by attention',\n    allAttention: 'Any attention state',\n    unassignedActive: 'Active & unassigned',\n    closedWithoutOutcome: 'Closed without outcome',\n    all: 'All',\n",
    'english attention copy',
)
localization = replace_once(
    localization,
    "    filterByStatus: 'Filtrer par statut',\n    filterByFollowUp: 'Filtrer par suivi',\n    all: 'Toutes',\n",
    "    filterByStatus: 'Filtrer par statut',\n    filterByFollowUp: 'Filtrer par suivi',\n    attentionQueue: 'Points d’attention',\n    filterByAttention: 'Filtrer par point d’attention',\n    allAttention: 'Tous les points d’attention',\n    unassignedActive: 'Actives non attribuées',\n    closedWithoutOutcome: 'Clôturées sans résultat',\n    all: 'Toutes',\n",
    'french attention copy',
)
localization = replace_once(
    localization,
    "    filterByStatus: 'التصفية حسب الحالة',\n    filterByFollowUp: 'التصفية حسب المتابعة',\n    all: 'الكل',\n",
    "    filterByStatus: 'التصفية حسب الحالة',\n    filterByFollowUp: 'التصفية حسب المتابعة',\n    attentionQueue: 'حالات تحتاج متابعة',\n    filterByAttention: 'التصفية حسب حالة المتابعة',\n    allAttention: 'كل حالات المتابعة',\n    unassignedActive: 'نشطة وغير مسندة',\n    closedWithoutOutcome: 'مغلقة دون نتيجة',\n    all: 'الكل',\n",
    'arabic attention copy',
)
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(
    localization_test,
    "      saveOutcome: 'Save outcome',\n",
    "      saveOutcome: 'Save outcome',\n      unassignedActive: 'Active & unassigned',\n      closedWithoutOutcome: 'Closed without outcome',\n",
    'english attention test',
)
localization_test = replace_once(
    localization_test,
    "      saveOutcome: 'Enregistrer le résultat',\n",
    "      saveOutcome: 'Enregistrer le résultat',\n      unassignedActive: 'Actives non attribuées',\n      closedWithoutOutcome: 'Clôturées sans résultat',\n",
    'french attention test',
)
localization_test = replace_once(
    localization_test,
    "      saveOutcome: 'حفظ النتيجة',\n",
    "      saveOutcome: 'حفظ النتيجة',\n      unassignedActive: 'نشطة وغير مسندة',\n      closedWithoutOutcome: 'مغلقة دون نتيجة',\n",
    'arabic attention test',
)
localization_test_path.write_text(localization_test)

css_path = Path('apps/admin/app/enquiries/page.module.css')
css = css_path.read_text()
attention_css = '''.attentionSection {
  display: grid;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.attentionGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 0.65rem;
}

.attentionCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 4rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 0.8rem;
  text-decoration: none;
}

.attentionCard span {
  font-size: 0.82rem;
  font-weight: 650;
}

.attentionCard strong {
  font-size: 1.35rem;
}

.activeAttentionCard {
  border-width: 2px;
}

'''
css = replace_once(
    css,
    '.filterGroups,\n.filterGroup {\n',
    attention_css + '.filterGroups,\n.filterGroup {\n',
    'attention styles',
)
css_path.write_text(css)
