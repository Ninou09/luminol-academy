from pathlib import Path

page = Path('apps/admin/app/enquiries/page.tsx')
text = page.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    if old not in text:
        raise SystemExit(f'{label} marker not found')
    text = text.replace(old, new, 1)


city_copy_import = (
    "import { getEnquiryCityFilterCopy } from '../../lib/enquiry-city-filter-localization';\n"
)
replace_once(
    city_copy_import,
    city_copy_import
    + "import { getEnquiryQualificationGapFilterCopy } from '../../lib/enquiry-qualification-gap-filter-localization';\n",
    'city filter localization import',
)

city_filter_import = """import {
  getEnquiryCityWhere,
  parseEnquiryCityFilter,
} from '../../lib/enquiry-city-filter';
"""
replace_once(
    city_filter_import,
    city_filter_import
    + """import {
  getEnquiryQualificationGapWhere,
  parseEnquiryQualificationGapFilter,
  type EnquiryQualificationGap,
} from '../../lib/enquiry-qualification-gap-filter';
""",
    'city filter import',
)

search_param = "    city?: string | string[] | undefined;\n"
replace_once(
    search_param,
    search_param + "    qualificationGap?: string | string[] | undefined;\n",
    'city search param',
)

signature = "  city: string | null = null,\n) {\n"
replace_once(
    signature,
    "  city: string | null = null,\n  qualificationGap: EnquiryQualificationGap | null = null,\n) {\n",
    'buildEnquiryHref signature',
)

city_query = "  if (city) query.set('city', city);\n"
replace_once(
    city_query,
    city_query
    + "  if (qualificationGap) query.set('qualificationGap', qualificationGap);\n",
    'city query serialization',
)

city_copy = "  const cityFilterCopy = getEnquiryCityFilterCopy(locale);\n"
replace_once(
    city_copy,
    city_copy
    + "  const qualificationGapFilterCopy =\n    getEnquiryQualificationGapFilterCopy(locale);\n",
    'city copy assignment',
)

active_city = "  const activeCity = parseEnquiryCityFilter(params?.city);\n"
replace_once(
    active_city,
    active_city
    + "  const activeQualificationGap = parseEnquiryQualificationGapFilter(\n    params?.qualificationGap,\n  );\n",
    'active city parsing',
)

city_where = (
    "  const cityWhere = getEnquiryCityWhere(activeCity);\n"
    "  if (cityWhere) filters.push(cityWhere);\n"
)
replace_once(
    city_where,
    city_where
    + "  const qualificationGapWhere = getEnquiryQualificationGapWhere(\n"
    + "    activeQualificationGap,\n"
    + "  );\n"
    + "  if (qualificationGapWhere) filters.push(qualificationGapWhere);\n",
    'city where clause',
)

href_tail = "      activeProgramme,\n      activeCity,\n    );\n"
replace_once(
    href_tail,
    "      activeProgramme,\n      activeCity,\n      activeQualificationGap,\n    );\n",
    'hrefFor scope tail',
)

direct_tail = "                      activeCity,\n                    )}\n"
direct_count = text.count(direct_tail)
if direct_count != 7:
    raise SystemExit(f'expected 7 direct active-city tails, found {direct_count}')
text = text.replace(
    direct_tail,
    "                      activeCity,\n"
    "                      activeQualificationGap,\n"
    "                    )}\n",
)

city_clear_tail = "                      activeProgramme,\n                      null,\n                    )}\n"
replace_once(
    city_clear_tail,
    "                      activeProgramme,\n"
    "                      null,\n"
    "                      activeQualificationGap,\n"
    "                    )}\n",
    'city clear scope tail',
)

attention_marker = """            ) : null}

            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
"""
qualification_panel = """            ) : null}

            {activeQualificationGap ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {qualificationGapFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {qualificationGapFilterCopy.label(activeQualificationGap)}
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
                      null,
                    )}
                  >
                    <span>{qualificationGapFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {qualificationGapFilterCopy.intro}
                </p>
              </div>
            ) : null}

            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
"""
replace_once(
    attention_marker,
    qualification_panel,
    'attention section after city filter',
)

expected_page_tokens = [
    "qualificationGap?: string | string[] | undefined;",
    "qualificationGap: EnquiryQualificationGap | null = null,",
    "getEnquiryQualificationGapWhere(",
    "activeQualificationGap,",
    "qualificationGapFilterCopy.label(activeQualificationGap)",
]
for token in expected_page_tokens:
    if token not in text:
        raise SystemExit(f'missing expected page token: {token}')

page.write_text(text)

dashboard = Path('apps/admin/app/page.tsx')
dashboard_text = dashboard.read_text()

city_builder_import = "import { buildEnquiryCityQuery } from '../lib/enquiry-city-filter';\n"
if city_builder_import not in dashboard_text:
    raise SystemExit('city builder import marker not found')
dashboard_text = dashboard_text.replace(
    city_builder_import,
    city_builder_import
    + "import { buildEnquiryQualificationGapQuery } from '../lib/enquiry-qualification-gap-filter';\n",
    1,
)

gap_links = {
    "                <span>{qualificationGapCopy.city}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryQualificationGapQuery('city')}`,
                  )}
                >
                  <span>{qualificationGapCopy.city}</span>
                </Link>
""",
    "                <span>{qualificationGapCopy.preferredContact}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryQualificationGapQuery('preferredContact')}`,
                  )}
                >
                  <span>{qualificationGapCopy.preferredContact}</span>
                </Link>
""",
    "                <span>{qualificationGapCopy.deliveryPreference}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryQualificationGapQuery('deliveryPreference')}`,
                  )}
                >
                  <span>{qualificationGapCopy.deliveryPreference}</span>
                </Link>
""",
    "                <span>{qualificationGapCopy.timingPreference}</span>\n": """                <Link
                  href={localizeHref(
                    locale,
                    `/enquiries?${buildEnquiryQualificationGapQuery('timingPreference')}`,
                  )}
                >
                  <span>{qualificationGapCopy.timingPreference}</span>
                </Link>
""",
}
for marker, replacement in gap_links.items():
    marker_count = dashboard_text.count(marker)
    if marker_count != 1:
        raise SystemExit(
            f'qualification gap dashboard marker count was {marker_count} for {marker.strip()}'
        )
    dashboard_text = dashboard_text.replace(marker, replacement, 1)

if dashboard_text.count('buildEnquiryQualificationGapQuery(') != 5:
    raise SystemExit('qualification gap dashboard link count mismatch')

dashboard.write_text(dashboard_text)
