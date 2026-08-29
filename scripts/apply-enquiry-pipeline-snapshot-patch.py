from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


# Shared explicit reporting semantics.
attention_path = Path('apps/admin/lib/enquiry-attention.ts')
attention = attention_path.read_text()
attention = replace_once(
    attention,
    "export const ACTIVE_UNASSIGNED_ENQUIRY_WHERE = {\n  ownerUserId: null,\n  status: { notIn: ['CLOSED', 'SPAM'] },\n} satisfies Prisma.EnquiryWhereInput;\n",
    "export const ACTIVE_ENQUIRY_WHERE = {\n  status: { notIn: ['CLOSED', 'SPAM'] },\n} satisfies Prisma.EnquiryWhereInput;\n\nexport const ACTIVE_UNASSIGNED_ENQUIRY_WHERE = {\n  ...ACTIVE_ENQUIRY_WHERE,\n  ownerUserId: null,\n} satisfies Prisma.EnquiryWhereInput;\n",
    'active enquiry where',
)
attention_path.write_text(attention)

attention_test_path = Path('apps/admin/lib/enquiry-attention.test.ts')
attention_test = attention_test_path.read_text()
attention_test = replace_once(
    attention_test,
    "  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n",
    "  ACTIVE_ENQUIRY_WHERE,\n  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n",
    'attention test active import',
)
attention_test = replace_once(
    attention_test,
    "    expect(getEnquiryAttentionWhere('unassigned')).toEqual(\n      ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n    );\n",
    "    expect(ACTIVE_ENQUIRY_WHERE).toEqual({\n      status: { notIn: ['CLOSED', 'SPAM'] },\n    });\n    expect(getEnquiryAttentionWhere('unassigned')).toEqual(\n      ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n    );\n",
    'attention test active semantics',
)
attention_test_path.write_text(attention_test)

reporting_path = Path('apps/admin/lib/enquiry-pipeline-reporting.ts')
reporting_path.write_text(
    '''import type { Prisma } from '@luminol/database';\n\nconst THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1_000;\n\nexport function getThirtyDayEnquiryStart(now: Date): Date {\n  return new Date(now.getTime() - THIRTY_DAYS_MS);\n}\n\nexport function getRecentEnquiryWhere(\n  now: Date,\n): Prisma.EnquiryWhereInput {\n  return { createdAt: { gte: getThirtyDayEnquiryStart(now) } };\n}\n\nexport function getProgrammeAttributedRecentEnquiryWhere(\n  now: Date,\n): Prisma.EnquiryWhereInput {\n  return {\n    createdAt: { gte: getThirtyDayEnquiryStart(now) },\n    programmeSlug: { not: null },\n    programmeTitleSnapshot: { not: null },\n  };\n}\n'''
)

reporting_test_path = Path('apps/admin/lib/enquiry-pipeline-reporting.test.ts')
reporting_test_path.write_text(
    '''import { describe, expect, it } from 'vitest';\n\nimport { getAdminCopy } from './admin-localization';\nimport {\n  getProgrammeAttributedRecentEnquiryWhere,\n  getRecentEnquiryWhere,\n  getThirtyDayEnquiryStart,\n} from './enquiry-pipeline-reporting';\n\ndescribe('enquiry pipeline reporting', () => {\n  it('uses a rolling 30-day createdAt window', () => {\n    const now = new Date('2026-08-29T06:00:00.000Z');\n    const start = new Date('2026-07-30T06:00:00.000Z');\n\n    expect(getThirtyDayEnquiryStart(now)).toEqual(start);\n    expect(getRecentEnquiryWhere(now)).toEqual({\n      createdAt: { gte: start },\n    });\n  });\n\n  it('counts programme attribution only when both verified snapshot fields are present', () => {\n    const now = new Date('2026-08-29T06:00:00.000Z');\n\n    expect(getProgrammeAttributedRecentEnquiryWhere(now)).toEqual({\n      createdAt: { gte: new Date('2026-07-30T06:00:00.000Z') },\n      programmeSlug: { not: null },\n      programmeTitleSnapshot: { not: null },\n    });\n  });\n\n  it('keeps the protected pipeline snapshot labelled in every admin locale', () => {\n    expect(getAdminCopy('en').dashboard).toMatchObject({\n      enquiryPipeline: 'Enquiry pipeline',\n      rollingThirtyDays: 'Rolling 30 days',\n      enquiriesLast30Days: 'Enquiries received',\n      programmeAttributedLast30Days: 'Programme-attributed',\n      activeEnquiries: 'Active enquiries',\n      unassignedActiveEnquiries: 'Active & unassigned',\n    });\n    expect(getAdminCopy('fr').dashboard).toMatchObject({\n      enquiryPipeline: 'Pipeline des demandes',\n      rollingThirtyDays: '30 derniers jours',\n      enquiriesLast30Days: 'Demandes reçues',\n      programmeAttributedLast30Days: 'Attribuées à un programme',\n      activeEnquiries: 'Demandes actives',\n      unassignedActiveEnquiries: 'Actives non attribuées',\n    });\n    expect(getAdminCopy('ar').dashboard).toMatchObject({\n      enquiryPipeline: 'مسار الطلبات',\n      rollingThirtyDays: 'آخر 30 يومًا',\n      enquiriesLast30Days: 'الطلبات المستلمة',\n      programmeAttributedLast30Days: 'مرتبطة ببرنامج',\n      activeEnquiries: 'الطلبات النشطة',\n      unassignedActiveEnquiries: 'نشطة وغير مسندة',\n    });\n  });\n});\n'''
)

