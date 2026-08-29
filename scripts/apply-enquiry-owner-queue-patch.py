from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


owner_lib = Path('apps/admin/lib/enquiry-owner-filter.ts')
owner_lib.write_text('''import type { Prisma } from '@luminol/database';

export const enquiryOwnerFilters = ['mine'] as const;
export type EnquiryOwnerFilter = (typeof enquiryOwnerFilters)[number];

export function parseEnquiryOwnerFilter(
  value: string | string[] | undefined,
): EnquiryOwnerFilter | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === 'mine' ? candidate : null;
}

export function getEnquiryOwnerWhere(
  filter: EnquiryOwnerFilter | null,
  administratorId: string,
): Prisma.EnquiryWhereInput | null {
  return filter === 'mine' ? { ownerUserId: administratorId } : null;
}
''')

owner_test = Path('apps/admin/lib/enquiry-owner-filter.test.ts')
owner_test.write_text('''import { describe, expect, it } from 'vitest';

import {
  getEnquiryOwnerWhere,
  parseEnquiryOwnerFilter,
} from './enquiry-owner-filter';

describe('enquiry owner filter', () => {
  it('accepts only the stable mine token and fails closed for identifiers', () => {
    expect(parseEnquiryOwnerFilter('mine')).toBe('mine');
    expect(parseEnquiryOwnerFilter(['mine', 'ignored'])).toBe('mine');
    expect(parseEnquiryOwnerFilter('user_123')).toBeNull();
    expect(parseEnquiryOwnerFilter('admin@example.com')).toBeNull();
    expect(parseEnquiryOwnerFilter(undefined)).toBeNull();
  });

  it('resolves mine to the authenticated administrator ID only on the server', () => {
    expect(getEnquiryOwnerWhere('mine', 'administrator_123')).toEqual({
      ownerUserId: 'administrator_123',
    });
    expect(getEnquiryOwnerWhere(null, 'administrator_123')).toBeNull();
  });
});
''')

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "import {\n  getEnquiryContactPreferenceLabel,\n",
    "import {\n  getEnquiryOwnerWhere,\n  parseEnquiryOwnerFilter,\n  type EnquiryOwnerFilter,\n} from '../../lib/enquiry-owner-filter';\nimport {\n  getEnquiryContactPreferenceLabel,\n",
    'owner filter import',
)
page = replace_once(
    page,
    '    attention?: string | string[] | undefined;\n',
    '    attention?: string | string[] | undefined;\n    owner?: string | string[] | undefined;\n',
    'owner search param',
)
page = replace_once(
    page,
    '  attention: EnquiryAttentionFilter | null,\n) {\n',
    '  attention: EnquiryAttentionFilter | null,\n  owner: EnquiryOwnerFilter | null,\n) {\n',
    'owner href parameter',
)
page = replace_once(
    page,
    "  if (attention) query.set('attention', attention);\n",
    "  if (attention) query.set('attention', attention);\n  if (owner) query.set('owner', owner);\n",
    'owner href query',
)
page = replace_once(
    page,
    '  const activeAttention = parseEnquiryAttentionFilter(params?.attention);\n',
    '  const activeAttention = parseEnquiryAttentionFilter(params?.attention);\n  const activeOwner = parseEnquiryOwnerFilter(params?.owner);\n',
    'active owner parse',
)
page = replace_once(
    page,
    '  const attentionWhere = getEnquiryAttentionWhere(activeAttention);\n  if (attentionWhere) filters.push(attentionWhere);\n',
    '  const attentionWhere = getEnquiryAttentionWhere(activeAttention);\n  if (attentionWhere) filters.push(attentionWhere);\n  const ownerWhere = getEnquiryOwnerWhere(activeOwner, administrator.id);\n  if (ownerWhere) filters.push(ownerWhere);\n',
    'owner where composition',
)
page = replace_once(
    page,
    '    closedWithoutOutcomeCount,\n  ] = await Promise.all([\n',
    '    closedWithoutOutcomeCount,\n    assignedToMeCount,\n  ] = await Promise.all([\n',
    'owner counter tuple',
)
page = replace_once(
    page,
    '    db.enquiry.count({ where: CLOSED_WITHOUT_OUTCOME_WHERE }),\n  ]);\n',
    '    db.enquiry.count({ where: CLOSED_WITHOUT_OUTCOME_WHERE }),\n    db.enquiry.count({ where: { ownerUserId: administrator.id } }),\n  ]);\n',
    'owner counter query',
)

# Existing attention-card links intentionally reset the other queue filters.
page = page.replace(
    "href={enquiryHref(locale, null, null, 'unassigned')}",
    "href={enquiryHref(locale, null, null, 'unassigned', null)}",
)
page = page.replace(
    "href={enquiryHref(locale, null, 'due-today', null)}",
    "href={enquiryHref(locale, null, 'due-today', null, null)}",
)
page = page.replace(
    "href={enquiryHref(locale, null, 'overdue', null)}",
    "href={enquiryHref(locale, null, 'overdue', null, null)}",
)
page = replace_once(
    page,
    "                    'closed-without-outcome',\n                  )}\n",
    "                    'closed-without-outcome',\n                    null,\n                  )}\n",
    'closed outcome card owner argument',
)

