import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getLearnerLesson } from '../../../../../lib/course.server';
import { completeLesson } from '../../actions';
import styles from './lesson.module.css';

function formatLessonType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function getSafeResourceUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const user = await requireUser();
  const { slug, lessonSlug } = await params;
  const learning = await getLearnerLesson(user.id, slug, lessonSlug);

  if (!learning) notFound();

  const { course, lesson, module, navigation, progress } = learning;
  const resourceUrl = getSafeResourceUrl(lesson.contentUrl);
  const nextHref = navigation.next?.slug
    ? `/courses/${course.slug}/lessons/${navigation.next.slug}`
    : `/courses/${course.slug}`;

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

      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
          <span aria-hidden="true">/</span>
          <span>{lesson.title}</span>
        </nav>

        <div className={styles.layout}>
          <article>
            <header className={styles.lessonHeader}>
              <div className={styles.meta}>
                <span>Module {module.position}</span>
                <span>{formatLessonType(lesson.type)}</span>
                {lesson.durationMinutes && (
                  <span>{lesson.durationMinutes} minutes</span>
                )}
              </div>
              <h1>{lesson.title}</h1>
              {lesson.summary && <p>{lesson.summary}</p>}
            </header>

            <section
              className={styles.content}
              aria-labelledby="lesson-content"
            >
              <h2 id="lesson-content">Learning material</h2>
              {resourceUrl ? (
                <>
                  <p>
                    Open the approved learning resource in a new tab. Your
                    progress remains available here when you return.
                  </p>
                  <a
                    className={styles.resourceLink}
                    href={resourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Open {formatLessonType(lesson.type).toLowerCase()} resource
                    ↗
                  </a>
                </>
              ) : (
                <p>
                  This lesson is ready in your learning path. The programme team
                  is preparing its final resource; you can return without losing
                  your place.
                </p>
              )}
            </section>

            <nav className={styles.navigation} aria-label="Lesson navigation">
              {navigation.previous?.slug ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${navigation.previous.slug}`}
                >
                  <small>Previous lesson</small>
                  {navigation.previous.slug.replaceAll('-', ' ')}
                </Link>
              ) : (
                <span className={styles.disabled}>
                  <small>Previous lesson</small>
                  Start of programme
                </span>
              )}

              {navigation.next?.slug ? (
                <Link href={nextHref}>
                  <small>Next lesson</small>
                  {navigation.next.slug.replaceAll('-', ' ')}
                </Link>
              ) : (
                <Link href={`/courses/${course.slug}`}>
                  <small>Programme</small>
                  Review your curriculum
                </Link>
              )}
            </nav>
          </article>

          <aside className={styles.sidebar} aria-label="Lesson progress">
            <strong>
              {navigation.position}/{navigation.total}
            </strong>
            <span>Lessons in this programme</span>
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

            {lesson.status === 'COMPLETED' ? (
              <p className={styles.completed}>✓ Lesson completed</p>
            ) : learning.enrollmentStatus === 'ACTIVE' ? (
              <form action={completeLesson}>
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="redirectTo" value={nextHref} />
                <button className={styles.primaryAction} type="submit">
                  Complete and continue
                </button>
              </form>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
