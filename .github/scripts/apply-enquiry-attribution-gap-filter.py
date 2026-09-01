from pathlib import Path

page = Path('apps/admin/app/enquiries/page.tsx')
text = page.read_text()

marker = "import { getEnquiryCampaignFilterCopy } from '../../lib/enquiry-campaign-filter-localization';\n"
addition = marker + "import { getEnquiryAttributionGapFilterCopy } from '../../lib/enquiry-attribution-gap-filter-localization';\n"
if marker not in text:
    raise SystemExit('campaign filter localization import marker not found')
text = text.replace(marker, addition, 1)

marker = "import {\n  getEnquiryCampaignAttributionWhere,\n  parseEnquiryCampaignAttributionFilter,\n  type EnquiryCampaignAttributionFilter,\n} from '../../lib/enquiry-campaign-filter';\n"
addition = marker + "import {\n  getEnquiryAttributionGapWhere,\n  parseEnquiryAttributionGapFilter,\n  type EnquiryAttributionGap,\n} from '../../lib/enquiry-attribution-gap-filter';\n"
if marker not in text:
    raise SystemExit('campaign attribution helper import marker not found')
text = text.replace(marker, addition, 1)

marker = "    followUpTiming?: string | string[] | undefined;\n"
addition = marker + "    attributionGap?: string | string[] | undefined;\n"
if marker not in text:
    raise SystemExit('search params marker not found')
text = text.replace(marker, addition, 1)

marker = "  followUpTiming: EnquiryFollowUpTimingBucket | null = null,\n) {\n"
replacement = "  followUpTiming: EnquiryFollowUpTimingBucket | null = null,\n  attributionGap: EnquiryAttributionGap | null = null,\n) {\n"
if marker not in text:
    raise SystemExit('build href signature marker not found')
text = text.replace(marker, replacement, 1)

marker = "  if (followUpTiming) query.set('followUpTiming', followUpTiming);\n"
addition = marker + "  if (attributionGap) query.set('attributionGap', attributionGap);\n"
if marker not in text:
    raise SystemExit('query marker not found')
text = text.replace(marker, addition, 1)

marker = "  const campaignFilterCopy = getEnquiryCampaignFilterCopy(locale);\n"
addition = marker + "  const attributionGapFilterCopy =\n    getEnquiryAttributionGapFilterCopy(locale);\n"
if marker not in text:
    raise SystemExit('copy marker not found')
text = text.replace(marker, addition, 1)

marker = "  const activeFollowUpTiming = parseEnquiryFollowUpTimingFilter(\n    params?.followUpTiming,\n  );\n"
addition = marker + "  const activeAttributionGap = parseEnquiryAttributionGapFilter(\n    params?.attributionGap,\n  );\n"
if marker not in text:
    raise SystemExit('active follow-up timing parse marker not found')
text = text.replace(marker, addition, 1)

marker = "  if (followUpTimingWhere) filters.push(followUpTimingWhere);\n"
addition = marker + "  const attributionGapWhere = getEnquiryAttributionGapWhere(\n    activeAttributionGap,\n  );\n  if (attributionGapWhere) filters.push(attributionGapWhere);\n"
if marker not in text:
    raise SystemExit('where marker not found')
text = text.replace(marker, addition, 1)

marker = "      activeFollowUpTiming,\n    );\n"
replacement = "      activeFollowUpTiming,\n      activeAttributionGap,\n    );\n"
if marker not in text:
    raise SystemExit('hrefFor marker not found')
text = text.replace(marker, replacement, 1)

direct_marker = "                      activeFollowUpTiming,\n                    )}"
direct_replacement = "                      activeFollowUpTiming,\n                      activeAttributionGap,\n                    )}"
direct_count = text.count(direct_marker)
if direct_count < 8:
    raise SystemExit(f'expected many active follow-up timing clear links, found {direct_count}')
text = text.replace(direct_marker, direct_replacement)

followup_clear_marker = "                      activeAge,\n                      null,\n                    )}"
followup_clear_replacement = "                      activeAge,\n                      null,\n                      activeAttributionGap,\n                    )}"
if followup_clear_marker not in text:
    raise SystemExit('follow-up timing clear link marker not found')
text = text.replace(followup_clear_marker, followup_clear_replacement, 1)

anchor = '''            {activeFollowUpTiming ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {followUpTimingFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {followUpTimingFilterCopy.label(activeFollowUpTiming)}
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
                      activeAge,
                      null,
                      activeAttributionGap,
                    )}
                  >
                    <span>{followUpTimingFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {followUpTimingFilterCopy.intro}
                </p>
              </div>
            ) : null}
'''
if anchor not in text:
    raise SystemExit('follow-up timing active block anchor not found')
attribution_block = anchor + '''
            {activeAttributionGap ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {attributionGapFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {attributionGapFilterCopy.label(activeAttributionGap)}
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
                      activeAge,
                      activeFollowUpTiming,
                      null,
                    )}
                  >
                    <span>{attributionGapFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {attributionGapFilterCopy.intro}
                </p>
              </div>
            ) : null}
'''
text = text.replace(anchor, attribution_block, 1)
page.write_text(text)

dashboard = Path('apps/admin/app/page.tsx')
dashboard_text = dashboard.read_text()

marker = "import { getEnquiryAttributionCoverageCopy } from '../lib/enquiry-attribution-coverage-localization';\n"
addition = marker + "import { buildEnquiryAttributionGapQuery } from '../lib/enquiry-attribution-gap-filter';\n"
if marker not in dashboard_text:
    raise SystemExit('dashboard attribution coverage import marker not found')
dashboard_text = dashboard_text.replace(marker, addition, 1)

marker = '''                  <article key={item.field}>
                    <span>{attributionCoverageLabel(item.field)}</span>
                    <strong>{percent(item.percent)}</strong>
'''
replacement = '''                  <article key={item.field}>
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquiryAttributionGapQuery(item.field)}`,
                      )}
                    >
                      <span>{attributionCoverageLabel(item.field)}</span>
                    </Link>
                    <strong>{percent(item.percent)}</strong>
'''
if marker not in dashboard_text:
    raise SystemExit('dashboard coverage card marker not found')
dashboard_text = dashboard_text.replace(marker, replacement, 1)
dashboard.write_text(dashboard_text)
