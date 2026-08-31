from pathlib import Path

page = Path('apps/admin/app/enquiries/page.tsx')
text = page.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    if old not in text:
        raise SystemExit(f'{label} marker not found')
    text = text.replace(old, new, 1)


qualification_copy_import = "import { getEnquiryQualificationGapFilterCopy } from '../../lib/enquiry-qualification-gap-filter-localization';\n"
replace_once(
    qualification_copy_import,
    qualification_copy_import
    + "import { getEnquiryActiveAgeFilterCopy } from '../../lib/enquiry-active-age-filter-localization';\n",
    'qualification localization import',
)

qualification_filter_import = """import {
  getEnquiryQualificationGapWhere,
  parseEnquiryQualificationGapFilter,
  type EnquiryQualificationGap,
} from '../../lib/enquiry-qualification-gap-filter';
"""
replace_once(
    qualification_filter_import,
    qualification_filter_import
    + """import {
  getEnquiryActiveAgeWhere,
  parseEnquiryActiveAgeFilter,
  type EnquiryActiveAgeBucket,
} from '../../lib/enquiry-active-age-filter';
""",
    'qualification filter import',
)

search_param = "    qualificationGap?: string | string[] | undefined;\n"
replace_once(
    search_param,
    search_param + "    activeAge?: string | string[] | undefined;\n",
    'qualification gap search param',
)

signature = "  qualificationGap: EnquiryQualificationGap | null = null,\n) {\n"
replace_once(
    signature,
    "  qualificationGap: EnquiryQualificationGap | null = null,\n  activeAge: EnquiryActiveAgeBucket | null = null,\n) {\n",
    'buildEnquiryHref signature',
)

qualification_query = "  if (qualificationGap) query.set('qualificationGap', qualificationGap);\n"
replace_once(
    qualification_query,
    qualification_query + "  if (activeAge) query.set('activeAge', activeAge);\n",
    'qualification query serialization',
)

qualification_copy = "  const qualificationGapFilterCopy =\n    getEnquiryQualificationGapFilterCopy(locale);\n"
replace_once(
    qualification_copy,
    qualification_copy
    + "  const activeAgeFilterCopy = getEnquiryActiveAgeFilterCopy(locale);\n",
    'qualification copy assignment',
)

active_gap = "  const activeQualificationGap = parseEnquiryQualificationGapFilter(\n    params?.qualificationGap,\n  );\n"
replace_once(
    active_gap,
    active_gap
    + "  const activeAge = parseEnquiryActiveAgeFilter(params?.activeAge);\n",
    'active qualification gap parsing',
)

now_marker = "  const todayUtc = new Date();\n"
replace_once(
    now_marker,
    "  const now = new Date();\n  const todayUtc = new Date(now);\n",
    'today time marker',
)

qualification_where = "  const qualificationGapWhere = getEnquiryQualificationGapWhere(\n    activeQualificationGap,\n  );\n  if (qualificationGapWhere) filters.push(qualificationGapWhere);\n"
replace_once(
    qualification_where,
    qualification_where
    + "  const activeAgeWhere = getEnquiryActiveAgeWhere(now, activeAge);\n"
    + "  if (activeAgeWhere) filters.push(activeAgeWhere);\n",
    'qualification where clause',
)

href_tail = "      activeCity,\n      activeQualificationGap,\n    );\n"
replace_once(
    href_tail,
    "      activeCity,\n      activeQualificationGap,\n      activeAge,\n    );\n",
    'hrefFor scope tail',
)

direct_tail = "                      activeQualificationGap,\n                    )}\n"
direct_count = text.count(direct_tail)
if direct_count != 8:
    raise SystemExit(f'expected 8 direct qualification-gap tails, found {direct_count}')
text = text.replace(
    direct_tail,
    "                      activeQualificationGap,\n"
    "                      activeAge,\n"
    "                    )}\n",
)

gap_clear_tail = "                      activeCity,\n                      null,\n                    )}\n"
replace_once(
    gap_clear_tail,
    "                      activeCity,\n"
    "                      null,\n"
    "                      activeAge,\n"
    "                    )}\n",
    'qualification gap clear tail',
)

attention_marker = """            ) : null}

            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
"""
active_age_panel = """            ) : null}

            {activeAge ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {activeAgeFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {activeAgeFilterCopy.label(activeAge)}
                  </span>
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      activeCampaignAttribution,
                      activeLandingPath,
                      activeSchool,
                      activeContactPreference,
                      activeDeliveryPreference,
                      activeTimingPreference,
                      activeProgramme,
                      activeCity,
                      activeQualificationGap,
                      null,
                    )}
                  >
                    <span>{activeAgeFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>{activeAgeFilterCopy.intro}</p>
              </div>
            ) : null}

            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
"""
replace_once(
    attention_marker,
    active_age_panel,
    'attention section after qualification gap filter',
)

for token in [
    "activeAge?: string | string[] | undefined;",
    "activeAge: EnquiryActiveAgeBucket | null = null,",
    "getEnquiryActiveAgeWhere(now, activeAge)",
    "activeAgeFilterCopy.label(activeAge)",
]:
    if token not in text:
        raise SystemExit(f'missing expected enquiry page token: {token}')

page.write_text(text)

dashboard = Path('apps/admin/app/page.tsx')
dashboard_text = dashboard.read_text()

age_copy_import = "import { getEnquiryAgeCopy } from '../lib/enquiry-age-localization';\n"
if age_copy_import not in dashboard_text:
    raise SystemExit('age copy import marker not found')
dashboard_text = dashboard_text.replace(
    age_copy_import,
    age_copy_import
    + "import { buildEnquiryActiveAgeQuery } from '../lib/enquiry-active-age-filter';\n",
    1,
)

age_links = {
    "                <span>{ageCopy.under24Hours}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryActiveAgeQuery('under24Hours')}`,
                  )}
                >
                  <span>{ageCopy.under24Hours}</span>
                </Link>
""",
    "                <span>{ageCopy.oneToThreeDays}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryActiveAgeQuery('oneToThreeDays')}`,
                  )}
                >
                  <span>{ageCopy.oneToThreeDays}</span>
                </Link>
""",
    "                <span>{ageCopy.fourToSevenDays}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryActiveAgeQuery('fourToSevenDays')}`,
                  )}
                >
                  <span>{ageCopy.fourToSevenDays}</span>
                </Link>
""",
    "                <span>{ageCopy.overSevenDays}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryActiveAgeQuery('overSevenDays')}`,
                  )}
                >
                  <span>{ageCopy.overSevenDays}</span>
                </Link>
""",
}
for marker, replacement in age_links.items():
    marker_count = dashboard_text.count(marker)
    if marker_count != 1:
        raise SystemExit(
            f'active age dashboard marker count was {marker_count} for {marker.strip()}'
        )
    dashboard_text = dashboard_text.replace(marker, replacement, 1)

if dashboard_text.count('buildEnquiryActiveAgeQuery(') != 4:
    raise SystemExit('active age dashboard link count mismatch')
if "import { buildEnquiryActiveAgeQuery }" not in dashboard_text:
    raise SystemExit('active age dashboard import missing')

dashboard.write_text(dashboard_text)
