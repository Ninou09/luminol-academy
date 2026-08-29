from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


helper = Path('apps/admin/lib/enquiry-audit-history.ts')
helper.write_text('''export const ENQUIRY_AUDIT_RELATION_LIMIT = 6;\nexport const ENQUIRY_AUDIT_TIMELINE_LIMIT = 12;\n\nexport type EnquiryAuditAction =\n  | 'status-changed'\n  | 'ownership-assigned'\n  | 'ownership-reassigned'\n  | 'ownership-cleared'\n  | 'follow-up-planned'\n  | 'follow-up-updated'\n  | 'follow-up-cleared'\n  | 'outcome-recorded'\n  | 'outcome-updated'\n  | 'outcome-cleared';\n\ntype AuditActor = {\n  email: string;\n  firstName: string | null;\n  lastName: string | null;\n};\n\ntype StatusEvent = {\n  id: string;\n  fromStatus: string;\n  toStatus: string;\n  createdAt: Date;\n  actor: AuditActor;\n};\n\ntype OwnershipEvent = {\n  id: string;\n  fromOwnerUserId: string | null;\n  toOwnerUserId: string | null;\n  createdAt: Date;\n  actor: AuditActor;\n};\n\ntype FollowUpEvent = {\n  id: string;\n  fromNextFollowUpAt: Date | null;\n  toNextFollowUpAt: Date | null;\n  createdAt: Date;\n  actor: AuditActor;\n};\n\ntype OutcomeEvent = {\n  id: string;\n  fromOutcomeAt: Date | null;\n  toOutcomeAt: Date | null;\n  createdAt: Date;\n  actor: AuditActor;\n};\n\nexport type EnquiryAuditTimelineItem = {\n  id: string;\n  action: EnquiryAuditAction;\n  createdAt: Date;\n  actor: AuditActor;\n  fromStatus?: string;\n  toStatus?: string;\n  followUpAt?: Date | null;\n};\n\ntype EnquiryAuditInput = {\n  statusEvents: StatusEvent[];\n  ownershipEvents: OwnershipEvent[];\n  followUpEvents: FollowUpEvent[];\n  outcomeEvents: OutcomeEvent[];\n};\n\nfunction ownershipAction(event: OwnershipEvent): EnquiryAuditAction {\n  if (!event.toOwnerUserId) return 'ownership-cleared';\n  return event.fromOwnerUserId\n    ? 'ownership-reassigned'\n    : 'ownership-assigned';\n}\n\nfunction followUpAction(event: FollowUpEvent): EnquiryAuditAction {\n  if (!event.toNextFollowUpAt) return 'follow-up-cleared';\n  return event.fromNextFollowUpAt ? 'follow-up-updated' : 'follow-up-planned';\n}\n\nfunction outcomeAction(event: OutcomeEvent): EnquiryAuditAction {\n  if (!event.toOutcomeAt) return 'outcome-cleared';\n  return event.fromOutcomeAt ? 'outcome-updated' : 'outcome-recorded';\n}\n\nexport function buildEnquiryAuditTimeline(\n  events: EnquiryAuditInput,\n  limit = ENQUIRY_AUDIT_TIMELINE_LIMIT,\n): EnquiryAuditTimelineItem[] {\n  const items: EnquiryAuditTimelineItem[] = [\n    ...events.statusEvents.map((event) => ({\n      id: `status:${event.id}`,\n      action: 'status-changed' as const,\n      createdAt: event.createdAt,\n      actor: event.actor,\n      fromStatus: event.fromStatus,\n      toStatus: event.toStatus,\n    })),\n    ...events.ownershipEvents.map((event) => ({\n      id: `ownership:${event.id}`,\n      action: ownershipAction(event),\n      createdAt: event.createdAt,\n      actor: event.actor,\n    })),\n    ...events.followUpEvents.map((event) => ({\n      id: `follow-up:${event.id}`,\n      action: followUpAction(event),\n      createdAt: event.createdAt,\n      actor: event.actor,\n      followUpAt: event.toNextFollowUpAt,\n    })),\n    ...events.outcomeEvents.map((event) => ({\n      id: `outcome:${event.id}`,\n      action: outcomeAction(event),\n      createdAt: event.createdAt,\n      actor: event.actor,\n    })),\n  ];\n\n  return items\n    .sort(\n      (left, right) =>\n        right.createdAt.getTime() - left.createdAt.getTime() ||\n        left.id.localeCompare(right.id),\n    )\n    .slice(0, Math.max(0, limit));\n}\n''')

