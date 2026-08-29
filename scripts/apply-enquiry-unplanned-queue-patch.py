from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


attention_path = Path('apps/admin/lib/enquiry-attention.ts')
attention = attention_path.read_text()
attention = replace_once(
    attention,
    "export const enquiryAttentionFilters = [\n  'unassigned',\n  'closed-without-outcome',\n] as const;\n",
    "export const enquiryAttentionFilters = [\n  'unassigned',\n  'active-without-follow-up',\n  'closed-without-outcome',\n] as const;\n",
    'attention filter token',
)
attention = replace_once(
    attention,
    "export const CLOSED_WITHOUT_OUTCOME_WHERE = {\n",
    "export const ACTIVE_WITHOUT_FOLLOW_UP_WHERE = {\n  status: { notIn: ['CLOSED', 'SPAM'] },\n  nextFollowUpAt: null,\n  nextAction: null,\n} satisfies Prisma.EnquiryWhereInput;\n\nexport const CLOSED_WITHOUT_OUTCOME_WHERE = {\n",
    'active without follow-up where',
)
attention = replace_once(
    attention,
    "  if (filter === 'unassigned') return ACTIVE_UNASSIGNED_ENQUIRY_WHERE;\n  if (filter === 'closed-without-outcome') return CLOSED_WITHOUT_OUTCOME_WHERE;\n",
    "  if (filter === 'unassigned') return ACTIVE_UNASSIGNED_ENQUIRY_WHERE;\n  if (filter === 'active-without-follow-up')\n    return ACTIVE_WITHOUT_FOLLOW_UP_WHERE;\n  if (filter === 'closed-without-outcome') return CLOSED_WITHOUT_OUTCOME_WHERE;\n",
    'attention where mapping',
)
attention_path.write_text(attention)

attention_test_path = Path('apps/admin/lib/enquiry-attention.test.ts')
attention_test = attention_test_path.read_text()
attention_test = replace_once(
    attention_test,
    "  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n",
    "  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n",
    'attention test import',
)
attention_test = replace_once(
    attention_test,
    "    expect(parseEnquiryAttentionFilter('closed-without-outcome')).toBe(\n",
    "    expect(parseEnquiryAttentionFilter('active-without-follow-up')).toBe(\n      'active-without-follow-up',\n    );\n    expect(parseEnquiryAttentionFilter('closed-without-outcome')).toBe(\n",
    'attention parser test',
)
attention_test = replace_once(
    attention_test,
    "    expect(getEnquiryAttentionWhere('closed-without-outcome')).toEqual(\n",
    "    expect(getEnquiryAttentionWhere('active-without-follow-up')).toEqual(\n      ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n    );\n    expect(ACTIVE_WITHOUT_FOLLOW_UP_WHERE).toEqual({\n      status: { notIn: ['CLOSED', 'SPAM'] },\n      nextFollowUpAt: null,\n      nextAction: null,\n    });\n    expect(getEnquiryAttentionWhere('closed-without-outcome')).toEqual(\n",
    'attention semantics test',
)
attention_test_path.write_text(attention_test)

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    '  unassignedActive: string;\n  closedWithoutOutcome: string;\n',
    '  unassignedActive: string;\n  activeWithoutFollowUp: string;\n  closedWithoutOutcome: string;\n',
    'localization type',
)
localization = replace_once(
    localization,
    "    unassignedActive: 'Active & unassigned',\n    closedWithoutOutcome: 'Closed without outcome',\n",
    "    unassignedActive: 'Active & unassigned',\n    activeWithoutFollowUp: 'Active without follow-up',\n    closedWithoutOutcome: 'Closed without outcome',\n",
    'english unplanned copy',
)
localization = replace_once(
    localization,
    "    unassignedActive: 'Actives non attribuées',\n    closedWithoutOutcome: 'Clôturées sans résultat',\n",
    "    unassignedActive: 'Actives non attribuées',\n    activeWithoutFollowUp: 'Actives sans suivi planifié',\n    closedWithoutOutcome: 'Clôturées sans résultat',\n",
    'french unplanned copy',
)
localization = replace_once(
    localization,
    "    unassignedActive: 'نشطة وغير مسندة',\n    closedWithoutOutcome: 'مغلقة دون نتيجة',\n",
    "    unassignedActive: 'نشطة وغير مسندة',\n    activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',\n    closedWithoutOutcome: 'مغلقة دون نتيجة',\n",
    'arabic unplanned copy',
)
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(
    localization_test,
    "      unassignedActive: 'Active & unassigned',\n      closedWithoutOutcome: 'Closed without outcome',\n",
    "      unassignedActive: 'Active & unassigned',\n      activeWithoutFollowUp: 'Active without follow-up',\n      closedWithoutOutcome: 'Closed without outcome',\n",
    'english localization test',
)
localization_test = replace_once(
    localization_test,
    "      unassignedActive: 'Actives non attribuées',\n      closedWithoutOutcome: 'Clôturées sans résultat',\n",
    "      unassignedActive: 'Actives non attribuées',\n      activeWithoutFollowUp: 'Actives sans suivi planifié',\n      closedWithoutOutcome: 'Clôturées sans résultat',\n",
    'french localization test',
)
localization_test = replace_once(
    localization_test,
    "      unassignedActive: 'نشطة وغير مسندة',\n      closedWithoutOutcome: 'مغلقة دون نتيجة',\n",
    "      unassignedActive: 'نشطة وغير مسندة',\n      activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',\n      closedWithoutOutcome: 'مغلقة دون نتيجة',\n",
    'arabic localization test',
)
localization_test_path.write_text(localization_test)

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n  CLOSED_WITHOUT_OUTCOME_WHERE,\n",
    "  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n  CLOSED_WITHOUT_OUTCOME_WHERE,\n",
    'page attention import',
)
page = replace_once(
    page,
    '    unassignedActiveCount,\n    dueTodayCount,\n',
    '    unassignedActiveCount,\n    activeWithoutFollowUpCount,\n    dueTodayCount,\n',
    'page count tuple',
)
page = replace_once(
    page,
    '    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),\n    db.enquiry.count({\n',
    '    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),\n    db.enquiry.count({ where: ACTIVE_WITHOUT_FOLLOW_UP_WHERE }),\n    db.enquiry.count({\n',
    'page count query',
)