owner_card = '''                <Link
                  className={`${styles.attentionCard} ${
                    activeOwner === 'mine' ? styles.activeAttentionCard : ''
                  }`}
                  href={enquiryHref(locale, null, null, null, 'mine')}
                  aria-current={activeOwner === 'mine' ? 'page' : undefined}
                >
                  <span>{copy.myEnquiries}</span>
                  <strong>{number(assignedToMeCount)}</strong>
                </Link>
'''
page = replace_once(
    page,
    '              </div>\n            </div>\n\n            <div className={styles.filterGroups}>\n',
    owner_card
    + '              </div>\n            </div>\n\n            <div className={styles.filterGroups}>\n',
    'owner attention card',
)

# Preserve active owner filter while changing status/follow-up/attention filters.
page = page.replace(
    '                      activeAttention,\n                    )}',
    '                      activeAttention,\n                      activeOwner,\n                    )}',
)
page = page.replace(
    "                      'unassigned',\n                    )}",
    "                      'unassigned',\n                      activeOwner,\n                    )}",
)
page = page.replace(
    "                      'closed-without-outcome',\n                    )}",
    "                      'closed-without-outcome',\n                      activeOwner,\n                    )}",
)
# Attention-clear link has null as the fourth argument and must preserve owner.
page = replace_once(
    page,
    '                      activeFollowUp,\n                      null,\n                    )}\n                    aria-current={activeAttention === null',
    '                      activeFollowUp,\n                      null,\n                      activeOwner,\n                    )}\n                    aria-current={activeAttention === null',
    'attention clear preserves owner',
)

owner_filter_group = '''
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>{copy.filterByOwner}</span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByOwner}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeOwner === null ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      null,
                    )}
                    aria-current={activeOwner === null ? 'page' : undefined}
                  >
                    <span>{copy.anyOwner}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeOwner === 'mine' ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      'mine',
                    )}
                    aria-current={activeOwner === 'mine' ? 'page' : undefined}
                  >
                    <span>{copy.myEnquiries}</span>
                  </Link>
                </nav>
              </div>
'''
page = replace_once(
    page,
    '              <div className={styles.filterGroup}>\n                <span className={styles.filterLabel}>\n                  {copy.filterByAttention}\n',
    owner_filter_group
    + '              <div className={styles.filterGroup}>\n                <span className={styles.filterLabel}>\n                  {copy.filterByAttention}\n',
    'owner filter group',
)
page_path.write_text(page)

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    '  filterByAttention: string;\n  allAttention: string;\n',
    '  filterByAttention: string;\n  filterByOwner: string;\n  anyOwner: string;\n  myEnquiries: string;\n  allAttention: string;\n',
    'owner localization type',
)
localization = replace_once(
    localization,
    "    filterByAttention: 'Filter by attention',\n    allAttention: 'Any attention state',\n",
    "    filterByAttention: 'Filter by attention',\n    filterByOwner: 'Filter by owner',\n    anyOwner: 'Any owner',\n    myEnquiries: 'Assigned to me',\n    allAttention: 'Any attention state',\n",
    'english owner copy',
)
localization = replace_once(
    localization,
    "    filterByAttention: 'Filtrer par point d’attention',\n    allAttention: 'Tous les points d’attention',\n",
    "    filterByAttention: 'Filtrer par point d’attention',\n    filterByOwner: 'Filtrer par responsable',\n    anyOwner: 'Tous les responsables',\n    myEnquiries: 'Attribuées à moi',\n    allAttention: 'Tous les points d’attention',\n",
    'french owner copy',
)
localization = replace_once(
    localization,
    "    filterByAttention: 'التصفية حسب حالة المتابعة',\n    allAttention: 'كل حالات المتابعة',\n",
    "    filterByAttention: 'التصفية حسب حالة المتابعة',\n    filterByOwner: 'التصفية حسب المسؤول',\n    anyOwner: 'أي مسؤول',\n    myEnquiries: 'مسندة إليّ',\n    allAttention: 'كل حالات المتابعة',\n",
    'arabic owner copy',
)
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(
    localization_test,
    "      closedWithoutOutcome: 'Closed without outcome',\n",
    "      closedWithoutOutcome: 'Closed without outcome',\n      filterByOwner: 'Filter by owner',\n      myEnquiries: 'Assigned to me',\n",
    'english owner copy test',
)
localization_test = replace_once(
    localization_test,
    "      closedWithoutOutcome: 'Clôturées sans résultat',\n",
    "      closedWithoutOutcome: 'Clôturées sans résultat',\n      filterByOwner: 'Filtrer par responsable',\n      myEnquiries: 'Attribuées à moi',\n",
    'french owner copy test',
)
localization_test = replace_once(
    localization_test,
    "      closedWithoutOutcome: 'مغلقة دون نتيجة',\n",
    "      closedWithoutOutcome: 'مغلقة دون نتيجة',\n      filterByOwner: 'التصفية حسب المسؤول',\n      myEnquiries: 'مسندة إليّ',\n",
    'arabic owner copy test',
)
localization_test_path.write_text(localization_test)
