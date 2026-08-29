from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


helper_path = Path('apps/admin/lib/enquiry-first-response.ts')
helper_path.write_text(
    '''export type EnquiryFirstResponseStep =\n  | 'acknowledge'\n  | 'confirm-programme-objective'\n  | 'clarify-service-objective'\n  | 'clarify-location'\n  | 'clarify-format'\n  | 'clarify-timing'\n  | 'agree-next-option'\n  | 'use-email-preference'\n  | 'confirm-phone-permission'\n  | 'clarify-phone-number'\n  | 'confirm-whatsapp-permission'\n  | 'clarify-whatsapp-number'\n  | 'clarify-contact-preference'\n  | 'schedule-follow-up';\n\ntype EnquiryFirstResponseInput = {\n  programmeTitleSnapshot: string | null;\n  city: string | null;\n  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP' | null;\n  deliveryPreference: 'IN_PERSON' | 'ONLINE' | 'FLEXIBLE' | 'NOT_SURE' | null;\n  timingPreference: 'SOON' | 'WITHIN_MONTH' | 'LATER' | 'NOT_SURE' | null;\n  phone: string | null;\n};\n\nexport function buildEnquiryFirstResponseSteps(\n  enquiry: EnquiryFirstResponseInput,\n): EnquiryFirstResponseStep[] {\n  const steps: EnquiryFirstResponseStep[] = ['acknowledge'];\n\n  steps.push(\n    enquiry.programmeTitleSnapshot\n      ? 'confirm-programme-objective'\n      : 'clarify-service-objective',\n  );\n\n  if (!enquiry.city) steps.push('clarify-location');\n  if (!enquiry.deliveryPreference || enquiry.deliveryPreference === 'NOT_SURE') {\n    steps.push('clarify-format');\n  }\n  if (!enquiry.timingPreference || enquiry.timingPreference === 'NOT_SURE') {\n    steps.push('clarify-timing');\n  }\n\n  steps.push('agree-next-option');\n\n  if (enquiry.preferredContact === 'EMAIL') {\n    steps.push('use-email-preference');\n  } else if (enquiry.preferredContact === 'PHONE') {\n    steps.push(\n      enquiry.phone ? 'confirm-phone-permission' : 'clarify-phone-number',\n    );\n  } else if (enquiry.preferredContact === 'WHATSAPP') {\n    steps.push(\n      enquiry.phone\n        ? 'confirm-whatsapp-permission'\n        : 'clarify-whatsapp-number',\n    );\n  } else {\n    steps.push('clarify-contact-preference');\n  }\n\n  steps.push('schedule-follow-up');\n  return steps;\n}\n'''
)

