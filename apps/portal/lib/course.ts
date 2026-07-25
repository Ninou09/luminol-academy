export interface CurriculumLesson {
  id: string;
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