helper_test = Path('apps/admin/lib/enquiry-audit-history.test.ts')
helper_test.write_text('''import { describe, expect, it } from 'vitest';\n\nimport {\n  buildEnquiryAuditTimeline,\n  ENQUIRY_AUDIT_RELATION_LIMIT,\n  ENQUIRY_AUDIT_TIMELINE_LIMIT,\n} from './enquiry-audit-history';\n\nconst actor = { email: 'operator@example.com', firstName: 'Op', lastName: null };\n\ndescribe('enquiry audit history', () => {\n  it('normalizes all audited event families and sorts newest first', () => {\n    const timeline = buildEnquiryAuditTimeline({\n      statusEvents: [\n        {\n          id: 's1',\n          fromStatus: 'NEW',\n          toStatus: 'IN_REVIEW',\n          createdAt: new Date('2026-08-29T08:00:00.000Z'),\n          actor,\n        },\n      ],\n      ownershipEvents: [\n        {\n          id: 'o1',\n          fromOwnerUserId: null,\n          toOwnerUserId: 'operator',\n          createdAt: new Date('2026-08-29T09:00:00.000Z'),\n          actor,\n        },\n      ],\n      followUpEvents: [\n        {\n          id: 'f1',\n          fromNextFollowUpAt: null,\n          toNextFollowUpAt: new Date('2026-08-30T00:00:00.000Z'),\n          createdAt: new Date('2026-08-29T10:00:00.000Z'),\n          actor,\n        },\n      ],\n      outcomeEvents: [\n        {\n          id: 'r1',\n          fromOutcomeAt: null,\n          toOutcomeAt: new Date('2026-08-29T11:00:00.000Z'),\n          createdAt: new Date('2026-08-29T11:00:00.000Z'),\n          actor,\n        },\n      ],\n    });\n\n    expect(timeline.map((item) => item.action)).toEqual([\n      'outcome-recorded',\n      'follow-up-planned',\n      'ownership-assigned',\n      'status-changed',\n    ]);\n    expect(timeline[3]).toMatchObject({\n      fromStatus: 'NEW',\n      toStatus: 'IN_REVIEW',\n    });\n  });\n\n  it('classifies updates and clears without carrying historical free text', () => {\n    const timeline = buildEnquiryAuditTimeline({\n      statusEvents: [],\n      ownershipEvents: [\n        {\n          id: 'o1',\n          fromOwnerUserId: 'one',\n          toOwnerUserId: 'two',\n          createdAt: new Date('2026-08-29T08:00:00.000Z'),\n          actor,\n        },\n        {\n          id: 'o2',\n          fromOwnerUserId: 'two',\n          toOwnerUserId: null,\n          createdAt: new Date('2026-08-29T09:00:00.000Z'),\n          actor,\n        },\n      ],\n      followUpEvents: [\n        {\n          id: 'f1',\n          fromNextFollowUpAt: new Date('2026-08-30T00:00:00.000Z'),\n          toNextFollowUpAt: new Date('2026-08-31T00:00:00.000Z'),\n          createdAt: new Date('2026-08-29T10:00:00.000Z'),\n          actor,\n        },\n        {\n          id: 'f2',\n          fromNextFollowUpAt: new Date('2026-08-31T00:00:00.000Z'),\n          toNextFollowUpAt: null,\n          createdAt: new Date('2026-08-29T11:00:00.000Z'),\n          actor,\n        },\n      ],\n      outcomeEvents: [\n        {\n          id: 'r1',\n          fromOutcomeAt: new Date('2026-08-29T07:00:00.000Z'),\n          toOutcomeAt: new Date('2026-08-29T08:00:00.000Z'),\n          createdAt: new Date('2026-08-29T12:00:00.000Z'),\n          actor,\n        },\n        {\n          id: 'r2',\n          fromOutcomeAt: new Date('2026-08-29T08:00:00.000Z'),\n          toOutcomeAt: null,\n          createdAt: new Date('2026-08-29T13:00:00.000Z'),\n          actor,\n        },\n      ],\n    });\n\n    expect(timeline.map((item) => item.action)).toEqual([\n      'outcome-cleared',\n      'outcome-updated',\n      'follow-up-cleared',\n      'follow-up-updated',\n      'ownership-cleared',\n      'ownership-reassigned',\n    ]);\n    expect(JSON.stringify(timeline)).not.toContain('nextAction');\n    expect(JSON.stringify(timeline)).not.toContain('outcomeText');\n  });\n\n  it('uses explicit bounded defaults and respects a smaller render limit', () => {\n    expect(ENQUIRY_AUDIT_RELATION_LIMIT).toBe(6);\n    expect(ENQUIRY_AUDIT_TIMELINE_LIMIT).toBe(12);\n\n    const statusEvents = Array.from({ length: 4 }, (_, index) => ({\n      id: `s${index}`,\n      fromStatus: 'NEW',\n      toStatus: 'IN_REVIEW',\n      createdAt: new Date(`2026-08-29T0${index + 1}:00:00.000Z`),\n      actor,\n    }));\n    expect(\n      buildEnquiryAuditTimeline(\n        { statusEvents, ownershipEvents: [], followUpEvents: [], outcomeEvents: [] },\n        2,\n      ),\n    ).toHaveLength(2);\n  });\n});\n''')

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    "import type { EnquiryFirstResponseStep } from './enquiry-first-response';\n",
    "import type { EnquiryAuditAction } from './enquiry-audit-history';\nimport type { EnquiryFirstResponseStep } from './enquiry-first-response';\n",
    'audit localization import',
)
localization = replace_once(
    localization,
    '  firstResponseBoundary: string;\n  followUpPlan: string;\n',
    '  firstResponseBoundary: string;\n  recentAuditChanges: string;\n  recentAuditIntro: string;\n  auditBy: string;\n  auditNoChanges: string;\n  followUpPlan: string;\n',
    'audit copy type',
)
localization = replace_once(
    localization,
    "    firstResponseBoundary:\n      'Operational guidance only — do not add diagnoses, treatment recommendations or clinical claims to the reply.',\n    followUpPlan: 'Next follow-up plan',\n",
    "    firstResponseBoundary:\n      'Operational guidance only — do not add diagnoses, treatment recommendations or clinical claims to the reply.',\n    recentAuditChanges: 'Recent audited changes',\n    recentAuditIntro:\n      'Latest protected workflow events. Historical message, next-action and outcome text are not repeated here.',\n    auditBy: 'by',\n    auditNoChanges: 'No audited workflow changes recorded yet.',\n    followUpPlan: 'Next follow-up plan',\n",
    'english audit copy',
)
localization = replace_once(
    localization,
    "    firstResponseBoundary:\n      'Guide opérationnel uniquement — n’ajoutez pas de diagnostic, recommandation thérapeutique ou affirmation clinique à la réponse.',\n    followUpPlan: 'Prochain suivi',\n",
    "    firstResponseBoundary:\n      'Guide opérationnel uniquement — n’ajoutez pas de diagnostic, recommandation thérapeutique ou affirmation clinique à la réponse.',\n    recentAuditChanges: 'Modifications auditées récentes',\n    recentAuditIntro:\n      'Derniers événements protégés du flux. Les anciens messages, prochaines actions et textes de résultat ne sont pas répétés ici.',\n    auditBy: 'par',\n    auditNoChanges: 'Aucune modification auditée du flux pour le moment.',\n    followUpPlan: 'Prochain suivi',\n",
    'french audit copy',
)
localization = replace_once(
    localization,
    "    firstResponseBoundary:\n      'إرشاد تشغيلي فقط — لا تضف تشخيصات أو توصيات علاجية أو ادعاءات سريرية إلى الرد.',\n    followUpPlan: 'خطة المتابعة التالية',\n",
    "    firstResponseBoundary:\n      'إرشاد تشغيلي فقط — لا تضف تشخيصات أو توصيات علاجية أو ادعاءات سريرية إلى الرد.',\n    recentAuditChanges: 'أحدث التغييرات المدققة',\n    recentAuditIntro:\n      'أحدث أحداث سير العمل المحمية. لا نكرر هنا نصوص الرسائل أو الإجراءات التالية أو النتائج السابقة.',\n    auditBy: 'بواسطة',\n    auditNoChanges: 'لا توجد تغييرات مدققة في سير العمل حتى الآن.',\n    followUpPlan: 'خطة المتابعة التالية',\n",
    'arabic audit copy',
)
audit_labels = '''\nconst AUDIT_ACTION_LABELS: Record<Locale, Record<EnquiryAuditAction, string>> = {\n  en: {\n    'status-changed': 'Status changed',\n    'ownership-assigned': 'Owner assigned',\n    'ownership-reassigned': 'Owner reassigned',\n    'ownership-cleared': 'Ownership cleared',\n    'follow-up-planned': 'Follow-up planned',\n    'follow-up-updated': 'Follow-up updated',\n    'follow-up-cleared': 'Follow-up cleared',\n    'outcome-recorded': 'Outcome recorded',\n    'outcome-updated': 'Outcome updated',\n    'outcome-cleared': 'Outcome cleared',\n  },\n  fr: {\n    'status-changed': 'Statut modifié',\n    'ownership-assigned': 'Responsable attribué',\n    'ownership-reassigned': 'Responsable réattribué',\n    'ownership-cleared': 'Attribution retirée',\n    'follow-up-planned': 'Suivi planifié',\n    'follow-up-updated': 'Suivi modifié',\n    'follow-up-cleared': 'Suivi supprimé',\n    'outcome-recorded': 'Résultat enregistré',\n    'outcome-updated': 'Résultat modifié',\n    'outcome-cleared': 'Résultat supprimé',\n  },\n  ar: {\n    'status-changed': 'تم تغيير الحالة',\n    'ownership-assigned': 'تم إسناد مسؤول',\n    'ownership-reassigned': 'تم تغيير المسؤول',\n    'ownership-cleared': 'تم إلغاء الإسناد',\n    'follow-up-planned': 'تمت جدولة المتابعة',\n    'follow-up-updated': 'تم تحديث المتابعة',\n    'follow-up-cleared': 'تم إلغاء المتابعة',\n    'outcome-recorded': 'تم تسجيل النتيجة',\n    'outcome-updated': 'تم تحديث النتيجة',\n    'outcome-cleared': 'تم حذف النتيجة',\n  },\n};\n\n'''
localization = replace_once(
    localization,
    'const FIRST_RESPONSE_STEP_LABELS: Record<\n',
    audit_labels + 'const FIRST_RESPONSE_STEP_LABELS: Record<\n',
    'audit labels block',
)
localization = replace_once(
    localization,
    'export function getEnquiryFirstResponseStepLabel(\n',
    "export function getEnquiryAuditActionLabel(\n  locale: Locale,\n  action: EnquiryAuditAction,\n): string {\n  return AUDIT_ACTION_LABELS[locale][action];\n}\n\nexport function getEnquiryFirstResponseStepLabel(\n",
    'audit action label helper',
)
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(
    localization_test,
    '  getEnquiryContactPreferenceLabel,\n',
    '  getEnquiryAuditActionLabel,\n  getEnquiryContactPreferenceLabel,\n',
    'audit localization test import',
)
localization_test = replace_once(
    localization_test,
    "      firstResponseGuide: 'First-response guide',\n",
    "      firstResponseGuide: 'First-response guide',\n      recentAuditChanges: 'Recent audited changes',\n",
    'english audit assertion',
)
localization_test = replace_once(
    localization_test,
    "      firstResponseGuide: 'Guide de première réponse',\n",
    "      firstResponseGuide: 'Guide de première réponse',\n      recentAuditChanges: 'Modifications auditées récentes',\n",
    'french audit assertion',
)
localization_test = replace_once(
    localization_test,
    "      firstResponseGuide: 'دليل الرد الأول',\n",
    "      firstResponseGuide: 'دليل الرد الأول',\n      recentAuditChanges: 'أحدث التغييرات المدققة',\n",
    'arabic audit assertion',
)
localization_test = replace_once(
    localization_test,
    "    expect(\n      getEnquiryFirstResponseStepLabel('ar', 'schedule-follow-up'),\n    ).toContain('تاريخ المتابعة');\n  });\n});\n",
    "    expect(\n      getEnquiryFirstResponseStepLabel('ar', 'schedule-follow-up'),\n    ).toContain('تاريخ المتابعة');\n  });\n\n  it('localizes audit event actions in every admin locale', () => {\n    expect(getEnquiryAuditActionLabel('en', 'status-changed')).toBe(\n      'Status changed',\n    );\n    expect(getEnquiryAuditActionLabel('fr', 'follow-up-cleared')).toBe(\n      'Suivi supprimé',\n    );\n    expect(getEnquiryAuditActionLabel('ar', 'outcome-recorded')).toBe(\n      'تم تسجيل النتيجة',\n    );\n  });\n});\n",
    'audit localization action test',
)
localization_test_path.write_text(localization_test)

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "import { getAdminEnumLabel } from '../../lib/admin-localization';\n",
    "import { getAdminEnumLabel } from '../../lib/admin-localization';\nimport {\n  buildEnquiryAuditTimeline,\n  ENQUIRY_AUDIT_RELATION_LIMIT,\n} from '../../lib/enquiry-audit-history';\n",
    'page audit helper import',
)
page = replace_once(
    page,
    '  getEnquiryContactPreferenceLabel,\n',
    '  getEnquiryAuditActionLabel,\n  getEnquiryContactPreferenceLabel,\n',
    'page audit localization import',
)
actor_select = '''{\n              select: {\n                email: true,\n                firstName: true,\n                lastName: true,\n              },\n            }'''
relations = f'''        statusEvents: {{\n          take: ENQUIRY_AUDIT_RELATION_LIMIT,\n          orderBy: {{ createdAt: 'desc' }},\n          select: {{\n            id: true,\n            fromStatus: true,\n            toStatus: true,\n            createdAt: true,\n            actor: {actor_select},\n          }},\n        }},\n        ownershipEvents: {{\n          take: ENQUIRY_AUDIT_RELATION_LIMIT,\n          orderBy: {{ createdAt: 'desc' }},\n          select: {{\n            id: true,\n            fromOwnerUserId: true,\n            toOwnerUserId: true,\n            createdAt: true,\n            actor: {actor_select},\n          }},\n        }},\n        followUpEvents: {{\n          take: ENQUIRY_AUDIT_RELATION_LIMIT,\n          orderBy: {{ createdAt: 'desc' }},\n          select: {{\n            id: true,\n            fromNextFollowUpAt: true,\n            toNextFollowUpAt: true,\n            createdAt: true,\n            actor: {actor_select},\n          }},\n        }},\n        outcomeEvents: {{\n          take: ENQUIRY_AUDIT_RELATION_LIMIT,\n          orderBy: {{ createdAt: 'desc' }},\n          select: {{\n            id: true,\n            fromOutcomeAt: true,\n            toOutcomeAt: true,\n            createdAt: true,\n            actor: {actor_select},\n          }},\n        }},\n'''
page = replace_once(
    page,
    "        owner: {\n          select: {\n            id: true,\n            email: true,\n            firstName: true,\n            lastName: true,\n          },\n        },\n",
    "        owner: {\n          select: {\n            id: true,\n            email: true,\n            firstName: true,\n            lastName: true,\n          },\n        },\n" + relations,
    'page audit relation selects',
)
page = replace_once(
    page,
    "                const firstResponseSteps = buildEnquiryFirstResponseSteps({\n                  programmeTitleSnapshot: enquiry.programmeTitleSnapshot,\n                  city: enquiry.city,\n                  preferredContact: enquiry.preferredContact,\n                  deliveryPreference: enquiry.deliveryPreference,\n                  timingPreference: enquiry.timingPreference,\n                  phone: enquiry.phone,\n                });\n\n                return (\n",
    "                const firstResponseSteps = buildEnquiryFirstResponseSteps({\n                  programmeTitleSnapshot: enquiry.programmeTitleSnapshot,\n                  city: enquiry.city,\n                  preferredContact: enquiry.preferredContact,\n                  deliveryPreference: enquiry.deliveryPreference,\n                  timingPreference: enquiry.timingPreference,\n                  phone: enquiry.phone,\n                });\n                const auditTimeline = buildEnquiryAuditTimeline({\n                  statusEvents: enquiry.statusEvents,\n                  ownershipEvents: enquiry.ownershipEvents,\n                  followUpEvents: enquiry.followUpEvents,\n                  outcomeEvents: enquiry.outcomeEvents,\n                });\n\n                return (\n",
    'page timeline construction',
)
audit_block = '''\n                    <section className={styles.auditBlock}>\n                      <div>\n                        <span className={styles.messageLabel}>\n                          {copy.recentAuditChanges}\n                        </span>\n                        <p className={styles.privacyNote}>\n                          {copy.recentAuditIntro}\n                        </p>\n                      </div>\n                      {auditTimeline.length > 0 ? (\n                        <ol className={styles.auditList}>\n                          {auditTimeline.map((event) => {\n                            const actorName = displayPersonName(\n                              event.actor.firstName,\n                              event.actor.lastName,\n                              event.actor.email,\n                            );\n                            return (\n                              <li key={event.id}>\n                                <div className={styles.auditEventHeading}>\n                                  <strong>\n                                    {getEnquiryAuditActionLabel(\n                                      locale,\n                                      event.action,\n                                    )}\n                                  </strong>\n                                  <small>\n                                    {date(event.createdAt)} · {copy.auditBy}{' '}\n                                    <span dir="auto">{actorName}</span>\n                                  </small>\n                                </div>\n                                {event.action === 'status-changed' &&\n                                event.fromStatus &&\n                                event.toStatus ? (\n                                  <span>\n                                    {getAdminEnumLabel(\n                                      locale,\n                                      event.fromStatus,\n                                    )}{' '}\n                                    →{' '}\n                                    {getAdminEnumLabel(locale, event.toStatus)}\n                                  </span>\n                                ) : event.followUpAt ? (\n                                  <span>{date(event.followUpAt)}</span>\n                                ) : null}\n                              </li>\n                            );\n                          })}\n                        </ol>\n                      ) : (\n                        <p className={styles.privacyNote}>\n                          {copy.auditNoChanges}\n                        </p>\n                      )}\n                    </section>\n'''
page = replace_once(
    page,
    '                    </section>\n\n                    <div className={styles.statusRow}>\n',
    '                    </section>\n' + audit_block + '\n                    <div className={styles.statusRow}>\n',
    'page audit block',
)
page_path.write_text(page)

css_path = Path('apps/admin/app/enquiries/page.module.css')
css = css_path.read_text()
css = replace_once(
    css,
    '.followUpHeading {\n',
    '''.auditBlock {\n  display: grid;\n  gap: 0.65rem;\n  padding: 0.9rem;\n  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);\n  border-radius: 0.8rem;\n  background: color-mix(in srgb, currentColor 2%, transparent);\n}\n\n.auditBlock > div {\n  display: grid;\n  gap: 0.3rem;\n}\n\n.auditList {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.auditList li {\n  display: grid;\n  gap: 0.25rem;\n  padding-block-start: 0.6rem;\n  border-top: 1px solid color-mix(in srgb, currentColor 9%, transparent);\n}\n\n.auditEventHeading {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 0.65rem;\n  flex-wrap: wrap;\n}\n\n.auditEventHeading small {\n  opacity: 0.68;\n}\n\n.followUpHeading {\n''',
    'audit css block',
)
css_path.write_text(css)
