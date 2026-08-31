from pathlib import Path
import re


def replace_exact(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one marker, found {count}")
    return text.replace(old, new, 1)


# Protected enquiry desk integration.
path = Path('apps/admin/app/enquiries/page.tsx')
text = path.read_text()
text = replace_exact(
    text,
    "import { getEnquiryProgrammeFilterCopy } from '../../lib/enquiry-programme-filter-localization';\n",
    "import { getEnquiryProgrammeFilterCopy } from '../../lib/enquiry-programme-filter-localization';\n"
    "import { getEnquiryCityFilterCopy } from '../../lib/enquiry-city-filter-localization';\n",
    'city filter localization import',
)
text = replace_exact(
    text,
    "import {\n"
    "  getEnquiryProgrammeWhere,\n"
    "  parseEnquiryProgrammeFilter,\n"
    "  type EnquiryProgrammeFilter,\n"
    "} from '../../lib/enquiry-programme-filter';\n",
    "import {\n"
    "  getEnquiryProgrammeWhere,\n"
    "  parseEnquiryProgrammeFilter,\n"
    "  type EnquiryProgrammeFilter,\n"
    "} from '../../lib/enquiry-programme-filter';\n"
    "import {\n"
    "  getEnquiryCityWhere,\n"
    "  parseEnquiryCityFilter,\n"
    "} from '../../lib/enquiry-city-filter';\n",
    'city filter import',
)
text = replace_exact(
    text,
    "    programmeSlug?: string | string[] | undefined;\n"
    "    programmeTitle?: string | string[] | undefined;\n",
    "    programmeSlug?: string | string[] | undefined;\n"
    "    programmeTitle?: string | string[] | undefined;\n"
    "    city?: string | string[] | undefined;\n",
    'city search parameter',
)
text = replace_exact(
    text,
    "  timingPreference: EnquiryTimingPreference | null = null,\n"
    "  programme: EnquiryProgrammeFilter | null = null,\n"
    ") {\n",
    "  timingPreference: EnquiryTimingPreference | null = null,\n"
    "  programme: EnquiryProgrammeFilter | null = null,\n"
    "  city: string | null = null,\n"
    ") {\n",
    'city href parameter',
)
text = replace_exact(
    text,
    "  if (programme) {\n"
    "    query.set('programmeSlug', programme.programmeSlug);\n"
    "    query.set('programmeTitle', programme.programmeTitleSnapshot);\n"
    "  }\n"
    "  const suffix = query.size > 0 ? `?${query.toString()}` : '';\n",
    "  if (programme) {\n"
    "    query.set('programmeSlug', programme.programmeSlug);\n"
    "    query.set('programmeTitle', programme.programmeTitleSnapshot);\n"
    "  }\n"
    "  if (city) query.set('city', city);\n"
    "  const suffix = query.size > 0 ? `?${query.toString()}` : '';\n",
    'city href query',
)
text = replace_exact(
    text,
    "  const programmeFilterCopy = getEnquiryProgrammeFilterCopy(locale);\n"
    "  const contactShortcutsCopy = getEnquiryContactShortcutsCopy(locale);\n",
    "  const programmeFilterCopy = getEnquiryProgrammeFilterCopy(locale);\n"
    "  const cityFilterCopy = getEnquiryCityFilterCopy(locale);\n"
    "  const contactShortcutsCopy = getEnquiryContactShortcutsCopy(locale);\n",
    'city filter copy',
)
text = replace_exact(
    text,
    "  const activeProgramme = parseEnquiryProgrammeFilter(\n"
    "    params?.programmeSlug,\n"
    "    params?.programmeTitle,\n"
    "  );\n"
    "  const todayUtc = new Date();\n",
    "  const activeProgramme = parseEnquiryProgrammeFilter(\n"
    "    params?.programmeSlug,\n"
    "    params?.programmeTitle,\n"
    "  );\n"
    "  const activeCity = parseEnquiryCityFilter(params?.city);\n"
    "  const todayUtc = new Date();\n",
    'active city parse',
)
text = replace_exact(
    text,
    "  const programmeWhere = getEnquiryProgrammeWhere(activeProgramme);\n"
    "  if (programmeWhere) filters.push(programmeWhere);\n"
    "  const enquiryWhere = filters.length > 0 ? { AND: filters } : null;\n",
    "  const programmeWhere = getEnquiryProgrammeWhere(activeProgramme);\n"
    "  if (programmeWhere) filters.push(programmeWhere);\n"
    "  const cityWhere = getEnquiryCityWhere(activeCity);\n"
    "  if (cityWhere) filters.push(cityWhere);\n"
    "  const enquiryWhere = filters.length > 0 ? { AND: filters } : null;\n",
    'city prisma scope',
)
# Preserve the new city scope anywhere an existing explicit link already preserves programme scope.
def preserve_city(match: re.Match[str]) -> str:
    indent = match.group(1)
    return f"{indent}activeProgramme,\n{indent}activeCity,\n"

text, preserved_count = re.subn(
    r'(?m)^(\s*)activeProgramme,\n',
    preserve_city,
    text,
)
if preserved_count < 6:
    raise SystemExit(
        f'city scope preservation: expected at least 6 activeProgramme argument sites, found {preserved_count}'
    )

# Clearing programme must preserve city even though the programme argument itself is null.
text = replace_exact(
    text,
    "                      activeDeliveryPreference,\n"
    "                      activeTimingPreference,\n"
    "                      null,\n"
    "                    )}\n"
    "                  >\n"
    "                    <span>{programmeFilterCopy.clear}</span>\n",
    "                      activeDeliveryPreference,\n"
    "                      activeTimingPreference,\n"
    "                      null,\n"
    "                      activeCity,\n"
    "                    )}\n"
    "                  >\n"
    "                    <span>{programmeFilterCopy.clear}</span>\n",
    'programme clear preserves city',
)
city_block_marker = """            {activeProgramme ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {programmeFilterCopy.eyebrow}
                </span>
"""
marker_index = text.find(city_block_marker)
if marker_index < 0:
    raise SystemExit('programme filter block marker not found')
attention_marker = """            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
"""
attention_index = text.find(attention_marker, marker_index)
if attention_index < 0:
    raise SystemExit('attention queue marker after programme block not found')
city_block = """            {activeCity ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {cityFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink} dir="auto">
                    {cityFilterCopy.city}: {activeCity}
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
                      null,
                    )}
                  >
                    <span>{cityFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>{cityFilterCopy.intro}</p>
              </div>
            ) : null}

"""
text = text[:attention_index] + city_block + text[attention_index:]
path.write_text(text)


# Operations data source integration.
path = Path('apps/admin/lib/operations.server.ts')
text = path.read_text()
text = replace_exact(
    text,
    "import {\n"
    "  normalizeEnquiryLandingPathMix,\n"
    "  type EnquiryLandingPathMixSummary,\n"
    "} from './enquiry-landing-path-reporting';\n",
    "import {\n"
    "  normalizeEnquiryLandingPathMix,\n"
    "  type EnquiryLandingPathMixSummary,\n"
    "} from './enquiry-landing-path-reporting';\n"
    "import {\n"
    "  normalizeEnquiryCityMix,\n"
    "  type EnquiryCityMixSummary,\n"
    "} from './enquiry-city-reporting';\n",
    'city reporting import',
)
text = replace_exact(
    text,
    "  enquiryLandingPathMixLast30Days: EnquiryLandingPathMixSummary;\n"
    "  enquiryQualificationGapsLast30Days: EnquiryQualificationGapSummary;\n",
    "  enquiryLandingPathMixLast30Days: EnquiryLandingPathMixSummary;\n"
    "  enquiryCityMixLast30Days: EnquiryCityMixSummary;\n"
    "  enquiryQualificationGapsLast30Days: EnquiryQualificationGapSummary;\n",
    'city dashboard type',
)
text = replace_exact(
    text,
    "    landingPathRecordedLast30Days,\n"
    "    landingPathGroupsLast30Days,\n"
    "    preferredContactGroupsLast30Days,\n",
    "    landingPathRecordedLast30Days,\n"
    "    landingPathGroupsLast30Days,\n"
    "    cityRecordedLast30Days,\n"
    "    cityGroupsLast30Days,\n"
    "    preferredContactGroupsLast30Days,\n",
    'city promise results',
)
text = replace_exact(
    text,
    "    db.enquiry.groupBy({\n"
    "      by: ['landingPath'],\n"
    "      where: {\n"
    "        ...getRecentEnquiryWhere(now),\n"
    "        landingPath: { not: null },\n"
    "      },\n"
    "      _count: { _all: true },\n"
    "    }),\n"
    "    db.enquiry.groupBy({\n"
    "      by: ['preferredContact'],\n",
    "    db.enquiry.groupBy({\n"
    "      by: ['landingPath'],\n"
    "      where: {\n"
    "        ...getRecentEnquiryWhere(now),\n"
    "        landingPath: { not: null },\n"
    "      },\n"
    "      _count: { _all: true },\n"
    "    }),\n"
    "    db.enquiry.count({\n"
    "      where: {\n"
    "        ...getRecentEnquiryWhere(now),\n"
    "        city: { not: null },\n"
    "      },\n"
    "    }),\n"
    "    db.enquiry.groupBy({\n"
    "      by: ['city'],\n"
    "      where: {\n"
    "        ...getRecentEnquiryWhere(now),\n"
    "        city: { not: null },\n"
    "      },\n"
    "      _count: { _all: true },\n"
    "    }),\n"
    "    db.enquiry.groupBy({\n"
    "      by: ['preferredContact'],\n",
    'city recent queries',
)
text = replace_exact(
    text,
    "    enquiryLandingPathMixLast30Days: normalizeEnquiryLandingPathMix(\n"
    "      landingPathGroupsLast30Days,\n"
    "      enquiriesLast30Days,\n"
    "      landingPathRecordedLast30Days,\n"
    "    ),\n"
    "    enquiryContactPreferenceMixLast30Days: normalizeEnquiryContactPreferenceMix(\n",
    "    enquiryLandingPathMixLast30Days: normalizeEnquiryLandingPathMix(\n"
    "      landingPathGroupsLast30Days,\n"
    "      enquiriesLast30Days,\n"
    "      landingPathRecordedLast30Days,\n"
    "    ),\n"
    "    enquiryCityMixLast30Days: normalizeEnquiryCityMix(\n"
    "      cityGroupsLast30Days,\n"
    "      enquiriesLast30Days,\n"
    "      cityRecordedLast30Days,\n"
    "    ),\n"
    "    enquiryContactPreferenceMixLast30Days: normalizeEnquiryContactPreferenceMix(\n",
    'city dashboard summary',
)
path.write_text(text)


# Operations dashboard presentation and drill-down entry point.
path = Path('apps/admin/app/page.tsx')
text = path.read_text()
text = replace_exact(
    text,
    "import { buildEnquiryLandingPathQuery } from '../lib/enquiry-landing-path-filter';\n",
    "import { buildEnquiryLandingPathQuery } from '../lib/enquiry-landing-path-filter';\n"
    "import { buildEnquiryCityQuery } from '../lib/enquiry-city-filter';\n"
    "import { getEnquiryCityReportingCopy } from '../lib/enquiry-city-reporting-localization';\n",
    'city dashboard imports',
)
text = replace_exact(
    text,
    "  const landingPathCopy = getEnquiryLandingPathCopy(locale);\n"
    "  const contactPreferenceCopy = getEnquiryContactPreferenceCopy(locale);\n",
    "  const landingPathCopy = getEnquiryLandingPathCopy(locale);\n"
    "  const cityReportingCopy = getEnquiryCityReportingCopy(locale);\n"
    "  const contactPreferenceCopy = getEnquiryContactPreferenceCopy(locale);\n",
    'city dashboard copy',
)
section_marker = """            ) : (
              <p className="admin-empty">{copy.dashboard.noSchoolMix}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{programmeMixCopy.eyebrow}</p>
"""
city_section = """            ) : (
              <p className="admin-empty">{copy.dashboard.noSchoolMix}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{cityReportingCopy.eyebrow}</p>
                <h2>{cityReportingCopy.title}</h2>
                <p>{cityReportingCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={cityReportingCopy.title}>
              <article>
                <span>{cityReportingCopy.recorded}</span>
                <strong>{number(operations.enquiryCityMixLast30Days.recorded)}</strong>
                <small>{copy.dashboard.rollingThirtyDays}</small>
              </article>
              <article>
                <span>{cityReportingCopy.missing}</span>
                <strong>{number(operations.enquiryCityMixLast30Days.missing)}</strong>
                <small>{copy.dashboard.rollingThirtyDays}</small>
              </article>
            </div>
            {operations.enquiryCityMixLast30Days.items.length > 0 ? (
              <div className="metric-grid" aria-label={cityReportingCopy.title}>
                {operations.enquiryCityMixLast30Days.items.map((item) => (
                  <article key={item.city}>
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquiryCityQuery(item.city)}`,
                      )}
                    >
                      <span dir="auto">{item.city}</span>
                    </Link>
                    <strong>{number(item.count)}</strong>
                    <small>{cityReportingCopy.enquiryCount(number(item.count))}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{cityReportingCopy.noData}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{programmeMixCopy.eyebrow}</p>
"""
text = replace_exact(text, section_marker, city_section, 'city dashboard section')
path.write_text(text)
