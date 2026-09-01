import type { Locale } from '@luminol/localization';

export type AiOperatorProposalQueueCopy = {
  eyebrow: string;
  title: string;
  navLabel: string;
  intro: string;
  back: string;
  pending: string;
  approved: string;
  rejected: string;
  cancelled: string;
  recent: string;
  proposal: string;
  policy: string;
  source: string;
  target: string;
  payload: string;
  proposedBy: string;
  decidedBy: string;
  created: string;
  decided: string;
  exactEnvelope: string;
  auditHistory: string;
  approve: string;
  reject: string;
  rejectionNote: string;
  rejectionPlaceholder: string;
  noProposals: string;
  invalidEnvelope: string;
  noActor: string;
  pendingOnly: string;
  noExecution: string;
  readinessTitle: string;
  readinessIntro: string;
  readinessPassed: string;
  readinessFailed: string;
  readinessCheck: {
    envelopeValid: string;
    metadataMatches: string;
    approvalState: string;
    policyRegistered: string;
  };
  readinessStatus: Record<
    | 'READY_FOR_EXECUTOR'
    | 'NOT_APPROVED'
    | 'INVALID_ENVELOPE'
    | 'METADATA_MISMATCH',
    string
  >;
  statusLabel: Record<
    'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
    string
  >;
  kindLabel: Record<
    | 'UPDATE_ENQUIRY_WORKFLOW'
    | 'SEND_OUTBOUND_MESSAGE'
    | 'PUBLISH_SOCIAL_CONTENT',
    string
  >;
};

