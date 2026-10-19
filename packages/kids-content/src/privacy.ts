/**
 * The privacy policy shown in the parent area. The same policy is published
 * on the website (apps/web/lib/noor-privacy.ts) for the store listing and in
 * docs/kids/PRIVACY_POLICY.md; keep all three in step.
 */
export const PRIVACY_POLICY_UPDATED = '2026-10-20';

export const PRIVACY_POLICY: readonly { heading: string; body: string }[] = [
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
];

/**
 * Credit for the ARASAAC pictograms on the communication board, which their
 * Creative Commons BY-NC-SA licence requires wherever they are shown. The
 * English line is ARASAAC's own wording.
 */
export const MEDIA_CREDITS = {
  heading: 'حقوق الصور',
  body: 'بعض رموز لوحة الكلام من ARASAAC (https://arasaac.org)، من تصميم سيرجيو بالاو، وهي ملك لحكومة أراغون (إسبانيا)، وتُوزَّع برخصة المشاع الإبداعي BY-NC-SA 4.0. باقي الصور من إعداد فريق لومينول.',
  original:
    'The pictographic symbols used are the property of the Government of Aragón and have been created by Sergio Palao for ARASAAC (https://arasaac.org), that distribute them under Creative Commons License BY-NC-SA.',
} as const;
