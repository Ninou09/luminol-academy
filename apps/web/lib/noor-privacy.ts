import type { Locale } from '@luminol/localization';

/**
 * The Luminol Noor app's privacy policy, linked from its Google Play
 * listing. The app shows the same Arabic text in its parent area
 * (packages/kids-content/src/privacy.ts); keep them in step.
 */
export const NOOR_PRIVACY_PATH = '/noor/privacy';
export const NOOR_PRIVACY_UPDATED = '2026-10-20';

type PolicyCopy = {
  title: string;
  updated: string;
  intro: string;
  sections: readonly { heading: string; body: string }[];
};

export const NOOR_PRIVACY: Record<Locale, PolicyCopy> = {
  en: {
    title: 'Luminol Noor privacy policy',
    updated: 'Last updated',
    intro:
      'Luminol Noor is an Arabic learning and communication app for children aged 3 to 10, made by Luminol Academy.',
    sections: [
      {
        heading: 'In short',
        body: "Luminol Noor needs no account, shows no ads and uses no analytics or tracking tools. Your child's data stays on the device, encrypted.",
      },
      {
        heading: 'What is stored on the device',
        body: 'The nickname, approximate age and settings; game results, sessions and goals; the communication board, routines and stories. They are kept in an encrypted database on the device only and are never sent to us.',
      },
      {
        heading: 'Photos and recordings',
        body: 'The app only uses the camera, microphone or photo library when you add a photo or a recording in the parent area. They stay on the device, are deleted with the card or the profile, and have location data removed.',
      },
      {
        heading: 'Completely free',
        body: 'The app is completely free, with no subscription, no purchases and no in-app payment of any kind. The app connects to no server, and no data ever leaves your device.',
      },
      {
        heading: 'Sharing',
        body: "We do not share your child's data with anyone. The progress report and data export only leave the device when you choose to share them, with whoever you choose.",
      },
      {
        heading: 'Deletion',
        body: "You can clear the progress history or delete a child's profile at any time in the parent area; everything belonging to that profile is deleted with it. Uninstalling the app deletes all of its data from the device.",
      },
      {
        heading: 'Children',
        body: "The app is designed for children with a parent's supervision. The parent area and external links are behind a question only an adult can answer.",
      },
      {
        heading: 'Contact',
        body: "For any privacy question, email the developer address shown on the app's Google Play page.",
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité de Luminol Noor',
    updated: 'Dernière mise à jour',
    intro:
      'Luminol Noor est une application arabe d’apprentissage et de communication pour les enfants de 3 à 10 ans, créée par Luminol Academy.',
    sections: [
      {
        heading: 'En bref',
        body: 'Luminol Noor ne demande aucun compte, n’affiche aucune publicité et n’utilise aucun outil d’analyse ou de suivi. Les données de votre enfant restent sur l’appareil, chiffrées.',
      },
      {
        heading: 'Ce qui est conservé sur l’appareil',
        body: 'Le surnom, l’âge approximatif et les réglages ; les résultats des jeux, les séances et les objectifs ; le tableau de communication, les routines et les histoires. Ils sont conservés dans une base de données chiffrée, uniquement sur l’appareil, et ne nous sont jamais envoyés.',
      },
      {
        heading: 'Photos et enregistrements',
        body: 'L’application n’utilise l’appareil photo, le micro ou la photothèque que lorsque vous ajoutez une photo ou un enregistrement dans l’espace parents. Ils restent sur l’appareil, sont supprimés avec la carte ou le profil, et leurs données de localisation sont retirées.',
      },
      {
        heading: 'Entièrement gratuit',
        body: 'L’application est entièrement gratuite, sans abonnement, sans achat et sans aucun paiement intégré. L’application ne se connecte à aucun serveur, et aucune donnée ne quitte votre appareil.',
      },
      {
        heading: 'Partage',
        body: 'Nous ne partageons les données de votre enfant avec personne. Le rapport de progrès et l’export des données ne quittent l’appareil que si vous choisissez de les partager, avec la personne de votre choix.',
      },
      {
        heading: 'Suppression',
        body: 'Vous pouvez effacer l’historique des progrès ou supprimer le profil d’un enfant à tout moment dans l’espace parents ; tout ce qui appartient à ce profil est supprimé avec lui. Désinstaller l’application supprime toutes ses données de l’appareil.',
      },
      {
        heading: 'Enfants',
        body: 'L’application est conçue pour les enfants, sous la supervision d’un parent. L’espace parents et les liens externes sont protégés par une question à laquelle seul un adulte peut répondre.',
      },
      {
        heading: 'Contact',
        body: 'Pour toute question de confidentialité, écrivez à l’adresse du développeur indiquée sur la page de l’application sur Google Play.',
      },
    ],
  },
  ar: {
    title: 'سياسة خصوصية لومينول نور',
    updated: 'آخر تحديث',
    intro:
      'لومينول نور تطبيق عربي للتعلّم والتواصل للأطفال من 3 إلى 10 سنوات، من أكاديمية لومينول.',
    sections: [
      {
        heading: 'باختصار',
        body: 'لومينول نور لا يطلب حسابًا، ولا يعرض إعلانات، ولا يستخدم أي أدوات تحليل أو تتبّع. تبقى بيانات طفلك على هذا الجهاز ومشفّرة.',
      },
      {
        heading: 'ما نحفظه على الجهاز',
        body: 'الاسم المستعار والعمر التقريبي والإعدادات، ونتائج الألعاب والجلسات والأهداف، ولوحة الكلام والروتين والقصص. تُحفظ في قاعدة بيانات مشفّرة على هذا الجهاز فقط، ولا تُرسَل إلينا.',
      },
      {
        heading: 'الصور والتسجيلات',
        body: 'لا يستخدم التطبيق الكاميرا أو الميكروفون أو الصور إلا عندما تضيف أنت صورة أو تسجيلًا في منطقة الوالدين. تُحفظ على هذا الجهاز وتُحذف مع البطاقة أو الملف، وتُزال منها بيانات الموقع.',
      },
      {
        heading: 'مجاني بالكامل',
        body: 'التطبيق مجاني بالكامل، بلا اشتراك ولا مشتريات ولا أي دفع داخل التطبيق. لا يتّصل التطبيق بأي خادم، ولا تغادر أي بيانات جهازك.',
      },
      {
        heading: 'المشاركة',
        body: 'لا نشارك بيانات طفلك مع أحد. التقرير والتصدير لا يغادران الجهاز إلا عندما تختار أنت مشاركتهما، وإلى الجهة التي تختارها.',
      },
      {
        heading: 'الحذف',
        body: 'يمكنك مسح سجلّ التقدّم أو حذف ملف الطفل في أي وقت من منطقة الوالدين، ويُحذف معه كل ما يخصّه. حذف التطبيق يحذف كل البيانات من الجهاز.',
      },
      {
        heading: 'الأطفال',
        body: 'صُمّم التطبيق للأطفال بإشراف الوالدين. منطقة الوالدين والروابط الخارجية محميّة بسؤال للوالدين.',
      },
      {
        heading: 'التواصل',
        body: 'لأي سؤال عن الخصوصية، راسلنا على بريد المطوّر المذكور في صفحة التطبيق على Google Play.',
      },
    ],
  },
};

/** The update date as dd/mm/yyyy, the same in every language. */
export function formatPolicyDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}
