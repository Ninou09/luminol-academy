import 'server-only';

import { db } from '@luminol/database';

import {
  normalizeLearningSearchQuery,
  rankLearningSearchResultsWithCount,
  type LearningSearchCandidate,
} from './learning-search';

export async function searchLearnerContent(
  userId: string,
  rawQuery: string | null | undefined,
) {
  const query = normalizeLearningSearchQuery(rawQuery);
  if (query.length < 2) return { query, results: [], totalMatches: 0 };

  const enrollments = await db.enrollment.findMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
      course: { published: true },
    },
    select: {
      course: {
        select: {
          slug: true,
          title: true,
          modules: {
            where: { published: true },
            orderBy: { position: 'asc' },
            select: {
              title: true,
              description: true,
              lessons: {
                where: { published: true },
                orderBy: { position: 'asc' },
                select: {
                  slug: true,
                  title: true,
                  summary: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const candidates: LearningSearchCandidate[] = [];

  for (const { course } of enrollments) {
    candidates.push({
      kind: 'programme',
      courseSlug: course.slug,
      courseTitle: course.title,
      title: course.title,
    });

    for (const courseModule of course.modules) {
      candidates.push({
        kind: 'module',
        courseSlug: course.slug,
        courseTitle: course.title,
        title: courseModule.title,
        body: courseModule.description,
        moduleTitle: courseModule.title,
      });

      for (const lesson of courseModule.lessons) {
        candidates.push({
          kind: 'lesson',
          courseSlug: course.slug,
          courseTitle: course.title,
          title: lesson.title,
          body: lesson.summary,
          moduleTitle: courseModule.title,
          lessonSlug: lesson.slug,
        });
      }
    }
  }

  const ranked = rankLearningSearchResultsWithCount(candidates, query);
  return { query, ...ranked };
}
