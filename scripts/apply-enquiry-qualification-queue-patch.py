from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


attention_path = Path('apps/admin/lib/enquiry-attention.ts')
attention = attention_path.read_text()
attention = replace_once(attention, "  'active-without-follow-up',\n  'closed-without-outcome',\n", "  'active-without-follow-up',\n  'active-incomplete-qualification',\n  'closed-without-outcome',\n", 'attention token')
attention = replace_once(attention, "export const CLOSED_WITHOUT_OUTCOME_WHERE = {\n", "export const ACTIVE_INCOMPLETE_QUALIFICATION_WHERE = {\n  ...ACTIVE_ENQUIRY_WHERE,\n  OR: [\n    { city: null },\n    { preferredContact: null },\n    { deliveryPreference: null },\n    { timingPreference: null },\n  ],\n} satisfies Prisma.EnquiryWhereInput;\n\nexport const CLOSED_WITHOUT_OUTCOME_WHERE = {\n", 'attention qualification where')
attention = replace_once(attention, "  if (filter === 'active-without-follow-up')\n    return ACTIVE_WITHOUT_FOLLOW_UP_WHERE;\n  if (filter === 'closed-without-outcome') return CLOSED_WITHOUT_OUTCOME_WHERE;\n", "  if (filter === 'active-without-follow-up')\n    return ACTIVE_WITHOUT_FOLLOW_UP_WHERE;\n  if (filter === 'active-incomplete-qualification')\n    return ACTIVE_INCOMPLETE_QUALIFICATION_WHERE;\n  if (filter === 'closed-without-outcome') return CLOSED_WITHOUT_OUTCOME_WHERE;\n", 'attention qualification mapping')
attention_path.write_text(attention)

