import type { Locale } from '@luminol/localization';

import type { AiOperationsBriefItem } from './ai-operations-brief';

export type AiOperationsBriefCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  mode: string;
  executionPolicy: string;
  action: string;
  allClearTitle: string;
  allClearBody: string;
  qualificationLabels: Record<
    'city' | 'preferredContact' | 'deliveryPreference' | 'timingPreference',
    string
  >;
  attributionLabels: Record<
    'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmContent' | 'landingPath',
    string
  >;
  items: {
    unassigned: { title: string; body: (count: string) => string };
    pastDueFollowUp: { title: string; body: (count: string) => string };
    missingFollowUpPlan: { title: string; body: (count: string) => string };
    qualificationGap: {
      title: (field: string) => string;
      body: (count: string) => string;
    };
    missingOutcome: { title: string; body: (count: string) => string };
    attributionGap: {
      title: (field: string) => string;
      body: (count: string) => string;
    };
  };
};

const COPY: Record<Locale, AiOperationsBriefCopy> = {
  en: {
    eyebrow: 'Luminol AI Operator',
    title: 'Operations Brief',
    intro:
      'A read-only operational brief generated from the same protected CRM and dashboard data shown in this Operating System. It highlights recorded workflow gaps and opens the existing protected queues; it does not infer intent, lead quality, suitability, clinical need, campaign performance or ROI.',
    mode: 'Deterministic',
    executionPolicy: 'Execution policy: read_only · navigation only',
    action: 'Open protected queue',
    allClearTitle: 'No supported workflow gaps detected',
    allClearBody:
      'The current dashboard snapshot has no non-zero items in the AI Operator brief rules. This is an operational all-clear only, not a judgment about business performance or learner needs.',
    qualificationLabels: {
      city: 'city',
      preferredContact: 'preferred contact',
      deliveryPreference: 'delivery preference',
      timingPreference: 'timing preference',
    },
    attributionLabels: {
      utmSource: 'UTM source',
      utmMedium: 'UTM medium',
      utmCampaign: 'UTM campaign',
      utmContent: 'UTM content',
      landingPath: 'landing path',
    },
    items: {
      unassigned: {
        title: 'Assign active enquiries',
        body: (count) => `${count} active enquiries have no recorded owner.`,
      },
      pastDueFollowUp: {
        title: 'Review past-due follow-ups',
        body: (count) =>
          `${count} active enquiries have a complete recorded follow-up plan whose next follow-up time has passed.`,
      },
      missingFollowUpPlan: {
        title: 'Complete follow-up plans',
        body: (count) =>
          `${count} active enquiries are missing a complete recorded follow-up plan.`,
      },
      qualificationGap: {
        title: (field) => `Complete recorded ${field}`,
        body: (count) =>
          `${count} recent active enquiries are missing this structured qualification field.`,
      },
      missingOutcome: {
        title: 'Complete closed-enquiry outcomes',
        body: (count) =>
          `${count} recent closed enquiries are missing a complete recorded outcome.`,
      },
      attributionGap: {
        title: (field) => `Improve recorded ${field} coverage`,
        body: (count) =>
          `${count} enquiries in the rolling 30-day cohort are missing this persisted attribution field.`,
      },
    },
  },
  fr: {
    eyebrow: 'Luminol AI Operator',
    title: 'Brief opérationnel',
    intro:
      'Brief opérationnel en lecture seule généré à partir des mêmes données CRM et tableau de bord protégées que ce système d’exploitation. Il signale des écarts de workflow enregistrés et ouvre les files protégées existantes ; il n’infère ni intention, ni qualité du prospect, ni adéquation, ni besoin clinique, ni performance de campagne, ni ROI.',
    mode: 'Déterministe',
    executionPolicy: 'Politique d’exécution : read_only · navigation uniquement',
    action: 'Ouvrir la file protégée',
    allClearTitle: 'Aucun écart de workflow pris en charge détecté',
    allClearBody:
      'L’instantané actuel du tableau de bord ne contient aucun élément non nul selon les règles du brief AI Operator. Il s’agit uniquement d’un état opérationnel, et non d’un jugement sur la performance ou les besoins des apprenants.',
    qualificationLabels: {
      city: 'ville',
      preferredContact: 'contact préféré',
      deliveryPreference: 'mode de prestation',
      timingPreference: 'préférence de calendrier',
    },
    attributionLabels: {
      utmSource: 'source UTM',
      utmMedium: 'support UTM',
      utmCampaign: 'campagne UTM',
      utmContent: 'contenu UTM',
      landingPath: 'page d’arrivée',
    },
    items: {
      unassigned: {
        title: 'Attribuer les demandes actives',
        body: (count) =>
          `${count} demandes actives n’ont aucun responsable enregistré.`,
      },
      pastDueFollowUp: {
        title: 'Revoir les suivis échus',
        body: (count) =>
          `${count} demandes actives ont un plan de suivi complet enregistré dont l’heure du prochain suivi est dépassée.`,
      },
      missingFollowUpPlan: {
        title: 'Compléter les plans de suivi',
        body: (count) =>
          `${count} demandes actives n’ont pas de plan de suivi complet enregistré.`,
      },
      qualificationGap: {
        title: (field) => `Compléter le champ ${field}`,
        body: (count) =>
          `${count} demandes actives récentes n’ont pas ce champ structuré de qualification.`,
      },
      missingOutcome: {
        title: 'Compléter les résultats des demandes clôturées',
        body: (count) =>
          `${count} demandes clôturées récentes n’ont pas de résultat complet enregistré.`,
      },
      attributionGap: {
        title: (field) => `Améliorer la couverture ${field}`,
        body: (count) =>
          `${count} demandes de la cohorte glissante de 30 jours n’ont pas ce champ d’attribution persistant.`,
      },
    },
  },
  ar: {
    eyebrow: 'Luminol AI Operator',
    title: 'الموجز التشغيلي',
    intro:
      'موجز تشغيلي للقراءة فقط يُنشأ من نفس بيانات CRM ولوحة التحكم المحمية داخل نظام التشغيل. يعرض فجوات سير العمل المسجلة ويفتح قوائم العمل المحمية الحالية، ولا يستنتج النية أو جودة الطلب أو الملاءمة أو الحاجة السريرية أو أداء الحملات أو العائد على الاستثمار.',
    mode: 'حتمي',
    executionPolicy: 'سياسة التنفيذ: read_only · تنقل فقط دون تغييرات',
    action: 'فتح قائمة العمل المحمية',
    allClearTitle: 'لا توجد فجوات مدعومة في سير العمل',
    allClearBody:
      'لا يحتوي ملخص لوحة التحكم الحالي على عناصر غير صفرية ضمن قواعد موجز AI Operator. هذا وضوح تشغيلي فقط، وليس حكمًا على أداء العمل أو احتياجات المتعلمين.',
    qualificationLabels: {
      city: 'المدينة',
      preferredContact: 'وسيلة التواصل المفضلة',
      deliveryPreference: 'طريقة الحضور',
      timingPreference: 'التوقيت المفضل',
    },
    attributionLabels: {
      utmSource: 'مصدر UTM',
      utmMedium: 'وسيط UTM',
      utmCampaign: 'حملة UTM',
      utmContent: 'محتوى UTM',
      landingPath: 'مسار صفحة الوصول',
    },
    items: {
      unassigned: {
        title: 'تعيين الطلبات النشطة',
        body: (count) => `${count} طلبات نشطة لا يوجد لها مسؤول مسجل.`,
      },
      pastDueFollowUp: {
        title: 'مراجعة المتابعات المتأخرة',
        body: (count) =>
          `${count} طلبات نشطة لديها خطة متابعة كاملة ومسجلة وقد تجاوز موعد المتابعة التالي.`,
      },
      missingFollowUpPlan: {
        title: 'استكمال خطط المتابعة',
        body: (count) => `${count} طلبات نشطة تفتقد خطة متابعة كاملة ومسجلة.`,
      },
      qualificationGap: {
        title: (field) => `استكمال حقل ${field}`,
        body: (count) =>
          `${count} طلبات نشطة حديثة تفتقد هذا الحقل المنظم للتأهيل.`,
      },
      missingOutcome: {
        title: 'استكمال نتائج الطلبات المغلقة',
        body: (count) => `${count} طلبات مغلقة حديثة تفتقد نتيجة كاملة ومسجلة.`,
      },
      attributionGap: {
        title: (field) => `تحسين تغطية ${field} المسجلة`,
        body: (count) =>
          `${count} طلبات ضمن فترة آخر 30 يومًا تفتقد هذا الحقل المحفوظ للإسناد.`,
      },
    },
  },
};

