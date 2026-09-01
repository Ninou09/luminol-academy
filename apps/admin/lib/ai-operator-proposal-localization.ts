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
  executed: string;
  recent: string;
  proposal: string;
  policy: string;
  source: string;
  target: string;
  payload: string;
  proposedBy: string;
  decidedBy: string;
  executedBy: string;
  created: string;
  decided: string;
  executionTime: string;
  exactEnvelope: string;
  auditHistory: string;
  approve: string;
  reject: string;
  execute: string;
  rejectionNote: string;
  rejectionPlaceholder: string;
  noProposals: string;
  invalidEnvelope: string;
  noActor: string;
  pendingOnly: string;
  noExecution: string;
  executionTitle: string;
  executionIntro: string;
  executionUnavailable: string;
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
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'EXECUTED',
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
      'Review validated approval-required actions before any side effect. Approval changes proposal state only. A separate controlled executor can apply an approved CRM follow-up action after readiness checks; messaging and social publishing remain disabled.',
    back: 'Back to operations',
    pending: 'Pending approval',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    executed: 'Executed',
    recent: 'recent proposals',
    proposal: 'Proposal',
    policy: 'Execution policy',
    source: 'Source',
    target: 'Target',
    payload: 'Payload summary',
    proposedBy: 'Proposed by',
    decidedBy: 'Decided by',
    executedBy: 'Executed by',
    created: 'Created',
    decided: 'Decision time',
    executionTime: 'Execution time',
    exactEnvelope: 'Inspect exact validated action envelope',
    auditHistory: 'Audit history',
    approve: 'Approve proposal',
    reject: 'Reject proposal',
    execute: 'Execute approved follow-up',
    rejectionNote: 'Optional rejection note',
    rejectionPlaceholder: 'Bounded operational reason (optional)',
    noProposals: 'No AI Operator proposals have been recorded yet.',
    invalidEnvelope:
      'Stored action envelope failed validation. Decision and execution controls are disabled.',
    noActor: 'System / unavailable actor',
    pendingOnly: 'Only pending proposals can be decided.',
    noExecution:
      'Controlled execution is limited to explicitly approved, readiness-passing CRM follow-up proposals. Outbound messages and social publishing are not executable here.',
    executionTitle: 'Controlled execution',
    executionIntro:
      'Execution re-checks the exact stored envelope and current readiness, then atomically applies the CRM follow-up plan with audit history. It runs only after an explicit operator action.',
    executionUnavailable:
      'This proposal is not eligible for the controlled CRM follow-up executor.',
    readinessTitle: 'Execution readiness review',
    readinessIntro:
      'A ready result means the approved proposal is structurally eligible for the controlled executor. Readiness alone never performs the action.',
    readinessPassed: 'Passed',
    readinessFailed: 'Not passed',
    readinessCheck: {
      envelopeValid: 'Stored envelope validates',
      metadataMatches: 'Persisted metadata matches the envelope',
      approvalState: 'Proposal is approved',
      policyRegistered: 'Action remains approval-required in the registry',
    },
    readinessStatus: {
      READY_FOR_EXECUTOR: 'Ready for controlled execution',
      NOT_APPROVED: 'Not approved for executor readiness',
      INVALID_ENVELOPE: 'Invalid stored envelope',
      METADATA_MISMATCH: 'Envelope or registry metadata mismatch',
    },
    statusLabel: {
      PENDING_APPROVAL: 'Pending approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
      EXECUTED: 'Executed',
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
      'Examinez les actions validées nécessitant une approbation avant tout effet. L’approbation ne change que l’état de la proposition. Un exécuteur contrôlé distinct peut appliquer un suivi CRM approuvé après les vérifications de préparation ; la messagerie et la publication sociale restent désactivées.',
    back: 'Retour aux opérations',
    pending: 'En attente d’approbation',
    approved: 'Approuvées',
    rejected: 'Rejetées',
    cancelled: 'Annulées',
    executed: 'Exécutées',
    recent: 'propositions récentes',
    proposal: 'Proposition',
    policy: 'Politique d’exécution',
    source: 'Source',
    target: 'Cible',
    payload: 'Résumé de la charge utile',
    proposedBy: 'Proposée par',
    decidedBy: 'Décidée par',
    executedBy: 'Exécutée par',
    created: 'Créée',
    decided: 'Heure de décision',
    executionTime: 'Heure d’exécution',
    exactEnvelope: 'Inspecter l’enveloppe d’action validée exacte',
    auditHistory: 'Historique d’audit',
    approve: 'Approuver la proposition',
    reject: 'Rejeter la proposition',
    execute: 'Exécuter le suivi approuvé',
    rejectionNote: 'Note de rejet facultative',
    rejectionPlaceholder: 'Motif opérationnel limité (facultatif)',
    noProposals: 'Aucune proposition AI Operator n’a encore été enregistrée.',
    invalidEnvelope:
      'L’enveloppe d’action enregistrée a échoué à la validation. Les contrôles de décision et d’exécution sont désactivés.',
    noActor: 'Système / acteur indisponible',
    pendingOnly: 'Seules les propositions en attente peuvent être décidées.',
    noExecution:
      'L’exécution contrôlée est limitée aux suivis CRM explicitement approuvés et validés par la revue de préparation. Les messages sortants et publications sociales ne sont pas exécutables ici.',
    executionTitle: 'Exécution contrôlée',
    executionIntro:
      'L’exécution revérifie l’enveloppe exacte et la préparation actuelle, puis applique atomiquement le suivi CRM avec son historique d’audit. Elle exige une action explicite de l’opérateur.',
    executionUnavailable:
      'Cette proposition n’est pas admissible à l’exécuteur contrôlé de suivi CRM.',
    readinessTitle: 'Revue de préparation à l’exécution',
    readinessIntro:
      'Un résultat prêt signifie que la proposition approuvée est structurellement admissible à l’exécuteur contrôlé. La préparation seule n’exécute jamais l’action.',
    readinessPassed: 'Validé',
    readinessFailed: 'Non validé',
    readinessCheck: {
      envelopeValid: 'L’enveloppe enregistrée est valide',
      metadataMatches:
        'Les métadonnées enregistrées correspondent à l’enveloppe',
      approvalState: 'La proposition est approuvée',
      policyRegistered: 'L’action reste soumise à approbation dans le registre',
    },
    readinessStatus: {
      READY_FOR_EXECUTOR: 'Prête pour l’exécution contrôlée',
      NOT_APPROVED: 'Non approuvée pour la préparation à l’exécution',
      INVALID_ENVELOPE: 'Enveloppe enregistrée invalide',
      METADATA_MISMATCH: 'Incohérence entre enveloppe, métadonnées ou registre',
    },
    statusLabel: {
      PENDING_APPROVAL: 'En attente d’approbation',
      APPROVED: 'Approuvée',
      REJECTED: 'Rejetée',
      CANCELLED: 'Annulée',
      EXECUTED: 'Exécutée',
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
      'راجع الإجراءات التي تم التحقق منها وتتطلب موافقة قبل أي تأثير جانبي. الموافقة تغيّر حالة المقترح فقط. يمكن لمنفّذ مضبوط منفصل تطبيق إجراء متابعة CRM الموافق عليه بعد اجتياز فحوص الجاهزية، بينما يبقى إرسال الرسائل والنشر الاجتماعي معطلاً.',
    back: 'العودة إلى العمليات',
    pending: 'بانتظار الموافقة',
    approved: 'تمت الموافقة',
    rejected: 'مرفوضة',
    cancelled: 'ملغاة',
    executed: 'تم تنفيذها',
    recent: 'مقترحات حديثة',
    proposal: 'المقترح',
    policy: 'سياسة التنفيذ',
    source: 'المصدر',
    target: 'الهدف',
    payload: 'ملخص الحمولة',
    proposedBy: 'اقترحه',
    decidedBy: 'اتخذ القرار',
    executedBy: 'نفّذه',
    created: 'تاريخ الإنشاء',
    decided: 'وقت القرار',
    executionTime: 'وقت التنفيذ',
    exactEnvelope: 'عرض غلاف الإجراء المتحقق منه بالكامل',
    auditHistory: 'سجل التدقيق',
    approve: 'الموافقة على المقترح',
    reject: 'رفض المقترح',
    execute: 'تنفيذ المتابعة الموافق عليها',
    rejectionNote: 'ملاحظة رفض اختيارية',
    rejectionPlaceholder: 'سبب تشغيلي مختصر (اختياري)',
    noProposals: 'لم يتم تسجيل أي مقترحات للمشغّل الذكي بعد.',
    invalidEnvelope:
      'فشل التحقق من غلاف الإجراء المخزّن. تم تعطيل أزرار القرار والتنفيذ.',
    noActor: 'النظام / منفّذ غير متاح',
    pendingOnly: 'يمكن اتخاذ القرار فقط للمقترحات المعلّقة.',
    noExecution:
      'التنفيذ المضبوط محدود بمقترحات متابعة CRM التي تمت الموافقة عليها صراحة واجتازت مراجعة الجاهزية. لا يمكن تنفيذ الرسائل الصادرة أو النشر الاجتماعي من هنا.',
    executionTitle: 'التنفيذ المضبوط',
    executionIntro:
      'يعيد التنفيذ التحقق من غلاف الإجراء المخزّن والجاهزية الحالية، ثم يطبّق خطة متابعة CRM وسجل التدقيق ضمن معاملة ذرية واحدة. ويتطلب إجراءً صريحاً من المشغّل.',
    executionUnavailable:
      'هذا المقترح غير مؤهل لمنفّذ متابعة CRM المضبوط.',
    readinessTitle: 'مراجعة الجاهزية للتنفيذ',
    readinessIntro:
      'تعني حالة الجاهزية أن المقترح الموافق عليه مؤهل بنيوياً للمنفّذ المضبوط. الجاهزية وحدها لا تنفذ أي إجراء.',
    readinessPassed: 'تم التحقق',
    readinessFailed: 'لم يتم التحقق',
    readinessCheck: {
      envelopeValid: 'غلاف الإجراء المخزّن صالح',
      metadataMatches: 'البيانات الوصفية المخزّنة تطابق الغلاف',
      approvalState: 'تمت الموافقة على المقترح',
      policyRegistered: 'ما يزال الإجراء يتطلب موافقة في السجل',
    },
    readinessStatus: {
      READY_FOR_EXECUTOR: 'جاهز للتنفيذ المضبوط',
      NOT_APPROVED: 'غير موافق عليه للجاهزية للتنفيذ',
      INVALID_ENVELOPE: 'غلاف الإجراء المخزّن غير صالح',
      METADATA_MISMATCH: 'عدم تطابق بين الغلاف أو البيانات الوصفية أو السجل',
    },
    statusLabel: {
      PENDING_APPROVAL: 'بانتظار الموافقة',
      APPROVED: 'تمت الموافقة',
      REJECTED: 'مرفوضة',
      CANCELLED: 'ملغاة',
      EXECUTED: 'تم تنفيذها',
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
