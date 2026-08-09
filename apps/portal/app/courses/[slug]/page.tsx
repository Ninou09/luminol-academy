import { requireUser } from '@luminol/auth';
import {
  formatLocalizedNumber,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../components/portal-header';
import { getLearnerCourse } from '../../../lib/course.server';
import {
  getLessonTypeLabel,
  getPortalCopy,
} from '../../../lib/portal-localization';
import { getPortalArrow } from '../../../lib/portal-direction';
import { getPortalRequestLocale } from '../../../lib/request-locale';
import { completeLesson } from './actions';

const courseExtras = {
  en: { progress: 'progress', of: 'of', lessons: 'lessons' },
  fr: { progress: 'progression', of: 'sur', lessons: 'leçons' },
  ar: { progress: 'التقدّم', of: 'من', lessons: 'دروس' },
} as const satisfies Record<
  Locale,
  { progress: string; of: string; lessons: string }
>;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const portalCopy = getPortalCopy(locale);
  const copy = portalCopy.course;
  const extras = courseExtras[locale];
  const { slug } = await params;
  const enrollment = await getLearnerCourse(user.id, slug);

  if (!enrollment) notFound();

  const { course, progress, nextLesson } = enrollment;
  const number = (value: number) => formatLocalizedNumber(value, locale);

  return (
    <main>
      <PortalHeader />

      <div className="course-shell">
        <Link className="back-link" href={localizeHref(locale, '/')}>
          {getPortalArrow(locale, 'back')} {copy.back}
        </Link>

        <section className="course-hero" aria-labelledby="course-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="course-title" dir="auto">
              {course.title}
            </h1>
            <p>{copy.intro}</p>
            {nextLesson?.slug ? (
              <Link
                className="course-link"
                href={localizeHref(
                  locale,
                  `/courses/${course.slug}/lessons/${nextLesson.slug}`,
                )}
              >
                {progress.completedLessons > 0 ? copy.resume : copy.start}{' '}
                <span aria-hidden="true">
                  {getPortalArrow(locale, 'forward')}
                </span>
              </Link>
            ) : null}
          </div>
          <div className="course-progress-card">
            <strong>{number(progress.percentage)}%</strong>
            <span>
              {number(progress.completedLessons)} {extras.of}{' '}
              {number(progress.totalLessons)} {extras.lessons}
            </span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`${course.title} ${extras.progress}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percentage}
            >
              <span style={{ width: `${progress.percentage}%` }} />
            </div>
          </div>
        </section>

        {course.modules.length > 0 ? (
          <div className="curriculum">
            {course.modules.map((module, moduleIndex) => (
              <section className="module" key={module.id}>
                <div className="module-heading">
                  <span>
                    {copy.module} {number(moduleIndex + 1)}
                  </span>
                  <div>
                    <h2 dir="auto">{module.title}</h2>
                    {module.description ? (
                      <p dir="auto">{module.description}</p>
                    ) : null}
                  </div>
                </div>
                <ol className="lesson-list">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li
                      className={
                        lesson.status === 'COMPLETED'
                          ? 'lesson lesson-completed'
                          : 'lesson'
                      }
                      key={lesson.id}
                    >
                      <span className="lesson-number">
                        {number(lessonIndex + 1)}
                      </span>
                      <div className="lesson-copy">
                        <div>
                          <span>{getLessonTypeLabel(locale, lesson.type)}</span>
                          {lesson.durationMinutes ? (
                            <span>
                              {number(lesson.durationMinutes)} {copy.minutes}
                            </span>
                          ) : null}
                        </div>
                        <h3 dir="auto">
                          <Link
                            href={localizeHref(
                              locale,
                              `/courses/${course.slug}/lessons/${lesson.slug}`,
                            )}
                          >
                            {lesson.title}
                          </Link>
                        </h3>
                        {lesson.summary ? (
                          <p dir="auto">{lesson.summary}</p>
                        ) : null}
                      </div>
                      {lesson.status === 'COMPLETED' ? (
                        <span className="complete-state">
                          ✓ {copy.completed}
                        </span>
                      ) : enrollment.status === 'ACTIVE' ? (
                        <form action={completeLesson}>
                          <input
                            type="hidden"
                            name="lessonId"
                            value={lesson.id}
                          />
                          <button type="submit">{copy.markComplete}</button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        ) : (
          <div className="curriculum-empty">
            <span aria-hidden="true">✦</span>
            <h2>{copy.preparingTitle}</h2>
            <p>{copy.preparingBody}</p>
          </div>
        )}
      </div>
    </main>
  );
}
