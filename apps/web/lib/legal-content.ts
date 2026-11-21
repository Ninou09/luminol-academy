import type { Locale } from '@luminol/localization';

export const LEGAL_DOCUMENTS = ['privacy', 'terms', 'booking'] as const;
export type LegalDocumentSlug = (typeof LEGAL_DOCUMENTS)[number];

export type LegalDocument = {
  title: string;
  description: string;
  intro: string;
  updated: string;
  sections: readonly { title: string; paragraphs: readonly string[] }[];
};

const CONTENT: Record<Locale, Record<LegalDocumentSlug, LegalDocument>> = {
  en: {
    privacy: {
      title: 'Privacy notice',
      description: 'How Luminol Academy handles website enquiry information.',
      intro:
        'This notice explains the limited information collected when you contact Luminol Academy and how the team uses it to respond.',
      updated: 'Last updated: 22 September 2026',
      sections: [
        {
          title: 'Information we collect',
          paragraphs: [
            'The enquiry form may collect your name, contact details, city, profession, area of interest, preferred format and timing, and the message you choose to provide.',
            'Do not submit medical records, financial details, identity documents, diagnoses, or other highly sensitive information through the public form.',
          ],
        },
        {
          title: 'Why we use it',
          paragraphs: [
            'We use enquiry information to understand your request, route it to an appropriate authorized team member, reply through your chosen channel, and record operational follow-up.',
          ],
        },
        {
          title: 'Access and communications',
          paragraphs: [
            'Full enquiry details remain in the protected Luminol operations workspace. Staff alerts minimize personal information and direct authorized team members to that protected record.',
            'If you provide an email address, Luminol may send a transactional acknowledgement. Marketing messages require a separate lawful basis or consent.',
          ],
        },
        {
          title: 'Your choices',
          paragraphs: [
            'You may ask Luminol to correct or delete enquiry information, subject to legitimate operational or legal retention needs. Contact the academy through the website contact page to make a request.',
          ],
        },
      ],
    },
    terms: {
      title: 'Website and service terms',
      description:
        'Terms for using the Luminol Academy website and enquiry services.',
      intro:
        'These terms set the boundary between website information, an enquiry, and a confirmed Luminol service.',
      updated: 'Last updated: 22 September 2026',
      sections: [
        {
          title: 'Website information',
          paragraphs: [
            'Programme and consultation pages provide general information. Availability, dates, prices, eligibility, and delivery format are confirmed by the team before registration or booking.',
          ],
        },
        {
          title: 'Enquiries are not confirmations',
          paragraphs: [
            'Submitting a form does not create an appointment, enrollment, payment obligation, or guaranteed place. A booking or registration becomes confirmed only after the team sends written confirmation and any required payment is verified.',
          ],
        },
        {
          title: 'Certificates',
          paragraphs: [
            'Where a programme includes a certificate, it is a certificate of attendance or presence under the stated programme conditions. The website does not claim external accreditation unless an authorized programme page explicitly states and evidences it.',
          ],
        },
        {
          title: 'Psychology information and emergencies',
          paragraphs: [
            'Website content and enquiry messages do not provide a diagnosis and do not replace emergency, psychiatric, or medical care. If there is an immediate risk of harm or an urgent situation, contact appropriate local emergency or qualified medical services.',
          ],
        },
      ],
    },
    booking: {
      title: 'Booking, cancellation, and payments',
      description:
        'How Luminol confirms bookings, registrations, cancellations, and payments.',
      intro:
        'The team confirms the applicable conditions before accepting payment so visitors do not rely on unapproved dates, prices, or refund rules.',
      updated: 'Last updated: 22 September 2026',
      sections: [
        {
          title: 'Confirmation',
          paragraphs: [
            'An enquiry is reviewed first. The team confirms the service or programme, participant eligibility where relevant, date, format, price, and available place before requesting payment.',
          ],
        },
        {
          title: 'Payments',
          paragraphs: [
            'Use only the payment method and recipient details supplied through an official Luminol confirmation. Do not send payment based only on a social-media comment or an unverified account.',
          ],
        },
        {
          title: 'Cancellation or rescheduling',
          paragraphs: [
            'The cancellation, rescheduling, transfer, and refund conditions that apply to a specific consultation or programme must be provided before payment. Contact Luminol as soon as possible if you need to change a confirmed booking.',
          ],
        },
        {
          title: 'Refund review',
          paragraphs: [
            'Refund eligibility depends on the written conditions accepted for the confirmed service and on whether the service or programme has started. The team records and communicates the decision through an official channel.',
          ],
        },
      ],
    },
  },
  fr: {
    privacy: {
      title: 'Avis de confidentialité',
      description:
        'Comment Luminol Academy traite les demandes envoyées par le site.',
      intro:
        'Cet avis explique les informations limitées recueillies lorsque vous contactez Luminol Academy et leur utilisation par l’équipe.',
      updated: 'Dernière mise à jour : 22 septembre 2026',
      sections: [
        {
          title: 'Informations recueillies',
          paragraphs: [
            'Le formulaire peut recueillir votre nom, vos coordonnées, votre ville, votre profession, le domaine recherché, le format et le délai souhaités, ainsi que le message que vous choisissez d’envoyer.',
            'N’envoyez pas de dossier médical, données financières, pièce d’identité, diagnostic ou autre information très sensible via le formulaire public.',
          ],
        },
        {
          title: 'Finalité',
          paragraphs: [
            'Luminol utilise ces informations pour comprendre la demande, l’orienter vers un membre autorisé, répondre par le canal choisi et assurer le suivi opérationnel.',
          ],
        },
        {
          title: 'Accès et communications',
          paragraphs: [
            'Les détails complets restent dans l’espace opérationnel protégé de Luminol. Les alertes internes réduisent les données personnelles et renvoient le personnel autorisé vers ce dossier.',
            'Une adresse e-mail peut être utilisée pour envoyer un accusé de réception transactionnel. Les messages marketing nécessitent un fondement ou un consentement distinct.',
          ],
        },
        {
          title: 'Vos choix',
          paragraphs: [
            'Vous pouvez demander la correction ou la suppression des données de la demande, sous réserve des obligations opérationnelles ou légales de conservation. Utilisez la page de contact pour faire cette demande.',
          ],
        },
      ],
    },
    terms: {
      title: 'Conditions du site et des services',
      description:
        'Conditions d’utilisation du site et des demandes Luminol Academy.',
      intro:
        'Ces conditions distinguent les informations du site, une demande et un service Luminol confirmé.',
      updated: 'Dernière mise à jour : 22 septembre 2026',
      sections: [
        {
          title: 'Informations du site',
          paragraphs: [
            'Les pages présentent des informations générales. La disponibilité, les dates, les prix, l’admissibilité et le format sont confirmés avant toute inscription ou réservation.',
          ],
        },
        {
          title: 'Une demande n’est pas une confirmation',
          paragraphs: [
            'L’envoi d’un formulaire ne crée ni rendez-vous, ni inscription, ni obligation de paiement, ni place garantie. La confirmation intervient par écrit après vérification des conditions et du paiement éventuellement requis.',
          ],
        },
        {
          title: 'Attestations',
          paragraphs: [
            'Lorsqu’un programme prévoit une attestation, il s’agit d’une attestation de présence ou de participation selon les conditions annoncées. Le site ne revendique aucune accréditation externe sans preuve explicite sur la page du programme.',
          ],
        },
        {
          title: 'Psychologie et urgences',
          paragraphs: [
            'Le contenu du site et les messages ne constituent pas un diagnostic et ne remplacent pas des soins urgents, psychiatriques ou médicaux. En cas de danger immédiat, contactez les services d’urgence locaux ou des professionnels qualifiés.',
          ],
        },
      ],
    },
    booking: {
      title: 'Réservation, annulation et paiements',
      description:
        'Comment Luminol confirme les réservations, inscriptions, annulations et paiements.',
      intro:
        'L’équipe confirme les conditions applicables avant tout paiement afin d’éviter l’utilisation de dates, prix ou règles non validés.',
      updated: 'Dernière mise à jour : 22 septembre 2026',
      sections: [
        {
          title: 'Confirmation',
          paragraphs: [
            'L’équipe examine d’abord la demande, puis confirme le service ou programme, l’admissibilité éventuelle, la date, le format, le prix et la place disponible avant de demander un paiement.',
          ],
        },
        {
          title: 'Paiements',
          paragraphs: [
            'Utilisez uniquement le moyen de paiement et les coordonnées transmis dans une confirmation officielle de Luminol. Ne payez pas sur la seule base d’un commentaire social ou d’un compte non vérifié.',
          ],
        },
        {
          title: 'Annulation ou report',
          paragraphs: [
            'Les conditions d’annulation, report, transfert et remboursement propres au service doivent être communiquées avant paiement. Contactez Luminol dès que possible pour modifier une réservation confirmée.',
          ],
        },
        {
          title: 'Examen du remboursement',
          paragraphs: [
            'L’éligibilité dépend des conditions écrites acceptées et du démarrage ou non du service. L’équipe enregistre et communique la décision par un canal officiel.',
          ],
        },
      ],
    },
  },
  ar: {
    privacy: {
      title: 'إشعار الخصوصية',
      description:
        'كيف تتعامل أكاديمية لومينول مع معلومات الطلبات المرسلة عبر الموقع.',
      intro:
        'يوضح هذا الإشعار المعلومات المحدودة التي نجمعها عند التواصل مع أكاديمية لومينول وكيف يستخدمها الفريق للرد.',
      updated: 'آخر تحديث: 22 سبتمبر 2026',
      sections: [
        {
          title: 'المعلومات التي نجمعها',
          paragraphs: [
            'قد يجمع نموذج الطلب الاسم وبيانات التواصل والمدينة والمهنة ومجال الاهتمام وطريقة الحضور والتوقيت المفضل والرسالة التي تختار إرسالها.',
            'لا ترسل تقارير طبية أو بيانات مالية أو وثائق هوية أو تشخيصات أو معلومات شديدة الحساسية عبر النموذج العام.',
          ],
        },
        {
          title: 'سبب الاستخدام',
          paragraphs: [
            'نستخدم معلومات الطلب لفهمه وتوجيهه إلى موظف مخوّل والرد عبر الوسيلة المختارة وتسجيل المتابعة التشغيلية.',
          ],
        },
        {
          title: 'الوصول والتواصل',
          paragraphs: [
            'تبقى تفاصيل الطلب الكاملة داخل مساحة تشغيل لومينول المحمية. تقلل التنبيهات الداخلية البيانات الشخصية وتوجّه الموظفين المخوّلين إلى السجل المحمي.',
            'قد نرسل إشعار استلام تشغيليًا إلى البريد المقدم. تتطلب الرسائل التسويقية أساسًا أو موافقة منفصلة.',
          ],
        },
        {
          title: 'اختياراتك',
          paragraphs: [
            'يمكنك طلب تصحيح معلومات الطلب أو حذفها مع مراعاة متطلبات الاحتفاظ التشغيلية أو القانونية المشروعة. استخدم صفحة التواصل لتقديم الطلب.',
          ],
        },
      ],
    },
    terms: {
      title: 'شروط الموقع والخدمات',
      description: 'شروط استخدام موقع أكاديمية لومينول وخدمة إرسال الطلبات.',
      intro:
        'توضح هذه الشروط الفرق بين معلومات الموقع وإرسال طلب والحصول على خدمة مؤكدة من لومينول.',
      updated: 'آخر تحديث: 22 سبتمبر 2026',
      sections: [
        {
          title: 'معلومات الموقع',
          paragraphs: [
            'تعرض صفحات البرامج والاستشارات معلومات عامة. يؤكد الفريق التوفر والتواريخ والأسعار وشروط القبول وطريقة التقديم قبل التسجيل أو الحجز.',
          ],
        },
        {
          title: 'الطلب ليس تأكيدًا',
          paragraphs: [
            'إرسال النموذج لا ينشئ موعدًا أو تسجيلًا أو التزامًا بالدفع ولا يضمن مكانًا. يصبح الحجز أو التسجيل مؤكدًا فقط بعد إرسال تأكيد كتابي والتحقق من أي دفع مطلوب.',
          ],
        },
        {
          title: 'الشهادات',
          paragraphs: [
            'إذا تضمن البرنامج شهادة فهي شهادة حضور وفق شروط البرنامج المعلنة. لا يدعي الموقع اعتمادًا خارجيًا إلا إذا ذكرته صفحة برنامج مخوّلة مع الدليل المناسب.',
          ],
        },
        {
          title: 'المعلومات النفسية والطوارئ',
          paragraphs: [
            'لا يمثل محتوى الموقع ورسائل الطلب تشخيصًا ولا يعوض خدمات الطوارئ أو الرعاية النفسية أو الطبية. عند وجود خطر فوري تواصل مع خدمات الطوارئ المحلية أو جهة طبية مؤهلة.',
          ],
        },
      ],
    },
    booking: {
      title: 'الحجز والإلغاء والدفع',
      description:
        'كيف تؤكد لومينول الحجوزات والتسجيلات والإلغاءات والمدفوعات.',
      intro:
        'يؤكد الفريق الشروط المطبقة قبل قبول الدفع حتى لا يعتمد الزائر على تاريخ أو سعر أو قاعدة استرجاع غير معتمدة.',
      updated: 'آخر تحديث: 22 سبتمبر 2026',
      sections: [
        {
          title: 'التأكيد',
          paragraphs: [
            'يراجع الفريق الطلب أولًا ثم يؤكد الخدمة أو البرنامج وشروط القبول عند الحاجة والتاريخ وطريقة التقديم والسعر والمكان المتاح قبل طلب الدفع.',
          ],
        },
        {
          title: 'الدفع',
          paragraphs: [
            'استخدم فقط وسيلة الدفع وبيانات المستلم المرسلة ضمن تأكيد رسمي من لومينول. لا تدفع اعتمادًا على تعليق في وسائل التواصل أو حساب غير موثوق.',
          ],
        },
        {
          title: 'الإلغاء أو تغيير الموعد',
          paragraphs: [
            'يجب إرسال شروط الإلغاء أو تغيير الموعد أو التحويل أو الاسترجاع الخاصة بالخدمة قبل الدفع. تواصل مع لومينول في أقرب وقت لتغيير حجز مؤكد.',
          ],
        },
        {
          title: 'مراجعة الاسترجاع',
          paragraphs: [
            'تعتمد أهلية الاسترجاع على الشروط المكتوبة المقبولة وعلى ما إذا كانت الخدمة أو الدورة قد بدأت. يسجل الفريق القرار ويرسله عبر قناة رسمية.',
          ],
        },
      ],
    },
  },
};

export function isLegalDocumentSlug(value: string): value is LegalDocumentSlug {
  return (LEGAL_DOCUMENTS as readonly string[]).includes(value);
}

export function getLegalDocument(
  locale: Locale,
  document: LegalDocumentSlug,
): LegalDocument {
  return CONTENT[locale][document];
}
