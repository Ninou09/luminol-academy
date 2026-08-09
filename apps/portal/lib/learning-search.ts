export const LEARNING_SEARCH_MAX_QUERY_LENGTH = 120;
export const LEARNING_SEARCH_MAX_RESULTS = 20;

export type LearningSearchCandidate = {
  kind: 'programme' | 'module' | 'lesson';
  courseSlug: string;
  courseTitle: string;
  title: string;
  body?: string | null;
  moduleTitle?: string | null;
  lessonSlug?: string | null;
};

export type LearningSearchResult = LearningSearchCandidate & {
  href: string;
  score: number;
};

function fold(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

export function normalizeLearningSearchQuery(raw: string | undefined | null) {
  return (raw ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LEARNING_SEARCH_MAX_QUERY_LENGTH);
}

function scoreText(
  value: string | null | undefined,
  query: string,
  tokens: string[],
) {
  if (!value) return 0;

  const text = fold(value);
  let score = 0;

  if (text === query) score += 120;
  else if (text.startsWith(query)) score += 85;
  else if (text.includes(query)) score += 60;

  for (const token of tokens) {
    if (text === token) score += 30;
    else if (text.startsWith(token)) score += 20;
    else if (text.includes(token)) score += 10;
  }

  return score;
}

function hrefFor(candidate: LearningSearchCandidate) {
  const courseHref = `/courses/${encodeURIComponent(candidate.courseSlug)}`;
  if (candidate.kind === 'lesson' && candidate.lessonSlug) {
    return `${courseHref}/lessons/${encodeURIComponent(candidate.lessonSlug)}`;
  }
  return courseHref;
}

export function rankLearningSearchResults(
  candidates: readonly LearningSearchCandidate[],
  rawQuery: string | undefined | null,
  limit = LEARNING_SEARCH_MAX_RESULTS,
): LearningSearchResult[] {
  const normalized = normalizeLearningSearchQuery(rawQuery);
  const query = fold(normalized);
  if (query.length < 2) return [];

  const tokens = query.split(' ').filter((token) => token.length >= 2);
  const boundedLimit = Math.max(1, Math.min(limit, LEARNING_SEARCH_MAX_RESULTS));

  return candidates
    .flatMap((candidate) => {
      const titleScore = scoreText(candidate.title, query, tokens) * 3;
      const courseScore = scoreText(candidate.courseTitle, query, tokens);
      const moduleScore = scoreText(candidate.moduleTitle, query, tokens);
      const bodyScore = scoreText(candidate.body, query, tokens);
      const textScore = titleScore + courseScore + moduleScore + bodyScore;

      if (textScore === 0) return [];

      const kindBoost =
        candidate.kind === 'lesson' ? 6 : candidate.kind === 'module' ? 3 : 0;

      return [
        {
          ...candidate,
          href: hrefFor(candidate),
          score: textScore + kindBoost,
        },
      ];
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, boundedLimit);
}
