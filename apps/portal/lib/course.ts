export interface CurriculumLesson {
  id: string;
  slug?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CurriculumModule {
  id: string;
  lessons: CurriculumLesson[];
}

export function calculateCourseProgress(modules: CurriculumModule[]) {
  const lessons = modules.flatMap(({ lessons }) => lessons);
  const completedLessons = lessons.filter(
    ({ status }) => status === 'COMPLETED',
  ).length;

  return {
    completedLessons,
    totalLessons: lessons.length,
    percentage:
      lessons.length > 0
        ? Math.round((completedLessons / lessons.length) * 100)
        : 0,
  };
}

export function getNextLearningLesson(modules: CurriculumModule[]) {
  const lessons = modules.flatMap(({ lessons }) => lessons);

  return (
    lessons.find(({ status }) => status === 'IN_PROGRESS') ??
    lessons.find(({ status }) => status === 'NOT_STARTED') ??
    lessons.at(-1) ??
    null
  );
}

export function getLessonNavigation(
  modules: CurriculumModule[],
  lessonId: string,
) {
  const lessons = modules.flatMap(({ lessons }) => lessons);
  const currentIndex = lessons.findIndex(({ id }) => id === lessonId);

  if (currentIndex < 0) return null;

  return {
    position: currentIndex + 1,
    total: lessons.length,
    previous: lessons[currentIndex - 1] ?? null,
    next: lessons[currentIndex + 1] ?? null,
  };
}
