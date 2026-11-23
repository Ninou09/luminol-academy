import type { Locale } from '@luminol/localization';

export type FaqItem = { question: string; answer: string };

export type FaqCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly FaqItem[];
};

/**
 * Answers use only facts already stated elsewhere on the site (the enquiry
 * flow, the safety notice, the certificate scope and the trilingual offer).
 * Fees are explained personally by the team, so no amounts are published.
 * Response times stay out until Luminol confirms them.
 */
export const contactFaq: Record<Locale, FaqCopy> = {
  en: {
    eyebrow: 'Questions & answers',
    title: 'Before you write to us.',
    intro:
      'Short answers to the questions people ask most before their first step.',
    items: [
      {
        question:
          'I am not sure which school or programme I need. Can I still write?',
        answer:
          'Yes. Choose “Help me choose” in the form and describe your goal in a few words. The team reviews it and guides you toward the right school and programme.',
      },
      {
        question: 'What happens after I send the form?',
        answer:
          'Your enquiry is securely recorded, the team reviews your goal and area of interest, and Luminol follows up using the contact method you chose — WhatsApp, phone or email. A place or appointment is confirmed only after that follow-up.',
      },
      {
        question: 'Is this form suitable for an emergency?',
        answer:
          'No. The form is not emergency care. If there is an immediate risk of harm or an urgent psychiatric or medical situation, contact local emergency services or qualified medical care right away.',
      },
      {
        question: 'What should I write in my message?',
        answer:
          'Only what the team needs to understand your request: your goal, the area you are interested in and how you prefer to be contacted. Please do not include highly sensitive medical, financial or identity information.',
      },
      {
        question: 'When is the team available?',
        answer:
          'The Luminol team works every day except Friday, from 8:00 to 17:00 (Algeria time). You can send the form at any time; you can also follow Luminol on Instagram and Facebook.',
      },
      {
        question: 'In which languages can I contact Luminol?',
        answer:
          'Luminol works in Arabic, French and English. Write in the language that feels most natural to you.',
      },
      {
        question: 'Do programmes include a certificate?',
        answer:
          'Yes. Every course ends with a certificate of attendance issued by Luminol Academy. It does not confer academic accreditation or a licence to practise.',
      },
      {
        question: 'When do courses start, and can I attend online?',
        answer:
          'All psychology and language courses are open for registration. Each group starts as soon as it is full, and you can choose to attend in person in Blida or online. Psychology courses run for 18 hours, in Arabic with some Darija and French.',
      },
      {
        question: 'How much do consultations and courses cost?',
        answer:
          'Our fees are kept accessible, and we prefer to explain them personally so you get the right option for your situation. Message us on WhatsApp or call reception: we will give you every detail, with no commitment.',
      },
      {
        question: 'How are my details used?',
        answer:
          'Your details are used only to understand and respond to your enquiry. The privacy policy explains what is stored, why, and how to ask for access or deletion.',
      },
    ],
  },
  fr: {
    eyebrow: 'Questions & réponses',
    title: 'Avant de nous écrire.',
    intro:
      'Des réponses courtes aux questions les plus fréquentes avant un premier pas.',
    items: [
      {
        question:
          'Je ne sais pas quelle école ou quel programme choisir. Puis-je quand même écrire ?',
        answer:
          'Oui. Choisissez « Aidez-moi à choisir » dans le formulaire et décrivez votre objectif en quelques mots. L’équipe l’étudie et vous oriente vers la bonne école et le bon programme.',
      },
      {
        question: 'Que se passe-t-il après l’envoi du formulaire ?',
        answer:
          'Votre demande est enregistrée en toute sécurité, l’équipe étudie votre objectif et votre domaine d’intérêt, puis Luminol vous recontacte par le moyen choisi — WhatsApp, téléphone ou e-mail. Une place ou un rendez-vous n’est confirmé qu’après ce suivi.',
      },
      {
        question: 'Ce formulaire convient-il à une urgence ?',
        answer:
          'Non. Ce formulaire n’est pas un service d’urgence. En cas de risque immédiat ou de situation psychiatrique ou médicale urgente, contactez immédiatement les services d’urgence locaux ou un professionnel de santé qualifié.',
      },
      {
        question: 'Que dois-je écrire dans mon message ?',
        answer:
          'Seulement ce dont l’équipe a besoin pour comprendre votre demande : votre objectif, le domaine qui vous intéresse et le moyen de contact préféré. Merci de ne pas inclure d’informations médicales, financières ou d’identité très sensibles.',
      },
      {
        question: 'Quand l’équipe est-elle disponible ?',
        answer:
          'L’équipe Luminol travaille tous les jours sauf le vendredi, de 8 h à 17 h (heure d’Algérie). Vous pouvez envoyer le formulaire à tout moment et suivre Luminol sur Instagram et Facebook.',
      },
      {
        question: 'Dans quelles langues puis-je contacter Luminol ?',
        answer:
          'Luminol travaille en arabe, en français et en anglais. Écrivez dans la langue qui vous est la plus naturelle.',
      },
      {
        question: 'Les programmes donnent-ils un certificat ?',
        answer:
          'Oui. Chaque formation se termine par une attestation de participation délivrée par Luminol Academy. Elle ne confère ni accréditation académique ni autorisation d’exercer.',
      },
      {
        question:
          'Quand les formations commencent-elles, et puis-je les suivre en ligne ?',
        answer:
          'Toutes les formations en psychologie et en langues sont ouvertes aux inscriptions. Chaque groupe démarre dès qu’il est complet, en présentiel à Blida ou en ligne, selon votre choix. Les formations en psychologie durent 18 heures, en arabe avec un peu de darija et de français.',
      },
      {
        question: 'Combien coûtent les consultations et les formations ?',
        answer:
          'Nos tarifs restent accessibles, et nous préférons vous les présenter de vive voix pour vous proposer la formule adaptée à votre situation. Écrivez-nous sur WhatsApp ou appelez l’accueil : nous vous donnerons tous les détails, sans engagement.',
      },
      {
        question: 'Comment mes données sont-elles utilisées ?',
        answer:
          'Vos données servent uniquement à comprendre votre demande et à y répondre. La politique de confidentialité explique ce qui est conservé, pourquoi, et comment demander l’accès ou la suppression.',
      },
    ],
  },
  ar: {
    eyebrow: 'أسئلة وأجوبة',
    title: 'قبل أن تكتب إلينا.',
    intro: 'إجابات قصيرة عن أكثر الأسئلة شيوعًا قبل الخطوة الأولى.',
    items: [
      {
        question:
          'لست متأكدًا من المدرسة أو البرنامج المناسب لي. هل يمكنني الكتابة رغم ذلك؟',
        answer:
          'نعم. اختر «ساعدني على الاختيار» في الاستمارة وصف هدفك بكلمات قليلة، وسيدرسه الفريق ويوجّهك نحو المدرسة والبرنامج الأنسب.',
      },
      {
        question: 'ماذا يحدث بعد إرسال الاستمارة؟',
        answer:
          'يُسجَّل طلبك بأمان، ويراجع الفريق هدفك ومجال اهتمامك، ثم تتواصل معك لومينول بالوسيلة التي اخترتها — واتساب أو الهاتف أو البريد الإلكتروني. لا يُؤكَّد المقعد أو الموعد إلا بعد هذا التواصل.',
      },
      {
        question: 'هل تصلح هذه الاستمارة لحالة طارئة؟',
        answer:
          'لا. هذه الاستمارة ليست خدمة طوارئ. إذا كان هناك خطر مباشر أو حالة نفسية أو طبية عاجلة، فاتصل فورًا بخدمات الطوارئ المحلية أو بجهة طبية مؤهلة.',
      },
      {
        question: 'ماذا أكتب في رسالتي؟',
        answer:
          'اكتب فقط ما يحتاجه الفريق لفهم طلبك: هدفك، والمجال الذي يهمك، ووسيلة التواصل المفضلة. يُرجى عدم إدراج معلومات طبية أو مالية أو تعريفية شديدة الحساسية.',
      },
      {
        question: 'متى يكون الفريق متاحًا؟',
        answer:
          'يعمل فريق لومينول كل يوم ما عدا الجمعة، من الساعة 8:00 إلى 17:00 بتوقيت الجزائر. يمكنك إرسال الاستمارة في أي وقت، كما يمكنك متابعة لومينول على إنستغرام وفيسبوك.',
      },
      {
        question: 'بأي لغات يمكنني التواصل مع لومينول؟',
        answer:
          'تعمل لومينول بالعربية والفرنسية والإنجليزية. اكتب باللغة الأقرب إليك.',
      },
      {
        question: 'هل تتضمن البرامج شهادة؟',
        answer:
          'نعم. تنتهي كل دورة بشهادة حضور تصدرها أكاديمية لومينول، وهي لا تمنح اعتمادًا أكاديميًا ولا ترخيصًا بالممارسة.',
      },
      {
        question: 'متى تبدأ الدورات، وهل يمكنني متابعتها عن بُعد؟',
        answer:
          'جميع دورات علم النفس واللغات مفتوحة للتسجيل. تبدأ كل مجموعة بمجرد اكتمالها، ويمكنك اختيار الحضور في البليدة أو المتابعة عن بُعد. تمتد دورات علم النفس 18 ساعة، بالعربية مع شيء من الدارجة والفرنسية.',
      },
      {
        question: 'كم تكلّف الاستشارات والدورات؟',
        answer:
          'أسعارنا في متناول الجميع، ونفضّل أن نشرحها لك شخصيًا لنقترح عليك الصيغة الأنسب لوضعك. راسلنا عبر واتساب أو اتصل بالاستقبال، وسنعطيك كل التفاصيل دون أي التزام.',
      },
      {
        question: 'كيف تُستخدم بياناتي؟',
        answer:
          'تُستخدم بياناتك فقط لفهم طلبك والرد عليه. توضّح سياسة الخصوصية ما يُحفظ ولماذا وكيف تطلب الاطلاع على بياناتك أو حذفها.',
      },
    ],
  },
};
