from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


ops_path = Path('apps/admin/lib/operations.server.ts')
ops = ops_path.read_text()
ops = replace_once(
    ops,
    "} from './enquiry-attention';\nimport {\n  calculateEnquiryCoveragePercent,",
    "} from './enquiry-attention';\nimport {\n  summarizeEnquiryFirstContactTurnaround,\n  type EnquiryFirstContactTurnaroundSummary,\n} from './enquiry-contact-turnaround';\nimport {\n  calculateEnquiryCoveragePercent,",
    'operations import',
)
ops = replace_once(
    ops,
    "    coveragePercent: number;\n  };\n  recentEnquiries: RecentEnquiry[];",
    "    coveragePercent: number;\n  };\n  enquiryContactTurnaroundLast30Days: EnquiryFirstContactTurnaroundSummary;\n  recentEnquiries: RecentEnquiry[];",
    'operations dashboard type',
)
ops = replace_once(
    ops,
    "    recentClosedWithOutcomeEnquiries,\n    completedEnrollments,",
    "    recentClosedWithOutcomeEnquiries,\n    recentEnquiryContactSamples,\n    completedEnrollments,",
    'operations destructuring',
)
ops = replace_once(
    ops,
    "    db.enquiry.count({ where: getRecentClosedEnquiryWithOutcomeWhere(now) }),\n    db.enrollment.count({ where: { status: 'COMPLETED' } }),",
    "    db.enquiry.count({ where: getRecentClosedEnquiryWithOutcomeWhere(now) }),\n    db.enquiry.findMany({\n      where: getRecentEnquiryWhere(now),\n      select: {\n        createdAt: true,\n        statusEvents: {\n          where: { toStatus: 'CONTACTED' },\n          orderBy: { createdAt: 'asc' },\n          take: 1,\n          select: { createdAt: true },\n        },\n      },\n    }),\n    db.enrollment.count({ where: { status: 'COMPLETED' } }),",
    'operations contact query',
)
ops = replace_once(
    ops,
    "    },\n    recentEnquiries: recentEnquiries as RecentEnquiry[],\n",
    "    },\n    enquiryContactTurnaroundLast30Days:\n      summarizeEnquiryFirstContactTurnaround(recentEnquiryContactSamples),\n    recentEnquiries: recentEnquiries as RecentEnquiry[],\n",
    'operations return summary',
)
ops_path.write_text(ops)

page_path = Path('apps/admin/app/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "import { getEnquiryCampaignReportingCopy } from '../lib/enquiry-campaign-reporting-localization';\nimport { getEnquiryOutcomeCoverageCopy } from '../lib/enquiry-outcome-coverage-localization';",
    "import { getEnquiryCampaignReportingCopy } from '../lib/enquiry-campaign-reporting-localization';\nimport { getEnquiryContactTurnaroundCopy } from '../lib/enquiry-contact-turnaround-localization';\nimport { getEnquiryOutcomeCoverageCopy } from '../lib/enquiry-outcome-coverage-localization';",
    'page contact localization import',
)
page = replace_once(
    page,
    "  const campaignCopy = getEnquiryCampaignReportingCopy(locale);\n  const outcomeCoverageCopy = getEnquiryOutcomeCoverageCopy(locale);",
    "  const campaignCopy = getEnquiryCampaignReportingCopy(locale);\n  const contactTurnaroundCopy = getEnquiryContactTurnaroundCopy(locale);\n  const outcomeCoverageCopy = getEnquiryOutcomeCoverageCopy(locale);",
    'page contact copy',
)
page = replace_once(
    page,
    "  const date = (value: Date) => formatLocalizedDate(value, locale);",
    "  const contactTurnaround = (minutes: number | null) => {\n    if (minutes === null) return contactTurnaroundCopy.noMedian;\n    if (minutes < 60) return contactTurnaroundCopy.minutes(number(minutes));\n\n    return contactTurnaroundCopy.hours(\n      formatLocalizedNumber(minutes / 60, locale, {\n        maximumFractionDigits: 1,\n      }),\n    );\n  };\n  const date = (value: Date) => formatLocalizedDate(value, locale);",
    'page duration formatter',
)
panel = '''          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{contactTurnaroundCopy.eyebrow}</p>
                <h2>{contactTurnaroundCopy.title}</h2>
                <p>{contactTurnaroundCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={contactTurnaroundCopy.title}>
              <article>
                <span>{contactTurnaroundCopy.contacted}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.contacted,
                  )}
                </strong>
                <small>{contactTurnaroundCopy.contactedNote}</small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.uncontacted}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.uncontacted,
                  )}
                </strong>
                <small>{contactTurnaroundCopy.uncontactedNote}</small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.median}</span>
                <strong>
                  {contactTurnaround(
                    operations.enquiryContactTurnaroundLast30Days.medianMinutes,
                  )}
                </strong>
                <small>{contactTurnaroundCopy.medianNote}</small>
              </article>
            </div>
            <div className="panel-heading">
              <div>
                <h3>{contactTurnaroundCopy.bucketsTitle}</h3>
              </div>
            </div>
            <div
              className="metric-grid"
              aria-label={contactTurnaroundCopy.bucketsTitle}
            >
              <article>
                <span>{contactTurnaroundCopy.underOneHour}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .underOneHour,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .underOneHour,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.oneToFourHours}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .oneToFourHours,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .oneToFourHours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.fourToTwentyFourHours}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .fourToTwentyFourHours,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .fourToTwentyFourHours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.overTwentyFourHours}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .overTwentyFourHours,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .overTwentyFourHours,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

'''
page = replace_once(
    page,
    '          <div className="operations-grid">',
    panel + '          <div className="operations-grid">',
    'page contact panel',
)
page_path.write_text(page)
