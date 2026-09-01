import type { Locale } from '@luminol/localization';

export type AiProviderCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  operatorQueue: string;
  mode: string;
  model: string;
  monthlyBudget: string;
  spent: string;
  remaining: string;
  requests: string;
  tokens: string;
  inputTokens: string;
  outputTokens: string;
  succeeded: string;
  failed: string;
  blocked: string;
  budgetStatus: string;
  warning: Record<'BELOW_50' | 'AT_50' | 'AT_80' | 'EXHAUSTED', string>;
  runTitle: string;
  summaryTitle: string;
  summaryIntro: string;
  summaryAction: string;
  recommendationsTitle: string;
  recommendationsIntro: string;
  recommendationsAction: string;
  campaignAnalysisTitle: string;
  campaignAnalysisIntro: string;
  campaignAnalysisAction: string;
  running: string;
  advisoryLabel: string;
  noSideEffects: string;
  blockedResult: string;
  failedResult: string;
  recentFailures: string;
  noFailures: string;
  task: string;
  errorCode: string;
  occurredAt: string;
  privacy: string;
  modeDescription: Record<'OFF' | 'OPENAI', string>;
  taskLabel: Record<
    | 'SUMMARIZE_OPERATIONAL_STATE'
    | 'DRAFT_OPERATOR_RECOMMENDATIONS'
    | 'ANALYZE_CAMPAIGN_METRICS',
    string
  >;
};

