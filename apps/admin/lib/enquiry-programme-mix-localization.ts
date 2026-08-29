import type { Locale } from '@luminol/localization';

type EnquiryProgrammeMixCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  enquiryCount: (count: string) => string;
  noData: string;
};

const COPY: Record<Locale, EnquiryProgrammeMixCopy> = {
  en: {
    eyebrow: 'Verified programme context',
    title: 'Programme enquiry mix',
    intro:
      'Programme-attributed enquiries created in the rolling last 30 days, grouped only by the server-verified programme snapshot stored with each enquiry.',
    enquiryCount: (count) => `${count} enquiries`,
    noData: 'No verified programme-attributed enquiries were received in this 30-day window.',
  },
  fr: {
    eyebrow: 'Contexte programme vérifié',
    title: 'Répartition des demandes par programme',
    intro:
      'Demandes attribuées à un programme reçues sur les 30 derniers jours glissants, regroupées uniquement selon l’instantané de programme vérifié par le serveur et enregistré avec chaque demande.',
    enquiryCount: (count) => `${count} demandes`,
    noData:
      'Aucune demande avec attribution de programme vérifiée n’a été reçue sur cette période de 30 jours.',
  },
  ar: {
    eyebrow: 'سياق برنامج موثّق',
    title: 'توزيع الطلبات حسب البرنامج',
    intro:
      'الطلبات المرتبطة ببرنامج والمستلمة خلال آخر 30 يومًا بشكل متحرك، مجمّعة فقط وفق لقطة البرنامج التي تحقق منها الخادم وحُفظت مع كل طلب.',
    enquiryCount: (count) => `${count} طلبات`,
    noData:
      'لم يتم استلام طلبات مرتبطة ببرنامج موثّق خلال نافذة الثلاثين يومًا هذه.',
  },
};

export function getEnquiryProgrammeMixCopy(locale: Locale) {
  return COPY[locale];
}