const COPY: Record<Locale, AiOperatorProposalQueueCopy> = {
  en: {
    eyebrow: 'Luminol AI Operator',
    title: 'Proposal & Approval Queue',
    navLabel: 'AI approval queue',
    intro:
      'Review validated approval-required actions before any future side effect. Approval here changes proposal state only; it does not update CRM records, send messages, or publish social content.',
    back: 'Back to operations',
    pending: 'Pending approval',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    recent: 'recent proposals',
    proposal: 'Proposal',
    policy: 'Execution policy',
    source: 'Source',
    target: 'Target',
    payload: 'Payload summary',
    proposedBy: 'Proposed by',
    decidedBy: 'Decided by',
    created: 'Created',
    decided: 'Decision time',
    exactEnvelope: 'Inspect exact validated action envelope',
    auditHistory: 'Audit history',
    approve: 'Approve proposal',
    reject: 'Reject proposal',
    rejectionNote: 'Optional rejection note',
    rejectionPlaceholder: 'Bounded operational reason (optional)',
    noProposals: 'No AI Operator proposals have been recorded yet.',
    invalidEnvelope:
      'Stored action envelope failed validation. Decision controls are disabled.',
    noActor: 'System / unavailable actor',
    pendingOnly: 'Only pending proposals can be decided.',
    noExecution:
      'No side effect is executed from this queue in the current release.',
    readinessTitle: 'Execution readiness review',
    readinessIntro:
      'Derived review only. A ready result means the approved proposal is structurally eligible for a future executor; nothing is executed here.',
    readinessPassed: 'Passed',
    readinessFailed: 'Not passed',
    readinessCheck: {
      envelopeValid: 'Stored envelope validates',
      metadataMatches: 'Persisted metadata matches the envelope',
      approvalState: 'Proposal is approved',
      policyRegistered: 'Action remains approval-required in the registry',
    },
    readinessStatus: {
      READY_FOR_EXECUTOR: 'Ready for a future executor',
      NOT_APPROVED: 'Not approved for executor readiness',
      INVALID_ENVELOPE: 'Invalid stored envelope',
      METADATA_MISMATCH: 'Envelope or registry metadata mismatch',
    },
    statusLabel: {
      PENDING_APPROVAL: 'Pending approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
    },
    kindLabel: {
      UPDATE_ENQUIRY_WORKFLOW: 'CRM workflow update',
      SEND_OUTBOUND_MESSAGE: 'Outbound message',
      PUBLISH_SOCIAL_CONTENT: 'Social content publish',
    },
  },
  fr: {
    eyebrow: 'Luminol AI Operator',
    title: 'File de propositions et d’approbation',
    navLabel: 'File d’approbation IA',
    intro:
      'Examinez les actions validées nécessitant une approbation avant tout futur effet externe. L’approbation ici ne change que l’état de la proposition : elle ne modifie pas le CRM, n’envoie aucun message et ne publie aucun contenu social.',
    back: 'Retour aux opérations',
    pending: 'En attente d’approbation',
    approved: 'Approuvées',
    rejected: 'Rejetées',
    cancelled: 'Annulées',
    recent: 'propositions récentes',
    proposal: 'Proposition',
    policy: 'Politique d’exécution',
    source: 'Source',
    target: 'Cible',
    payload: 'Résumé de la charge utile',
    proposedBy: 'Proposée par',
    decidedBy: 'Décidée par',
    created: 'Créée',
    decided: 'Heure de décision',
    exactEnvelope: 'Inspecter l’enveloppe d’action validée exacte',
    auditHistory: 'Historique d’audit',
    approve: 'Approuver la proposition',
    reject: 'Rejeter la proposition',
    rejectionNote: 'Note de rejet facultative',
    rejectionPlaceholder: 'Motif opérationnel limité (facultatif)',
    noProposals: 'Aucune proposition AI Operator n’a encore été enregistrée.',
    invalidEnvelope:
      'L’enveloppe d’action enregistrée a échoué à la validation. Les contrôles de décision sont désactivés.',
    noActor: 'Système / acteur indisponible',
    pendingOnly: 'Seules les propositions en attente peuvent être décidées.',
    noExecution:
      'Aucun effet externe n’est exécuté depuis cette file dans la version actuelle.',
    readinessTitle: 'Revue de préparation à l’exécution',
    readinessIntro:
      'Revue dérivée uniquement. Un résultat prêt signifie que la proposition approuvée est structurellement admissible à un futur exécuteur ; rien n’est exécuté ici.',
    readinessPassed: 'Validé',
    readinessFailed: 'Non validé',
    readinessCheck: {
      envelopeValid: 'L’enveloppe enregistrée est valide',
      metadataMatches: 'Les métadonnées enregistrées correspondent à l’enveloppe',
      approvalState: 'La proposition est approuvée',
      policyRegistered: 'L’action reste soumise à approbation dans le registre',
    },
    readinessStatus: {
      READY_FOR_EXECUTOR: 'Prête pour un futur exécuteur',
      NOT_APPROVED: 'Non approuvée pour la préparation à l’exécution',
      INVALID_ENVELOPE: 'Enveloppe enregistrée invalide',
      METADATA_MISMATCH: 'Incohérence entre enveloppe, métadonnées ou registre',
    },
    statusLabel: {
      PENDING_APPROVAL: 'En attente d’approbation',
      APPROVED: 'Approuvée',
      REJECTED: 'Rejetée',
      CANCELLED: 'Annulée',
    },
    kindLabel: {
      UPDATE_ENQUIRY_WORKFLOW: 'Mise à jour du flux CRM',
      SEND_OUTBOUND_MESSAGE: 'Message sortant',
      PUBLISH_SOCIAL_CONTENT: 'Publication de contenu social',
    },
  },
  ar: {
    eyebrow: 'Luminol AI Operator',
    title: 'قائمة المقترحات والموافقات',
    navLabel: 'قائمة موافقات المشغّل الذكي',
    intro:
      'راجع الإجراءات التي تم التحقق منها وتتطلب موافقة قبل أي تأثير جانبي مستقبلي. الموافقة هنا تغيّر حالة المقترح فقط، ولا تعدّل سجلات CRM ولا ترسل رسائل ولا تنشر محتوى على الشبكات الاجتماعية.',
    back: 'العودة إلى العمليات',
    pending: 'بانتظار الموافقة',
    approved: 'تمت الموافقة',
    rejected: 'مرفوضة',
    cancelled: 'ملغاة',
    recent: 'مقترحات حديثة',
    proposal: 'المقترح',
    policy: 'سياسة التنفيذ',
    source: 'المصدر',
    target: 'الهدف',
    payload: 'ملخص الحمولة',
    proposedBy: 'اقترحه',
    decidedBy: 'اتخذ القرار',
    created: 'تاريخ الإنشاء',
    decided: 'وقت القرار',
    exactEnvelope: 'عرض غلاف الإجراء المتحقق منه بالكامل',
    auditHistory: 'سجل التدقيق',
    approve: 'الموافقة على المقترح',
    reject: 'رفض المقترح',
    rejectionNote: 'ملاحظة رفض اختيارية',
    rejectionPlaceholder: 'سبب تشغيلي مختصر (اختياري)',
    noProposals: 'لم يتم تسجيل أي مقترحات للمشغّل الذكي بعد.',
    invalidEnvelope:
      'فشل التحقق من غلاف الإجراء المخزّن. تم تعطيل أزرار القرار.',
    noActor: 'النظام / منفّذ غير متاح',
    pendingOnly: 'يمكن اتخاذ القرار فقط للمقترحات المعلّقة.',
    noExecution:
      'لا يتم تنفيذ أي تأثير جانبي من هذه القائمة في الإصدار الحالي.',
    readinessTitle: 'مراجعة الجاهزية للتنفيذ',
    readinessIntro:
      'هذه مراجعة مشتقة فقط. تعني حالة الجاهزية أن المقترح الموافق عليه مؤهل بنيوياً لمنفّذ مستقبلي، ولا يتم تنفيذ أي إجراء هنا.',
    readinessPassed: 'تم التحقق',
    readinessFailed: 'لم يتم التحقق',
    readinessCheck: {
      envelopeValid: 'غلاف الإجراء المخزّن صالح',
      metadataMatches: 'البيانات الوصفية المخزّنة تطابق الغلاف',
      approvalState: 'تمت الموافقة على المقترح',
      policyRegistered: 'ما يزال الإجراء يتطلب موافقة في السجل',
    },
    readinessStatus: {
      READY_FOR_EXECUTOR: 'جاهز لمنفّذ مستقبلي',
      NOT_APPROVED: 'غير موافق عليه للجاهزية للتنفيذ',
      INVALID_ENVELOPE: 'غلاف الإجراء المخزّن غير صالح',
      METADATA_MISMATCH: 'عدم تطابق بين الغلاف أو البيانات الوصفية أو السجل',
    },
    statusLabel: {
      PENDING_APPROVAL: 'بانتظار الموافقة',
      APPROVED: 'تمت الموافقة',
      REJECTED: 'مرفوضة',
      CANCELLED: 'ملغاة',
    },
    kindLabel: {
      UPDATE_ENQUIRY_WORKFLOW: 'تحديث سير عمل CRM',
      SEND_OUTBOUND_MESSAGE: 'رسالة صادرة',
      PUBLISH_SOCIAL_CONTENT: 'نشر محتوى اجتماعي',
    },
  },
};

export function getAiOperatorProposalQueueCopy(
  locale: Locale,
): AiOperatorProposalQueueCopy {
  return COPY[locale];
}
