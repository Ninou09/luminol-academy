import type { Locale } from '@luminol/localization';

/**
 * A fast, deterministic crisis check that runs before the model. When it
 * matches, the visitor immediately gets safety guidance and human contacts,
 * whatever the model would have said.
 */
const crisisPatterns: readonly RegExp[] = [
  // English
  /\b(suicid\w*|kill (my|him|her)self|end (my|his|her) life|want(ed)? to die|self[- ]?harm|hurt (my|him|her)self|cutting myself|overdose)\b/i,
  // French
  /\b(suicid\w*|me tuer|mettre fin à (ma|sa) vie|envie de mourir|veux mourir|me faire du mal|automutil\w*|scarifi\w*)\b/i,
  // Arabic and Algerian Darja
  /(انتحار|أنتحر|انتحر|نقتل روحي|أقتل نفسي|اقتل نفسي|أريد أن أموت|بغيت نموت|حاب نموت|أؤذي نفسي|نؤذي روحي|إيذاء النفس)/,
];

export function looksLikeCrisis(text: string): boolean {
  return crisisPatterns.some((pattern) => pattern.test(text));
}

export const crisisReply: Record<Locale, string> = {
  en: 'Thank you for telling me — what you are feeling matters, and you deserve support right now. If you might be in danger, please contact your local emergency services or go to the nearest hospital immediately. You can also call Luminol reception on +213 777 07 71 97 or message us on WhatsApp at +213 556 91 45 17 so a person can follow up with you. I am an automated helper and cannot provide crisis care.',
  fr: 'Merci de me le dire — ce que vous ressentez compte, et vous méritez du soutien dès maintenant. Si vous êtes en danger, contactez immédiatement les services d’urgence locaux ou rendez-vous à l’hôpital le plus proche. Vous pouvez aussi appeler l’accueil de Luminol au +213 777 07 71 97 ou nous écrire sur WhatsApp au +213 556 91 45 17 pour qu’une personne vous recontacte. Je suis un assistant automatique et je ne peux pas offrir d’aide en situation de crise.',
  ar: 'شكرًا لأنك أخبرتني، ما تشعر به مهم وتستحق الدعم الآن. إذا كنت في خطر، اتصل فورًا بخدمات الطوارئ المحلية أو توجّه إلى أقرب مستشفى. يمكنك أيضًا الاتصال باستقبال لومينول على ‎+213 777 07 71 97 أو مراسلتنا على واتساب ‎+213 556 91 45 17 ليتواصل معك شخص من الفريق. أنا مساعد آلي ولا أستطيع تقديم رعاية في حالات الأزمات.',
};
