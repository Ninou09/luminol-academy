from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)

reporting_path = Path('apps/admin/lib/enquiry-pipeline-reporting.ts')
reporting = reporting_path.read_text()
reporting += """

export const MAX_PROGRAMME_MIX_ITEMS = 8;

export type VerifiedProgrammeMixItem = {
  programmeSlug: string;
  programmeTitleSnapshot: string;
  count: number;
};

export function normalizeVerifiedProgrammeMix(
  groups: Array<{
    programmeSlug: string | null;
    programmeTitleSnapshot: string | null;
    _count: { _all: number };
  }>,
): VerifiedProgrammeMixItem[] {
  return groups
    .filter(
      (group) =>
        Boolean(group.programmeSlug) &&
        Boolean(group.programmeTitleSnapshot) &&
        group._count._all > 0,
    )
    .map((group) => ({
      programmeSlug: group.programmeSlug as string,
      programmeTitleSnapshot: group.programmeTitleSnapshot as string,
      count: group._count._all,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.programmeTitleSnapshot.localeCompare(b.programmeTitleSnapshot) ||
        a.programmeSlug.localeCompare(b.programmeSlug),
    )
    .slice(0, MAX_PROGRAMME_MIX_ITEMS);
}
"""
reporting_path.write_text(reporting)

reporting_test_path = Path('apps/admin/lib/enquiry-pipeline-reporting.test.ts')
reporting_test = reporting_test_path.read_text()
reporting_test = replace_once(
    reporting_test,
    "  normalizeEnquirySchoolMix,\n} from './enquiry-pipeline-reporting';\n",
    "  MAX_PROGRAMME_MIX_ITEMS,\n  normalizeEnquirySchoolMix,\n  normalizeVerifiedProgrammeMix,\n} from './enquiry-pipeline-reporting';\n",
    'reporting test imports',
)
anchor = "  it('keeps the protected pipeline snapshot labelled in every admin locale', () => {\n"
new_test = """  it('keeps only verified atomic programme groups, sorted and bounded', () => {
    const groups: Array<{
      programmeSlug: string | null;
      programmeTitleSnapshot: string | null;
      _count: { _all: number };
    }> = Array.from({ length: MAX_PROGRAMME_MIX_ITEMS + 3 }, (_, index) => ({
      programmeSlug: `programme-${index}`,
      programmeTitleSnapshot: `Programme ${String(index).padStart(2, '0')}`,
      _count: { _all: index + 1 },
    }));
    groups.push({
      programmeSlug: null,
      programmeTitleSnapshot: 'Invalid programme',
      _count: { _all: 999 },
    });
    groups.push({
      programmeSlug: 'missing-title',
      programmeTitleSnapshot: null,
      _count: { _all: 999 },
    });

    const result = normalizeVerifiedProgrammeMix(groups);

    expect(result).toHaveLength(MAX_PROGRAMME_MIX_ITEMS);
    expect(result[0]).toMatchObject({
      programmeSlug: `programme-${MAX_PROGRAMME_MIX_ITEMS + 2}`,
      count: MAX_PROGRAMME_MIX_ITEMS + 3,
    });
    expect(result.every((item) => item.programmeSlug && item.programmeTitleSnapshot)).toBe(true);
  });

"""
reporting_test = replace_once(reporting_test, anchor, new_test + anchor, 'programme mix test')
reporting_test_path.write_text(reporting_test)

operations_path = Path('apps/admin/lib/operations.server.ts')
operations = operations_path.read_text()
operations = replace_once(
    operations,
    "  normalizeEnquirySchoolMix,\n  type EnquirySchoolValue,\n} from './enquiry-pipeline-reporting';\n",
    "  normalizeEnquirySchoolMix,\n  normalizeVerifiedProgrammeMix,\n  type EnquirySchoolValue,\n  type VerifiedProgrammeMixItem,\n} from './enquiry-pipeline-reporting';\n",
    'operations imports',
)
operations = replace_once(
    operations,
    "  enquirySchoolMixLast30Days: Array<{\n    school: EnquirySchoolValue;\n    count: number;\n  }>;\n  recentEnquiries: RecentEnquiry[];\n",
    "  enquirySchoolMixLast30Days: Array<{\n    school: EnquirySchoolValue;\n    count: number;\n  }>;\n  verifiedProgrammeMixLast30Days: VerifiedProgrammeMixItem[];\n  recentEnquiries: RecentEnquiry[];\n",
    'operations type',
)
operations = replace_once(
    operations,
    "    enquirySchoolGroupsLast30Days,\n    recentEnquiries,\n",
    "    enquirySchoolGroupsLast30Days,\n    verifiedProgrammeGroupsLast30Days,\n    recentEnquiries,\n",
    'operations tuple',
)
operations = replace_once(
    operations,
    "    db.enquiry.groupBy({\n      by: ['school'],\n      where: getRecentEnquiryWhere(now),\n      _count: { _all: true },\n    }),\n    db.enquiry.findMany({\n",
    "    db.enquiry.groupBy({\n      by: ['school'],\n      where: getRecentEnquiryWhere(now),\n      _count: { _all: true },\n    }),\n    db.enquiry.groupBy({\n      by: ['programmeSlug', 'programmeTitleSnapshot'],\n      where: getProgrammeAttributedRecentEnquiryWhere(now),\n      _count: { _all: true },\n    }),\n    db.enquiry.findMany({\n",
    'operations programme group query',
)
operations = replace_once(
    operations,
    "    enquirySchoolMixLast30Days: normalizeEnquirySchoolMix(\n      enquirySchoolGroupsLast30Days,\n    ),\n    recentEnquiries: recentEnquiries as RecentEnquiry[],\n",
    "    enquirySchoolMixLast30Days: normalizeEnquirySchoolMix(\n      enquirySchoolGroupsLast30Days,\n    ),\n    verifiedProgrammeMixLast30Days: normalizeVerifiedProgrammeMix(\n      verifiedProgrammeGroupsLast30Days,\n    ),\n    recentEnquiries: recentEnquiries as RecentEnquiry[],\n",
    'operations return',
)
operations_path.write_text(operations)