helper_test_path = Path('apps/admin/lib/enquiry-first-response.test.ts')
helper_test_path.write_text(
    '''import { describe, expect, it } from 'vitest';\n\nimport { buildEnquiryFirstResponseSteps } from './enquiry-first-response';\n\ndescribe('enquiry first-response guidance', () => {\n  it('keeps a fully qualified email enquiry concise and operational', () => {\n    expect(\n      buildEnquiryFirstResponseSteps({\n        programmeTitleSnapshot: 'Verified programme',\n        city: 'Blida',\n        preferredContact: 'EMAIL',\n        deliveryPreference: 'IN_PERSON',\n        timingPreference: 'SOON',\n        phone: null,\n      }),\n    ).toEqual([\n      'acknowledge',\n      'confirm-programme-objective',\n      'agree-next-option',\n      'use-email-preference',\n      'schedule-follow-up',\n    ]);\n  });\n\n  it('asks for missing qualification details without inventing them', () => {\n    expect(\n      buildEnquiryFirstResponseSteps({\n        programmeTitleSnapshot: null,\n        city: null,\n        preferredContact: 'WHATSAPP',\n        deliveryPreference: 'NOT_SURE',\n        timingPreference: null,\n        phone: null,\n      }),\n    ).toEqual([\n      'acknowledge',\n      'clarify-service-objective',\n      'clarify-location',\n      'clarify-format',\n      'clarify-timing',\n      'agree-next-option',\n      'clarify-whatsapp-number',\n      'schedule-follow-up',\n    ]);\n  });\n\n  it('requires explicit channel permission before a phone follow-up', () => {\n    const steps = buildEnquiryFirstResponseSteps({\n      programmeTitleSnapshot: null,\n      city: 'Algiers',\n      preferredContact: 'PHONE',\n      deliveryPreference: 'ONLINE',\n      timingPreference: 'WITHIN_MONTH',\n      phone: '+213000000000',\n    });\n\n    expect(steps).toContain('confirm-phone-permission');\n    expect(steps).not.toContain('use-email-preference');\n    expect(steps).not.toContain('confirm-whatsapp-permission');\n  });\n});\n'''
)

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    "import type { Locale } from '@luminol/localization';\n",
    "import type { Locale } from '@luminol/localization';\n\nimport type { EnquiryFirstResponseStep } from './enquiry-first-response';\n",
    'localization step import',
)
localization = replace_once(
    localization,
    '  protectedMessage: string;\n  followUpPlan: string;\n',
    '  protectedMessage: string;\n  firstResponseGuide: string;\n  firstResponseGuideIntro: string;\n  firstResponseBoundary: string;\n  followUpPlan: string;\n',
    'localization first-response type',
)
localization = replace_once(
    localization,
    "    protectedMessage:\n      'Protected enquiry message — use only for operational follow-up.',\n    followUpPlan: 'Next follow-up plan',\n",
    "    protectedMessage:\n      'Protected enquiry message — use only for operational follow-up.',\n    firstResponseGuide: 'First-response guide',\n    firstResponseGuideIntro:\n      'Use this checklist to keep the first contact consistent with the information already provided.',\n    firstResponseBoundary:\n      'Operational guidance only — do not add diagnoses, treatment recommendations or clinical claims to the reply.',\n    followUpPlan: 'Next follow-up plan',\n",
    'english first-response copy',
)
localization = replace_once(
    localization,
    "    protectedMessage:\n      'Message de demande protégé — à utiliser uniquement pour le suivi opérationnel.',\n    followUpPlan: 'Prochain suivi',\n",
    "    protectedMessage:\n      'Message de demande protégé — à utiliser uniquement pour le suivi opérationnel.',\n    firstResponseGuide: 'Guide de première réponse',\n    firstResponseGuideIntro:\n      'Utilisez cette liste pour garder un premier contact cohérent avec les informations déjà fournies.',\n    firstResponseBoundary:\n      'Guide opérationnel uniquement — n’ajoutez pas de diagnostic, recommandation thérapeutique ou affirmation clinique à la réponse.',\n    followUpPlan: 'Prochain suivi',\n",
    'french first-response copy',
)
localization = replace_once(
    localization,
    "    protectedMessage:\n      'رسالة طلب محمية — تُستخدم فقط لأغراض المتابعة التشغيلية.',\n    followUpPlan: 'خطة المتابعة التالية',\n",
    "    protectedMessage:\n      'رسالة طلب محمية — تُستخدم فقط لأغراض المتابعة التشغيلية.',\n    firstResponseGuide: 'دليل الرد الأول',\n    firstResponseGuideIntro:\n      'استخدم هذه القائمة للحفاظ على تواصل أول متسق مع المعلومات التي قدمها صاحب الطلب.',\n    firstResponseBoundary:\n      'إرشاد تشغيلي فقط — لا تضف تشخيصات أو توصيات علاجية أو ادعاءات سريرية إلى الرد.',\n    followUpPlan: 'خطة المتابعة التالية',\n",
    'arabic first-response copy',
)
step_labels = '''\nconst FIRST_RESPONSE_STEP_LABELS: Record<\n  Locale,\n  Record<EnquiryFirstResponseStep, string>\n> = {\n  en: {\n    acknowledge: 'Acknowledge the enquiry and confirm you understood the request.',\n    'confirm-programme-objective':\n      'Confirm that the recorded programme matches the visitor’s objective; do not assume availability or suitability.',\n    'clarify-service-objective':\n      'Clarify which service or objective the visitor is asking about.',\n    'clarify-location': 'Ask for the city or area needed for routing.',\n    'clarify-format':\n      'Confirm whether they prefer in-person or online support.',\n    'clarify-timing': 'Confirm their preferred timing for the next step.',\n    'agree-next-option':\n      'Offer only an operational next option that is actually available and agree what happens next.',\n    'use-email-preference': 'Reply by email, their stated preferred channel.',\n    'confirm-phone-permission':\n      'Before continuing by phone, confirm they agree to be contacted on the provided number.',\n    'clarify-phone-number':\n      'They prefer phone but no number is recorded; confirm how they want to be contacted.',\n    'confirm-whatsapp-permission':\n      'Before moving to WhatsApp, confirm they agree to continue there; do not assume the provided number is WhatsApp-enabled.',\n    'clarify-whatsapp-number':\n      'They prefer WhatsApp but no number is recorded; confirm the contact method and number first.',\n    'clarify-contact-preference':\n      'Confirm which contact channel they prefer before moving the conversation.',\n    'schedule-follow-up':\n      'After the response, record the next action and follow-up date in this desk.',\n  },\n  fr: {\n    acknowledge: 'Accusez réception de la demande et confirmez que vous avez compris le besoin.',\n    'confirm-programme-objective':\n      'Confirmez que le programme enregistré correspond à l’objectif de la personne, sans supposer sa disponibilité ni son adéquation.',\n    'clarify-service-objective':\n      'Clarifiez le service ou l’objectif recherché par la personne.',\n    'clarify-location': 'Demandez la ville ou la zone nécessaire au routage.',\n    'clarify-format':\n      'Confirmez si la personne préfère un accompagnement en présentiel ou en ligne.',\n    'clarify-timing': 'Confirmez le délai souhaité pour la prochaine étape.',\n    'agree-next-option':\n      'Proposez uniquement une prochaine option opérationnelle réellement disponible et convenez de la suite.',\n    'use-email-preference':\n      'Répondez par e-mail, le canal indiqué comme préféré.',\n    'confirm-phone-permission':\n      'Avant de poursuivre par téléphone, confirmez l’accord pour utiliser le numéro fourni.',\n    'clarify-phone-number':\n      'Le téléphone est préféré mais aucun numéro n’est enregistré ; confirmez le moyen de contact.',\n    'confirm-whatsapp-permission':\n      'Avant de passer sur WhatsApp, confirmez l’accord pour y poursuivre l’échange et ne supposez pas que le numéro fourni est compatible.',\n    'clarify-whatsapp-number':\n      'WhatsApp est préféré mais aucun numéro n’est enregistré ; confirmez d’abord le moyen de contact et le numéro.',\n    'clarify-contact-preference':\n      'Confirmez le canal de contact préféré avant de poursuivre l’échange.',\n    'schedule-follow-up':\n      'Après la réponse, enregistrez la prochaine action et la date de suivi dans ce bureau.',\n  },\n  ar: {\n    acknowledge: 'أكد استلام الطلب وأنك فهمت ما يطلبه صاحبه.',\n    'confirm-programme-objective':\n      'أكد أن البرنامج المسجل يطابق هدف صاحب الطلب دون افتراض التوفر أو الملاءمة.',\n    'clarify-service-objective': 'وضّح الخدمة أو الهدف الذي يسأل عنه صاحب الطلب.',\n    'clarify-location': 'اطلب المدينة أو المنطقة اللازمة لتوجيه الطلب.',\n    'clarify-format': 'أكد ما إذا كان يفضل المتابعة حضوريًا أو عن بُعد.',\n    'clarify-timing': 'أكد التوقيت المفضل للخطوة التالية.',\n    'agree-next-option':\n      'اعرض فقط خيارًا تشغيليًا متاحًا فعليًا للخطوة التالية واتفق على ما سيحدث بعدها.',\n    'use-email-preference': 'استخدم البريد الإلكتروني لأنه وسيلة التواصل المفضلة المذكورة.',\n    'confirm-phone-permission':\n      'قبل المتابعة هاتفيًا، أكد موافقته على التواصل عبر الرقم المقدم.',\n    'clarify-phone-number':\n      'يفضل الهاتف لكن لا يوجد رقم مسجل؛ أكد معه طريقة التواصل المناسبة.',\n    'confirm-whatsapp-permission':\n      'قبل الانتقال إلى واتساب، أكد موافقته على مواصلة التواصل هناك ولا تفترض أن الرقم المقدم مفعّل على واتساب.',\n    'clarify-whatsapp-number':\n      'يفضل واتساب لكن لا يوجد رقم مسجل؛ أكد أولًا وسيلة التواصل والرقم.',\n    'clarify-contact-preference':\n      'أكد وسيلة التواصل التي يفضلها قبل نقل المحادثة إلى قناة أخرى.',\n    'schedule-follow-up':\n      'بعد الرد، سجّل الخطوة التالية وتاريخ المتابعة في هذا المكتب.',\n  },\n};\n\n'''
localization = replace_once(
    localization,
    'const CONTACT_LABELS: Record<\n',
    step_labels + 'const CONTACT_LABELS: Record<\n',
    'first-response labels block',
)
localization = replace_once(
    localization,
    'export function getEnquiryContactPreferenceLabel(\n',
    "export function getEnquiryFirstResponseStepLabel(\n  locale: Locale,\n  step: EnquiryFirstResponseStep,\n): string {\n  return FIRST_RESPONSE_STEP_LABELS[locale][step];\n}\n\nexport function getEnquiryContactPreferenceLabel(\n",
    'first-response label helper',
)
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(
    localization_test,
    '  getEnquiryDeskCopy,\n  getEnquiryTimingPreferenceLabel,\n',
    '  getEnquiryDeskCopy,\n  getEnquiryFirstResponseStepLabel,\n  getEnquiryTimingPreferenceLabel,\n',
    'localization test helper import',
)
localization_test = replace_once(
    localization_test,
    "      myEnquiries: 'Assigned to me',\n",
    "      myEnquiries: 'Assigned to me',\n      firstResponseGuide: 'First-response guide',\n",
    'english localization guide assertion',
)
localization_test = replace_once(
    localization_test,
    "      myEnquiries: 'Attribuées à moi',\n",
    "      myEnquiries: 'Attribuées à moi',\n      firstResponseGuide: 'Guide de première réponse',\n",
    'french localization guide assertion',
)
localization_test = replace_once(
    localization_test,
    "      myEnquiries: 'مسندة إليّ',\n",
    "      myEnquiries: 'مسندة إليّ',\n      firstResponseGuide: 'دليل الرد الأول',\n",
    'arabic localization guide assertion',
)
localization_test = replace_once(
    localization_test,
    "    expect(getEnquiryContactPreferenceLabel('en', null)).toBe('Not provided');\n  });\n});\n",
    "    expect(getEnquiryContactPreferenceLabel('en', null)).toBe('Not provided');\n  });\n\n  it('localizes first-response channel guidance without generating message content', () => {\n    expect(\n      getEnquiryFirstResponseStepLabel('en', 'confirm-phone-permission'),\n    ).toContain('confirm they agree');\n    expect(\n      getEnquiryFirstResponseStepLabel('fr', 'confirm-whatsapp-permission'),\n    ).toContain('confirmez l’accord');\n    expect(\n      getEnquiryFirstResponseStepLabel('ar', 'schedule-follow-up'),\n    ).toContain('تاريخ المتابعة');\n  });\n});\n",
    'localization first-response test',
)
localization_test_path.write_text(localization_test)

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "import {\n  getEnquiryContactPreferenceLabel,\n",
    "import { buildEnquiryFirstResponseSteps } from '../../lib/enquiry-first-response';\nimport {\n  getEnquiryContactPreferenceLabel,\n",
    'page first-response helper import',
)
page = replace_once(
    page,
    '  getEnquiryDeskCopy,\n  getEnquiryTimingPreferenceLabel,\n',
    '  getEnquiryDeskCopy,\n  getEnquiryFirstResponseStepLabel,\n  getEnquiryTimingPreferenceLabel,\n',
    'page first-response localization import',
)
page = replace_once(
    page,
    "                const hasOutcome = Boolean(\n                  enquiry.outcome && enquiry.outcomeAt,\n                );\n\n                return (\n",
    "                const hasOutcome = Boolean(\n                  enquiry.outcome && enquiry.outcomeAt,\n                );\n                const firstResponseSteps = buildEnquiryFirstResponseSteps({\n                  programmeTitleSnapshot: enquiry.programmeTitleSnapshot,\n                  city: enquiry.city,\n                  preferredContact: enquiry.preferredContact,\n                  deliveryPreference: enquiry.deliveryPreference,\n                  timingPreference: enquiry.timingPreference,\n                  phone: enquiry.phone,\n                });\n\n                return (\n",
    'page checklist construction',
)
response_block = '''\n                    <section className={styles.responseGuideBlock}>\n                      <div>\n                        <span className={styles.messageLabel}>\n                          {copy.firstResponseGuide}\n                        </span>\n                        <p className={styles.privacyNote}>\n                          {copy.firstResponseGuideIntro}\n                        </p>\n                      </div>\n                      <ol className={styles.responseGuideList}>\n                        {firstResponseSteps.map((step) => (\n                          <li key={step}>\n                            {getEnquiryFirstResponseStepLabel(locale, step)}\n                          </li>\n                        ))}\n                      </ol>\n                      <p className={styles.privacyNote}>\n                        {copy.firstResponseBoundary}\n                      </p>\n                    </section>\n'''
page = replace_once(
    page,
    '                    </div>\n\n                    <section className={styles.followUpBlock}>\n',
    '                    </div>\n' + response_block + '\n                    <section className={styles.followUpBlock}>\n',
    'page response guide block',
)
page_path.write_text(page)

css_path = Path('apps/admin/app/enquiries/page.module.css')
css = css_path.read_text()
css = replace_once(
    css,
    '.followUpBlock {\n  background: color-mix(in srgb, currentColor 3%, transparent);\n  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);\n}\n\n.followUpHeading {\n',
    ".followUpBlock {\n  background: color-mix(in srgb, currentColor 3%, transparent);\n  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);\n}\n\n.responseGuideBlock {\n  display: grid;\n  gap: 0.65rem;\n  padding: 0.9rem;\n  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);\n  border-radius: 0.8rem;\n}\n\n.responseGuideBlock > div {\n  display: grid;\n  gap: 0.3rem;\n}\n\n.responseGuideList {\n  display: grid;\n  gap: 0.45rem;\n  margin: 0;\n  padding-inline-start: 1.35rem;\n  line-height: 1.45;\n}\n\n.responseGuideList li::marker {\n  font-weight: 700;\n}\n\n.followUpHeading {\n",
    'response guide css',
)
css_path.write_text(css)
