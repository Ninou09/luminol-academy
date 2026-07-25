import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getLearnerCourse } from '../../../lib/course.server';
import { completeLesson } from './actions';

function formatLessonType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const enrollment = await getLearnerCourse(user.id, slug);

  if (!enrollment) notFound();

  const { course, progress } = enrollment;

  return (
    <main>
      <header className="portal-header">
        <Link href="/" className="brand-link" aria-label="Luminol learner home">
          <Wordmark />
        </Link>
        <div className="portal-account">
          <span>Learner portal</span>
          <UserButton />
        </div>
      </header>

      <div className="course-shell">
        <Link className="back-link" href="/">
          ← Back to dashboard
        </Link>

        <section className="course-hero" aria-labelledby="course-title">
          <div>
            <p className="eyebrow">My programme</p>
            <h1 id="course-title">{course.title}</h1>
            <p>
              Move through each lesson at your pace. Your completed work is
              saved to your secure learner record.
            </p>
          </div>
          <div className="course-progress-card">
            <strong>{progress.percentage}%</strong>
            <span>
              {progress.completedLessons} of {progress.totalLessons} lessons
            </span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`${course.title} progress`}
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
                  <span>Module {moduleIndex + 1}</span>
                  <div>
                    <h2>{module.title}</h2>
                    {module.description && <p>{module.description}</p>}
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
                        {String(lessonIndex + 1).padStart(2, '0')}
                      </span>
                      <div className="lesson-copy">
                        <div>
                          <span>{formatLessonType(lesson.type)}</span>
                          {lesson.durationMinutes && (
                            <span>{lesson.durationMinutes} min</span>
                          )}
                        </div>
                        <h3>{lesson.title}</h3>
                        {lesson.summary && <p>{lesson.summary}</p>}
                      </div>
                      {lesson.status === 'COMPLETED' ? (
                        <span className="complete-state">✓ Completed</span>
                      ) : enrollment.status === 'ACTIVE' ? (
                        <form action={completeLesson}>
                          <input
                            type="hidden"
                            name="lessonId"
                            value={lesson.id}
                          />
                          <button type="submit">Mark complete</button>
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
            <h2>Your curriculum is being prepared.</h2>
            <p>
              Your programme team will publish the first learning materials
              here. Your enrolment is already secure.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
