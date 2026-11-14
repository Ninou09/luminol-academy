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
 * Prices, durations and response times stay out until Luminol confirms them.
 */
export const contactFaq: Record<Locale, FaqCopy> = {
  en: {
    eyebrow: 'Questions & answers',
    title: 'Before you write to us.',
    intro: 'Short answers to the questions people ask most before their first step.',
    items: [
      {
        question: 'I am not sure which school or programme I need. Can I still write?',
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
          'The Luminol team works from Sunday to Thursday, 8:00 to 17:00 (Algeria time). You can send the form at any time; you can also follow Luminol on Instagram and Facebook.',
      },
      {
        question: 'In which languages can I contact Luminol?',
        answer:
          'Luminol works in Arabic, French and English. Write in the language that feels most natural to you.',
      },
      {
        question: 'Do programmes include a certificate?',
        answer:
          'Programmes can include an attendance certificate issued by Luminol Academy. It does not confer academic accreditation or a licence to practise.',
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
    intro: 'Des réponses courtes aux questions les plus fréquentes avant un premier pas.',
    items: [
      {
        question: 'Je ne sais pas quelle école ou quel programme choisir. Puis-je quand même écrire ?',
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
          'L’équipe Luminol travaille du dimanche au jeudi, de 8 h à 17 h (heure d’Algérie). Vous pouvez envoyer le formulaire à tout moment et suivre Luminol sur Instagram et Facebook.',
      },
      {
        question: 'Dans quelles langues puis-je contacter Luminol ?',
        answer:
          'Luminol travaille en arabe, en français et en anglais. Écrivez dans la langue qui vous est la plus naturelle.',
      },
      {
        question: 'Les programmes donnent-ils un certificat ?',
        answer:
          'Les programmes peuvent inclure une attestation de participation délivrée par Luminol Academy. Elle ne confère ni accréditation académique ni autorisation d’exercer.',
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
        question: 'لست متأكدًا من المدرسة أو البرنامج المناسب لي. هل يمكنني الكتابة رغم ذلك؟',
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
          'يعمل فريق لومينول من الأحد إلى الخميس، من الساعة 8:00 إلى 17:00 بتوقيت الجزائر. يمكنك إرسال الاستمارة في أي وقت، كما يمكنك متابعة لومينول على إنستغرام وفيسبوك.',
      },
      {
        question: 'بأي لغات يمكنني التواصل مع لومينول؟',
        answer: 'تعمل لومينول بالعربية والفرنسية والإنجليزية. اكتب باللغة الأقرب إليك.',
      },
      {
        question: 'هل تتضمن البرامج شهادة؟',
        answer:
          'قد تتضمن البرامج شهادة حضور تصدرها أكاديمية لومينول، وهي لا تمنح اعتمادًا أكاديميًا ولا ترخيصًا بالممارسة.',
      },
      {
        question: 'كيف تُستخدم بياناتي؟',
        answer:
          'تُستخدم بياناتك فقط لفهم طلبك والرد عليه. توضّح سياسة الخصوصية ما يُحفظ ولماذا وكيف تطلب الاطلاع على بياناتك أو حذفها.',
      },
    ],
  },
};