# Database-backed dashboard reporting.
operations_path = Path('apps/admin/lib/operations.server.ts')
operations = operations_path.read_text()
operations = replace_once(
    operations,
    "import { db } from '@luminol/database';\n\nimport {\n",
    "import { db } from '@luminol/database';\n\nimport {\n  ACTIVE_ENQUIRY_WHERE,\n  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,\n} from './enquiry-attention';\nimport {\n  getProgrammeAttributedRecentEnquiryWhere,\n  getRecentEnquiryWhere,\n} from './enquiry-pipeline-reporting';\nimport {\n",
    'operations reporting imports',
)
operations = replace_once(
    operations,
    '    newEnquiries: number;\n    completionRate: number;\n',
    '    newEnquiries: number;\n    enquiriesLast30Days: number;\n    programmeAttributedLast30Days: number;\n    activeEnquiries: number;\n    unassignedActiveEnquiries: number;\n    completionRate: number;\n',
    'operations reporting type',
)
operations = replace_once(
    operations,
    'export async function getOperationsDashboard(): Promise<OperationsDashboard> {\n  const [\n',
    'export async function getOperationsDashboard(): Promise<OperationsDashboard> {\n  const now = new Date();\n  const [\n',
    'operations reporting now',
)
operations = replace_once(
    operations,
    '    newEnquiries,\n    completedEnrollments,\n',
    '    newEnquiries,\n    enquiriesLast30Days,\n    programmeAttributedLast30Days,\n    activeEnquiries,\n    unassignedActiveEnquiries,\n    completedEnrollments,\n',
    'operations reporting tuple',
)
operations = replace_once(
    operations,
    "    db.enquiry.count({ where: { status: 'NEW' } }),\n    db.enrollment.count({ where: { status: 'COMPLETED' } }),\n",
    "    db.enquiry.count({ where: { status: 'NEW' } }),\n    db.enquiry.count({ where: getRecentEnquiryWhere(now) }),\n    db.enquiry.count({\n      where: getProgrammeAttributedRecentEnquiryWhere(now),\n    }),\n    db.enquiry.count({ where: ACTIVE_ENQUIRY_WHERE }),\n    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),\n    db.enrollment.count({ where: { status: 'COMPLETED' } }),\n",
    'operations reporting queries',
)
operations = replace_once(
    operations,
    '      newEnquiries,\n      completionRate: calculateCompletionRate(\n',
    '      newEnquiries,\n      enquiriesLast30Days,\n      programmeAttributedLast30Days,\n      activeEnquiries,\n      unassignedActiveEnquiries,\n      completionRate: calculateCompletionRate(\n',
    'operations reporting return',
)
operations_path.write_text(operations)