const COPY: Record<Locale, AiProviderCopy> = {
  en: {
    eyebrow: 'Luminol AI Operator',
    title: 'AI Provider Gateway',
    intro:
      'A cost-controlled, server-only reasoning gateway. Deterministic CRM, KPI, workflow, content and approval logic continues to work without any AI call.',
    back: 'Back to operations',
    operatorQueue: 'Operator approval queue',
    mode: 'Provider mode',
    model: 'Configured model',
    monthlyBudget: 'Monthly ceiling',
    spent: 'Estimated spend',
    remaining: 'Remaining allowance',
    requests: 'Gateway attempts',
    tokens: 'Recorded tokens',
    inputTokens: 'input',
    outputTokens: 'output',
    succeeded: 'Succeeded',
    failed: 'Failed',
    blocked: 'Blocked',
    budgetStatus: 'Budget status',
    warning: {
      BELOW_50: 'Below 50% of the monthly ceiling',
      AT_50: 'At least 50% of the monthly ceiling used',
      AT_80: 'At least 80% of the monthly ceiling used',
      EXHAUSTED: 'Monthly allowance exhausted or disabled',
    },
    runTitle: 'Bounded AI advisory workspace',
    summaryTitle: 'Operational summary',
    summaryIntro:
      'Summarizes aggregate workflow and coverage counts only. No enquiry messages, therapy-client text, credentials or personal records are sent.',
    summaryAction: 'Run operational summary',
    recommendationsTitle: 'Operator recommendations',
    recommendationsIntro:
      'Drafts bounded operational recommendations from aggregate queue, follow-up, outcome and workflow coverage metrics. Recommendations remain advisory.',
    recommendationsAction: 'Draft recommendations',
    campaignAnalysisTitle: 'Campaign metric analysis',
    campaignAnalysisIntro:
      'Analyzes aggregate 30-day campaign and attribution counts only. Campaign labels, personal records and free text are not sent.',
    campaignAnalysisAction: 'Analyze campaign metrics',
    running: 'Running…',
    advisoryLabel: 'Advisory AI output',
    noSideEffects:
      'These outputs cannot mutate CRM data, send messages, approve actions or publish social content.',
    blockedResult: 'The reasoning request was blocked by the gateway policy.',
    failedResult: 'The provider request failed closed.',
    recentFailures: 'Recent blocked or failed attempts',
    noFailures: 'No recent blocked or failed attempts this month.',
    task: 'Task',
    errorCode: 'Safe error code',
    occurredAt: 'Time',
    privacy:
      'Usage records contain provider mode, model, task class, bounded outcome/error codes, token counts, estimated cost and latency only. Prompts, outputs and API keys are not stored in the usage ledger.',
    modeDescription: {
      OFF: 'OFF — zero external AI requests are allowed.',
      OPENAI:
        'OPENAI — external reasoning is enabled only through server environment configuration.',
    },
    taskLabel: {
      SUMMARIZE_OPERATIONAL_STATE: 'Summarize operational state',
      DRAFT_OPERATOR_RECOMMENDATIONS: 'Draft operator recommendations',
      ANALYZE_CAMPAIGN_METRICS: 'Analyze campaign metrics',
    },
  },
  fr: {
    eyebrow: 'Luminol AI Operator',
    title: 'Passerelle fournisseur IA',
    intro:
      'Une passerelle de raisonnement côté serveur avec contrôle des coûts. Les règles déterministes du CRM, des KPI, des workflows, du contenu et des approbations continuent de fonctionner sans appel IA.',
    back: 'Retour aux opérations',
    operatorQueue: 'File d’approbation Operator',
    mode: 'Mode fournisseur',
    model: 'Modèle configuré',
    monthlyBudget: 'Plafond mensuel',
    spent: 'Dépense estimée',
    remaining: 'Budget restant',
    requests: 'Tentatives de passerelle',
    tokens: 'Tokens enregistrés',
    inputTokens: 'entrée',
    outputTokens: 'sortie',
    succeeded: 'Réussies',
    failed: 'Échouées',
    blocked: 'Bloquées',
    budgetStatus: 'État du budget',
    warning: {
      BELOW_50: 'Moins de 50 % du plafond mensuel utilisé',
      AT_50: 'Au moins 50 % du plafond mensuel utilisé',
      AT_80: 'Au moins 80 % du plafond mensuel utilisé',
      EXHAUSTED: 'Budget mensuel épuisé ou désactivé',
    },
    runTitle: 'Espace consultatif IA borné',
    summaryTitle: 'Résumé opérationnel',
    summaryIntro:
      'Résume uniquement des compteurs agrégés de workflow et de couverture. Aucun message de demande, texte client, identifiant ou dossier personnel n’est envoyé.',
    summaryAction: 'Lancer le résumé opérationnel',
    recommendationsTitle: 'Recommandations Operator',
    recommendationsIntro:
      'Propose des recommandations opérationnelles bornées à partir de métriques agrégées de file, suivi, résultats et couverture. Elles restent consultatives.',
    recommendationsAction: 'Proposer des recommandations',
    campaignAnalysisTitle: 'Analyse des métriques de campagne',
    campaignAnalysisIntro:
      'Analyse uniquement des compteurs agrégés de campagne et d’attribution sur 30 jours. Les libellés de campagne, dossiers personnels et textes libres ne sont pas envoyés.',
    campaignAnalysisAction: 'Analyser les métriques de campagne',
    running: 'Exécution…',
    advisoryLabel: 'Sortie IA consultative',
    noSideEffects:
      'Ces sorties ne peuvent ni modifier le CRM, ni envoyer de message, ni approuver une action, ni publier sur les réseaux sociaux.',
    blockedResult:
      'La demande de raisonnement a été bloquée par la politique de la passerelle.',
    failedResult: 'La demande fournisseur a échoué en mode fermé.',
    recentFailures: 'Tentatives bloquées ou échouées récentes',
    noFailures: 'Aucune tentative bloquée ou échouée récente ce mois-ci.',
    task: 'Tâche',
    errorCode: 'Code d’erreur sûr',
    occurredAt: 'Heure',
    privacy:
      'Le registre conserve uniquement le mode, le modèle, la classe de tâche, des résultats/codes bornés, les tokens, le coût estimé et la latence. Les prompts, sorties et clés API ne sont pas stockés.',
    modeDescription: {
      OFF: 'OFF — aucun appel IA externe n’est autorisé.',
      OPENAI:
        'OPENAI — le raisonnement externe est activé uniquement par configuration serveur.',
    },
    taskLabel: {
      SUMMARIZE_OPERATIONAL_STATE: 'Résumer l’état opérationnel',
      DRAFT_OPERATOR_RECOMMENDATIONS: 'Proposer des recommandations Operator',
      ANALYZE_CAMPAIGN_METRICS: 'Analyser les métriques de campagne',
    },
  },
  ar: {
    eyebrow: 'Luminol AI Operator',
    title: 'بوابة مزود الذكاء الاصطناعي',
    intro:
      'بوابة استدلال تعمل على الخادم مع ضبط للتكلفة. تبقى قواعد CRM والمؤشرات وسير العمل والمحتوى والموافقات الحتمية فعالة من دون أي اتصال بالذكاء الاصطناعي.',
    back: 'العودة إلى العمليات',
    operatorQueue: 'قائمة موافقات Operator',
    mode: 'وضع المزود',
    model: 'النموذج المضبوط',
    monthlyBudget: 'السقف الشهري',
    spent: 'الإنفاق التقديري',
    remaining: 'الرصيد المتبقي',
    requests: 'محاولات البوابة',
    tokens: 'الرموز المسجلة',
    inputTokens: 'إدخال',
    outputTokens: 'إخراج',
    succeeded: 'ناجحة',
    failed: 'فاشلة',
    blocked: 'محظورة',
    budgetStatus: 'حالة الميزانية',
    warning: {
      BELOW_50: 'تم استخدام أقل من 50٪ من السقف الشهري',
      AT_50: 'تم استخدام 50٪ على الأقل من السقف الشهري',
      AT_80: 'تم استخدام 80٪ على الأقل من السقف الشهري',
      EXHAUSTED: 'تم استنفاد الرصيد الشهري أو تعطيله',
    },
    runTitle: 'مساحة استشارية محدودة للذكاء الاصطناعي',
    summaryTitle: 'الملخص التشغيلي',
    summaryIntro:
      'يلخص فقط أرقام سير العمل والتغطية المجمعة. لا يتم إرسال رسائل الاستفسارات أو نصوص العملاء أو بيانات الاعتماد أو السجلات الشخصية.',
    summaryAction: 'تشغيل الملخص التشغيلي',
    recommendationsTitle: 'توصيات Operator',
    recommendationsIntro:
      'يصيغ توصيات تشغيلية محدودة من مؤشرات مجمعة لقائمة العمل والمتابعة والنتائج والتغطية. تبقى التوصيات استشارية فقط.',
    recommendationsAction: 'صياغة التوصيات',
    campaignAnalysisTitle: 'تحليل مؤشرات الحملات',
    campaignAnalysisIntro:
      'يحلل فقط أرقام الحملات والإسناد المجمعة لآخر 30 يوماً. لا يتم إرسال أسماء الحملات أو السجلات الشخصية أو النصوص الحرة.',
    campaignAnalysisAction: 'تحليل مؤشرات الحملات',
    running: 'جارٍ التشغيل…',
    advisoryLabel: 'مخرجات ذكاء اصطناعي استشارية',
    noSideEffects:
      'لا تستطيع هذه المخرجات تعديل CRM أو إرسال رسائل أو اعتماد إجراءات أو نشر محتوى على الشبكات الاجتماعية.',
    blockedResult: 'تم حظر طلب الاستدلال وفق سياسة البوابة.',
    failedResult: 'فشل طلب المزود بشكل مغلق وآمن.',
    recentFailures: 'المحاولات المحظورة أو الفاشلة الأخيرة',
    noFailures: 'لا توجد محاولات محظورة أو فاشلة حديثة هذا الشهر.',
    task: 'المهمة',
    errorCode: 'رمز خطأ آمن',
    occurredAt: 'الوقت',
    privacy:
      'يحفظ سجل الاستخدام وضع المزود والنموذج ونوع المهمة والنتيجة ورموز الخطأ المحدودة وعدد الرموز والتكلفة التقديرية وزمن الاستجابة فقط. لا يتم حفظ المطالبات أو المخرجات أو مفاتيح API.',
    modeDescription: {
      OFF: 'OFF — لا يُسمح بأي طلب خارجي للذكاء الاصطناعي.',
      OPENAI: 'OPENAI — يُفعّل الاستدلال الخارجي فقط عبر إعدادات الخادم.',
    },
    taskLabel: {
      SUMMARIZE_OPERATIONAL_STATE: 'تلخيص الحالة التشغيلية',
      DRAFT_OPERATOR_RECOMMENDATIONS: 'صياغة توصيات Operator',
      ANALYZE_CAMPAIGN_METRICS: 'تحليل مؤشرات الحملات',
    },
  },
};

export function getAiProviderCopy(locale: Locale) {
  return COPY[locale];
}
