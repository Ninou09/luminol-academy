from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


path = Path('apps/admin/app/enquiries/page.tsx')
text = path.read_text()
text = replace_once(
    text,
    "import { getIncompleteQualificationAttentionLabel } from '../../lib/enquiry-attention-localization';",
    "import {\n  getIncompleteQualificationAttentionLabel,\n  getNoRecordedContactAttentionCopy,\n} from '../../lib/enquiry-attention-localization';",
    'attention localization import',
)
text = replace_once(
    text,
    "  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n  CLOSED_WITHOUT_OUTCOME_WHERE,",
    "  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,\n  ACTIVE_WITHOUT_RECORDED_CONTACT_WHERE,\n  CLOSED_WITHOUT_OUTCOME_WHERE,",
    'attention predicate import',
)
text = replace_once(
    text,
    "  const incompleteQualificationLabel =\n    getIncompleteQualificationAttentionLabel(locale);",
    "  const incompleteQualificationLabel =\n    getIncompleteQualificationAttentionLabel(locale);\n  const noRecordedContactCopy = getNoRecordedContactAttentionCopy(locale);",
    'localized attention copy',
)
text = replace_once(
    text,
    "    incompleteQualificationCount,\n    dueTodayCount,",
    "    incompleteQualificationCount,\n    noRecordedContactCount,\n    dueTodayCount,",
    'count destructuring',
)
text = replace_once(
    text,
    "    db.enquiry.count({ where: ACTIVE_INCOMPLETE_QUALIFICATION_WHERE }),\n    db.enquiry.count({\n      where: { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } },\n    }),",
    "    db.enquiry.count({ where: ACTIVE_INCOMPLETE_QUALIFICATION_WHERE }),\n    db.enquiry.count({ where: ACTIVE_WITHOUT_RECORDED_CONTACT_WHERE }),\n    db.enquiry.count({\n      where: { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } },\n    }),",
    'count query',
)
anchor = '''                <Link
                  className={`${styles.attentionCard} ${
                    activeFollowUp === 'due-today'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(locale, null, 'due-today', null, null)}
'''
card = '''                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'active-without-recorded-contact'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={enquiryHref(
                    locale,
                    null,
                    null,
                    'active-without-recorded-contact',
                    null,
                  )}
                  aria-current={
                    activeAttention === 'active-without-recorded-contact'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{noRecordedContactCopy.label}</span>
                  <strong>{number(noRecordedContactCount)}</strong>
                </Link>
'''
text = replace_once(text, anchor, card + anchor, 'attention card')
text = replace_once(
    text,
    "              </div>\n            </div>\n\n            <div className={styles.filterGroups}>",
    "              </div>\n              <p className={styles.filterLabel}>{noRecordedContactCopy.note}</p>\n            </div>\n\n            <div className={styles.filterGroups}>",
    'attention explanatory note',
)
path.write_text(text)
