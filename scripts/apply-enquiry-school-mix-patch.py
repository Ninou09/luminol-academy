from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)

# Add a typed transformation helper so the DB groupBy result stays bounded to known schools.
reporting_path = Path('apps/admin/lib/enquiry-pipeline-reporting.ts')
reporting = reporting_path.read_text()
reporting += """

export const ENQUIRY_SCHOOLS = [
  'PSYCHOLOGY',
  'LANGUAGES',
  'TRAINING',
  'GENERAL',
] as const;

export type EnquirySchoolValue = (typeof ENQUIRY_SCHOOLS)[number];

export function normalizeEnquirySchoolMix(
  groups: Array<{ school: string; _count: { _all: number } }>,
): Array<{ school: EnquirySchoolValue; count: number }> {
  const allowed = new Set<string>(ENQUIRY_SCHOOLS);
  return groups
    .filter((group) => allowed.has(group.school) && group._count._all > 0)
    .map((group) => ({
      school: group.school as EnquirySchoolValue,
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count || a.school.localeCompare(b.school));
}
"""
reporting_path.write_text(reporting)

reporting_test_path = Path('apps/admin/lib/enquiry-pipeline-reporting.test.ts')
reporting_test = reporting_test_path.read_text()
reporting_test = replace_once(
    reporting_test,
    "  getThirtyDayEnquiryStart,\n} from './enquiry-pipeline-reporting';\n",
    "  getThirtyDayEnquiryStart,\n  normalizeEnquirySchoolMix,\n} from './enquiry-pipeline-reporting';\n",
    'reporting test import',
)
reporting_test = replace_once(
    reporting_test,
    "  it('keeps the protected pipeline snapshot labelled in every admin locale', () => {\n",
    "  it('normalizes only known non-zero school groups in descending count order', () => {\n    expect(\n      normalizeEnquirySchoolMix([\n        { school: 'GENERAL', _count: { _all: 2 } },\n        { school: 'PSYCHOLOGY', _count: { _all: 7 } },\n        { school: 'UNKNOWN', _count: { _all: 99 } },\n        { school: 'LANGUAGES', _count: { _all: 0 } },\n      ]),\n    ).toEqual([\n      { school: 'PSYCHOLOGY', count: 7 },\n      { school: 'GENERAL', count: 2 },\n    ]);\n  });\n\n  it('keeps the protected pipeline snapshot labelled in every admin locale', () => {\n",
    'reporting school mix test',
)
reporting_test_path.write_text(reporting_test)

operations_path = Path('apps/admin/lib/operations.server.ts')
operations = operations_path.read_text()
operations = replace_once(
    operations,
    "  getProgrammeAttributedRecentEnquiryWhere,\n  getRecentEnquiryWhere,\n} from './enquiry-pipeline-reporting';\n",
    "  getProgrammeAttributedRecentEnquiryWhere,\n  getRecentEnquiryWhere,\n  normalizeEnquirySchoolMix,\n  type EnquirySchoolValue,\n} from './enquiry-pipeline-reporting';\n",
    'operations reporting import',
)
operations = replace_once(
    operations,
    "  recentEnquiries: RecentEnquiry[];\n",
    "  enquirySchoolMixLast30Days: Array<{\n    school: EnquirySchoolValue;\n    count: number;\n  }>;\n  recentEnquiries: RecentEnquiry[];\n",
    'operations type',
)
operations = replace_once(
    operations,
    "    trackedEnrollments,\n    recentEnquiries,\n",
    "    trackedEnrollments,\n    enquirySchoolGroupsLast30Days,\n    recentEnquiries,\n",
    'operations tuple',
)
operations = replace_once(
    operations,
    "    db.enrollment.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),\n    db.enquiry.findMany({\n",
    "    db.enrollment.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),\n    db.enquiry.groupBy({\n      by: ['school'],\n      where: getRecentEnquiryWhere(now),\n      _count: { _all: true },\n    }),\n    db.enquiry.findMany({\n",
    'operations group query',
)
operations = replace_once(
    operations,
    "    recentEnquiries: recentEnquiries as RecentEnquiry[],\n",
    "    enquirySchoolMixLast30Days: normalizeEnquirySchoolMix(\n      enquirySchoolGroupsLast30Days,\n    ),\n    recentEnquiries: recentEnquiries as RecentEnquiry[],\n",
    'operations return',
)
operations_path.write_text(operations)

localization_path = Path('apps/admin/lib/admin-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    "    needsOwner: string;\n    growth: string;\n",
    "    needsOwner: string;\n    enquirySchoolMix: string;\n    enquirySchoolMixIntro: string;\n    noSchoolMix: string;\n    growth: string;\n",
    'localization type',
)
localization = replace_once(
    localization,
    "      needsOwner: 'Needs an owner',\n      growth: 'Growth',\n",
    "      needsOwner: 'Needs an owner',\n      enquirySchoolMix: 'Enquiry mix by school',\n      enquirySchoolMixIntro: 'Enquiries created in the rolling last 30 days, grouped by the submitted school.',\n      noSchoolMix: 'No enquiries were received in this 30-day window.',\n      growth: 'Growth',\n",
    'english copy',
)
localization = replace_once(
    localization,
    "      needsOwner: 'Responsable à attribuer',\n      growth: 'Développement',\n",
    "      needsOwner: 'Responsable à attribuer',\n      enquirySchoolMix: 'Répartition des demandes par pôle',\n      enquirySchoolMixIntro: 'Demandes créées au cours des 30 derniers jours glissants, regroupées selon le pôle sélectionné.',\n      noSchoolMix: 'Aucune demande reçue pendant cette période de 30 jours.',\n      growth: 'Développement',\n",
    'french copy',
)
localization = replace_once(
    localization,
    "      needsOwner: 'تحتاج إلى مسؤول متابعة',\n      growth: 'النمو',\n",
    "      needsOwner: 'تحتاج إلى مسؤول متابعة',\n      enquirySchoolMix: 'توزيع الطلبات حسب المجال',\n      enquirySchoolMixIntro: 'الطلبات المنشأة خلال آخر 30 يومًا متحركًا، مجمعة حسب المجال الذي اختاره صاحب الطلب.',\n      noSchoolMix: 'لم تُستلم طلبات خلال فترة الثلاثين يومًا هذه.',\n      growth: 'النمو',\n",
    'arabic copy',
)
localization_path.write_text(localization)

page_path = Path('apps/admin/app/page.tsx')
page = page_path.read_text()
section = """

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.dashboard.rollingThirtyDays}</p>
                <h2>{copy.dashboard.enquirySchoolMix}</h2>
                <p>{copy.dashboard.enquirySchoolMixIntro}</p>
              </div>
            </div>
            {operations.enquirySchoolMixLast30Days.length > 0 ? (
              <div className="metric-grid">
                {operations.enquirySchoolMixLast30Days.map((item) => (
                  <article key={item.school}>
                    <span>{getAdminEnumLabel(locale, item.school)}</span>
                    <strong>{number(item.count)}</strong>
                    <small>{copy.dashboard.rollingThirtyDays}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{copy.dashboard.noSchoolMix}</p>
            )}
          </section>
"""
page = replace_once(
    page,
    "          </section>\n\n          <div className=\"operations-grid\">\n",
    "          </section>" + section + "\n          <div className=\"operations-grid\">\n",
    'dashboard school mix section',
)
page_path.write_text(page)