unplanned_card = '''                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'active-without-follow-up'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(
                    locale,
                    null,
                    null,
                    'active-without-follow-up',
                    null,
                  )}
                  aria-current={
                    activeAttention === 'active-without-follow-up'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{copy.activeWithoutFollowUp}</span>
                  <strong>{number(activeWithoutFollowUpCount)}</strong>
                </Link>
'''
page = replace_once(
    page,
    "                  <strong>{number(unassignedActiveCount)}</strong>\n                </Link>\n                <Link\n                  className={`${styles.attentionCard} ${\n                    activeFollowUp === 'due-today'\n",
    "                  <strong>{number(unassignedActiveCount)}</strong>\n                </Link>\n"
    + unplanned_card
    + "                <Link\n                  className={`${styles.attentionCard} ${\n                    activeFollowUp === 'due-today'\n",
    'page unplanned attention card',
)

unplanned_filter_link = '''                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'active-without-follow-up'
                        ? styles.activeFilter
                        : ''
                    }`}
                    href={enquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      'active-without-follow-up',
                      activeOwner,
                    )}
                    aria-current={
                      activeAttention === 'active-without-follow-up'
                        ? 'page'
                        : undefined
                    }
                  >
                    <span>{copy.activeWithoutFollowUp}</span>
                  </Link>
'''
page = replace_once(
    page,
    "                  >\n                    <span>{copy.unassignedActive}</span>\n                  </Link>\n                  <Link\n                    className={`${styles.filterLink} ${\n                      activeAttention === 'closed-without-outcome'\n",
    "                  >\n                    <span>{copy.unassignedActive}</span>\n                  </Link>\n"
    + unplanned_filter_link
    + "                  <Link\n                    className={`${styles.filterLink} ${\n                      activeAttention === 'closed-without-outcome'\n",
    'page unplanned attention filter',
)
page_path.write_text(page)