export function getAiOperationsBriefCopy(
  locale: Locale,
): AiOperationsBriefCopy {
  return COPY[locale];
}

export function getAiOperationsBriefItemText(
  copy: AiOperationsBriefCopy,
  item: AiOperationsBriefItem,
  count: string,
): { title: string; body: string } {
  if (item.kind === 'unassigned') {
    return {
      title: copy.items.unassigned.title,
      body: copy.items.unassigned.body(count),
    };
  }
  if (item.kind === 'pastDueFollowUp') {
    return {
      title: copy.items.pastDueFollowUp.title,
      body: copy.items.pastDueFollowUp.body(count),
    };
  }
  if (item.kind === 'missingFollowUpPlan') {
    return {
      title: copy.items.missingFollowUpPlan.title,
      body: copy.items.missingFollowUpPlan.body(count),
    };
  }
  if (item.kind === 'qualificationGap' && item.qualificationGap) {
    return {
      title: copy.items.qualificationGap.title(
        copy.qualificationLabels[item.qualificationGap],
      ),
      body: copy.items.qualificationGap.body(count),
    };
  }
  if (item.kind === 'attributionGap' && item.attributionGap) {
    return {
      title: copy.items.attributionGap.title(
        copy.attributionLabels[item.attributionGap],
      ),
      body: copy.items.attributionGap.body(count),
    };
  }

  return {
    title: copy.items.missingOutcome.title,
    body: copy.items.missingOutcome.body(count),
  };
}
