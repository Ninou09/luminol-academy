import 'server-only';

import { db } from '@luminol/database';

import {
  calculateCourseProgress,
  getLessonNavigation,
  getNextLearningLesson,
} from './course';

export async function getLearnerCourse(userId: string, slug: string) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
      course: { slug },
    },
    select: {
      status: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          modules: {
            where: { published: true },
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
              lessons: {
                where: { published: true },
                orderBy: { position: 'asc' },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  summary: true,
                  type: true,
                  position: true,
                  durationMinutes: true,
                  contentUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) return null;

  const records = await db.learningRecord.findMany({
    where: { userId, courseId: enrollment.course.id },
    select: { lessonId: true, status: true },
  });
  const statusByLesson = new Map(
    records.map(({ lessonId, status }) => [lessonId, status]),
  );
  const modules = enrollment.course.modules.map((courseModule) => ({
    ...courseModule,
    lessons: courseModule.lessons.map((lesson) => ({
      ...lesson,
      status: statusByLesson.get(lesson.id) ?? ('NOT_STARTED' as const),
    })),
  }));

  return {
    ...enrollment,
    course: { ...enrollment.course, modules },
    progress: calculateCourseProgress(modules),
    nextLesson: getNextLearningLesson(modules),
  };
}

export async function getLearnerLesson(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
) {
  const enrollment = await getLearnerCourse(userId, courseSlug);

  if (!enrollment) return null;

  const courseModule = enrollment.course.modules.find(({ lessons }) =>
    lessons.some(({ slug }) => slug === lessonSlug),
  );
  const lesson = courseModule?.lessons.find(
    ({ slug }) => slug === lessonSlug,
  );

  if (!courseModule || !lesson) return null;

  const navigation = getLessonNavigation(enrollment.course.modules, lesson.id);

  if (!navigation) return null;

  return {
    enrollmentStatus: enrollment.status,
    course: {
      id: enrollment.course.id,
      slug: enrollment.course.slug,
      title: enrollment.course.title,
    },
    module: {
      id: courseModule.id,
      title: courseModule.title,
      position: courseModule.position,
    },
    lesson,
    navigation,
    progress: enrollment.progress,
  };
}
