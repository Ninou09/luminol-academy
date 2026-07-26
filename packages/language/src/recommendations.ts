import type {
  CourseCandidate,
  CourseRecommendation,
  PlacementResult,
} from "./types";

export function recommendCourse(
  result: PlacementResult,
  courses: readonly CourseCandidate[],
): CourseRecommendation {
  const course = courses.find(
    (candidate) => candidate.active && candidate.level === result.overall,
  );
  const prioritySkills = result.weaknesses.slice(0, 3);
  const skillReason =
    prioritySkills.length > 0
      ? `Priority development areas: ${prioritySkills.join(", ")}.`
      : "The learner demonstrated balanced performance across all assessed skills.";

  return {
    courseId: course?.id ?? null,
    courseTitle: course?.title ?? null,
    recommendedLevel: result.overall,
    reason: `Placement score ${result.score}% indicates CEFR ${result.overall}. ${skillReason}`,
    prioritySkills,
  };
}