# Localized protected dashboard copy.
localization_path = Path('apps/admin/lib/admin-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    '    completionRate: string;\n    completionRateAria: string;\n    growth: string;\n',
    '    completionRate: string;\n    completionRateAria: string;\n    enquiryPipelineAria: string;\n    enquiryPipeline: string;\n    rollingThirtyDays: string;\n    enquiriesLast30Days: string;\n    receivedLast30Days: string;\n    programmeAttributedLast30Days: string;\n    verifiedProgrammeContext: string;\n    activeEnquiries: string;\n    currentlyOpen: string;\n    unassignedActiveEnquiries: string;\n    needsOwner: string;\n    growth: string;\n',
    'dashboard copy type',
)
localization = replace_once(
    localization,
    "      completionRate: 'Completion rate',\n      completionRateAria: 'Programme completion rate',\n      growth: 'Growth',\n",
    "      completionRate: 'Completion rate',\n      completionRateAria: 'Programme completion rate',\n      enquiryPipelineAria: 'Enquiry pipeline snapshot',\n      enquiryPipeline: 'Enquiry pipeline',\n      rollingThirtyDays: 'Rolling 30 days',\n      enquiriesLast30Days: 'Enquiries received',\n      receivedLast30Days: 'Created in the last 30 days',\n      programmeAttributedLast30Days: 'Programme-attributed',\n      verifiedProgrammeContext: 'Verified programme context in the last 30 days',\n      activeEnquiries: 'Active enquiries',\n      currentlyOpen: 'New, in review or contacted',\n      unassignedActiveEnquiries: 'Active & unassigned',\n      needsOwner: 'Needs an owner',\n      growth: 'Growth',\n",
    'english pipeline copy',
)
localization = replace_once(
    localization,
    "      completionRate: 'Taux d’achèvement',\n      completionRateAria: 'Taux d’achèvement des programmes',\n      growth: 'Développement',\n",
    "      completionRate: 'Taux d’achèvement',\n      completionRateAria: 'Taux d’achèvement des programmes',\n      enquiryPipelineAria: 'Aperçu du pipeline des demandes',\n      enquiryPipeline: 'Pipeline des demandes',\n      rollingThirtyDays: '30 derniers jours',\n      enquiriesLast30Days: 'Demandes reçues',\n      receivedLast30Days: 'Créées au cours des 30 derniers jours',\n      programmeAttributedLast30Days: 'Attribuées à un programme',\n      verifiedProgrammeContext: 'Contexte de programme vérifié sur 30 jours',\n      activeEnquiries: 'Demandes actives',\n      currentlyOpen: 'Nouvelles, en examen ou contactées',\n      unassignedActiveEnquiries: 'Actives non attribuées',\n      needsOwner: 'Responsable à attribuer',\n      growth: 'Développement',\n",
    'french pipeline copy',
)
localization = replace_once(
    localization,
    "      completionRate: 'نسبة الإكمال',\n      completionRateAria: 'نسبة إكمال البرامج',\n      growth: 'النمو',\n",
    "      completionRate: 'نسبة الإكمال',\n      completionRateAria: 'نسبة إكمال البرامج',\n      enquiryPipelineAria: 'ملخص مسار الطلبات',\n      enquiryPipeline: 'مسار الطلبات',\n      rollingThirtyDays: 'آخر 30 يومًا',\n      enquiriesLast30Days: 'الطلبات المستلمة',\n      receivedLast30Days: 'أُنشئت خلال آخر 30 يومًا',\n      programmeAttributedLast30Days: 'مرتبطة ببرنامج',\n      verifiedProgrammeContext: 'سياق برنامج موثّق خلال آخر 30 يومًا',\n      activeEnquiries: 'الطلبات النشطة',\n      currentlyOpen: 'جديدة أو قيد المراجعة أو تم التواصل معها',\n      unassignedActiveEnquiries: 'نشطة وغير مسندة',\n      needsOwner: 'تحتاج إلى مسؤول متابعة',\n      growth: 'النمو',\n",
    'arabic pipeline copy',
)
localization_path.write_text(localization)

# Render a compact protected snapshot without changing existing summary cards.
page_path = Path('apps/admin/app/page.tsx')
page = page_path.read_text()
pipeline_section = '''\n          <section className="admin-panel">\n            <div className="panel-heading">\n              <div>\n                <p className="eyebrow">{copy.dashboard.growth}</p>\n                <h2>{copy.dashboard.enquiryPipeline}</h2>\n              </div>\n              <span>{copy.dashboard.rollingThirtyDays}</span>\n            </div>\n            <div\n              className="metric-grid"\n              aria-label={copy.dashboard.enquiryPipelineAria}\n            >\n              <article>\n                <span>{copy.dashboard.enquiriesLast30Days}</span>\n                <strong>{number(operations.summary.enquiriesLast30Days)}</strong>\n                <small>{copy.dashboard.receivedLast30Days}</small>\n              </article>\n              <article>\n                <span>{copy.dashboard.programmeAttributedLast30Days}</span>\n                <strong>\n                  {number(operations.summary.programmeAttributedLast30Days)}\n                </strong>\n                <small>{copy.dashboard.verifiedProgrammeContext}</small>\n              </article>\n              <article>\n                <span>{copy.dashboard.activeEnquiries}</span>\n                <strong>{number(operations.summary.activeEnquiries)}</strong>\n                <small>{copy.dashboard.currentlyOpen}</small>\n              </article>\n              <article>\n                <span>{copy.dashboard.unassignedActiveEnquiries}</span>\n                <strong>\n                  {number(operations.summary.unassignedActiveEnquiries)}\n                </strong>\n                <small>{copy.dashboard.needsOwner}</small>\n              </article>\n            </div>\n          </section>\n'''
page = replace_once(
    page,
    '          </section>\n\n          <div className="operations-grid">\n',
    '          </section>\n' + pipeline_section + '\n          <div className="operations-grid">\n',
    'dashboard pipeline section',
)
page_path.write_text(page)
