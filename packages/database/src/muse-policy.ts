import type { MuseIntent } from '@luminol/validation/muse';

export const MUSE_AGENTS = {
  main: { intents: ['briefing', 'plan'], permission: 'academy:manage' },
  leads: { intents: ['triage', 'follow-up'], permission: 'academy:manage' },
  booking: { intents: ['booking'], permission: 'academy:manage' },
  courses: { intents: ['faq'], permission: 'academy:manage' },
  revenue: { intents: ['revenue'], permission: 'finance:manage' },
  content: { intents: ['content', 'social'], permission: 'academy:manage' },
  fettouma: { intents: ['faq'], permission: 'academy:manage' },
} as const;

export function routeMuseCommand(prompt: string): MuseIntent {
  const text = prompt.normalize('NFKC').toLowerCase();
  if (/revenu|revenue|income|إيراد|ايراد|دخل|مداخيل/.test(text))
    return 'revenue';
  if (/follow.?up|relance|suivi|متابعة|تابع/.test(text)) return 'follow-up';
  if (/lead|prospect|عميل|عملاء|فرز|مهتم/.test(text)) return 'triage';
  if (/booking|consultation|rendez.vous|حجز|استشار/.test(text))
    return 'booking';
  if (/performance|insight|statistique|أداء|اداء/.test(text)) return 'social';
  if (/caption|content|contenu|publication|محتوى|منشور/.test(text))
    return 'content';
  if (/task|plan|tâche|objectif|خطة|مهمة|مهام|هدف/.test(text)) return 'plan';
  if (
    /faq|course|formation|fettouma|دورة|دورات|سؤال|فتومة|فطومة|معرفة/.test(text)
  )
    return 'faq';
  return 'briefing';
}

export function museAttentionScore(
  lead: {
    createdAt: Date;
    nextFollowUpAt: Date | null;
    ownerUserId: string | null;
  },
  now: Date,
) {
  // A queue attention score, never a prediction of conversion or clinical need.
  const overdue = !!lead.nextFollowUpAt && lead.nextFollowUpAt < now;
  const unassigned = !lead.ownerUserId;
  const waiting =
    now.getTime() - lead.createdAt.getTime() >= 48 * 60 * 60 * 1000;
  return {
    score: (overdue ? 50 : 0) + (unassigned ? 30 : 0) + (waiting ? 20 : 0),
    overdue,
    unassigned,
    waiting,
  };
}

export function museKnowledgeTerms(prompt: string) {
  const ignored = new Set([
    'faq',
    'course',
    'courses',
    'formation',
    'fettouma',
    'دورة',
    'دورات',
    'سؤال',
    'فتومة',
    'فطومة',
    'معرفة',
    'the',
    'about',
    'what',
    'من',
    'في',
    'عن',
    'ما',
    'هل',
    'les',
    'des',
    'une',
  ]);
  return [
    ...new Set(
      prompt
        .normalize('NFKC')
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((word) => word.length > 2 && !ignored.has(word)),
    ),
  ].slice(0, 8);
}
