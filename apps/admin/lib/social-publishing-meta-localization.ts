import type { Locale } from '@luminol/localization';

export type SocialPublishingMetaCopy = {
  providerHeading: string;
  providerReady: string;
  providerOff: string;
  providerMisconfigured: string;
  credentialsBoundary: string;
  execute: string;
  executeHelp: string;
  instagramOnly: string;
};

const english: SocialPublishingMetaCopy = {
  providerHeading: 'Meta publishing provider',
  providerReady:
    'Instagram Reels provider is configured. Publishing remains manual and approval-bound.',
  providerOff:
    'External Meta publishing is off. Planning and review remain available without provider calls.',
  providerMisconfigured:
    'Meta publishing was enabled but the server configuration is incomplete or invalid.',
  credentialsBoundary:
    'Meta credentials stay server-side and are never stored in publishing records or displayed in this workspace.',
  execute: 'Execute Instagram Reel manually',
  executeHelp:
    'This is an explicit external side effect. The executor revalidates the approved proposal, exact content revision and destination before each provider phase.',
  instagramOnly:
    'Live provider execution currently supports Instagram Reels only. Facebook remains disabled until its upload checkpoints can be represented safely.',
};

const french: SocialPublishingMetaCopy = {
  providerHeading: 'Fournisseur de publication Meta',
  providerReady:
    'Le fournisseur Instagram Reels est configuré. La publication reste manuelle et liée à une approbation.',
  providerOff:
    'La publication externe Meta est désactivée. La planification et la revue restent disponibles sans appel fournisseur.',
  providerMisconfigured:
    'La publication Meta a été activée mais la configuration serveur est incomplète ou invalide.',
  credentialsBoundary:
    'Les identifiants Meta restent côté serveur et ne sont jamais stockés dans les enregistrements de publication ni affichés dans cet espace.',
  execute: 'Exécuter manuellement le Reel Instagram',
  executeHelp:
    'Cette action produit un effet externe explicite. L’exécuteur revalide la proposition approuvée, la révision exacte du contenu et la destination avant chaque phase fournisseur.',
  instagramOnly:
    'L’exécution fournisseur en direct prend actuellement en charge uniquement les Reels Instagram. Facebook reste désactivé jusqu’à ce que ses étapes de téléversement puissent être représentées de manière sûre.',
};

const arabic: SocialPublishingMetaCopy = {
  providerHeading: 'مزوّد النشر عبر Meta',
  providerReady:
    'تم إعداد مزوّد Reels على إنستغرام. يبقى النشر يدوياً ومرتبطاً بالموافقة.',
  providerOff:
    'النشر الخارجي عبر Meta معطّل. تبقى المراجعة والتخطيط متاحين من دون أي اتصال بالمزوّد.',
  providerMisconfigured:
    'تم تفعيل نشر Meta لكن إعدادات الخادم غير مكتملة أو غير صالحة.',
  credentialsBoundary:
    'تبقى بيانات اعتماد Meta على الخادم فقط ولا تُخزَّن في سجلات النشر ولا تُعرض في مساحة العمل هذه.',
  execute: 'تنفيذ نشر Reel على إنستغرام يدوياً',
  executeHelp:
    'هذا الإجراء يسبب أثراً خارجياً صريحاً. يعيد المنفّذ التحقق من الاقتراح المعتمد ونسخة المحتوى الدقيقة والوجهة قبل كل مرحلة لدى المزوّد.',
  instagramOnly:
    'التنفيذ المباشر يدعم حالياً Reels على إنستغرام فقط. يبقى فيسبوك معطلاً إلى أن يمكن تمثيل مراحل الرفع الخاصة به بنقاط تحقق آمنة.',
};

export function getSocialPublishingMetaCopy(
  locale: Locale,
): SocialPublishingMetaCopy {
  if (locale === 'fr') return french;
  if (locale === 'ar') return arabic;
  return english;
}