localization_path = Path('apps/admin/lib/admin-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    "    noSchoolMix: string;\n    growth: string;\n",
    "    noSchoolMix: string;\n    verifiedProgrammeMix: string;\n    verifiedProgrammeMixIntro: string;\n    noVerifiedProgrammeMix: string;\n    enquiryCount: string;\n    growth: string;\n",
    'localization type',
)
localization = replace_once(
    localization,
    "      noSchoolMix: 'No enquiries were received in this 30-day window.',\n      growth: 'Growth',\n",
    "      noSchoolMix: 'No enquiries were received in this 30-day window.',\n      verifiedProgrammeMix: 'Verified programme interest',\n      verifiedProgrammeMixIntro: 'Programme-attributed enquiries created in the rolling last 30 days, using only the server-verified programme snapshot.',\n      noVerifiedProgrammeMix: 'No verified programme-attributed enquiries were received in this 30-day window.',\n      enquiryCount: 'Enquiries',\n      growth: 'Growth',\n",
    'english copy',
)
localization = replace_once(
    localization,
    "      noSchoolMix: 'Aucune demande reçue pendant cette période de 30 jours.',\n      growth: 'Développement',\n",
    "      noSchoolMix: 'Aucune demande reçue pendant cette période de 30 jours.',\n      verifiedProgrammeMix: 'Intérêt par programme vérifié',\n      verifiedProgrammeMixIntro: 'Demandes attribuées à un programme créées au cours des 30 derniers jours glissants, uniquement à partir de l’instantané de programme vérifié côté serveur.',\n      noVerifiedProgrammeMix: 'Aucune demande attribuée à un programme vérifié pendant cette période de 30 jours.',\n      enquiryCount: 'Demandes',\n      growth: 'Développement',\n",
    'french copy',
)
localization = replace_once(
    localization,
    "      noSchoolMix: 'لم تُستلم طلبات خلال فترة الثلاثين يومًا هذه.',\n      growth: 'النمو',\n",
    "      noSchoolMix: 'لم تُستلم طلبات خلال فترة الثلاثين يومًا هذه.',\n      verifiedProgrammeMix: 'الاهتمام حسب البرنامج الموثّق',\n      verifiedProgrammeMixIntro: 'الطلبات المرتبطة ببرنامج والمنشأة خلال آخر 30 يومًا متحركًا، اعتمادًا فقط على لقطة البرنامج الموثّقة من الخادم.',\n      noVerifiedProgrammeMix: 'لم تُستلم طلبات مرتبطة ببرنامج موثّق خلال فترة الثلاثين يومًا هذه.',\n      enquiryCount: 'الطلبات',\n      growth: 'النمو',\n",
    'arabic copy',
)
localization_path.write_text(localization)

page_path = Path('apps/admin/app/page.tsx')
page = page_path.read_text()
anchor = """          <div className="operations-grid">\n"""
section = """          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.dashboard.rollingThirtyDays}</p>
                <h2>{copy.dashboard.verifiedProgrammeMix}</h2>
                <p>{copy.dashboard.verifiedProgrammeMixIntro}</p>
              </div>
            </div>
            {operations.verifiedProgrammeMixLast30Days.length > 0 ? (
              <div className="metric-grid">
                {operations.verifiedProgrammeMixLast30Days.map((item) => (
                  <article key={item.programmeSlug}>
                    <span dir="auto">{item.programmeTitleSnapshot}</span>
                    <strong>{number(item.count)}</strong>
                    <small>{copy.dashboard.enquiryCount}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">
                {copy.dashboard.noVerifiedProgrammeMix}
              </p>
            )}
          </section>

"""
page = replace_once(page, anchor, section + anchor, 'programme mix section')
page_path.write_text(page)