attention_test_path = Path('apps/admin/lib/enquiry-attention.test.ts')
attention_test = attention_test_path.read_text()
attention_test = replace_once(attention_test, "  ACTIVE_ENQUIRY_WHERE,\n  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n", "  ACTIVE_ENQUIRY_WHERE,\n  ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,\n  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n", 'attention test import')
attention_test = replace_once(attention_test, "    expect(parseEnquiryAttentionFilter('closed-without-outcome')).toBe(\n      'closed-without-outcome',\n    );\n", "    expect(parseEnquiryAttentionFilter('active-incomplete-qualification')).toBe(\n      'active-incomplete-qualification',\n    );\n    expect(parseEnquiryAttentionFilter('closed-without-outcome')).toBe(\n      'closed-without-outcome',\n    );\n", 'attention token test')
attention_test = replace_once(attention_test, "    expect(getEnquiryAttentionWhere('closed-without-outcome')).toEqual(\n      CLOSED_WITHOUT_OUTCOME_WHERE,\n    );\n", "    expect(getEnquiryAttentionWhere('active-incomplete-qualification')).toEqual(\n      ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,\n    );\n    expect(ACTIVE_INCOMPLETE_QUALIFICATION_WHERE).toEqual({\n      status: { notIn: ['CLOSED', 'SPAM'] },\n      OR: [\n        { city: null },\n        { preferredContact: null },\n        { deliveryPreference: null },\n        { timingPreference: null },\n      ],\n    });\n    expect(getEnquiryAttentionWhere('closed-without-outcome')).toEqual(\n      CLOSED_WITHOUT_OUTCOME_WHERE,\n    );\n", 'attention semantics test')
attention_test_path.write_text(attention_test)

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(localization, "  activeWithoutFollowUp: string;\n  closedWithoutOutcome: string;\n", "  activeWithoutFollowUp: string;\n  activeIncompleteQualification: string;\n  closedWithoutOutcome: string;\n", 'localization type')
localization = replace_once(localization, "    activeWithoutFollowUp: 'Active without follow-up',\n    closedWithoutOutcome: 'Closed without outcome',\n", "    activeWithoutFollowUp: 'Active without follow-up',\n    activeIncompleteQualification: 'Active with missing qualification',\n    closedWithoutOutcome: 'Closed without outcome',\n", 'english localization')
localization = replace_once(localization, "    activeWithoutFollowUp: 'Actives sans suivi planifié',\n    closedWithoutOutcome: 'Clôturées sans résultat',\n", "    activeWithoutFollowUp: 'Actives sans suivi planifié',\n    activeIncompleteQualification: 'Actives avec qualification incomplète',\n    closedWithoutOutcome: 'Clôturées sans résultat',\n", 'french localization')
localization = replace_once(localization, "    activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',\n    closedWithoutOutcome: 'مغلقة دون نتيجة',\n", "    activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',\n    activeIncompleteQualification: 'نشطة ببيانات تأهيل ناقصة',\n    closedWithoutOutcome: 'مغلقة دون نتيجة',\n", 'arabic localization')
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(localization_test, "      activeWithoutFollowUp: 'Active without follow-up',\n      closedWithoutOutcome: 'Closed without outcome',\n", "      activeWithoutFollowUp: 'Active without follow-up',\n      activeIncompleteQualification: 'Active with missing qualification',\n      closedWithoutOutcome: 'Closed without outcome',\n", 'english localization test')
localization_test = replace_once(localization_test, "      activeWithoutFollowUp: 'Actives sans suivi planifié',\n      closedWithoutOutcome: 'Clôturées sans résultat',\n", "      activeWithoutFollowUp: 'Actives sans suivi planifié',\n      activeIncompleteQualification: 'Actives avec qualification incomplète',\n      closedWithoutOutcome: 'Clôturées sans résultat',\n", 'french localization test')
localization_test = replace_once(localization_test, "      activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',\n      closedWithoutOutcome: 'مغلقة دون نتيجة',\n", "      activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',\n      activeIncompleteQualification: 'نشطة ببيانات تأهيل ناقصة',\n      closedWithoutOutcome: 'مغلقة دون نتيجة',\n", 'arabic localization test')
localization_test_path.write_text(localization_test)

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(page, "  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n", "  ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,\n  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n", 'page attention import')
page = replace_once(page, "    activeWithoutFollowUpCount,\n    dueTodayCount,\n", "    activeWithoutFollowUpCount,\n    activeIncompleteQualificationCount,\n    dueTodayCount,\n", 'page count tuple')
page = replace_once(page, "    db.enquiry.count({ where: ACTIVE_WITHOUT_FOLLOW_UP_WHERE }),\n    db.enquiry.count({\n      where: { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } },\n    }),\n", "    db.enquiry.count({ where: ACTIVE_WITHOUT_FOLLOW_UP_WHERE }),\n    db.enquiry.count({ where: ACTIVE_INCOMPLETE_QUALIFICATION_WHERE }),\n    db.enquiry.count({\n      where: { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } },\n    }),\n", 'page count query')
card_anchor = """                <Link\n                  className={`${styles.attentionCard} ${\n                    activeFollowUp === 'due-today'\n                      ? styles.activeAttentionCard\n                      : ''\n                  }`}\n                  href={enquiryHref(locale, null, 'due-today', null, null)}\n"""
qualification_card = """                <Link\n                  className={`${styles.attentionCard} ${\n                    activeAttention === 'active-incomplete-qualification'\n                      ? styles.activeAttentionCard\n                      : ''\n                  }`}\n                  href={enquiryHref(\n                    locale,\n                    null,\n                    null,\n                    'active-incomplete-qualification',\n                    null,\n                  )}\n                  aria-current={\n                    activeAttention === 'active-incomplete-qualification'\n                      ? 'page'\n                      : undefined\n                  }\n                >\n                  <span>{copy.activeIncompleteQualification}</span>\n                  <strong>{number(activeIncompleteQualificationCount)}</strong>\n                </Link>\n"""
page = replace_once(page, card_anchor, qualification_card + card_anchor, 'page attention card')
page_path.write_text(page)
