import type { Locale } from '@luminol/localization';

export type PrivacySection = { id: string; title: string; body: readonly string[] };

export type PrivacyCopy = {
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  updatedLabel: string;
  updated: string;
  contentsLabel: string;
  contactCta: string;
  linkLabel: string;
  sections: readonly PrivacySection[];
};

/**
 * Describes only what this website actually does: the enquiry form fields,
 * the language cookie, cookie-free analytics and the providers the code uses.
 * Luminol should have it reviewed before relying on it legally.
 */
export const privacyPolicy: Record<Locale, PrivacyCopy> = {
  en: {
    title: 'Privacy policy',
    description:
      'How Luminol Academy collects, uses and protects the personal data you share through this website.',
    eyebrow: 'Privacy policy',
    heroTitle: 'Your trust deserves clear answers.',
    heroBody:
      'This page explains which personal data Luminol Academy receives through this website, why, and the choices you have.',
    updatedLabel: 'Last updated',
    updated: '13 November 2026',
    contentsLabel: 'On this page',
    contactCta: 'Contact Luminol about your data',
    linkLabel: 'Privacy policy',
    sections: [
      {
        id: 'data',
        title: 'What we collect',
        body: [
          'When you send an enquiry we receive the details you enter: your name, your preferred contact method, a phone number or email address, the area you are interested in and, if you choose to add them, your city, delivery and timing preferences and a message.',
          'We also record your consent, the page you started from, the language of the site and campaign tags in the link you followed (for example utm_source). We never ask for medical, financial or identity documents through this form.',
        ],
      },
      {
        id: 'purpose',
        title: 'Why we use it',
        body: [
          'Your details are used only to understand your request, guide you toward the right school or programme and follow up with you using the method you chose.',
          'The legal basis is your consent, given with the checkbox in the form. Your details are not sold and are not used for advertising.',
        ],
      },
      {
        id: 'sharing',
        title: 'Who processes it',
        body: [
          'Your enquiry is stored in Luminol’s database on secure hosting. Confirmation emails are sent through an email delivery provider, and the team may receive an internal notification of a new enquiry through a messaging service.',
          'These providers act only on Luminol’s behalf. Workshop registrations use a separate Tally form, which has its own privacy terms.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and analytics',
        body: [
          'The site uses one functional cookie to remember your language (Arabic, French or English). It does not use advertising or tracking cookies.',
          'Visits are measured with privacy-friendly analytics that work without cookies and give the team aggregated figures only, such as the number of visits to a page.',
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        body: [
          'Enquiry details are kept only as long as needed to respond and follow up, and for the relationship that may follow. After that they are deleted or anonymised.',
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        body: [
          'In line with Algerian Law No. 18-07 on the protection of natural persons in the processing of personal data, you can ask to access, correct or delete your data and you can withdraw your consent at any time.',
          'To do so, write to luminolacademy09@gmail.com or send a request through the contact form. The team will confirm your identity before acting on the request.',
        ],
      },
      {
        id: 'safety',
        title: 'Not an emergency service',
        body: [
          'The enquiry form is not emergency care. If there is an immediate risk of harm or an urgent psychiatric or medical situation, contact local emergency services or qualified medical care.',
        ],
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    description:
      'Comment Luminol Academy collecte, utilise et protège les données personnelles transmises via ce site.',
    eyebrow: 'Politique de confidentialité',
    heroTitle: 'Votre confiance mérite des réponses claires.',
    heroBody:
      'Cette page explique quelles données personnelles Luminol Academy reçoit via ce site, pourquoi, et quels sont vos choix.',
    updatedLabel: 'Dernière mise à jour',
    updated: '13 novembre 2026',
    contentsLabel: 'Sur cette page',
    contactCta: 'Contacter Luminol au sujet de vos données',
    linkLabel: 'Politique de confidentialité',
    sections: [
      {
        id: 'data',
        title: 'Ce que nous collectons',
        body: [
          'Lorsque vous envoyez une demande, nous recevons les informations saisies : votre nom, votre moyen de contact préféré, un numéro de téléphone ou une adresse e-mail, le domaine qui vous intéresse et, si vous les ajoutez, votre ville, vos préférences de format et de calendrier et un message.',
          'Nous enregistrons aussi votre consentement, la page de départ, la langue du site et les paramètres de campagne du lien suivi (par exemple utm_source). Nous ne demandons jamais de documents médicaux, financiers ou d’identité via ce formulaire.',
        ],
      },
      {
        id: 'purpose',
        title: 'Pourquoi nous les utilisons',
        body: [
          'Vos données servent uniquement à comprendre votre demande, à vous orienter vers la bonne école ou le bon programme et à vous recontacter par le moyen choisi.',
          'La base légale est votre consentement, donné par la case à cocher du formulaire. Vos données ne sont ni vendues ni utilisées à des fins publicitaires.',
        ],
      },
      {
        id: 'sharing',
        title: 'Qui les traite',
        body: [
          'Votre demande est conservée dans la base de données de Luminol sur un hébergement sécurisé. Les e-mails de confirmation passent par un prestataire d’envoi, et l’équipe peut recevoir une notification interne via un service de messagerie.',
          'Ces prestataires agissent uniquement pour le compte de Luminol. Les inscriptions aux ateliers utilisent un formulaire Tally distinct, soumis à ses propres conditions.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies et mesure d’audience',
        body: [
          'Le site utilise un seul cookie fonctionnel pour mémoriser votre langue (arabe, français ou anglais). Il n’utilise aucun cookie publicitaire ou de suivi.',
          'Les visites sont mesurées par un outil respectueux de la vie privée, sans cookies, qui ne fournit que des chiffres agrégés, comme le nombre de visites d’une page.',
        ],
      },
      {
        id: 'retention',
        title: 'Durée de conservation',
        body: [
          'Les données d’une demande sont conservées le temps nécessaire pour répondre et assurer le suivi, ainsi que pour la relation qui peut en découler. Elles sont ensuite supprimées ou anonymisées.',
        ],
      },
      {
        id: 'rights',
        title: 'Vos droits',
        body: [
          'Conformément à la loi algérienne n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel, vous pouvez demander l’accès, la rectification ou la suppression de vos données et retirer votre consentement à tout moment.',
          'Pour cela, écrivez à luminolacademy09@gmail.com ou envoyez une demande via le formulaire de contact. L’équipe vérifiera votre identité avant d’y donner suite.',
        ],
      },
      {
        id: 'safety',
        title: 'Pas un service d’urgence',
        body: [
          'Le formulaire n’est pas un service d’urgence. En cas de risque immédiat ou de situation psychiatrique ou médicale urgente, contactez les services d’urgence locaux ou un professionnel de santé qualifié.',
        ],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    description:
      'كيف تجمع أكاديمية لومينول البيانات الشخصية التي تشاركها عبر هذا الموقع وتستخدمها وتحميها.',
    eyebrow: 'سياسة الخصوصية',
    heroTitle: 'ثقتك تستحق إجابات واضحة.',
    heroBody:
      'توضّح هذه الصفحة البيانات الشخصية التي تتلقاها أكاديمية لومينول عبر هذا الموقع، وسبب ذلك، والخيارات المتاحة لك.',
    updatedLabel: 'آخر تحديث',
    updated: '13 نوفمبر 2026',
    contentsLabel: 'في هذه الصفحة',
    contactCta: 'تواصل مع لومينول بشأن بياناتك',
    linkLabel: 'سياسة الخصوصية',
    sections: [
      {
        id: 'data',
        title: 'ما الذي نجمعه',
        body: [
          'عند إرسال طلب نتلقى البيانات التي تُدخلها: اسمك، ووسيلة التواصل المفضلة، ورقم الهاتف أو البريد الإلكتروني، والمجال الذي يهمك، وإن أردت إضافتها: مدينتك وتفضيلات الصيغة والتوقيت ورسالة.',
          'كما نسجّل موافقتك، والصفحة التي بدأت منها، ولغة الموقع، ووسوم الحملة في الرابط الذي اتبعته (مثل utm_source). ولا نطلب أبدًا وثائق طبية أو مالية أو تعريفية عبر هذه الاستمارة.',
        ],
      },
      {
        id: 'purpose',
        title: 'لماذا نستخدمها',
        body: [
          'تُستخدم بياناتك فقط لفهم طلبك وتوجيهك نحو المدرسة أو البرنامج المناسب والتواصل معك بالوسيلة التي اخترتها.',
          'الأساس القانوني هو موافقتك المعطاة عبر خانة الاختيار في الاستمارة. لا تُباع بياناتك ولا تُستخدم لأغراض إعلانية.',
        ],
      },
      {
        id: 'sharing',
        title: 'من يعالجها',
        body: [
          'يُحفظ طلبك في قاعدة بيانات لومينول على استضافة آمنة. تُرسل رسائل التأكيد عبر مزوّد لإرسال البريد الإلكتروني، وقد يتلقى الفريق إشعارًا داخليًا بطلب جديد عبر خدمة مراسلة.',
          'يعمل هؤلاء المزوّدون لحساب لومينول فقط. يتم التسجيل في الورشات عبر استمارة Tally منفصلة تخضع لشروط الخصوصية الخاصة بها.',
        ],
      },
      {
        id: 'cookies',
        title: 'ملفات تعريف الارتباط والإحصاءات',
        body: [
          'يستخدم الموقع ملف تعريف ارتباط وظيفيًا واحدًا لتذكّر لغتك (العربية أو الفرنسية أو الإنجليزية)، ولا يستخدم ملفات إعلانية أو تتبعية.',
          'تُقاس الزيارات بأداة تحترم الخصوصية تعمل دون ملفات تعريف الارتباط ولا تقدّم للفريق إلا أرقامًا إجمالية، مثل عدد زيارات صفحة ما.',
        ],
      },
      {
        id: 'retention',
        title: 'مدة الاحتفاظ',
        body: [
          'تُحفظ بيانات الطلب للمدة اللازمة للرد والمتابعة وللعلاقة التي قد تنشأ بعد ذلك، ثم تُحذف أو تُجعل مجهولة الهوية.',
        ],
      },
      {
        id: 'rights',
        title: 'حقوقك',
        body: [
          'وفقًا للقانون الجزائري رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي، يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، وسحب موافقتك في أي وقت.',
          'لذلك راسلنا على luminolacademy09@gmail.com أو أرسل طلبًا عبر استمارة التواصل، وسيتحقق الفريق من هويتك قبل تنفيذ الطلب.',
        ],
      },
      {
        id: 'safety',
        title: 'ليست خدمة طوارئ',
        body: [
          'استمارة الطلب ليست خدمة طوارئ. إذا كان هناك خطر مباشر أو حالة نفسية أو طبية عاجلة، فاتصل بخدمات الطوارئ المحلية أو بجهة طبية مؤهلة.',
        ],
      },
    ],
  },
};
